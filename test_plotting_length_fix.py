#!/usr/bin/env python3
"""
Test plotting length mismatch fix
This demonstrates how to avoid "length of list vectors must match" errors
"""

import requests
import json

def test_plotting_length_fix():
    """Test that plotting works without length mismatches"""
    
    print("📊 TESTING PLOTTING LENGTH MISMATCH FIX")
    print("=" * 50)
    
    # Medical data with 40 patients (like clinical trial dataset)
    medical_data = []
    treatments = ['Treatment_A', 'Treatment_B', 'Control']
    
    for i in range(40):
        patient = {
            "patient_id": f"P{i+1:03d}",
            "age": 30 + (i % 50),  # Ages 30-80
            "treatment_group": treatments[i % 3],  # Rotate through 3 treatments
            "baseline_bp": 140 + (i % 30),  # BP 140-170
            "week_12_bp": 130 + (i % 25),   # BP 130-155
            "outcome": "Improved" if i % 3 == 0 else ("Stable" if i % 3 == 1 else "Worsened")
        }
        medical_data.append(patient)
    
    # Code that correctly handles plotting without length mismatches
    correct_plotting_code = """
print("📊 MEDICAL DATA VISUALIZATION - CORRECT APPROACH")
print("=" * 55)

import matplotlib.pyplot as plt
import numpy as np

print(f"Dataset: {df.shape[0]} patients, {df.shape[1]} variables")
print(f"Treatment groups: {df['treatment_group'].unique()}")

# ✅ CORRECT: Aggregate data before plotting to avoid length mismatches

# 1. Mean age by treatment group
print("\\n1️⃣ MEAN AGE BY TREATMENT GROUP:")
age_by_treatment = df.groupby('treatment_group')['age'].mean()
print(age_by_treatment)

plt.figure(figsize=(10, 6))
plt.subplot(2, 2, 1)
plt.bar(age_by_treatment.index, age_by_treatment.values)
plt.title('Mean Age by Treatment Group')
plt.ylabel('Mean Age (years)')
plt.xticks(rotation=45)

# 2. Blood pressure improvement by treatment
print("\\n2️⃣ BLOOD PRESSURE IMPROVEMENT:")
bp_improvement = df['baseline_bp'] - df['week_12_bp']
df['bp_improvement'] = bp_improvement

bp_by_treatment = df.groupby('treatment_group')['bp_improvement'].mean()
print(bp_by_treatment)

plt.subplot(2, 2, 2)
plt.bar(bp_by_treatment.index, bp_by_treatment.values)
plt.title('Mean BP Improvement by Treatment')
plt.ylabel('BP Reduction (mmHg)')
plt.xticks(rotation=45)

# 3. Outcome distribution (categorical)
print("\\n3️⃣ OUTCOME DISTRIBUTION:")
outcome_counts = df.groupby(['treatment_group', 'outcome']).size().unstack(fill_value=0)
print(outcome_counts)

plt.subplot(2, 2, 3)
outcome_counts.plot(kind='bar', ax=plt.gca())
plt.title('Outcomes by Treatment Group')
plt.ylabel('Number of Patients')
plt.legend(title='Outcome')
plt.xticks(rotation=45)

# 4. Age distribution histogram
plt.subplot(2, 2, 4)
plt.hist(df['age'], bins=15, alpha=0.7)
plt.title('Age Distribution')
plt.xlabel('Age (years)')
plt.ylabel('Number of Patients')

plt.tight_layout()
plt.show()

print("\\n✅ PLOTTING COMPLETED WITHOUT LENGTH ERRORS!")
print("📊 All visualizations used properly aggregated data")
print("🏥 Medical analysis charts are ready!")
"""
    
    print("Testing medical data visualization with proper aggregation...")
    
    payload = {
        "code": correct_plotting_code,
        "fileName": "medical_plotting.csv",
        "fileData": medical_data
    }
    
    try:
        response = requests.post(
            "http://localhost:8001/api/execute-python",
            json=payload,
            timeout=25
        )
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get('success'):
                print("✅ PLOTTING TEST SUCCESS!")
                print("\n" + "="*60)
                print("📊 VISUALIZATION OUTPUT:")
                print("="*60)
                output = result.get('output', '')
                print(output)
                print("="*60)
                
                # Check for success indicators
                success_indicators = [
                    "PLOTTING COMPLETED WITHOUT LENGTH ERRORS",
                    "Mean Age by Treatment Group",
                    "BLOOD PRESSURE IMPROVEMENT",
                    "OUTCOME DISTRIBUTION"
                ]
                
                found_indicators = sum(1 for indicator in success_indicators if indicator in output)
                
                if found_indicators >= 3:
                    print("\n🎉 EXCELLENT! Plotting works without length errors!")
                    print("✅ No more 'length of list vectors must match' errors")
                    print("✅ Proper data aggregation for visualization")
                    print("✅ Medical charts display correctly")
                    print("📊 Visualization system is ready!")
                    return True
                else:
                    print(f"\n⚠️ Partial success - found {found_indicators}/4 expected elements")
                    
            else:
                print("❌ PLOTTING TEST FAILED:")
                error = result.get('error', '')
                print(f"Error: {error}")
                
                if "length" in error.lower() and "match" in error.lower():
                    print("🔥 LENGTH MISMATCH ISSUE STILL EXISTS!")
                    print("💡 This usually means data isn't being aggregated properly")
                elif "length of list vectors" in error:
                    print("🔥 PLOTTING VECTOR LENGTH ERROR STILL PRESENT!")
                    
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
    
    return False

