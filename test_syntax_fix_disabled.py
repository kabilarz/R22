#!/usr/bin/env python3
"""
Test without validation - should now work and show real analysis
"""

import requests
import json

def test_without_validation():
    """Test that validation is disabled and we get real output"""
    
    print("🔧 TESTING WITHOUT VALIDATION")
    print("=" * 50)
    
    # Simple statistical analysis
    analysis_code = """
# Basic statistical analysis
print("STARTING REAL ANALYSIS")
print("Dataset info:", df.shape)
print("Columns:", list(df.columns))

# Calculate statistics if numeric columns exist
numeric_cols = df.select_dtypes(include=['number']).columns
if len(numeric_cols) > 0:
    print("\\nNUMERIC ANALYSIS:")
    for col in numeric_cols:
        print(f"{col}: Mean = {df[col].mean():.2f}, Std = {df[col].std():.2f}")
        
# Categorical analysis
categorical_cols = df.select_dtypes(include=['object']).columns  
if len(categorical_cols) > 0:
    print("\\nCATEGORICAL ANALYSIS:")
    for col in categorical_cols:
        print(f"{col} value counts:")
        print(df[col].value_counts())
        
print("\\nANALYSIS COMPLETE!")
"""

    test_data = [
        {"age": 45, "treatment": "drug", "outcome": "improved"},
        {"age": 52, "treatment": "placebo", "outcome": "stable"},
        {"age": 38, "treatment": "drug", "outcome": "improved"},
        {"age": 61, "treatment": "placebo", "outcome": "worsened"},
        {"age": 47, "treatment": "drug", "outcome": "improved"}
    ]
    
    payload = {
        "code": analysis_code,
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
                print("✅ SUCCESS! Here's the output:")
                print("\n" + "="*60)
                print(output)
                print("="*60)
                
                if "STARTING REAL ANALYSIS" in output and "Mean =" in output:
                    print("\n🎉 PERFECT! Real statistical analysis working!")
                    print("✅ No more validation errors")
                    print("✅ Actual statistics calculated")
                    print("✅ Complete analysis output shown")
                    return True
                else:
                    print("\n⚠️ Output shown but missing expected analysis")
                    return False
            else:
                error = result.get('error', '')
                if "syntax error" in error.lower():
                    print("❌ Still getting syntax errors")
                else:
                    print(f"❌ Other error: {error}")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

if __name__ == "__main__":
    success = test_without_validation()
    
    if success:
        print("\n🎉 VALIDATION DISABLED - REAL ANALYSIS WORKING!")
        print("You should now restart backend and get real statistical results!")
    else:
        print("\n❌ Still having issues - may need backend restart")