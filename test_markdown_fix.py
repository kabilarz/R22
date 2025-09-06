#!/usr/bin/env python3
"""
Test markdown code fence removal
"""

import requests
import json

def test_markdown_removal():
    """Test that markdown code fences are properly removed"""
    
    print("🔧 TESTING MARKDOWN CODE FENCE REMOVAL")
    print("=" * 60)
    
    # Code with markdown fences (like what's causing the error)
    code_with_markdown = """```python
print("REAL STATISTICAL ANALYSIS")
print("=" * 40)

# Show basic stats
print("Dataset shape:", df.shape)
print("Columns:", list(df.columns))

# Calculate means for numeric columns
numeric_cols = df.select_dtypes(include=['number']).columns
for col in numeric_cols:
    mean_val = df[col].mean()
    std_val = df[col].std()
    print(f"{col}: Mean = {mean_val:.2f}, Std = {std_val:.2f}")

print("Analysis complete!")
```"""

    test_data = [
        {"age": 45, "bp": 120, "treatment": "drug"},
        {"age": 52, "bp": 140, "treatment": "placebo"},
        {"age": 38, "bp": 115, "treatment": "drug"},
        {"age": 61, "bp": 145, "treatment": "placebo"}
    ]
    
    payload = {
        "code": code_with_markdown,
        "fileName": "test.csv",
        "fileData": test_data
    }
    
    try:
        print("Sending code with markdown fences...")
        print("Should auto-remove ```python and ``` lines")
        
        response = requests.post(
            "http://localhost:8001/api/execute-python",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get('success'):
                output = result.get('output', '')
                print("✅ SUCCESS! Markdown cleaning worked!")
                print("\n" + "="*60)
                print("ACTUAL OUTPUT:")
                print("="*60)
                print(output)
                print("="*60)
                
                if "REAL STATISTICAL ANALYSIS" in output and "Mean =" in output:
                    print("\n🎉 PERFECT! Real analysis working with markdown removed!")
                    return True
                else:
                    print("\n⚠️ Code executed but missing expected output")
                    return False
            else:
                error = result.get('error', '')
                print(f"❌ EXECUTION FAILED: {error}")
                if "```python" in error:
                    print("   Markdown fences still causing issues")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

if __name__ == "__main__":
    success = test_markdown_removal()
    
    if success:
        print("\n🎉 MARKDOWN CLEANING WORKING!")
        print("✅ Code fences automatically removed")
        print("✅ Real statistical analysis displayed")  
        print("🚀 Your system should now handle any code format!")
    else:
        print("\n❌ Still having issues - restart backend after this fix")