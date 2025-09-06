#!/usr/bin/env python3
"""
Test proper data type handling for medical analysis
This shows how to correctly handle mixed data types in medical datasets
"""

import requests
import json

def test_proper_data_type_handling():
    """Test correct data type detection and analysis"""
    
    print("🏥 TESTING PROPER MEDICAL DATA TYPE ANALYSIS")
    print("=" * 55)
    
    # Realistic medical dataset with mixed data types
    medical_data = [
        {"patient_id": "P001", "age": 45, "gender": "male", "treatment": "drug_a", "bp_systolic": 140, "bp_diastolic": 90, "outcome": "improved", "weight_kg": 75.5},
        {"patient_id": "P002", "age": 52, "gender": "female", "treatment": "placebo", "bp_systolic": 150, "bp_diastolic": 95, "outcome": "stable", "weight_kg": 68.2},
        {"patient_id": "P003", "age": 38, "gender": "male", "treatment": "drug_a", "bp_systolic": 135, "bp_diastolic": 88, "outcome": "improved", "weight_kg": 82.1},
        {"patient_id": "P004", "age": 61, "gender": "female", "treatment": "placebo", "bp_systolic": 155, "bp_diastolic": 98, "outcome": "worsened", "weight_kg": 71.8}
    ]
    
    # CORRECT way to handle medical data with mixed types
    correct_analysis_code = """
print("🏥 COMPREHENSIVE MEDICAL DATA ANALYSIS")
print("=" * 45)

# Step 1: Basic dataset information
print(f"Dataset shape: {df.shape}")
print(f"Total patients: {df.shape[0]}")
print(f"Total variables: {df.shape[1]}")

# Step 2: Examine data types
print("\\n📊 DATA TYPES ANALYSIS:")
print(df.dtypes)

# Step 3: Identify different column types
numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
categorical_cols = df.select_dtypes(include=['object']).columns.tolist()

print(f"\\n📈 NUMERIC COLUMNS ({len(numeric_cols)}):")
print(numeric_cols)

print(f"\\n📋 CATEGORICAL COLUMNS ({len(categorical_cols)}):")
print(categorical_cols)

# Step 4: Descriptive statistics for numeric data ONLY
if len(numeric_cols) > 0:
    print("\\n🔢 DESCRIPTIVE STATISTICS (Numeric Variables):")
    print(df[numeric_cols].describe())
    
    print("\\n📊 SUMMARY STATISTICS:")
    for col in numeric_cols:
        mean_val = df[col].mean()
        std_val = df[col].std()
        print(f"  {col}: Mean = {mean_val:.2f}, Std = {std_val:.2f}")
else:
    print("\\n⚠️ No numeric columns found for descriptive statistics")

# Step 5: Frequency analysis for categorical data
if len(categorical_cols) > 0:
    print("\\n📈 FREQUENCY ANALYSIS (Categorical Variables):")
    for col in categorical_cols:
        print(f"\\n{col.upper()} frequencies:")
        freq_counts = df[col].value_counts()
        print(freq_counts)
        
        # Show percentages too
        freq_pct = df[col].value_counts(normalize=True) * 100
        print(f"{col} percentages:")
        print(freq_pct.round(2))

# Step 6: Missing data analysis
print("\\n🔍 MISSING DATA ANALYSIS:")
missing_data = df.isnull().sum()
if missing_data.sum() > 0:
    print("Missing values per column:")
    print(missing_data[missing_data > 0])
else:
    print("✅ No missing data found")

print("\\n✅ COMPREHENSIVE ANALYSIS COMPLETE!")
print("📋 Summary:")
print(f"  - {len(numeric_cols)} numeric variables analyzed")
print(f"  - {len(categorical_cols)} categorical variables analyzed") 
print(f"  - {df.shape[0]} patient records processed")
"""
    
    print("Testing comprehensive medical data analysis...")
    
    payload = {
        "code": correct_analysis_code,
        "fileName": "medical_data.csv",
        "fileData": medical_data
    }
    
    try:
        response = requests.post(
            "http://localhost:8001/api/execute-python",
            json=payload,
            timeout=20
        )
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get('success'):
                print("✅ COMPREHENSIVE ANALYSIS SUCCESS!")
                print("\n" + "="*60)
                print("📊 ANALYSIS OUTPUT:")
                print("="*60)
                output = result.get('output', '')
                print(output)
                print("="*60)
                
                # Check for expected content
                expected_elements = [
                    "Dataset shape:",
                    "DATA TYPES ANALYSIS:",
                    "NUMERIC COLUMNS",
                    "CATEGORICAL COLUMNS", 
                    "DESCRIPTIVE STATISTICS",
                    "FREQUENCY ANALYSIS",
                    "MISSING DATA ANALYSIS"
                ]
                
                found_elements = sum(1 for elem in expected_elements if elem in output)
                
                print(f"\n📊 ANALYSIS QUALITY CHECK:")
                print(f"✅ Found {found_elements}/{len(expected_elements)} expected analysis components")
                
                if found_elements >= 6:
                    print("🎉 EXCELLENT - Complete medical data analysis!")
                    print("✅ Proper data type handling")
                    print("✅ No 'Cannot describe DataFrame' errors")
                    print("✅ Comprehensive statistical output")
                    return True
                else:
                    print("⚠️ Analysis incomplete - some components missing")
                    
            else:
                print("❌ ANALYSIS FAILED:")
                error = result.get('error', '')
                print(f"Error: {error}")
                
                if "Cannot describe a DataFrame without columns" in error:
                    print("🔥 STILL HAVE DATA TYPE ISSUE!")
                else:
                    print("💡 Different error - may be fixable")
                    
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    return False

