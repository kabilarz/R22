#!/usr/bin/env python3
"""
Debug the Python execution issue - why is output truncated?
"""

import requests
import json

def test_simple_output():
    """Test very simple Python output to see what's happening"""
    
    print("🔍 DEBUGGING PYTHON EXECUTION OUTPUT")
    print("=" * 60)
    
    # Simple test to see if output is being captured
    simple_code = """
print("TEST 1: Basic output")
print("TEST 2: Multiple lines")
print("TEST 3: Numbers:", 123)
print("TEST 4: Dataset info")
print(f"Dataset shape: {df.shape}")
print("TEST 5: Loop output")
for i in range(3):
    print(f"  Loop iteration {i}")
print("TEST 6: Final output")
"""

    test_data = [
        {"id": 1, "value": "test"},
        {"id": 2, "value": "data"}
    ]
    
    payload = {
        "code": simple_code,
        "fileName": "debug_test.csv",
        "fileData": test_data
    }
    
    try:
        print("📤 Sending simple test...")
        response = requests.post(
            "http://localhost:8001/api/execute-python",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            
            print("📋 Response structure:")
            print(f"  Success: {result.get('success')}")
            print(f"  Output length: {len(result.get('output', ''))}")
            print(f"  Error: {result.get('error')}")
            print(f"  Execution time: {result.get('execution_time')}")
            
            print("\n📄 Raw output:")
            print(f"'{result.get('output', '')}'")
            
            print("\n📄 Output lines:")
            output_lines = result.get('output', '').split('\n')
            for i, line in enumerate(output_lines):
                print(f"  Line {i}: '{line}'")
                
            return result.get('output', '')
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return None

def test_statistical_code():
    """Test actual statistical code to see output"""
    
    print("\n🧪 TESTING STATISTICAL CODE OUTPUT")
    print("=" * 60)
    
    stats_code = """
import pandas as pd
import numpy as np
from scipy import stats

print("🔬 STATISTICAL ANALYSIS")
print("=" * 30)

# Basic dataset info
print(f"Dataset shape: {df.shape}")
print(f"Columns: {list(df.columns)}")

# If we have numeric data, do basic stats
numeric_cols = df.select_dtypes(include=[np.number]).columns
if len(numeric_cols) > 0:
    print(f"Numeric columns: {list(numeric_cols)}")
    for col in numeric_cols[:2]:  # First 2 numeric columns
        print(f"{col} - Mean: {df[col].mean():.2f}, Std: {df[col].std():.2f}")

print("✅ Analysis complete")
"""

    # Use vaccination data
    vaccination_data = [
        {"patient_id": 1, "vaccination_status": "vaccinated", "antibody_level": 85},
        {"patient_id": 2, "vaccination_status": "unvaccinated", "antibody_level": 25},
        {"patient_id": 3, "vaccination_status": "vaccinated", "antibody_level": 92},
        {"patient_id": 4, "vaccination_status": "unvaccinated", "antibody_level": 18},
        {"patient_id": 5, "vaccination_status": "vaccinated", "antibody_level": 88}
    ]
    
    payload = {
        "code": stats_code,
        "fileName": "vaccination_data.csv",
        "fileData": vaccination_data
    }
    
    try:
        print("📤 Sending statistical code...")
        response = requests.post(
            "http://localhost:8001/api/execute-python",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            
            print("📋 Statistical analysis result:")
            print(result.get('output', ''))
            
            return result.get('output', '')
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return None

if __name__ == "__main__":
    # Test basic output
    simple_output = test_simple_output()
    
    # Test statistical output  
    stats_output = test_statistical_code()
    
    print("\n" + "="*60)
    print("🔍 DIAGNOSIS")
    print("="*60)
    
    if simple_output and "TEST 1:" in simple_output:
        print("✅ Basic output capture works")
    else:
        print("❌ Basic output capture broken")
        
    if stats_output and "STATISTICAL ANALYSIS" in stats_output:
        print("✅ Statistical code output works")
    else:
        print("❌ Statistical code output broken")
        
    print("\n💡 The issue might be:")
    print("1. Output buffer limits in Python executor")
    print("2. Error handling swallowing output")
    print("3. Code execution failing silently")
    print("4. Output encoding issues")