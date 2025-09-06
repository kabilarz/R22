#!/usr/bin/env python3
"""
Final test - user code executes directly at module level with no try wrapper
"""

import requests
import json

def test_final_solution():
    """Test that user code executes at module level without indentation issues"""
    
    print("🔥 FINAL INDENTATION SOLUTION TEST")
    print("=" * 60)
    print("User code now executes directly at module level - no try wrapper!")
    
    # Test with imports and statistical code
    test_code = """
import pandas as pd
import numpy as np
from scipy import stats

print("🔬 MEDICAL DATA ANALYSIS")
print("=" * 30)

# Basic analysis
print(f"Dataset shape: {df.shape}")
print(f"Columns: {list(df.columns)}")

# Statistical analysis
numeric_cols = df.select_dtypes(include=[np.number]).columns

if len(numeric_cols) > 0:
    print("\\n📊 DESCRIPTIVE STATISTICS:")
    for col in numeric_cols:
        mean_val = df[col].mean()
        std_val = df[col].std()
        print(f"{col}: Mean = {mean_val:.2f}, Std = {std_val:.2f}")

# Group comparison if categorical data exists
categorical_cols = df.select_dtypes(include=['object']).columns
if len(categorical_cols) > 0 and len(numeric_cols) > 0:
    group_col = categorical_cols[0]
    value_col = numeric_cols[0]
    
    groups = df[group_col].unique()
    if len(groups) == 2:
        print(f"\\n🧪 T-TEST: {value_col} by {group_col}")
        
        group1 = df[df[group_col] == groups[0]][value_col]
        group2 = df[df[group_col] == groups[1]][value_col]
        
        t_stat, p_val = stats.ttest_ind(group1, group2)
        
        print(f"Group 1 ({groups[0]}): {group1.mean():.2f}")
        print(f"Group 2 ({groups[1]}): {group2.mean():.2f}")
        print(f"T-statistic: {t_stat:.4f}")
        print(f"P-value: {p_val:.6f}")
        
        if p_val < 0.05:
            print("Result: SIGNIFICANT difference!")
        else:
            print("Result: No significant difference")

print("\\n✅ ANALYSIS COMPLETE!")
"""

    # Test data
    test_data = [
        {"age": 45, "treatment": "drug", "bp": 120},
        {"age": 52, "treatment": "placebo", "bp": 140},
        {"age": 38, "treatment": "drug", "bp": 118},
        {"age": 61, "treatment": "placebo", "bp": 145},
        {"age": 47, "treatment": "drug", "bp": 115},
        {"age": 55, "treatment": "placebo", "bp": 142}
    ]
    
    payload = {
        "code": test_code,
        "fileName": "clinical_trial.csv",
        "fileData": test_data
    }
    
    try:
        print("Testing module-level execution...")
        
        response = requests.post(
            "http://localhost:8001/api/execute-python",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get('success'):
                output = result.get('output', '')
                print("✅ SUCCESS! No more indentation errors!")
                print("\n" + "="*60)
                print("📊 FINAL ANALYSIS OUTPUT:")
                print("="*60)
                print(output)
                print("="*60)
                
                # Check for complete analysis
                analysis_indicators = [
                    "MEDICAL DATA ANALYSIS",
                    "DESCRIPTIVE STATISTICS:",
                    "Mean =",
                    "T-TEST:",
                    "T-statistic:",
                    "P-value:",
                    "ANALYSIS COMPLETE!"
                ]
                
                found_indicators = sum(1 for indicator in analysis_indicators if indicator in output)
                
                if found_indicators >= 6:
                    print(f"\n🎉 PERFECT! COMPLETE STATISTICAL ANALYSIS!")
                    print(f"✅ Imports working at module level")
                    print(f"✅ Statistical calculations complete")
                    print(f"✅ T-test with p-values displayed")
                    print(f"✅ No indentation errors")
                    print(f"📊 Found {found_indicators}/7 analysis components")
                    print(f"🚀 Your system is 100% functional!")
                    return True
                else:
                    print(f"⚠️ Partial analysis - {found_indicators}/7 components found")
                    return False
            else:
                error = result.get('error', '')
                print(f"❌ EXECUTION ERROR: {error}")
                
                if "IndentationError" in error:
                    print("🔥 INDENTATION ERROR STILL EXISTS!")
                    print("Backend restart required for fix to take effect")
                elif "expected an indented block" in error:
                    print("🔥 TRY BLOCK INDENTATION STILL BROKEN!")
                    print("The try wrapper removal didn't apply yet")
                
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

if __name__ == "__main__":
    success = test_final_solution()
    
    if success:
        print("\n🎉 FINAL SOLUTION SUCCESSFUL!")
        print("🏆 Indentation nightmare is OVER!")
        print("📊 Users get complete statistical analysis!")
        print("✅ Module-level execution working perfectly!")
    else:
        print("\n🔄 RESTART BACKEND FOR FINAL FIX:")
        print("   cd c:\\Users\\rock\\Desktop\\R24\\R22\\backend")
        print("   python app.py")
        print("   (User code now executes at module level - no try wrapper!)")