def test_data_type_debugging():
    """Test data type detection specifically"""
    
    print(f"\n🔬 DATA TYPE DEBUGGING TEST")
    print("=" * 40)
    
    debug_code = """
print("🔬 DATA TYPE DEBUGGING")
print("=" * 30)

print("Dataset shape:", df.shape)
print("\\nColumn names:")
print(list(df.columns))

print("\\nData types:")
print(df.dtypes)

print("\\nFirst few rows:")
print(df.head())

print("\\nNumeric column detection:")
numeric_cols = df.select_dtypes(include=['number']).columns
print(f"Numeric columns found: {len(numeric_cols)}")
print(f"Numeric columns: {list(numeric_cols)}")

print("\\nCategorical column detection:")
categorical_cols = df.select_dtypes(include=['object']).columns  
print(f"Categorical columns found: {len(categorical_cols)}")
print(f"Categorical columns: {list(categorical_cols)}")

# Try describe on numeric columns only
if len(numeric_cols) > 0:
    print("\\n✅ Describing numeric columns:")
    print(df[numeric_cols].describe())
else:
    print("\\n⚠️ No numeric columns to describe")
"""
    
    test_data = [
        {"id": "A001", "age": 25, "score": 85.5, "group": "treatment"},
        {"id": "A002", "age": 30, "score": 92.3, "group": "control"}
    ]
    
    payload = {
        "code": debug_code,
        "fileName": "debug.csv",
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
                print("✅ DEBUG SUCCESS!")
                output = result.get('output', '')
                print(output)
                return True
            else:
                print("❌ DEBUG FAILED:")
                print(result.get('error', ''))
                
    except Exception as e:
        print(f"❌ Debug failed: {e}")
    
    return False

if __name__ == "__main__":
    print("🚀 TESTING PROPER MEDICAL DATA TYPE HANDLING")
    print("This test verifies that data type errors are fixed\n")
    
    # Test comprehensive analysis
    analysis_success = test_proper_data_type_handling()
    
    # Test debugging
    debug_success = test_data_type_debugging()
    
    print(f"\n" + "="*60)
    print("📊 FINAL TEST RESULTS")
    print("="*60)
    
    if analysis_success and debug_success:
        print("🎉 ALL DATA TYPE TESTS PASSED!")
        print("✅ No more 'Cannot describe DataFrame' errors")
        print("✅ Proper numeric/categorical column detection")
        print("✅ Comprehensive medical data analysis working")
        print("🏥 Ready for medical research!")
    else:
        print("⚠️ Some data type issues remain")
        print("💡 May need to restart backend for AI prompt updates")