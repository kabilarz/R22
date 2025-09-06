#!/usr/bin/env python3
"""
Quick build verification script for Nemo desktop application
"""
import os
import subprocess
import sys
from pathlib import Path

def check_command(cmd, description):
    """Check if a command exists and is working"""
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, shell=True)
        if result.returncode == 0:
            print(f"✅ {description}: {result.stdout.strip()}")
            return True
        else:
            print(f"❌ {description}: Failed")
            return False
    except Exception as e:
        print(f"❌ {description}: Error - {e}")
        return False

def check_file_exists(path, description):
    """Check if a file exists"""
    if os.path.exists(path):
        print(f"✅ {description}: Found")
        return True
    else:
        print(f"❌ {description}: Not found")
        return False

def main():
    print("=" * 60)
    print("    Nemo Desktop Application Build Verification")
    print("=" * 60)
    print()
    
    # Check prerequisites
    print("🔍 Checking Prerequisites...")
    node_ok = check_command("node --version", "Node.js")
    npm_ok = check_command("npm --version", "npm")
    rust_ok = check_command("rustc --version", "Rust")
    python_ok = check_command("python --version", "Python")
    
    print()
    print("🔍 Checking Project Files...")
    package_ok = check_file_exists("package.json", "package.json")
    tauri_conf_ok = check_file_exists("src-tauri/tauri.conf.json", "Tauri config")
    backend_ok = check_file_exists("backend/app.py", "Backend")
    
    print()
    print("🔍 Checking Dependencies...")
    node_modules_ok = check_file_exists("node_modules", "Node modules")
    
    # Check if Tauri CLI is available
    tauri_cli_ok = check_command("tauri --version", "Tauri CLI")
    
    print()
    print("🔍 Checking Build Outputs...")
    out_dir_ok = check_file_exists("out", "Frontend build (out/)")
    debug_exe = check_file_exists("src-tauri/target/debug/app.exe", "Debug executable")
    release_exe = check_file_exists("src-tauri/target/release/app.exe", "Release executable")
    
    print()
    print("=" * 60)
    print("    Summary")
    print("=" * 60)
    
    total_checks = 10
    passed_checks = sum([
        node_ok, npm_ok, rust_ok, python_ok, package_ok, 
        tauri_conf_ok, backend_ok, node_modules_ok, tauri_cli_ok, 
        (out_dir_ok or debug_exe or release_exe)
    ])
    
    print(f"Passed: {passed_checks}/{total_checks} checks")
    
    if passed_checks >= 8:
        print("🎉 Environment looks good! Ready to build.")
        print()
        print("💡 Suggested next steps:")
        if not node_modules_ok:
            print("   - Run: npm install")
        if not tauri_cli_ok:
            print("   - Run: npm install -g @tauri-apps/cli")
        if not out_dir_ok:
            print("   - Run: npm run build")
        if not release_exe:
            print("   - Run: npm run tauri:build")
    else:
        print("⚠️  Some prerequisites are missing. Please install missing components.")
    
    print()
    input("Press Enter to continue...")

if __name__ == "__main__":
    main()