#!/usr/bin/env python3
"""
Test data type conversion fix for medical datasets
This verifies that numeric columns are properly converted for statistical analysis
"""

import requests
import json

def test_data_type_conversion():
    """Test that medical data types are properly converted"""
    
    print("🔬 TESTING DATA TYPE CONVERSION FIX")
    print("=" * 50)
    
    # Test with realistic medical data that might have type issues
    medical_data = [
        {"patient_id": "P001", "age": "45", "treatment_group": "Treatment_A", "week_12_systolic_bp": "132", "outcome": "Improved"},
        {"patient_id": "P002", "age": "52", "treatment_group": "Treatment_B", "week_12_systolic_bp": "148", "outcome": "Improved"},
        {"patient_id": "P003", "age": "38", "treatment_group": "Control", "week_12_systolic_bp": "141", "outcome": "Stable"},
        {"patient_id": "P004", "age": "61", "treatment_group": "Treatment_A", "week_12_systolic_bp": "138", "outcome": "Improved"}
    ]
    
    # Test code that performs T-test with proper type conversion
    test_code = """
print("🏥 MEDICAL DATA TYPE CONVERSION TEST")
print("=" * 45)

# Check initial data types
print("Initial data types:")
print(df.dtypes)

print(f"\\nDataset: {df.shape[0]} patients, {df.shape[1]} variables")

# Test numeric column detection BEFORE conversion
numeric_cols_before = df.select_dtypes(include=['number']).columns
print(f"\\nNumeric columns BEFORE conversion: {len(numeric_cols_before)}")
print(list(numeric_cols_before))

# The DuckDB loader should have already converted types, but let's verify
print(f"\\nAge column type: {df['age'].dtype}")
print(f"Week 12 BP column type: {df['week_12_systolic_bp'].dtype}")

# Test that age is now numeric for T-test
if pd.api.types.is_numeric_dtype(df['age']):
    print("✅ Age column is numeric!")
    print(f"Age statistics: mean={df['age'].mean():.1f}, std={df['age'].std():.1f}")
else:
    print("❌ Age column is still not numeric!")
    print(f"Age sample values: {df['age'].head().tolist()}")

# Test that blood pressure is numeric
if pd.api.types.is_numeric_dtype(df['week_12_systolic_bp']):
    print("✅ Blood pressure column is numeric!")
    print(f"BP statistics: mean={df['week_12_systolic_bp'].mean():.1f}, std={df['week_12_systolic_bp'].std():.1f}")
else:
    print("❌ Blood pressure column is still not numeric!")
    print(f"BP sample values: {df['week_12_systolic_bp'].head().tolist()}")

# Test T-test between treatment groups using blood pressure
print("\\n🧪 TESTING T-TEST WITH CONVERTED DATA:")
treatment_groups = df['treatment_group'].unique()
print(f"Treatment groups found: {list(treatment_groups)}")

# Filter to just two groups for T-test
group1_data = df[df['treatment_group'] == 'Treatment_A']['week_12_systolic_bp'].dropna()
group2_data = df[df['treatment_group'] == 'Control']['week_12_systolic_bp'].dropna()

print(f"\\nGroup sizes:")
print(f"  Treatment_A: {len(group1_data)} patients")
print(f"  Control: {len(group2_data)} patients")

if len(group1_data) > 0 and len(group2_data) > 0:
    try:
        from scipy import stats
        t_stat, p_value = stats.ttest_ind(group1_data, group2_data)
        
        print(f"\\n📊 T-TEST RESULTS:")
        print(f"  T-statistic: {t_stat:.4f}")
        print(f"  P-value: {p_value:.6f}")
        print(f"  Treatment_A mean: {group1_data.mean():.1f}")
        print(f"  Control mean: {group2_data.mean():.1f}")
        
        print("\\n🎉 SUCCESS: T-test completed without data type errors!")
        
    except Exception as e:
        print(f"\\n❌ T-test failed: {str(e)}")
        if "not numeric" in str(e).lower():
            print("🔥 DATA TYPE ISSUE STILL EXISTS!")
else:
    print("\\n⚠️ Insufficient data for T-test")

print("\\n✅ DATA TYPE CONVERSION TEST COMPLETE")
"""
    
    payload = {
        "code": test_code,
        "fileName": "medical_type_test.csv",
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
                print("✅ TYPE CONVERSION TEST SUCCESS!")
                print("\n" + "="*60)
                print("📊 TEST OUTPUT:")
                print("="*60)
                output = result.get('output', '')
                print(output)
                print("="*60)
                
                # Check for success indicators
                if "T-test completed without data type errors!" in output:
                    print("\n🎉 PERFECT! Data type conversion is working!")
                    print("✅ No more 'column is not numeric' errors")
                    print("✅ T-tests can now run successfully")
                    print("✅ Medical analysis ready to go!")
                    return True
                elif "Age column is numeric!" in output and "Blood pressure column is numeric!" in output:
                    print("\n✅ GOOD! Data types are being converted properly")
                    print("✅ Both age and blood pressure are now numeric")
                    return True
                else:
                    print("\n⚠️ Partial success - some conversion may still be needed")
                    
            else:
                print("❌ TYPE CONVERSION TEST FAILED:")
                error = result.get('error', '')
                print(f"Error: {error}")
                
                if "not numeric" in error.lower():
                    print("🔥 DATA TYPE ISSUE STILL EXISTS!")
                    print("💡 Backend restart may be needed for fixes to take effect")
                    
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    return False

if __name__ == "__main__":
    print("🚀 TESTING DATA TYPE CONVERSION FIXES")
    print("This test verifies that medical datasets have proper numeric types\n")
    
    success = test_data_type_conversion()
    
    print(f"\n" + "="*60)
    print("📊 FINAL RESULT")
    print("="*60)
    
    if success:
        print("🎉 DATA TYPE CONVERSION WORKING!")
        print("✅ Medical datasets now have proper numeric types")
        print("✅ T-tests and statistical analysis will work correctly")
        print("🏥 Ready for clinical trial analysis!")
    else:
        print("⚠️ Data type conversion may need backend restart")
        print("🔧 Run: cd backend && python app.py")
        print("💡 Then test again with medical data analysis")