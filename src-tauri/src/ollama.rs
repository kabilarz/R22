use reqwest;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::process::{Command, Stdio};
use sysinfo::{System, SystemExt};
use tauri::command;
use tokio::time::{timeout, Duration};

#[derive(Debug, Serialize, Deserialize)]
pub struct HardwareInfo {
    pub total_memory_gb: f64,
    pub available_memory_gb: f64,
    pub cpu_count: usize,
    pub recommended_model: String,
    pub can_run_7b: bool,
    pub can_run_mini: bool,
    pub os: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ModelInfo {
    pub name: String,
    pub size_gb: f64,
    pub description: String,
    pub recommended_ram_gb: f64,
    pub is_medical: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OllamaResponse {
    pub response: String,
    pub done: bool,
    pub context: Option<Vec<i32>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct QueryRequest {
    pub model: String,
    pub prompt: String,
    pub stream: bool,
}

const OLLAMA_BASE_URL: &str = "http://localhost:11434";

pub fn get_available_models() -> Vec<ModelInfo> {
    vec![
        ModelInfo {
            name: "tinyllama".to_string(),
            size_gb: 1.1,
            description: "TinyLlama 1.1B - Fast and lightweight model for basic analysis".to_string(),
            recommended_ram_gb: 4.0,
            is_medical: false,
        },
        ModelInfo {
            name: "phi3:mini".to_string(),
            size_gb: 2.2,
            description: "Phi-3 Mini - Balanced performance for general analysis".to_string(),
            recommended_ram_gb: 6.0,
            is_medical: false,
        },
        ModelInfo {
            name: "biomistral:7b".to_string(),
            size_gb: 4.1,
            description: "BioMistral 7B - Specialized medical research model".to_string(),
            recommended_ram_gb: 8.0,
            is_medical: true,
        },
    ]
}

#[command]
pub async fn get_hardware_info() -> Result<HardwareInfo, String> {
    let mut sys = System::new_all();
    sys.refresh_all();

    let total_memory = sys.total_memory() as f64 / (1024.0 * 1024.0 * 1024.0); // Convert to GB
    let available_memory = sys.available_memory() as f64 / (1024.0 * 1024.0 * 1024.0);
    let cpu_count = sys.cpus().len();

    // Determine recommended model based on available RAM
    let recommended_model = if total_memory >= 8.0 {
        "biomistral:7b".to_string()
    } else if total_memory >= 6.0 {
        "phi3:mini".to_string()
    } else {
        "tinyllama".to_string()
    };

    let can_run_7b = total_memory >= 8.0;
    let can_run_mini = total_memory >= 6.0;

    let os = if cfg!(target_os = "windows") {
        "Windows".to_string()
    } else if cfg!(target_os = "macos") {
        "macOS".to_string()
    } else if cfg!(target_os = "linux") {
        "Linux".to_string()
    } else {
        "Unknown".to_string()
    };

    Ok(HardwareInfo {
        total_memory_gb: total_memory,
        available_memory_gb: available_memory,
        cpu_count,
        recommended_model,
        can_run_7b,
        can_run_mini,
        os,
    })
}

#[command]
pub async fn check_ollama_status() -> Result<bool, String> {
    let client = reqwest::Client::new();
    
    match timeout(Duration::from_secs(5), client.get(&format!("{}/api/tags", OLLAMA_BASE_URL)).send()).await {
        Ok(Ok(response)) => Ok(response.status().is_success()),
        Ok(Err(e)) => {
            log::warn!("Ollama check failed: {}", e);
            Ok(false)
        },
        Err(_) => {
            log::warn!("Ollama check timeout");
            Ok(false)
        },
    }
}

#[command]
pub async fn start_ollama() -> Result<String, String> {
    // Check if already running
    if check_ollama_status().await.unwrap_or(false) {
        return Ok("Ollama is already running".to_string());
    }

    // Try to start Ollama
    let result = if cfg!(target_os = "windows") {
        Command::new("ollama")
            .arg("serve")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
    } else {
        Command::new("ollama")
            .arg("serve")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
    };

    match result {
        Ok(_) => {
            // Wait a moment for service to start
            tokio::time::sleep(Duration::from_secs(3)).await;
            
            // Verify it started
            if check_ollama_status().await.unwrap_or(false) {
                Ok("Ollama started successfully".to_string())
            } else {
                Err("Failed to start Ollama service".to_string())
            }
        },
        Err(e) => Err(format!("Failed to start Ollama: {}. Please ensure Ollama is installed.", e)),
    }
}

#[command]
pub async fn download_model(model_name: String) -> Result<String, String> {
    log::info!("Starting download for model: {}", model_name);
    
    let result = Command::new("ollama")
        .arg("pull")
        .arg(&model_name)
        .output();

    match result {
        Ok(output) => {
            if output.status.success() {
                Ok(format!("Model {} downloaded successfully", model_name))
            } else {
                let error = String::from_utf8_lossy(&output.stderr);
                Err(format!("Failed to download model {}: {}", model_name, error))
            }
        },
        Err(e) => Err(format!("Failed to execute ollama pull: {}", e)),
    }
}

#[command]
pub async fn query_ollama(model: String, prompt: String) -> Result<String, String> {
    let client = reqwest::Client::new();
    
    let request_body = json!({
        "model": model,
        "prompt": prompt,
        "stream": false
    });

    log::info!("Querying Ollama with model: {} and prompt length: {}", model, prompt.len());

    match timeout(
        Duration::from_secs(30), 
        client.post(&format!("{}/api/generate", OLLAMA_BASE_URL))
            .json(&request_body)
            .send()
    ).await {
        Ok(Ok(response)) => {
            if response.status().is_success() {
                match response.json::<OllamaResponse>().await {
                    Ok(ollama_response) => Ok(ollama_response.response),
                    Err(e) => Err(format!("Failed to parse Ollama response: {}", e)),
                }
            } else {
                let status = response.status();
                let error_text = response.text().await.unwrap_or_default();
                Err(format!("Ollama API error {}: {}", status, error_text))
            }
        },
        Ok(Err(e)) => Err(format!("Network error: {}", e)),
        Err(_) => Err("Query timeout (30s)".to_string()),
    }
}

#[command]
pub async fn list_installed_models() -> Result<Vec<String>, String> {
    let client = reqwest::Client::new();
    
    match timeout(
        Duration::from_secs(10),
        client.get(&format!("{}/api/tags", OLLAMA_BASE_URL)).send()
    ).await {
        Ok(Ok(response)) => {
            if response.status().is_success() {
                match response.json::<serde_json::Value>().await {
                    Ok(data) => {
                        let models = data["models"].as_array()
                            .map(|models| {
                                models.iter()
                                    .filter_map(|model| model["name"].as_str())
                                    .map(|name| name.to_string())
                                    .collect()
                            })
                            .unwrap_or_default();
                        Ok(models)
                    },
                    Err(e) => Err(format!("Failed to parse models list: {}", e)),
                }
            } else {
                Err(format!("Failed to get models list: {}", response.status()))
            }
        },
        Ok(Err(e)) => Err(format!("Network error: {}", e)),
        Err(_) => Err("Request timeout".to_string()),
    }
}

#[command]
pub fn get_model_recommendations() -> Vec<ModelInfo> {
    get_available_models()
}