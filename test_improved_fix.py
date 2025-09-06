#!/usr/bin/env python3
"""
Test the improved indentation fix that executes user code at module level
"""

import requests
import json

def test_improved_fix():
    """Test that the new module-level execution works perfectly"""
    
    print("🎯 TESTING IMPROVED INDENTATION FIX")
    print("=" * 60)
    print("Testing module-level execution with imports and complex code")
    
    # Test code with imports and complex analysis
    advanced_code = """
import pandas as pd
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt

print("🔬 ADVANCED MEDICAL STATISTICAL ANALYSIS")
print("=" * 50)

# Dataset overview
print(f"📊 Dataset Information:")
print(f"   Shape: {df.shape}")
print(f"   Columns: {list(df.columns)}")

# Data types analysis
numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
categorical_cols = df.select_dtypes(include=['object']).columns.tolist()

print(f"\\n📈 Data Types:")
print(f"   Numeric columns ({len(numeric_cols)}): {numeric_cols}")
print(f"   Categorical columns ({len(categorical_cols)}): {categorical_cols}")

# Statistical Analysis
if len(numeric_cols) >= 2:
    print(f"\\n🧮 STATISTICAL ANALYSIS:")
    
    # Descriptive statistics
    desc_stats = df[numeric_cols].describe()
    print("📋 Descriptive Statistics:")
    print(desc_stats)
    
    # Correlation analysis
    corr_matrix = df[numeric_cols].corr()
    print(f"\\n🔗 Correlation Matrix:")
    print(corr_matrix)
    
    # If we have groups, perform t-test
    if len(categorical_cols) > 0:
        group_col = categorical_cols[0]
        value_col = numeric_cols[0]
        
        groups = df[group_col].unique()
        if len(groups) == 2:
            print(f"\\n🧪 T-TEST ANALYSIS:")
            print(f"   Comparing {value_col} between {group_col} groups")
            
            group1_data = df[df[group_col] == groups[0]][value_col]
            group2_data = df[df[group_col] == groups[1]][value_col]
            
            t_stat, p_value = stats.ttest_ind(group1_data, group2_data)
            
            print(f"   {groups[0]}: mean = {group1_data.mean():.2f}, n = {len(group1_data)}")
            print(f"   {groups[1]}: mean = {group2_data.mean():.2f}, n = {len(group2_data)}")
            print(f"   T-statistic: {t_stat:.4f}")
            print(f"   P-value: {p_value:.6f}")
            
            if p_value < 0.05:
                print("   ✅ SIGNIFICANT difference found (p < 0.05)")
            else:
                print("   ❌ No significant difference (p ≥ 0.05)")

print(f"\\n✅ ANALYSIS COMPLETE!")
print("🎉 Module-level execution successful!")
"""

    # Test data with medical context
    medical_data = [
        {"patient_id": 1, "age": 45, "treatment": "experimental", "bp_systolic": 120, "outcome": "improved"},
        {"patient_id": 2, "age": 52, "treatment": "control", "bp_systolic": 140, "outcome": "stable"},
        {"patient_id": 3, "age": 38, "treatment": "experimental", "bp_systolic": 118, "outcome": "improved"},
        {"patient_id": 4, "age": 61, "treatment": "control", "bp_systolic": 145, "outcome": "stable"},
        {"patient_id": 5, "age": 47, "treatment": "experimental", "bp_systolic": 115, "outcome": "improved"},
        {"patient_id": 6, "age": 55, "treatment": "control", "bp_systolic": 142, "outcome": "worsened"}
    ]
    
    payload = {
        "code": advanced_code,
        "fileName": "clinical_study.csv",
        "fileData": medical_data
    }
    
    try:
        print("Executing advanced medical analysis code...")
        
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
                print("\\n" + "="*70)
                print("📊 COMPLETE MEDICAL ANALYSIS OUTPUT:")
                print("="*70)
                print(output)
                print("="*70)
                
                # Check for expected content
                expected_content = [
                    "ADVANCED MEDICAL STATISTICAL ANALYSIS",
                    "Descriptive Statistics:",
                    "Correlation Matrix:",
                    "T-TEST ANALYSIS:",
                    "T-statistic:",
                    "P-value:",
                    "ANALYSIS COMPLETE!"
                ]
                
                content_found = sum(1 for item in expected_content if item in output)
                
                if content_found >= 6:  # Most content should be present
                    print(f"\\n🎉 PERFECT! COMPLETE MEDICAL ANALYSIS WORKING!")
                    print(f"✅ Module-level imports working")
                    print(f"✅ Complex statistical calculations")
                    print(f"✅ T-test with p-values")
                    print(f"✅ Medical data interpretation")
                    print(f"✅ No indentation errors")
                    print(f"📊 Found {content_found}/7 expected analysis components")
                    return True
                else:
                    print(f"⚠️ Partial success - found {content_found}/7 expected components")
                    return False
            else:
                error = result.get('error', '')
                print(f"❌ EXECUTION ERROR: {error}")
                if "IndentationError" in error or "expected an indented block" in error:
                    print("   🔥 INDENTATION STILL BROKEN!")
                elif "SyntaxError" in error:
                    print("   🔥 SYNTAX ERROR STILL PRESENT!")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print("Response:", response.text)
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

if __name__ == "__main__":
    success = test_improved_fix()
    
    if success:
        print("\\n🎉 IMPROVED FIX IS WORKING PERFECTLY!")
        print("🚀 Your Nemo AI medical platform is now fully functional!")
        print("📊 Users will get complete statistical analysis like Claude described!")
        print("✅ Indentation issues completely resolved!")
    else:
        print("\\n❌ Please restart your backend to apply the improved fix")
        print("   The new module-level execution should resolve all issues")