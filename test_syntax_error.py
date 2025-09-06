#!/usr/bin/env python3
"""
Test to reproduce the syntax error
"""

import requests
import json

def test_syntax_error():
    """Test what code might be causing the syntax error"""
    
    print("🔍 TESTING SYNTAX ERROR REPRODUCTION")
    print("=" * 50)
    
    # Test with potentially problematic code
    problematic_code = """
print("Starting analysis")
try:
    result = df.describe()
    print(result)
except Exception as e:
    print(f"Error: {e}")
print("Analysis complete")
"""
    
    test_data = [
        {"id": 1, "value": 10},
        {"id": 2, "value": 20}
    ]
    
    payload = {
        "code": problematic_code,
        "fileName": "test.csv",
        "fileData": test_data
    }
    
    print("Testing with user code containing try/except blocks...")
    print("User code:")
    print(problematic_code)
    print("-" * 30)
    
    try:
        response = requests.post(
            "http://localhost:8001/api/execute-python",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✅ SUCCESS - No syntax error")
                print("Output:", result.get('output', ''))
            else:
                print("❌ EXECUTION FAILED")
                print("Error:", result.get('error', ''))
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print("Response:", response.text)
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    test_syntax_error()