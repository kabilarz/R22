"""
"""

import sys
import os
import json
import tempfile
import subprocess
import time
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from contextlib import contextmanager

# Windows-compatible resource management
try:
    import resource
    HAS_RESOURCE = True
except ImportError:
    # Windows doesn't have the resource module
    HAS_RESOURCE = False
    print("Warning: resource module not available (Windows system)")

# Try to import psutil for better memory monitoring
try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False
    print("Warning: psutil not available - install with 'pip install psutil' for better memory monitoring")

class PythonExecutionResult:
    """Result container for Python execution"""
    def __init__(self, success: bool, output: str = "", error: str = None, 
                 execution_time: float = 0, memory_used: int = 0):
        self.success = success
        self.output = output
        self.error = error
        self.execution_time = execution_time
        self.memory_used = memory_used
        self.timestamp = time.time()

class EnhancedPythonExecutor:
    """Enhanced Python executor with security and performance optimizations"""
    
    def __init__(self):
        self.python_executable = self._get_python_executable()
        self.max_execution_time = 60  # seconds
        self.max_memory_mb = 1024     # MB
        self.medical_libraries = self._get_medical_libraries()
        self._setup_environment()
    
    def _get_python_executable(self) -> str:
        """Get Python executable, prefer bundled version for deployment"""
        
        # 1. Try bundled Python (for Tauri desktop deployment)
        bundled_paths = [
            "src-tauri/resources/python/python.exe",  # Windows
            "src-tauri/resources/python/bin/python",  # Linux/Mac
            "resources/python/python.exe",            # Alternative Windows
            "python/python.exe",                      # Alternative
            "../src-tauri/resources/python/python.exe", # From backend directory
            "../resources/python/python.exe",          # Alternative from backend
            "../../resources/python/python.exe"        # From nested backend
        ]
        
        for path in bundled_paths:
            if Path(path).exists():
                abs_path = str(Path(path).absolute())
                print(f"🐍 Using bundled Python: {abs_path}")
                print(f"✅ OFFLINE MODE: No external Python dependencies required")
                return abs_path
        
        # 2. Check if running as Tauri app and get Python from app resources
        try:
            app_exe_dir = Path(sys.executable).parent if getattr(sys, 'frozen', False) else None
            if app_exe_dir:
                app_python = app_exe_dir / "python" / "python.exe"
                if app_python.exists():
                    abs_path = str(app_python.absolute())
                    print(f"🐍 Using app bundled Python: {abs_path}")
                    print(f"✅ DESKTOP MODE: Python bundled with application")
                    return abs_path
        except Exception:
            pass
        
        # 3. Try virtual environment
        venv_paths = [
            "venv/Scripts/python.exe",  # Windows
            "venv/bin/python",          # Linux/Mac
            ".venv/Scripts/python.exe", # Alternative Windows
            ".venv/bin/python",         # Alternative Linux/Mac
            "../venv/Scripts/python.exe", # From backend directory
            "../venv/bin/python"        # From backend directory
        ]
        
        for path in venv_paths:
            if Path(path).exists():
                abs_path = str(Path(path).absolute())
                print(f"🐍 Using virtual environment Python: {abs_path}")
                print(f"⚠️  DEVELOPMENT MODE: Using project virtual environment")
                return abs_path
        
        # 4. Fallback to system Python
        print(f"🐍 Using system Python: {sys.executable}")
        print(f"⚠️  SYSTEM MODE: Requires user to have Python installed")
        print(f"💡 For production deployment, Python should be auto-installed by the app")
        return sys.executable
    
    def _get_medical_libraries(self) -> List[str]:
        """Get list of required medical/statistical libraries"""
        return [
            "pandas>=2.1.4",
            "numpy>=1.24.4",
            "scipy>=1.11.4", 
            "matplotlib>=3.8.2",
            "seaborn>=0.13.0",
            "statsmodels>=0.14.1",
            "scikit-learn>=1.3.2",
            "pingouin>=0.5.4",
            "lifelines>=0.29.0",
            "plotly>=5.18.0"
        ]
    
    def _setup_environment(self):
        """Setup and validate Python environment"""
        print("🔧 Setting up Python execution environment...")
        
        # Verify Python executable exists and works
        try:
            result = subprocess.run(
                [self.python_executable, "--version"], 
                capture_output=True, 
                text=True, 
                timeout=10
            )
            if result.returncode == 0:
                version = result.stdout.strip()
                print(f"✅ Python executable verified: {version}")
            else:
                raise Exception(f"Python executable failed: {result.stderr}")
        except Exception as e:
            print(f"❌ Python executable verification failed: {e}")
            raise
    
    def check_library_availability(self) -> Dict[str, bool]:
        """Check which medical libraries are available"""
        print("📦 Checking medical library availability...")
        
        check_code = '''
import json
import importlib

libraries = {
    "pandas": False,
    "numpy": False, 
    "scipy": False,
    "matplotlib": False,
    "seaborn": False,
    "statsmodels": False,
    "sklearn": False,
    "pingouin": False,
    "lifelines": False,
    "plotly": False
}

for lib in libraries:
    try:
        if lib == "sklearn":
            importlib.import_module("sklearn")
        else:
            importlib.import_module(lib)
        libraries[lib] = True
    except ImportError:
        libraries[lib] = False

print(json.dumps(libraries))
'''
        
        try:
            result = subprocess.run(
                [self.python_executable, "-c", check_code],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                libraries = json.loads(result.stdout.strip())
                available_count = sum(libraries.values())
                total_count = len(libraries)
                
                print(f"📊 Libraries available: {available_count}/{total_count}")
                for lib, available in libraries.items():
                    status = "✅" if available else "❌"
                    print(f"  {status} {lib}")
                
                return libraries
            else:
                print(f"❌ Library check failed: {result.stderr}")
                return {}
                
        except Exception as e:
            print(f"❌ Library availability check error: {e}")
            return {}
    
    @contextmanager
    def _resource_limits(self):
        """Set resource limits for execution (Windows compatible)"""
        old_limits = {}
        
        try:
            # Set resource limits only if available (Unix systems)
            if HAS_RESOURCE:
                # Set memory limit (Linux/Mac only)
                if hasattr(resource, 'RLIMIT_AS'):
                    old_limits['memory'] = resource.getrlimit(resource.RLIMIT_AS)
                    memory_limit = self.max_memory_mb * 1024 * 1024  # Convert MB to bytes
                    resource.setrlimit(resource.RLIMIT_AS, (memory_limit, memory_limit))
                
                # Set CPU time limit
                if hasattr(resource, 'RLIMIT_CPU'):
                    old_limits['cpu'] = resource.getrlimit(resource.RLIMIT_CPU)
                    resource.setrlimit(resource.RLIMIT_CPU, (self.max_execution_time, self.max_execution_time))
            else:
                # Windows - resource limits will be handled via process monitoring
                print("Windows system - using process monitoring for resource limits")
            
            yield
            
        finally:
            # Restore old limits (Unix only)
            if HAS_RESOURCE:
                for limit_type, old_limit in old_limits.items():
                    if limit_type == 'memory' and hasattr(resource, 'RLIMIT_AS'):
                        resource.setrlimit(resource.RLIMIT_AS, old_limit)
                    elif limit_type == 'cpu' and hasattr(resource, 'RLIMIT_CPU'):
                        resource.setrlimit(resource.RLIMIT_CPU, old_limit)
    
    def _validate_user_code(self, code: str) -> tuple[bool, str]:
        """Validate user code for basic syntax issues before execution"""
        try:
            # Try to compile the code to check for syntax errors
            compile(code, '<user_code>', 'exec')
            return True, ""
        except SyntaxError as e:
            return False, f"Syntax error in user code: {str(e)}"
        except Exception as e:
            return False, f"Code validation error: {str(e)}"
    
    def _clean_user_code(self, code: str) -> str:
        """Clean user code by removing markdown formatting and other artifacts"""
        lines = code.strip().split('\n')
        cleaned_lines = []
        in_code_block = False
        
        for line in lines:
            stripped = line.strip()
            
            # Handle markdown code fences
            if stripped.startswith('```'):
                if stripped == '```' or stripped.startswith('```python'):
                    in_code_block = not in_code_block
                continue
            
            # Skip empty lines at the beginning
            if not cleaned_lines and not stripped:
                continue
                
            # If we're in a code block or no code block markers found, include the line
            if in_code_block or '```' not in code:
                # Preserve original line (including indentation) but remove trailing whitespace
                cleaned_lines.append(line.rstrip())
        
        # Join lines and ensure we have actual code
        result = '\n'.join(cleaned_lines)
        
        # If result is empty or just whitespace, return the original code
        if not result.strip():
            return code.strip()
        
        return result
    
    def execute_code_with_duckdb(self, code: str, dataset_id: str, 
                                filename: str = "data.csv") -> PythonExecutionResult:
        """Execute Python code using DuckDB integration (no temporary files)"""
        
        start_time = time.time()
        start_memory = self._get_memory_usage()
        
        # Clean user code to remove markdown and other artifacts
        cleaned_code = self._clean_user_code(code)
        
        # Debug: Print the cleaned code to see what we're actually executing
        print("DEBUG - Cleaned user code:")
        print(repr(cleaned_code))
        print("DEBUG - Cleaned user code (formatted):")
        print(cleaned_code)
        
        # Validate user code first
        try:
            compile(cleaned_code, '<user_code>', 'exec')
        except SyntaxError as e:
            return PythonExecutionResult(
                success=False,
                error=f"Syntax error in user code: {str(e)}",
                execution_time=time.time() - start_time
            )
        except Exception as e:
            return PythonExecutionResult(
                success=False,
                error=f"Code validation error: {str(e)}",
                execution_time=time.time() - start_time
            )
        
        try:
            # Get database path for DuckDB connection
            from data_store import DB_PATH
            db_path = str(DB_PATH).replace('\\', '/')
            
            # Always use v_user_data view (active dataset)
            view_name = "v_user_data"
            
            # Create the complete Python script
            # Build it piece by piece to avoid f-string and triple quote conflicts
            python_script_parts = [
                "import pandas as pd",
                "import pandas  # Also make 'pandas' available directly",
                "import numpy as np", 
                "import matplotlib",
                "matplotlib.use('Agg')",
                "import matplotlib.pyplot as plt",
                "import seaborn as sns",
                "import duckdb",
                "import sys",
                "import warnings",
                "from scipy import stats",
                "import traceback",
                "",
                "warnings.filterwarnings('ignore')",
                "",
                "# Load data from DuckDB",
                "try:",
                f"    conn = duckdb.connect(r'{db_path}')",
                f"    df = conn.execute('SELECT * FROM {view_name}').fetchdf()",
                "    conn.close()",
                "    print(f'Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns')",
                "    ",
                "    # Ensure proper data types for medical analysis",
                "    import pandas as pd",
                "    import numpy as np",
                "    ",
                "    # Convert numeric columns that might be stored as strings",
                "    for col in df.columns:",
                "        if col not in ['patient_id', 'gender', 'race', 'enrollment_date', 'treatment_group', ",
                "                       'diabetes', 'hypertension', 'smoking_status', 'cardiovascular_history',",
                "                       'primary_outcome', 'adverse_events', 'study_completion']:",
                "            try:",
                "                df[col] = pd.to_numeric(df[col], errors='coerce')",
                "            except:",
                "                pass",
                "    ",
                "    # Verify data types",
                "    numeric_cols = df.select_dtypes(include=[np.number]).columns",
                "    print(f'Numeric columns detected: {len(numeric_cols)}')",
                "except Exception as e:",
                "    print(f'EXECUTION_ERROR: Data loading failed: {str(e)}')",
                "    sys.exit(1)",
                "",
                "# Execute user code",
                "try:",
            ]
            
            # Add user code with proper indentation for the try block
            for line in cleaned_code.split('\n'):
                python_script_parts.append(f"    {line}")
            
            # Add the exception handler
            python_script_parts.extend([
                "except Exception as e:",
                "    print(f'EXECUTION_ERROR: {str(e)}')",
                "    traceback.print_exc()",
                "    sys.exit(1)"
            ])
            
            python_script = '\n'.join(python_script_parts)

            # Execute the script
            try:
                if HAS_PSUTIL:
                    process = psutil.Popen(
                        [self.python_executable, '-c', python_script],
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        text=True
                    )
                else:
                    process = subprocess.Popen(
                        [self.python_executable, '-c', python_script],
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        text=True
                    )
                
                # Monitor execution with timeout
                stdout, stderr = process.communicate(timeout=self.max_execution_time)
                return_code = process.returncode
                
            except subprocess.TimeoutExpired:
                process.kill()
                return PythonExecutionResult(
                    success=False,
                    error=f"Execution timed out after {self.max_execution_time} seconds",
                    execution_time=time.time() - start_time
                )
            
            # Calculate execution stats
            execution_time = time.time() - start_time
            memory_used = self._get_memory_usage() - start_memory
            
            # Check if execution was successful
            success = return_code == 0 and "EXECUTION_ERROR:" not in stdout
            
            if success:
                # Clean output - remove system messages
                output_lines = []
                for line in stdout.split('\n'):
                    line = line.strip()
                    if line and not line.startswith('Dataset loaded:'):
                        output_lines.append(line)
                
                output = '\n'.join(output_lines) if output_lines else "Code executed successfully (no output)"
                
                return PythonExecutionResult(
                    success=True,
                    output=output,
                    execution_time=execution_time,
                    memory_used=memory_used
                )
            else:
                # Extract error message
                error_msg = stderr.strip() if stderr.strip() else "Unknown execution error"
                
                # Look for our custom error messages
                if "EXECUTION_ERROR:" in stdout:
                    error_lines = [line for line in stdout.split('\n') if 'EXECUTION_ERROR:' in line]
                    if error_lines:
                        error_msg = error_lines[0].replace("EXECUTION_ERROR: ", "")
                
                return PythonExecutionResult(
                    success=False,
                    error=error_msg,
                    execution_time=execution_time,
                    memory_used=memory_used
                )
                
        except Exception as e:
            return PythonExecutionResult(
                success=False,
                error=f"System error during execution: {str(e)}",
                execution_time=time.time() - start_time
            )
    
    def execute_code(self, code: str, data: List[Dict[str, Any]], 
                    filename: str = "data.csv") -> PythonExecutionResult:
        """Execute Python code with medical data"""
        
        start_time = time.time()
        start_memory = self._get_memory_usage()
        
        # Clean user code to remove markdown and other artifacts
        code = self._clean_user_code(code)
        
        try:
            # Create temporary file for data
            with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as temp_file:
                json.dump(data, temp_file)
                temp_file_path = temp_file.name
            
            # Prepare secure Python execution code
            # Indent user code properly for the try block
            indented_code = '\n'.join('    ' + line for line in code.split('\n'))
            
            python_code = f'''
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import json
import sys
import warnings
from scipy import stats

warnings.filterwarnings('ignore')

# Load data
try:
    with open(r'{temp_file_path}', 'r') as f:
        data = json.load(f)
    df = pd.DataFrame(data)
    print(f"Dataset loaded: {{df.shape[0]}} rows, {{df.shape[1]}} columns")
except Exception as e:
    print(f"Data loading error: {{e}}")
    sys.exit(1)

# Execute user code
try:
{indented_code}
except Exception as e:
    print(f"Error: {{str(e)}}")
'''

            # Execute with resource limits and monitoring
            if HAS_PSUTIL:
                process = psutil.Popen(
                    [self.python_executable, '-c', python_code],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
            else:
                # Fallback to standard subprocess if psutil not available
                process = subprocess.Popen(
                    [self.python_executable, '-c', python_code],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
            
            # Monitor execution
            try:
                stdout, stderr = process.communicate(timeout=self.max_execution_time)
                return_code = process.returncode
            except subprocess.TimeoutExpired:
                process.kill()
                return PythonExecutionResult(
                    success=False,
                    error=f"Execution timed out after {self.max_execution_time} seconds",
                    execution_time=time.time() - start_time
                )
            
            # Clean up temporary file
            try:
                os.unlink(temp_file_path)
            except:
                pass
            
            # Parse results
            execution_time = time.time() - start_time
            memory_used = self._get_memory_usage() - start_memory
            
            success = return_code == 0 and "EXECUTION_ERROR:" not in stdout
            
            if success:
                # Clean output
                output = stdout.replace("EXECUTION_COMPLETE", "").strip()
                return PythonExecutionResult(
                    success=True,
                    output=output,
                    execution_time=execution_time,
                    memory_used=memory_used
                )
            else:
                # Extract error
                error_msg = stderr or "Unknown execution error"
                if "EXECUTION_ERROR:" in stdout:
                    error_lines = [line for line in stdout.split('\n') if 'EXECUTION_ERROR:' in line]
                    if error_lines:
                        error_msg = error_lines[0].replace("EXECUTION_ERROR: ", "")
                
                return PythonExecutionResult(
                    success=False,
                    error=error_msg,
                    execution_time=execution_time,
                    memory_used=memory_used
                )
                
        except Exception as e:
            return PythonExecutionResult(
                success=False,
                error=f"Execution system error: {str(e)}",
                execution_time=time.time() - start_time
            )
    
    def _get_memory_usage(self) -> int:
        """Get current memory usage in MB (Windows compatible)"""
        try:
            if HAS_PSUTIL:
                process = psutil.Process()
                return process.memory_info().rss // (1024 * 1024)  # Convert to MB
            else:
                # Fallback - return 0 if psutil not available
                return 0
        except:
            return 0
    
    def get_execution_stats(self) -> Dict[str, Any]:
        """Get execution environment statistics (Windows compatible)"""
        stats = {
            "python_executable": self.python_executable,
            "python_version": self._get_python_version(),
            "max_execution_time": self.max_execution_time,
            "max_memory_mb": self.max_memory_mb,
            "available_libraries": self.check_library_availability(),
            "has_resource_module": HAS_RESOURCE,
            "has_psutil": HAS_PSUTIL
        }
        
        # Add system info if psutil is available
        if HAS_PSUTIL:
            try:
                stats["system_memory_mb"] = psutil.virtual_memory().total // (1024 * 1024)
                stats["cpu_count"] = psutil.cpu_count()
            except:
                stats["system_memory_mb"] = "Unknown"
                stats["cpu_count"] = "Unknown"
        else:
            stats["system_memory_mb"] = "Unknown (install psutil)"
            stats["cpu_count"] = "Unknown (install psutil)"
            
        return stats
    
    def _get_python_version(self) -> str:
        """Get Python version string"""
        try:
            result = subprocess.run(
                [self.python_executable, "--version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            return result.stdout.strip() if result.returncode == 0 else "Unknown"
        except:
            return "Unknown"

# Global executor instance
python_executor = EnhancedPythonExecutor()