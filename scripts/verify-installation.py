#!/usr/bin/env python3
"""
Verification script for Nemo installation
Checks all dependencies and components are properly installed
"""

import sys
import subprocess
import os
import json
from pathlib import Path

class NemoInstallationVerifier:
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.success_count = 0
        self.total_checks = 0
    
    def check(self, description, condition, error_msg=None, warning_msg=None):
        """Run a check and track results"""
        self.total_checks += 1
        print(f"Checking {description}...", end=" ")
        
        try:
            if callable(condition):
                result = condition()
            else:
                result = condition
                
            if result:
                print("✓ PASS")
                self.success_count += 1
                return True
            else:
                print("✗ FAIL")
                if error_msg:
                    self.errors.append(f"{description}: {error_msg}")
                elif warning_msg:
                    self.warnings.append(f"{description}: {warning_msg}")
                return False
        except Exception as e:
            print(f"✗ ERROR: {e}")
            self.errors.append(f"{description}: {e}")
            return False
    
    def check_python_version(self):
        """Check Python version is compatible"""
        try:
            version = sys.version_info
            return (3, 8) <= (version.major, version.minor) <= (3, 11)
        except:
            return False
    
    def check_node_version(self):
        """Check Node.js version"""
        try:
            result = subprocess.run(['node', '--version'], 
                                  capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                version = result.stdout.strip().replace('v', '')
                major = int(version.split('.')[0])
                return major >= 18
            return False
        except:
            return False
    
    def check_npm_installed(self):
        """Check if npm is installed"""
        try:
            result = subprocess.run(['npm', '--version'], 
                                  capture_output=True, text=True, timeout=5)
            return result.returncode == 0
        except:
            return False
    
    def check_rust_installed(self):
        """Check if Rust is installed"""
        try:
            result = subprocess.run(['rustc', '--version'], 
                                  capture_output=True, text=True, timeout=5)
            return result.returncode == 0
        except:
            return False
    
    def check_python_dependencies(self):
        """Check Python dependencies are installed"""
        required_packages = [
            'fastapi', 'uvicorn', 'pandas', 'numpy', 'scipy',
            'matplotlib', 'seaborn', 'duckdb', 'pyarrow'
        ]
        
        missing = []
        for package in required_packages:
            try:
                __import__(package)
            except ImportError:
                missing.append(package)
        
        if missing:
            self.errors.append(f"Missing Python packages: {', '.join(missing)}")
            return False
        return True
    
    def check_tauri_cli(self):
        """Check if Tauri CLI is installed"""
        try:
            result = subprocess.run(['tauri', '--version'], 
                                  capture_output=True, text=True, timeout=5)
            return result.returncode == 0
        except:
            # Try npx version
            try:
                result = subprocess.run(['npx', 'tauri', '--version'], 
                                      capture_output=True, text=True, timeout=10)
                return result.returncode == 0
            except:
                return False
    
    def check_ollama_binary(self):
        """Check if Ollama binary exists"""
        ollama_path = Path("src-tauri/resources/ollama/ollama.exe")
        return ollama_path.exists() and ollama_path.stat().st_size > 1000000  # At least 1MB
    
    def check_project_structure(self):
        """Check project structure is correct"""
        required_files = [
            "package.json",
            "src-tauri/tauri.conf.json", 
            "backend/requirements.txt",
            "backend/app.py",
            "backend/server.py",
            "project-compass.json"
        ]
        
        missing = []
        for file_path in required_files:
            if not Path(file_path).exists():
                missing.append(file_path)
        
        if missing:
            self.errors.append(f"Missing project files: {', '.join(missing)}")
            return False
        return True
    
    def check_package_json(self):
        """Check package.json has required scripts"""
        try:
            with open("package.json", 'r') as f:
                package_data = json.load(f)
            
            scripts = package_data.get('scripts', {})
            required_scripts = ['dev', 'build', 'tauri', 'tauri:build']
            
            missing = [script for script in required_scripts if script not in scripts]
            
            if missing:
                self.warnings.append(f"Missing package.json scripts: {', '.join(missing)}")
                return False
            return True
        except:
            return False
    
    def check_tauri_config(self):
        """Check Tauri configuration"""
        try:
            with open("src-tauri/tauri.conf.json", 'r') as f:
                config = json.load(f)
            
            # Check required configurations
            checks = [
                config.get('productName') == 'Nemo',
                'bundle' in config,
                config.get('bundle', {}).get('active') == True,
                'externalBin' in config.get('bundle', {}),
                'resources' in config.get('bundle', {})
            ]
            
            return all(checks)
        except:
            return False
    
    def run_all_checks(self):
        """Run all verification checks"""
        print("=" * 60)
        print("           NEMO INSTALLATION VERIFIER")
        print("=" * 60)
        print()
        
        # System requirements
        print("📋 System Requirements:")
        self.check("Python version (3.8-3.11)", 
                  self.check_python_version(),
                  f"Python {sys.version_info.major}.{sys.version_info.minor} found. Need Python 3.8-3.11")
        
        self.check("Node.js version (18+)", 
                  self.check_node_version(),
                  "Node.js 18+ required. Run: node --version")
        
        self.check("npm installed", 
                  self.check_npm_installed(),
                  "npm not found. Install Node.js from nodejs.org")
        
        print()
        
        # Development tools
        print("🛠️  Development Tools:")
        self.check("Rust toolchain", 
                  self.check_rust_installed(),
                  "Rust not found. Install from https://rustup.rs")
        
        self.check("Tauri CLI", 
                  self.check_tauri_cli(),
                  "Tauri CLI not found. Run: npm install -g @tauri-apps/cli")
        
        print()
        
        # Project structure
        print("📁 Project Structure:")
        self.check("Project files", self.check_project_structure())
        self.check("package.json configuration", self.check_package_json())
        self.check("Tauri configuration", self.check_tauri_config())
        
        print()
        
        # Dependencies
        print("📦 Dependencies:")
        self.check("Python packages", self.check_python_dependencies())
        self.check("Ollama binary", 
                  self.check_ollama_binary(),
                  "Run: scripts/setup-ollama.bat")
        
        print()
        
        # Results
        self.print_results()
    
    def print_results(self):
        """Print verification results"""
        print("=" * 60)
        print("                    RESULTS")
        print("=" * 60)
        print()
        
        print(f"✅ Passed: {self.success_count}/{self.total_checks} checks")
        
        if self.warnings:
            print(f"⚠️  Warnings: {len(self.warnings)}")
            for warning in self.warnings:
                print(f"   • {warning}")
            print()
        
        if self.errors:
            print(f"❌ Errors: {len(self.errors)}")
            for error in self.errors:
                print(f"   • {error}")
            print()
        
        if not self.errors:
            print("🎉 Installation is ready for production build!")
            print("Run: npm run tauri build")
        else:
            print("🔧 Please fix the errors above before building.")
            print("Refer to DEPLOYMENT_GUIDE.md for detailed instructions.")
        
        print()
        return len(self.errors) == 0

def main():
    """Main entry point"""
    verifier = NemoInstallationVerifier()
    success = verifier.run_all_checks()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()