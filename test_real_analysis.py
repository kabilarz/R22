#!/usr/bin/env python3
"""
Test to get REAL statistical analysis, not just dataset info
"""

import requests
import json

def test_real_statistics():
    """Test that we get actual statistical results"""
    
    print("🔥 TESTING REAL STATISTICAL ANALYSIS")
    print("=" * 60)
    print("Goal: Get actual t-test results, not just 'Dataset loaded'")
    print("=" * 60)
    
    # Create test data for t-test
    test_data = [
        {"patient_id": 1, "group": "treatment", "blood_pressure": 120},
        {"patient_id": 2, "group": "control", "blood_pressure": 140}, 
        {"patient_id": 3, "group": "treatment", "blood_pressure": 118},
        {"patient_id": 4, "group": "control", "blood_pressure": 145},
        {"patient_id": 5, "group": "treatment", "blood_pressure": 115},
        {"patient_id": 6, "group": "control", "blood_pressure": 150},
        {"patient_id": 7, "group": "treatment", "blood_pressure": 122},
        {"patient_id": 8, "group": "control", "blood_pressure": 142}
    ]
    
    # Real statistical analysis code
    analysis_code = """
print("REAL STATISTICAL ANALYSIS")
print("=" * 40)

# Show dataset info
print(f"Dataset shape: {df.shape}")
print(f"Columns: {list(df.columns)}")

# Perform actual t-test
treatment_group = df[df['group'] == 'treatment']['blood_pressure']
control_group = df[df['group'] == 'control']['blood_pressure']

print(f"\\nTreatment group (n={len(treatment_group)}): {treatment_group.tolist()}")
print(f"Control group (n={len(control_group)}): {control_group.tolist()}")

# Calculate statistics
treatment_mean = treatment_group.mean()
control_mean = control_group.mean()
treatment_std = treatment_group.std()
control_std = control_group.std()

print(f"\\nDESCRIPTIVE STATISTICS:")
print(f"Treatment: Mean = {treatment_mean:.1f}, SD = {treatment_std:.1f}")
print(f"Control: Mean = {control_mean:.1f}, SD = {control_std:.1f}")
print(f"Difference: {treatment_mean - control_mean:.1f}")

# Perform t-test
from scipy import stats
t_statistic, p_value = stats.ttest_ind(treatment_group, control_group)

print(f"\\nT-TEST RESULTS:")
print(f"T-statistic: {t_statistic:.4f}")
print(f"P-value: {p_value:.6f}")

if p_value < 0.05:
    print("RESULT: SIGNIFICANT DIFFERENCE (p < 0.05)")
    if treatment_mean < control_mean:
        print("Treatment group has LOWER blood pressure than control")
    else:
        print("Treatment group has HIGHER blood pressure than control")
else:
    print("RESULT: No significant difference (p >= 0.05)")

print("\\n" + "=" * 40)
print("ANALYSIS COMPLETE!")
"""
    
    payload = {
        "code": analysis_code,
        "fileName": "bp_study.csv",
        "fileData": test_data
    }
    
    try:
        print("Sending request for REAL analysis...")
        
        response = requests.post(
            "http://localhost:8001/api/execute-python",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get('success'):
                output = result.get('output', '')
                print("✅ SUCCESS! Here's what we got:")
                print("\n" + "="*80)
                print("ACTUAL OUTPUT:")
                print("="*80)
                print(output)
                print("="*80)
                
                # Check if we got real analysis
                if ("T-TEST RESULTS:" in output and 
                    "T-statistic:" in output and 
                    "P-value:" in output):
                    print("\n🎉 PERFECT! WE GOT REAL STATISTICAL ANALYSIS!")
                    print("✅ T-test calculated")
                    print("✅ P-value shown") 
                    print("✅ Statistical interpretation provided")
                    return True
                else:
                    print("\n❌ STILL NOT WORKING - Only got dataset info")
                    print("Expected: T-test results with p-values")
                    print("Got: Just basic dataset loading")
                    return False
            else:
                print("❌ EXECUTION FAILED")
                print(f"Error: {result.get('error')}")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print("Response:", response.text)
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

if __name__ == "__main__":
    success = test_real_statistics()
    
    if success:
        print("\n🎉 SYSTEM IS WORKING!")
        print("You should now get real statistical results")
    else:
        print("\n🔥 STILL BROKEN!")
        print("We need to debug why only dataset info shows")