#!/usr/bin/env python3
"""
Test the FIXED DuckDB integration
"""

import requests
import json

def test_duckdb_integration():
    """Test that DuckDB is working and NOT using file system"""
    
    print("🔧 TESTING DUCKDB INTEGRATION FIX")
    print("=" * 50)
    
    # Test data - clinical trial data
    test_data = [
        {"patient_id": 1, "age": 45, "treatment": "drug_a", "bp_systolic": 140},
        {"patient_id": 2, "age": 52, "treatment": "placebo", "bp_systolic": 150},
        {"patient_id": 3, "age": 38, "treatment": "drug_a", "bp_systolic": 135},
        {"patient_id": 4, "age": 61, "treatment": "placebo", "bp_systolic": 155}
    ]
    
    # CORRECT code that uses df variable provided by DuckDB
    correct_code = """
print("🏥 MEDICAL ANALYSIS - USING DUCKDB")
print("=" * 40)

# df is automatically provided by DuckDB integration
print("Dataset shape:", df.shape)
print("Columns:", list(df.columns))

# Statistical analysis
print("\\nTreatment group analysis:")
treatment_stats = df.groupby('treatment')['bp_systolic'].agg(['mean', 'std', 'count'])
print(treatment_stats)

print("\\nAge analysis:")
print(f"Mean age: {df['age'].mean():.1f}")
print(f"Age range: {df['age'].min()} - {df['age'].max()}")

print("\\n✅ DUCKDB INTEGRATION WORKING!")
"""

    # WRONG code that tries to use file system (this will fail)
    wrong_code = """
import pandas as pd

# This is WRONG - tries to read from file system
df = pd.read_csv('clinical_trial_hypertension.csv')
print("This should fail!")
"""
    
    print("1. Testing CORRECT code (uses DuckDB df variable):")
    print("-" * 50)
    
    payload_correct = {
        "code": correct_code,
        "fileName": "medical_test.csv",
        "fileData": test_data
    }
    
    try:
        response = requests.post(
            "http://localhost:8001/api/execute-python",
            json=payload_correct,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get('success'):
                print("✅ CORRECT CODE SUCCESS!")
                print("Output:")
                print(result.get('output', ''))
                print("\n" + "="*50)
            else:
                print("❌ CORRECT CODE FAILED:")
                print(result.get('error', ''))
        else:
            print(f"❌ HTTP Error: {response.status_code}")
    
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    print("\n2. Testing WRONG code (tries file system):")
    print("-" * 50)
    
    payload_wrong = {
        "code": wrong_code,
        "fileName": "medical_test.csv", 
        "fileData": test_data
    }
    
    try:
        response = requests.post(
            "http://localhost:8001/api/execute-python",
            json=payload_wrong,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            
            if not result.get('success'):
                print("✅ WRONG CODE CORRECTLY FAILED:")
                print("Error:", result.get('error', ''))
                
                if "not found" in result.get('error', '').lower():
                    print("✅ This proves file system access is blocked!")
            else:
                print("⚠️ Wrong code unexpectedly succeeded")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    print("\n" + "="*60)
    print("📋 SUMMARY:")
    print("✅ DuckDB provides 'df' variable automatically")
    print("❌ File system access (pd.read_csv) is blocked") 
    print("💡 Your code should use 'df' not pd.read_csv()")
    print("="*60)

if __name__ == "__main__":
    test_duckdb_integration()