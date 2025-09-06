#!/usr/bin/env python3
"""
Test the indentation fix - should work without ANY indentation errors
"""

import requests
import json

def test_indentation_fix():
    """Test that indentation errors are completely eliminated"""
    
    print("🔧 TESTING INDENTATION FIX")
    print("=" * 50)
    
    # Simple analysis code
    simple_code = """
print("STATISTICAL ANALYSIS STARTING")
print("Dataset info:", df.shape)

# Basic stats
if len(df.select_dtypes(include=['number']).columns) > 0:
    numeric_cols = df.select_dtypes(include=['number']).columns
    print("NUMERIC ANALYSIS:")
    for col in numeric_cols:
        mean_val = df[col].mean()
        print(f"  {col}: Mean = {mean_val:.2f}")

print("ANALYSIS COMPLETE!")
"""

    test_data = [
        {"age": 45, "bp": 120},
        {"age": 52, "bp": 140}, 
        {"age": 38, "bp": 115},
        {"age": 61, "bp": 145}
    ]
    
    payload = {
        "code": simple_code,
        "fileName": "test.csv",
        "fileData": test_data
    }
    
    try:
        response = requests.post(
            "http://localhost:8001/api/execute-python",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get('success'):
                output = result.get('output', '')
                print("✅ SUCCESS! No indentation errors!")
                print("\n" + "="*50)
                print(output)
                print("="*50)
                
                if "Mean = " in output and "ANALYSIS COMPLETE!" in output:
                    print("\n🎉 PERFECT! Real statistics working!")
                    return True
                else:
                    print("\n⚠️ Code ran but missing expected output")
                    return False
            else:
                error = result.get('error', '')
                print(f"❌ ERROR: {error}")
                if "IndentationError" in error:
                    print("   Still having indentation issues")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

if __name__ == "__main__":
    success = test_indentation_fix()
    
    if success:
        print("\n🎉 INDENTATION FIXED!")
        print("✅ No more IndentationError")
        print("✅ Real statistical analysis working")
        print("🚀 Your laptop is safe!")
    else:
        print("\n❌ Need to restart backend for fix to take effect")