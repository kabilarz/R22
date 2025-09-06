#!/usr/bin/env python3
"""
Test Enhanced Python Execution System
=====================================

This script tests the new enhanced Python executor with:
- Library availability checking
- Performance monitoring
- Security features
- Medical data analysis capabilities
"""

import requests
import json
import time

def test_enhanced_python_execution():
    """Test the enhanced Python execution system"""
    
    base_url = "http://localhost:8001/api"
    
    print("🧪 TESTING ENHANCED PYTHON EXECUTION SYSTEM")
    print("=" * 50)
    
    # Test 1: Check Python environment stats
    print("\n1️⃣ Testing Python Environment Stats...")
    try:
        response = requests.get(f"{base_url}/python/stats", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                stats = data['stats']
                print(f"✅ Python Executable: {stats.get('python_executable')}")
                print(f"✅ Python Version: {stats.get('python_version')}")
                print(f"✅ Max Execution Time: {stats.get('max_execution_time')}s")
                print(f"✅ Max Memory: {stats.get('max_memory_mb')}MB")
                print(f"✅ System Memory: {stats.get('system_memory_mb')}MB")
                print(f"✅ CPU Count: {stats.get('cpu_count')}")
            else:
                print(f"❌ Stats check failed: {data.get('error')}")
        else:
            print(f"❌ Stats endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Stats test error: {e}")
    
    # Test 2: Check library availability
    print("\n2️⃣ Testing Library Availability...")
    try:
        response = requests.get(f"{base_url}/python/libraries", timeout=30)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                libraries = data['libraries']
                available = data['available_count']
                total = data['total_count']
                print(f"✅ Libraries Available: {available}/{total}")
                for lib, avail in libraries.items():
                    status = "✅" if avail else "❌"
                    print(f"  {status} {lib}")
            else:
                print(f"❌ Library check failed: {data.get('error')}")
        else:
            print(f"❌ Library endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Library test error: {e}")
    
    # Test 3: Execute medical statistical code
    print("\n3️⃣ Testing Medical Statistical Analysis...")
    
    # Sample medical data
    medical_data = [
        {"patient_id": 1, "age": 65, "gender": "M", "systolic_bp": 140, "treatment": "A"},
        {"patient_id": 2, "age": 72, "gender": "F", "systolic_bp": 135, "treatment": "A"},
        {"patient_id": 3, "age": 58, "gender": "M", "systolic_bp": 150, "treatment": "B"},
        {"patient_id": 4, "age": 63, "gender": "F", "systolic_bp": 145, "treatment": "B"},
        {"patient_id": 5, "age": 70, "gender": "M", "systolic_bp": 155, "treatment": "A"},
        {"patient_id": 6, "age": 68, "gender": "F", "systolic_bp": 142, "treatment": "B"}
    ]
    
    # Statistical analysis code
    analysis_code = """
# Medical Data Statistical Analysis
print("🏥 MEDICAL DATA ANALYSIS REPORT")
print("=" * 40)

# Basic dataset info
print(f"📊 Dataset: {df.shape[0]} patients, {df.shape[1]} variables")
print(f"📊 Variables: {list(df.columns)}")

# Descriptive statistics
print("\\n📈 DESCRIPTIVE STATISTICS:")
print(df.describe())

# Treatment group analysis
print("\\n💊 TREATMENT GROUP ANALYSIS:")
treatment_groups = df.groupby('treatment')['systolic_bp'].agg(['count', 'mean', 'std'])
print(treatment_groups)

# Gender analysis
print("\\n👥 GENDER ANALYSIS:")
gender_stats = df.groupby('gender')['systolic_bp'].agg(['count', 'mean', 'std'])
print(gender_stats)

# Statistical test: Compare blood pressure between treatments
from scipy import stats
treatment_a = df[df['treatment'] == 'A']['systolic_bp']
treatment_b = df[df['treatment'] == 'B']['systolic_bp']

t_stat, p_value = stats.ttest_ind(treatment_a, treatment_b)

print("\\n🧪 STATISTICAL TEST: Treatment Comparison")
print(f"T-statistic: {t_stat:.4f}")
print(f"P-value: {p_value:.4f}")
print(f"Significant difference: {'Yes' if p_value < 0.05 else 'No'}")

# Age correlation
age_bp_corr = df['age'].corr(df['systolic_bp'])
print(f"\\n🔗 Age-BP Correlation: {age_bp_corr:.4f}")

print("\\n✅ ANALYSIS COMPLETE")
"""
    
    try:
        execution_payload = {
            "code": analysis_code,
            "fileName": "medical_data.csv",
            "fileData": medical_data
        }
        
        start_time = time.time()
        response = requests.post(f"{base_url}/execute-python", 
                               json=execution_payload, timeout=60)
        execution_time = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print(f"✅ Execution successful!")
                print(f"⏱️  Execution time: {execution_time:.2f}s")
                if result.get('execution_time'):
                    print(f"⏱️  Backend time: {result['execution_time']:.2f}s")
                if result.get('memory_used_mb'):
                    print(f"💾 Memory used: {result['memory_used_mb']}MB")
                print("\\n📋 OUTPUT:")
                print(result['output'])
            else:
                print(f"❌ Execution failed: {result.get('error')}")
        else:
            print(f"❌ Execution endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Execution test error: {e}")
    
    # Test 4: Error handling
    print("\\n4️⃣ Testing Error Handling...")
    
    error_code = """
# This code should trigger an error
print("Testing error handling...")
undefined_variable = some_undefined_variable  # This will cause NameError
print("This should not print")
"""
    
    try:
        error_payload = {
            "code": error_code,
            "fileName": "error_test.csv",
            "fileData": [{"test": 1}]
        }
        
        response = requests.post(f"{base_url}/execute-python", 
                               json=error_payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            if not result.get('success') and result.get('error'):
                print("✅ Error handling works correctly")
                print(f"📝 Error message: {result['error']}")
            else:
                print("❌ Error handling test failed - should have returned error")
        else:
            print(f"❌ Error test endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error handling test error: {e}")
    
    print("\\n🎯 ENHANCED PYTHON EXECUTION TESTING COMPLETE!")

if __name__ == "__main__":
    test_enhanced_python_execution()