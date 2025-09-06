#!/usr/bin/env python3
"""
Test the syntax error fix with various code patterns
"""

import requests
import json

def test_syntax_fixes():
    """Test various code patterns that might cause syntax errors"""
    
    print("🔧 TESTING SYNTAX ERROR FIXES")
    print("=" * 60)
    
    # Test cases with potentially problematic code
    test_cases = [
        {
            "name": "Simple Analysis",
            "code": """
print("Basic statistics")
print(df.describe())
print("Analysis complete")
"""
        },
        {
            "name": "Try/Except Block", 
            "code": """
print("Statistical analysis with error handling")
try:
    result = df.describe()
    print("Descriptive statistics:")
    print(result)
except Exception as e:
    print(f"Error: {e}")
print("Analysis complete")
"""
        },
        {
            "name": "Multiple Try/Except",
            "code": """
# Multiple try/except blocks
try:
    print("Dataset shape:", df.shape)
    print("Column names:", list(df.columns))
except Exception as e:
    print(f"Shape error: {e}")

try:
    stats = df.describe()
    print("Statistics computed successfully")
    print(stats)
except Exception as e:
    print(f"Stats error: {e}")
"""
        },
        {
            "name": "Empty Lines and Indentation",
            "code": """
print("Analysis with empty lines")

if len(df) > 0:
    print("Dataset has data")
    
    # Calculate basic stats
    mean_values = df.select_dtypes(include='number').mean()
    print("Mean values:")
    print(mean_values)
    
else:
    print("Dataset is empty")

print("Done")
"""
        }
    ]
    
    test_data = [
        {"patient_id": 1, "age": 45, "treatment": "drug_a", "outcome": "improved"},
        {"patient_id": 2, "age": 52, "treatment": "placebo", "outcome": "no_change"},
        {"patient_id": 3, "age": 38, "treatment": "drug_a", "outcome": "improved"}
    ]
    
    passed_tests = 0
    total_tests = len(test_cases)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🔍 Test {i}: {test_case['name']}")
        print("-" * 40)
        
        payload = {
            "code": test_case["code"],
            "fileName": "test_data.csv",
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
                    print("✅ SUCCESS - Code executed without syntax errors")
                    output = result.get('output', '')
                    if output:
                        print("Sample output:", output[:100] + "..." if len(output) > 100 else output)
                    passed_tests += 1
                else:
                    print("❌ EXECUTION FAILED")
                    error = result.get('error', '')
                    if "syntax" in error.lower():
                        print(f"   SYNTAX ERROR: {error}")
                    else:
                        print(f"   OTHER ERROR: {error}")
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Request failed: {e}")
    
    # Summary
    print(f"\n📊 TEST SUMMARY")
    print("=" * 30)
    print(f"Tests passed: {passed_tests}/{total_tests}")
    
    if passed_tests == total_tests:
        print("🎉 ALL SYNTAX FIXES WORKING!")
        print("✅ User code with try/except blocks now executes correctly")
        print("✅ Indentation issues resolved")
        print("✅ Empty line handling improved") 
        return True
    else:
        print("⚠️ Some tests still failing")
        return False

def test_validation_system():
    """Test the code validation system"""
    
    print(f"\n🔍 TESTING CODE VALIDATION SYSTEM") 
    print("=" * 50)
    
    # Test invalid syntax
    invalid_code = """
print("This will fail")
if True
    print("Missing colon")
"""
    
    payload = {
        "code": invalid_code,
        "fileName": "test.csv", 
        "fileData": [{"id": 1, "value": 10}]
    }
    
    try:
        response = requests.post(
            "http://localhost:8001/api/execute-python",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            
            if not result.get('success') and "syntax" in result.get('error', '').lower():
                print("✅ VALIDATION WORKING - Invalid syntax caught before execution")
                print(f"Error message: {result.get('error', '')}")
                return True
            else:
                print("❌ Validation not working - Invalid code executed")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

if __name__ == "__main__":
    # Test syntax fixes
    syntax_ok = test_syntax_fixes()
    
    # Test validation system  
    validation_ok = test_validation_system()
    
    if syntax_ok and validation_ok:
        print(f"\n🎉 ALL FIXES SUCCESSFUL!")
        print("🔧 Syntax error issues resolved")
        print("🛡️ Code validation system working")
        print("✅ Python execution is now robust")
    else:
        print(f"\n⚠️ Some issues remain")