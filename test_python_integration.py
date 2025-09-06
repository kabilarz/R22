#!/usr/bin/env python3
"""
Test script to verify the Python integration works correctly
"""

import sys
import subprocess
import os
import time
from pathlib import Path

def test_enhanced_executor():
    """Test the enhanced Python executor"""
    print("🧪 Testing Enhanced Python Executor...")
    
    try:
        # Add backend to path
        backend_path = Path(__file__).parent / "backend"
        sys.path.insert(0, str(backend_path))
        
        from enhanced_python_executor import EnhancedPythonExecutor
        
        # Create executor
        executor = EnhancedPythonExecutor()
        
        # Test basic execution
        test_code = '''
import pandas as pd
import numpy as np

print("✅ Medical libraries loaded successfully!")
print(f"Pandas version: {pd.__version__}")
print(f"NumPy version: {np.__version__}")

# Simple medical analysis test
data = {
    'patient_id': [1, 2, 3, 4, 5],
    'age': [45, 67, 23, 56, 78],
    'systolic_bp': [120, 140, 110, 160, 135],
    'bmi': [24.5, 28.3, 22.1, 31.2, 26.8]
}

df = pd.DataFrame(data)
print(f"📊 Created test dataset with {len(df)} patients")
print(f"Average age: {df['age'].mean():.1f} years")
print(f"Average BMI: {df['bmi'].mean():.1f}")

high_bp_count = (df['systolic_bp'] >= 140).sum()
print(f"🩸 Patients with high BP (≥140): {high_bp_count}/{len(df)}")
'''
        
        result = executor.execute_code(test_code, {"test": "data"})
        
        if result.success:
            print("✅ Medical analysis test PASSED!")
            print(f"Execution time: {result.execution_time:.2f}s")
            print(f"Memory used: {result.memory_used}MB")
            print("\nOutput:")
            print(result.output)
        else:
            print("❌ Medical analysis test FAILED!")
            print(f"Error: {result.error}")
            
        return result.success
        
    except Exception as e:
        print(f"❌ Executor test failed: {e}")
        return False

def test_library_availability():
    """Test medical library availability"""
    print("\n🔍 Testing Medical Library Availability...")
    
    libraries = [
        "pandas", "numpy", "scipy", "matplotlib", 
        "seaborn", "statsmodels", "sklearn"
    ]
    
    available = []
    missing = []
    
    for lib in libraries:
        try:
            if lib == "sklearn":
                __import__("sklearn")
            else:
                __import__(lib)
            available.append(lib)
            print(f"✅ {lib}")
        except ImportError:
            missing.append(lib)
            print(f"❌ {lib}")
    
    print(f"\n📊 Summary: {len(available)}/{len(libraries)} libraries available")
    
    if missing:
        print(f"⚠️  Missing libraries: {', '.join(missing)}")
        print("💡 Run the Python setup from the app to install missing libraries")
    
    return len(missing) == 0

def main():
    """Main test function"""
    print("🏥 Nemo Medical AI - Python Integration Test")
    print("=" * 50)
    
    # Test 1: Library availability
    libs_ok = test_library_availability()
    
    # Test 2: Enhanced executor
    executor_ok = test_enhanced_executor()
    
    print("\n" + "=" * 50)
    print("📋 Test Results:")
    print(f"  Libraries: {'✅ PASS' if libs_ok else '❌ FAIL'}")
    print(f"  Executor:  {'✅ PASS' if executor_ok else '❌ FAIL'}")
    
    if libs_ok and executor_ok:
        print("\n🎉 All tests PASSED! Python integration is ready for medical analysis.")
        return 0
    else:
        print("\n⚠️  Some tests FAILED. Please check the Python setup.")
        return 1

if __name__ == "__main__":
    sys.exit(main())