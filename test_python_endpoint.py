#!/usr/bin/env python3
import requests
import json

try:
    url = "http://localhost:8001/api/execute-python"
    payload = {
        "code": "print('Hello World')",
        "fileName": "test.csv", 
        "fileData": []
    }
    
    response = requests.post(url, json=payload, timeout=10)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Success: {data.get('success', False)}")
        print(f"Output: {data.get('output', 'No output')}")
        if data.get('error'):
            print(f"Error: {data.get('error')}")
    else:
        print(f"Response: {response.text}")
        
except Exception as e:
    print(f"Request failed: {e}")