#!/usr/bin/env python3
"""
Simple test for DuckDB Python execution solution
"""

import requests
import json

def test_simple_duckdb():
    """Test basic DuckDB execution without Unicode emojis"""
    
    print("Testing DuckDB Python execution...")
    
    # Simple test data
    test_data = [
        {"id": 1, "name": "Alice", "age": 25, "status": "vaccinated"},
        {"id": 2, "name": "Bob", "age": 30, "status": "unvaccinated"},
        {"id": 3, "name": "Charlie", "age": 35, "status": "vaccinated"}
    ]
    
    # Simple test code without emoji characters
    test_code = """
print("Testing DuckDB execution...")
print("Dataset shape:", df.shape)
print("Columns:", list(df.columns))

# Test basic analysis
status_counts = df['status'].value_counts()
print("Status counts:")
for status, count in status_counts.items():
    print(f"  {status}: {count}")

print("Test completed successfully!")
"""
    
    payload = {
        "code": test_code,
        "fileName": "test_data.csv",
        "fileData": test_data
    }
    
    try:
        response = requests.post(
            "http://localhost:8001/api/execute-python",
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get('success'):
                print("SUCCESS: DuckDB execution working!")
                print("Output:")
                print(result['output'])
                return True
            else:
                print("FAILED: Execution error")
                print("Error:", result.get('error'))
                return False
        else:
            print(f"HTTP Error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Test error: {e}")
        return False

if __name__ == "__main__":
    success = test_simple_duckdb()
    if success:
        print("\nDuckDB solution is working!")
    else:
        print("\nDuckDB solution needs fixing.")