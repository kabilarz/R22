use tauri::command;
use tauri::Emitter;
use std::process::Command;
use std::path::{Path, PathBuf};
use std::fs;
use std::io;
use reqwest;
use zip;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct PythonStatus {
    is_available: bool,
    python_path: Option<String>,
    version: Option<String>,
    source: String, // \"bundled\", \"system\", \"none\"
    medical_libraries_available: bool,
    setup_required: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PythonSetupProgress {
    step: String,
    progress: u8,
    message: String,
    completed: bool,
    error: Option<String>,
}

#[command]
pub async fn check_python_status() -> Result<PythonStatus, String> {
    println!("Checking Python status...");
    
    // 1. Check for bundled Python first
    if let Some(bundled_path) = check_bundled_python() {
        let version = get_python_version(&bundled_path)?;
        let medical_libs = check_medical_libraries(&bundled_path).await;
        
        return Ok(PythonStatus {
            is_available: true,
            python_path: Some(bundled_path),
            version: Some(version),
            source: "bundled".to_string(),
            medical_libraries_available: medical_libs,
            setup_required: !medical_libs,
        });
    }
    
    // 2. Check for system Python
    if let Some(system_path) = check_system_python() {
        let version = get_python_version(&system_path)?;
        let medical_libs = check_medical_libraries(&system_path).await;
        
        return Ok(PythonStatus {
            is_available: true,
            python_path: Some(system_path),
            version: Some(version),
            source: "system".to_string(),
            medical_libraries_available: medical_libs,
            setup_required: false, // We'll use bundled for medical libs
        });
    }
    
    // 3. No Python found
    Ok(PythonStatus {
        is_available: false,
        python_path: None,
        version: None,
        source: "none".to_string(),
        medical_libraries_available: false,
        setup_required: true,
    })
}

#[command]
pub async fn setup_embedded_python(window: tauri::Window) -> Result<PythonStatus, String> {
    println!("Setting up embedded Python for medical analysis...");
    
    // Send progress updates to frontend
    let send_progress = |step: &str, progress: u8, message: &str| {
        let _ = window.emit("python_setup_progress", PythonSetupProgress {
            step: step.to_string(),
            progress,
            message: message.to_string(),
            completed: false,
            error: None,
        });
    };
    
    send_progress("initializing", 0, "Initializing Python setup...");
    
    // Create resources directory
    let app_dir = get_app_resources_dir()?;
    let python_dir = app_dir.join("python");
    
    if !python_dir.exists() {
        fs::create_dir_all(&python_dir)
            .map_err(|e| format!("Failed to create Python directory: {}", e))?;
    }
    
    send_progress("downloading", 10, "Downloading Python 3.11.7 embedded...");
    
    // Download embedded Python
    let python_url = "https://www.python.org/ftp/python/3.11.7/python-3.11.7-embed-amd64.zip";
    let zip_path = python_dir.join("python-embed.zip");
    
    download_file(python_url, &zip_path).await
        .map_err(|e| format!("Failed to download Python: {}", e))?;
    
    send_progress("extracting", 30, "Extracting Python runtime...");
    
    // Extract Python
    extract_zip(&zip_path, &python_dir)
        .map_err(|e| format!("Failed to extract Python: {}", e))?;
    
    // Remove zip file
    let _ = fs::remove_file(&zip_path);
    
    send_progress("configuring", 50, "Configuring Python environment...");
    
    // Configure Python for pip
    configure_embedded_python(&python_dir)?;
    
    send_progress("installing_pip", 60, "Installing package manager...");
    
    // Install pip
    install_pip(&python_dir).await?;
    
    send_progress("installing_libraries", 70, "Installing medical analysis libraries...");
    
    // Install medical libraries
    install_medical_libraries(&python_dir).await?;
    
    send_progress("verifying", 90, "Verifying installation...");
    
    // Verify installation
    let python_exe = python_dir.join("python.exe");
    let python_path = python_exe.to_string_lossy().to_string();
    let version = get_python_version(&python_path)?;
    let medical_libs = check_medical_libraries(&python_path).await;
    
    if !medical_libs {
        return Err("Medical libraries verification failed".to_string());
    }
    
    send_progress("completed", 100, "Python setup completed successfully!");
    
    // Send completion signal
    let _ = window.emit("python_setup_progress", PythonSetupProgress {
        step: "completed".to_string(),
        progress: 100,
        message: "Medical Python environment ready!".to_string(),
        completed: true,
        error: None,
    });
    
    Ok(PythonStatus {
        is_available: true,
        python_path: Some(python_path),
        version: Some(version),
        source: "bundled".to_string(),
        medical_libraries_available: true,
        setup_required: false,
    })
}

#[command]
pub async fn get_python_path() -> Result<String, String> {
    let status = check_python_status().await?;
    
    if let Some(path) = status.python_path {
        Ok(path)
    } else {
        Err("No Python installation found".to_string())
    }
}

// Helper functions

fn check_bundled_python() -> Option<String> {
    let possible_paths = vec![
        "resources/python/python.exe",
        "python/python.exe",
    ];
    
    for path_str in possible_paths {
        let path = Path::new(path_str);
        if path.exists() {
            return Some(path.to_string_lossy().to_string());
        }
    }
    
    // Check in app resources directory
    if let Ok(app_dir) = get_app_resources_dir() {
        let python_exe = app_dir.join("python").join("python.exe");
        if python_exe.exists() {
            return Some(python_exe.to_string_lossy().to_string());
        }
    }
    
    None
}

fn check_system_python() -> Option<String> {
    // Try common Python commands
    let commands = vec!["python", "python3", "py"];
    
    for cmd in commands {
        if let Ok(output) = Command::new(cmd)
            .arg("--version")
            .output()
        {
            if output.status.success() {
                // Get full path
                if let Ok(path_output) = Command::new("where")
                    .arg(cmd)
                    .output()
                {
                    if let Ok(path_str) = String::from_utf8(path_output.stdout) {
                        if let Some(first_line) = path_str.lines().next() {
                            return Some(first_line.trim().to_string());
                        }
                    }
                }
                return Some(cmd.to_string());
            }
        }
    }
    
    None
}

fn get_python_version(python_path: &str) -> Result<String, String> {
    let output = Command::new(python_path)
        .arg("--version")
        .output()
        .map_err(|e| format!("Failed to get Python version: {}", e))?;
    
    if output.status.success() {
        String::from_utf8(output.stdout)
            .map_err(|e| format!("Failed to parse version output: {}", e))
            .map(|s| s.trim().to_string())
    } else {
        Err("Failed to execute Python version command".to_string())
    }
}

async fn check_medical_libraries(python_path: &str) -> bool {
    let check_script = r#"
import json
libraries = ["pandas", "numpy", "scipy", "matplotlib", "seaborn", "statsmodels", "sklearn"]
available = {}
for lib in libraries:
    try:
        if lib == "sklearn":
            import sklearn
        else:
            __import__(lib)
        available[lib] = True
    except ImportError:
        available[lib] = False
print(json.dumps(available))
"#;
    
    if let Ok(output) = Command::new(python_path)
        .arg("-c")
        .arg(check_script)
        .output()
    {
        if output.status.success() {
            if let Ok(output_str) = String::from_utf8(output.stdout) {
                if let Ok(libs) = serde_json::from_str::<std::collections::HashMap<String, bool>>(&output_str) {
                    // Check if core libraries are available
                    let core_libs = vec!["pandas", "numpy", "scipy"];
                    return core_libs.iter().all(|lib| *libs.get(*lib).unwrap_or(&false));
                }
            }
        }
    }
    
    false
}

fn get_app_resources_dir() -> Result<PathBuf, String> {
    let exe_path = std::env::current_exe()
        .map_err(|e| format!("Failed to get executable path: {}", e))?;
    
    let app_dir = exe_path.parent()
        .ok_or("Failed to get parent directory")?;
    
    Ok(app_dir.to_path_buf())
}

async fn download_file(url: &str, path: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    let response = client.get(url).send().await?;
    let bytes = response.bytes().await?;
    
    fs::write(path, bytes)?;
    Ok(())
}

fn extract_zip(zip_path: &Path, extract_to: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let file = fs::File::open(zip_path)?;
    let mut archive = zip::ZipArchive::new(file)?;
    
    for i in 0..archive.len() {
        let mut file = archive.by_index(i)?;
        let outpath = extract_to.join(file.mangled_name());
        
        if file.name().ends_with('/') {
            fs::create_dir_all(&outpath)?;
        } else {
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    fs::create_dir_all(p)?;
                }
            }
            let mut outfile = fs::File::create(&outpath)?;
            io::copy(&mut file, &mut outfile)?;
        }
    }
    
    Ok(())
}

