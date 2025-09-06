#!/usr/bin/env python3
"""
Test pandas import fix - both 'pd' and 'pandas' should work
"""

import requests
import json

def test_pandas_import_fix():
    """Test that both 'pd' and 'pandas' imports work"""
    
    print("🐼 TESTING PANDAS IMPORT FIX")
    print("=" * 40)
    
    test_data = [
        {"id": 1, "name": "Alice", "age": 25, "score": 85},
        {"id": 2, "name": "Bob", "age": 30, "score": 92},
        {"id": 3, "name": "Charlie", "age": 35, "score": 78}
    ]
    
    # Test 1: Using 'pd' (should work)
    test_code_pd = """
print("Test 1: Using 'pd'")
print("Dataset shape:", df.shape)
print("Mean score:", df['score'].mean())
new_df = pd.DataFrame({'test': [1, 2, 3]})
print("New DataFrame created with pd:", new_df.shape)
"""
    
    # Test 2: Using 'pandas' directly (should also work now)
    test_code_pandas = """
print("Test 2: Using 'pandas' directly")
print("Dataset shape:", df.shape)
print("Max age:", df['age'].max())
another_df = pandas.DataFrame({'test2': [4, 5, 6]})
print("New DataFrame created with pandas:", another_df.shape)
"""
    
    # Test 3: Mixed usage (should work)
    test_code_mixed = """
print("Test 3: Mixed pandas/pd usage")
print("Dataset info:", df.shape)
subset = df[df['age'] > 28]
print("Filtered with df:", subset.shape)
summary = pd.DataFrame({'metric': ['count', 'mean'], 'value': [len(df), df['score'].mean()]})
print("Summary with pd:", summary)
"""
    
    tests = [
        ("Using 'pd'", test_code_pd),
        ("Using 'pandas'", test_code_pandas), 
        ("Mixed usage", test_code_mixed)
    ]
    
    success_count = 0
    
    for test_name, code in tests:
        print(f"\n📋 {test_name}:")
        print("-" * 30)
        
        payload = {
            "code": code,
            "fileName": "test.csv",
            "fileData": test_data
        }
        
        try:
            response = requests.post(
                "http://localhost:8001/api/execute-python",
                json=payload,
                timeout=15
            )
            
            if response.status_code == 200:
                result = response.json()
                
                if result.get('success'):
                    print("✅ SUCCESS!")
                    output = result.get('output', '')
                    if output:
                        print(f"Output: {output}")
                    success_count += 1
                else:
                    error = result.get('error', '')
                    if "'pandas' is not defined" in error:
                        print("❌ PANDAS IMPORT ISSUE STILL EXISTS!")
                        print(f"Error: {error}")
                    else:
                        print(f"❌ Other error: {error}")
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Request failed: {e}")
    
    print(f"\n" + "=" * 50)
    print("📊 PANDAS IMPORT TEST RESULTS")  
    print("=" * 50)
    print(f"Tests passed: {success_count}/{len(tests)}")
    
    if success_count == len(tests):
        print("🎉 ALL PANDAS IMPORT TESTS PASSED!")
        print("✅ Both 'pd' and 'pandas' are available")
        print("✅ No more 'pandas is not defined' errors")
        print("✅ AI-generated code will work properly")
    else:
        print("⚠️ Some pandas import issues remain")
        print("💡 You may need to restart the backend for changes to take effect")
    
    return success_count == len(tests)

if __name__ == "__main__":
    success = test_pandas_import_fix()
    if success:
        print("\n🚀 Ready for AI code generation without pandas errors!")
    else:
        print("\n🔧 Please restart backend: cd c:\\Users\\rock\\Desktop\\R24\\R22\\backend && python app.py")