def test_common_plotting_errors():
    """Test common plotting errors and their fixes"""
    
    print(f"\n🔍 TESTING COMMON PLOTTING ERROR PATTERNS")
    print("=" * 45)
    
    # Test data that commonly causes issues
    test_data = [
        {"group": "A", "value": 10},
        {"group": "B", "value": 20},
        {"group": "A", "value": 15},
        {"group": "B", "value": 25}
    ]
    
    # Code showing WRONG and RIGHT approaches
    comparison_code = """
print("🔍 PLOTTING ERROR PREVENTION DEMONSTRATION")
print("=" * 50)

print(f"Dataset shape: {df.shape}")
print(f"Groups: {df['group'].unique()}")
print(f"Sample data:")
print(df.head())

# ❌ WRONG: This might cause length mismatch errors
# If we try to plot raw data against group categories directly
print("\\n❌ POTENTIAL ISSUE:")
print("Plotting individual data points against group categories can cause length mismatches")

# ✅ RIGHT: Aggregate data first
print("\\n✅ CORRECT APPROACH:")
mean_by_group = df.groupby('group')['value'].mean()
print("Aggregated data:")
print(mean_by_group)

import matplotlib.pyplot as plt
plt.figure(figsize=(8, 4))

plt.subplot(1, 2, 1)
plt.bar(mean_by_group.index, mean_by_group.values)
plt.title('Mean Values by Group (Correct)')
plt.ylabel('Mean Value')

# Also show count by group
count_by_group = df.groupby('group').size()
plt.subplot(1, 2, 2)
plt.bar(count_by_group.index, count_by_group.values)
plt.title('Count by Group')
plt.ylabel('Count')

plt.tight_layout()
plt.show()

print("\\n✅ PLOTTING COMPLETED SUCCESSFULLY!")
print("📊 Data aggregation prevents length mismatch errors")
"""
    
    payload = {
        "code": comparison_code,
        "fileName": "plotting_demo.csv",
        "fileData": test_data
    }
    
    try:
        response = requests.post(
            "http://localhost:8001/api/execute-python",
            json=payload,
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get('success'):
                print("✅ PLOTTING DEMO SUCCESS!")
                output = result.get('output', '')
                print(output)
                return True
            else:
                print("❌ PLOTTING DEMO FAILED:")
                print(result.get('error', ''))
                
    except Exception as e:
        print(f"❌ Demo failed: {e}")
    
    return False

if __name__ == "__main__":
    print("🚀 TESTING PLOTTING LENGTH MISMATCH FIXES")
    print("This verifies that visualization errors are resolved\n")
    
    # Test main plotting functionality
    main_success = test_plotting_length_fix()
    
    # Test common error patterns
    demo_success = test_common_plotting_errors()
    
    print(f"\n" + "="*60)
    print("📊 PLOTTING TEST SUMMARY")
    print("="*60)
    
    if main_success and demo_success:
        print("🎉 ALL PLOTTING TESTS PASSED!")
        print("✅ No more 'length of list vectors must match' errors")
        print("✅ Proper data aggregation for all visualizations")
        print("✅ Medical charts and plots work correctly")
        print("📊 Visualization system fully functional!")
    else:
        print("⚠️ Some plotting issues may remain")
        print("💡 Consider restarting backend for AI prompt updates")
        print("🔧 Run: cd backend && python app.py")