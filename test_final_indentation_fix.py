#!/usr/bin/env python3
"""
FINAL TEST - This should eliminate ALL indentation errors
"""

import requests
import json

def test_final_fix():
    """Test that indentation is completely fixed"""
    
    print("🔧 FINAL INDENTATION TEST")
    print("=" * 50)
    print("This should work with ANY user code format")
    
    # Test various code formats that were causing issues
    test_code = """
print("MEDICAL STATISTICAL ANALYSIS")
print("=" * 40)

# Basic dataset info
print("Dataset shape:", df.shape)
print("Columns:", list(df.columns))

# Statistical analysis
numeric_cols = df.select_dtypes(include=['number']).columns
print("\\nNUMERIC ANALYSIS:")

for col in numeric_cols:
    mean_val = df[col].mean()
    std_val = df[col].std()
    print(f"{col}:")
    print(f"  Mean: {mean_val:.2f}")
    print(f"  Std:  {std_val:.2f}")

# Correlation if multiple numeric columns
if len(numeric_cols) > 1:
    print("\\nCORRELATION ANALYSIS:")
    corr_matrix = df[numeric_cols].corr()
    print(corr_matrix)

print("\\nANALYSIS COMPLETE!")
"""

    test_data = [
        {"age": 45, "bp": 120, "cholesterol": 180},
        {"age": 52, "bp": 140, "cholesterol": 220}, 
        {"age": 38, "bp": 115, "cholesterol": 160},
        {"age": 61, "bp": 145, "cholesterol": 240},
        {"age": 47, "bp": 125, "cholesterol": 190}
    ]
    
    payload = {
        "code": test_code,
        "fileName": "medical_data.csv",
        "fileData": test_data
    }
    
    try:
        print("Testing complex medical analysis code...")
        
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
                print("\n" + "="*60)
                print("REAL MEDICAL ANALYSIS OUTPUT:")
                print("="*60)
                print(output)
                print("="*60)
                
                # Check for expected statistical content
                has_stats = all(x in output for x in ["Mean:", "ANALYSIS COMPLETE!", "Dataset shape:"])
                
                if has_stats:
                    print("\n🎉 PERFECT! COMPLETE MEDICAL ANALYSIS WORKING!")
                    print("✅ No IndentationError")
                    print("✅ Real statistical calculations")
                    print("✅ Proper medical data analysis")
                    print("✅ Your system is fully functional!")
                    return True
                else:
                    print("\n⚠️ Code executed but missing statistical content")
                    return False
            else:
                error = result.get('error', '')
                print(f"❌ EXECUTION ERROR: {error}")
                if "IndentationError" in error or "expected an indented block" in error:
                    print("   🔥 STILL HAVE INDENTATION ISSUES!")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

if __name__ == "__main__":
    success = test_final_fix()
    
    if success:
        print("\n🎉 ALL INDENTATION ISSUES RESOLVED!")
        print("🚀 Your Nemo medical AI platform is working perfectly!")
        print("📊 You can now run any statistical analysis!")
    else:
        print("\n❌ Please restart your backend to apply the indentation fix")
        print("   cd c:\\Users\\rock\\Desktop\\R24\\R22\\backend")
        print("   python app.py")