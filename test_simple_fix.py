#!/usr/bin/env python3
"""
Test the fix without Unicode characters
"""

import requests
import json
import time

def test_simple_fix():
    """Test if the output fix works with simple ASCII"""
    
    print("TESTING FIXED PYTHON EXECUTION")
    print("=" * 60)
    
    # Test with simple code (no emojis)
    simple_code = """
print("STATISTICAL ANALYSIS")
print("=" * 30)
print("Testing vaccinated vs unvaccinated groups")

# Extract groups  
vaccinated = df[df['vaccination_status'] == 'vaccinated']['antibody_level']
unvaccinated = df[df['vaccination_status'] == 'unvaccinated']['antibody_level']

print("Vaccinated group: mean =", round(vaccinated.mean(), 1), "n =", len(vaccinated))
print("Unvaccinated group: mean =", round(unvaccinated.mean(), 1), "n =", len(unvaccinated))

# Perform t-test
from scipy import stats
t_stat, p_value = stats.ttest_ind(vaccinated, unvaccinated)

print("T-statistic:", round(t_stat, 4))
print("P-value:", round(p_value, 6))

if p_value < 0.05:
    print("RESULT: SIGNIFICANT DIFFERENCE!")
    if vaccinated.mean() > unvaccinated.mean():
        print("  Vaccinated group has higher antibody levels")
    else:
        print("  Unvaccinated group has higher antibody levels")
else:
    print("RESULT: No significant difference")

print("Analysis complete!")
"""

    vaccination_data = [
        {"patient_id": 1, "vaccination_status": "vaccinated", "antibody_level": 85},
        {"patient_id": 2, "vaccination_status": "unvaccinated", "antibody_level": 25},
        {"patient_id": 3, "vaccination_status": "vaccinated", "antibody_level": 92},
        {"patient_id": 4, "vaccination_status": "unvaccinated", "antibody_level": 18},
        {"patient_id": 5, "vaccination_status": "vaccinated", "antibody_level": 88},
        {"patient_id": 6, "vaccination_status": "unvaccinated", "antibody_level": 32}
    ]
    
    payload = {
        "code": simple_code,
        "fileName": "test.csv", 
        "fileData": vaccination_data
    }
    
    try:
        print("Sending request...")
        
        response = requests.post(
            "http://localhost:8001/api/execute-python",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get('success'):
                output = result.get('output', '')
                print("SUCCESS! Output:")
                print("=" * 60)
                print(output)
                print("=" * 60)
                
                # Check if we got the analysis
                if "STATISTICAL ANALYSIS" in output and "T-statistic:" in output:
                    print("COMPLETE ANALYSIS WORKING!")
                    return True
                else:
                    print("Still not getting full output")
                    return False
            else:
                print("Execution failed")
                print("Error:", result.get('error'))
                return False
        else:
            print("HTTP Error:", response.status_code)
            return False
            
    except Exception as e:
        print("Request failed:", e)
        return False

if __name__ == "__main__":
    success = test_simple_fix()
    
    if success:
        print("\nSYSTEM IS NOW WORKING!")
        print("AI can generate statistical analysis")
        print("Users will see proper results")
    else:
        print("\nSystem still has issues")