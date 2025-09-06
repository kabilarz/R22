#!/usr/bin/env python3
"""
Test the output fix - should now show REAL statistical analysis
"""

import requests
import json

def test_output_fix():
    """Test that we now get actual analysis output"""
    
    print("🔥 TESTING OUTPUT FIX")
    print("=" * 50)
    print("Should now show REAL t-test results, not just dataset info")
    
    # Simple t-test data
    data = [
        {"group": "A", "value": 10}, {"group": "A", "value": 12}, {"group": "A", "value": 11},
        {"group": "B", "value": 20}, {"group": "B", "value": 22}, {"group": "B", "value": 21}
    ]
    
    # Simple analysis that should show actual results
    code = """
print("STARTING ANALYSIS")
print("Group A mean:", df[df['group'] == 'A']['value'].mean())
print("Group B mean:", df[df['group'] == 'B']['value'].mean())

from scipy import stats
group_a = df[df['group'] == 'A']['value']
group_b = df[df['group'] == 'B']['value']
t_stat, p_val = stats.ttest_ind(group_a, group_b)

print(f"T-statistic: {t_stat:.4f}")
print(f"P-value: {p_val:.6f}")
print("ANALYSIS COMPLETE!")
"""
    
    payload = {
        "code": code,
        "fileName": "test.csv",
        "fileData": data
    }
    
    try:
        response = requests.post(
            "http://localhost:8001/api/execute-python",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            output = result.get('output', '')
            
            print("RESPONSE OUTPUT:")
            print("-" * 50)
            print(output)
            print("-" * 50)
            
            if "T-statistic:" in output and "P-value:" in output:
                print("🎉 SUCCESS! Real statistical analysis is working!")
                return True
            else:
                print("❌ Still not working - no statistical results")
                return False
        else:
            print(f"HTTP Error: {response.status_code}")
            return False
    except Exception as e:
        print(f"Request error: {e}")
        return False

if __name__ == "__main__":
    if test_output_fix():
        print("\n✅ FIXED! You should now get real statistical results!")
    else:
        print("\n❌ Still broken - need more debugging")