fn configure_embedded_python(python_dir: &Path) -> Result<(), String> {
    // Modify python311._pth to enable site-packages
    let pth_file = python_dir.join("python311._pth");
    
    if pth_file.exists() {
        let mut content = fs::read_to_string(&pth_file)
            .map_err(|e| format!("Failed to read pth file: {}", e))?;
        
        if !content.contains("import site") {
            content.push_str("\nimport site\n");
            fs::write(&pth_file, content)
                .map_err(|e| format!("Failed to write pth file: {}", e))?;
        }
    }
    
    Ok(())
}

async fn install_pip(python_dir: &Path) -> Result<(), String> {
    let python_exe = python_dir.join("python.exe");
    let get_pip_path = python_dir.join("get-pip.py");
    
    // Download get-pip.py
    download_file("https://bootstrap.pypa.io/get-pip.py", &get_pip_path)
        .await
        .map_err(|e| format!("Failed to download get-pip.py: {}", e))?;
    
    // Install pip
    let output = Command::new(&python_exe)
        .arg(&get_pip_path)
        .arg("--no-warn-script-location")
        .output()
        .map_err(|e| format!("Failed to install pip: {}", e))?;
    
    if !output.status.success() {
        return Err(format!("Pip installation failed: {}", String::from_utf8_lossy(&output.stderr)));
    }
    
    // Remove get-pip.py
    let _ = fs::remove_file(&get_pip_path);
    
    Ok(())
}

async fn install_medical_libraries(python_dir: &Path) -> Result<(), String> {
    let python_exe = python_dir.join("python.exe");
    
    let libraries = vec![
        "pandas==2.1.4",
        "numpy==1.24.4", 
        "scipy==1.11.4",
        "matplotlib==3.8.2",
        "seaborn==0.13.0",
        "statsmodels==0.14.1",
        "scikit-learn==1.3.2",
        "plotly==5.18.0",
    ];
    
    for lib in libraries {
        let output = Command::new(&python_exe)
            .args(&["-m", "pip", "install", lib, "--quiet", "--disable-pip-version-check"])
            .output()
            .map_err(|e| format!("Failed to install {}: {}", lib, e))?;
        
        if !output.status.success() {
            println!("Warning: Failed to install {}: {}", lib, String::from_utf8_lossy(&output.stderr));
            // Continue with other libraries
        }
    }
    
    // Install optional medical libraries (don't fail if these don't work)
    let optional_libs = vec!["pingouin", "lifelines"];
    
    for lib in optional_libs {
        let _ = Command::new(&python_exe)
            .args(&["-m", "pip", "install", lib, "--quiet", "--disable-pip-version-check"])
            .output();
    }
    
    Ok(())
}
