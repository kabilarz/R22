#!/usr/bin/env python3
"""
Test the fix for Python execution output
"""

import requests
import json
import time

def test_fixed_execution():
    """Test if the output fix works"""
    
    print("🔧 TESTING FIXED PYTHON EXECUTION")
    print("=" * 60)
    
    # Test with intelligent t-test code
    intelligent_code = """
print("🧪 INTELLIGENT T-TEST ANALYSIS")
print("=" * 40)
print("Testing vaccinated vs unvaccinated groups")

# Extract groups
vaccinated = df[df['vaccination_status'] == 'vaccinated']['antibody_level']
unvaccinated = df[df['vaccination_status'] == 'unvaccinated']['antibody_level']

print(f"Vaccinated group: mean = {vaccinated.mean():.1f}, n = {len(vaccinated)}")
print(f"Unvaccinated group: mean = {unvaccinated.mean():.1f}, n = {len(unvaccinated)}")

# Perform t-test
from scipy import stats
t_stat, p_value = stats.ttest_ind(vaccinated, unvaccinated)

print(f"T-statistic: {t_stat:.4f}")
print(f"P-value: {p_value:.6f}")

if p_value < 0.05:
    print("✅ SIGNIFICANT DIFFERENCE!")
    if vaccinated.mean() > unvaccinated.mean():
        print("   Vaccinated group has higher antibody levels")
    else:
        print("   Unvaccinated group has higher antibody levels")
else:
    print("❌ No significant difference")

print("🎯 Analysis complete!")
"""

    vaccination_data = [
        {"patient_id": 1, "vaccination_status": "vaccinated", "antibody_level": 85},
        {"patient_id": 2, "vaccination_status": "unvaccinated", "antibody_level": 25},
        {"patient_id": 3, "vaccination_status": "vaccinated", "antibody_level": 92},
        {"patient_id": 4, "vaccination_status": "unvaccinated", "antibody_level": 18},
        {"patient_id": 5, "vaccination_status": "vaccinated", "antibody_level": 88},
        {"patient_id": 6, "vaccination_status": "unvaccinated", "antibody_level": 32},
        {"patient_id": 7, "vaccination_status": "vaccinated", "antibody_level": 95},
        {"patient_id": 8, "vaccination_status": "unvaccinated", "antibody_level": 22}
    ]
    
    payload = {
        "code": intelligent_code,
        "fileName": "vaccination_test.csv",
        "fileData": vaccination_data
    }
    
    try:
        print("📤 Sending intelligent analysis code...")
        
        # Wait for backend
        time.sleep(2)
        
        response = requests.post(
            "http://localhost:8001/api/execute-python",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get('success'):
                output = result.get('output', '')
                print("🎉 SUCCESS! Fixed output:")
                print("=" * 60)
                print(output)
                print("=" * 60)
                
                # Check if we got the intelligent analysis
                if "INTELLIGENT T-TEST ANALYSIS" in output and "T-statistic:" in output:
                    print("✅ COMPLETE INTELLIGENT ANALYSIS WORKING!")
                    print("✅ The AI can now generate and execute statistical tests!")
                    return True
                else:
                    print("❌ Still not getting full analysis output")
                    return False
            else:
                print("❌ Execution failed")
                print(f"Error: {result.get('error')}")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

if __name__ == "__main__":
    success = test_fixed_execution()
    
    if success:
        print("\n🎉 SYSTEM IS NOW WORKING CORRECTLY!")
        print("🧠 AI can generate intelligent statistical analysis")
        print("⚡ Python execution shows complete results")
        print("📊 Users will see proper t-test output, not just 'Dataset loaded'")
    else:
        print("\n❌ System still has issues - need more debugging")