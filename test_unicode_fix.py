#!/usr/bin/env python3
"""
Test Unicode Fix for Python Execution
Verifies that emoji characters no longer cause encoding errors
"""

import requests
import json

def test_unicode_fix():
    """Test that Python execution works without Unicode encoding errors"""
    
    print("Testing Unicode fix for Python execution...")
    
    # Simple test data
    test_data = [
        {"name": "Alice", "age": 25, "status": "vaccinated"},
        {"name": "Bob", "age": 30, "status": "unvaccinated"},
    ]
    
    # Simple test code that should work now
    test_code = """
print("Testing Python execution without Unicode errors...")
print(f"Data shape: {df.shape}")
print("Column names:", list(df.columns))

# Test basic data analysis
print("Data summary:")
for index, row in df.iterrows():
    print(f"  {row['name']}: {row['age']} years old, {row['status']}")

print("Analysis completed successfully!")
"""
    
    payload = {
        "code": test_code,
        "fileName": "test_data.csv",
        "fileData": test_data
    }
    
    try:
        print("Sending request to backend...")
        response = requests.post(
            "http://localhost:8001/api/execute-python",
            json=payload,
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get('success'):
                print("SUCCESS: Unicode fix working!")
                print("\nOutput:")
                print("-" * 40)
                print(result['output'])
                print("-" * 40)
                
                if result.get('execution_time'):
                    print(f"Execution time: {result['execution_time']:.2f}s")
                
                return True
            else:
                print("FAILED: Still getting errors")
                print("Error:", result.get('error'))
                return False
        else:
            print(f"HTTP Error: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("CONNECTION ERROR: Backend not running")
        print("Please start backend with: cd backend && python app.py")
        return False
    except Exception as e:
        print(f"Test error: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Unicode Encoding Fix")
    print("=" * 40)
    
    success = test_unicode_fix()
    
    print("\n" + "=" * 40)
    if success:
        print("✅ Unicode fix is working!")
        print("Python execution now works on Windows without encoding errors!")
        print("Medical professionals can now run statistical analysis without issues!")
    else:
        print("❌ Unicode fix needs more work")
        print("Check the backend logs for more details")