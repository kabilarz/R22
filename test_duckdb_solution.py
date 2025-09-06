#!/usr/bin/env python3
"""
Test DuckDB Python Execution Solution
Verifies that the new DuckDB-based execution eliminates Windows Unicode errors
"""

import requests
import json
import time

def test_duckdb_execution():
    """Test the DuckDB-based Python execution"""
    
    print("🧪 TESTING DUCKDB PYTHON EXECUTION SOLUTION")
    print("=" * 50)
    
    # Test data (simulating medical dataset)
    test_data = [
        {"patient_id": 1, "age": 45, "vaccination_status": "vaccinated", "infection": "no", "gender": "male"},
        {"patient_id": 2, "age": 52, "vaccination_status": "unvaccinated", "infection": "yes", "gender": "female"},
        {"patient_id": 3, "age": 38, "vaccination_status": "vaccinated", "infection": "no", "gender": "female"},
        {"patient_id": 4, "age": 67, "vaccination_status": "unvaccinated", "infection": "yes", "gender": "male"},
        {"patient_id": 5, "age": 29, "vaccination_status": "vaccinated", "infection": "no", "gender": "male"},
    ]
    
    # Test code that would previously fail with Unicode errors
    test_code = """
print("🧪 Testing DuckDB-based execution...")
print(f"📊 Dataset shape: {df.shape}")
print(f"📋 Columns: {list(df.columns)}")

# Test statistical analysis
vaccination_counts = df['vaccination_status'].value_counts()
print(f"\\n💉 Vaccination Status:")
for status, count in vaccination_counts.items():
    print(f"  {status}: {count}")

# Test infection rates by vaccination status
infection_by_vaccination = df.groupby('vaccination_status')['infection'].value_counts()
print(f"\\n🦠 Infection by Vaccination Status:")
print(infection_by_vaccination)

# Simple effectiveness calculation
vaccinated_infected = len(df[(df['vaccination_status'] == 'vaccinated') & (df['infection'] == 'yes')])
vaccinated_total = len(df[df['vaccination_status'] == 'vaccinated'])
unvaccinated_infected = len(df[(df['vaccination_status'] == 'unvaccinated') & (df['infection'] == 'yes')])
unvaccinated_total = len(df[df['vaccination_status'] == 'unvaccinated'])

vaccinated_rate = (vaccinated_infected / vaccinated_total) * 100 if vaccinated_total > 0 else 0
unvaccinated_rate = (unvaccinated_infected / unvaccinated_total) * 100 if unvaccinated_total > 0 else 0

print(f"\\n📈 Infection Rates:")
print(f"  Vaccinated: {vaccinated_rate:.1f}% ({vaccinated_infected}/{vaccinated_total})")
print(f"  Unvaccinated: {unvaccinated_rate:.1f}% ({unvaccinated_infected}/{unvaccinated_total})")

print("\\n✅ DuckDB execution test completed successfully!")
"""
    
    payload = {
        "code": test_code,
        "fileName": "vaccination_study.csv",
        "fileData": test_data
    }
    
    print("📤 Sending test request to backend...")
    
    try:
        start_time = time.time()
        response = requests.post(
            "http://localhost:8001/api/execute-python",
            json=payload,
            timeout=30
        )
        execution_time = time.time() - start_time
        
        print(f"⏱️  Request completed in {execution_time:.2f} seconds")
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get('success'):
                print("🎉 SUCCESS: DuckDB-based execution working!")
                print("\n📋 Output:")
                print("-" * 40)
                print(result['output'])
                print("-" * 40)
                
                if result.get('execution_time'):
                    print(f"⚡ Execution time: {result['execution_time']:.2f}s")
                if result.get('memory_used_mb'):
                    print(f"💾 Memory used: {result['memory_used_mb']}MB")
                
                return True
            else:
                print("❌ FAILED: Execution reported error")
                print(f"Error: {result.get('error')}")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR: Backend not running")
        print("💡 Start backend with: python backend/app.py")
        return False
    except Exception as e:
        print(f"❌ REQUEST ERROR: {e}")
        return False

def test_unicode_paths():
    """Test specific Unicode path scenarios"""
    print("\n🧪 TESTING UNICODE PATH HANDLING")
    print("=" * 50)
    
    test_code_with_unicode = """
# This would previously fail with Unicode escape errors
print("Testing Unicode path resistance...")

# Test with various special characters that might cause issues
test_string = "C:\\\\Users\\\\rock\\\\AppData\\\\Local\\\\Temp\\\\tmpXXX.json"
print(f"Path handling test: {test_string}")

# Test data analysis
print(f"Data loaded successfully: {len(df)} rows")
print("Unicode test completed!")
"""
    
    payload = {
        "code": test_code_with_unicode,
        "fileName": "unicode_test.csv",
        "fileData": [{"test": "data", "value": 123}]
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
                print("✅ Unicode path test PASSED")
                return True
            else:
                print("❌ Unicode path test FAILED")
                print(f"Error: {result.get('error')}")
                return False
        else:
            print(f"❌ HTTP Error in Unicode test: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Unicode test error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting DuckDB Python Execution Tests...")
    
    # Test 1: Basic DuckDB execution
    test1_success = test_duckdb_execution()
    
    # Test 2: Unicode path resistance
    test2_success = test_unicode_paths()
    
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 50)
    print(f"✅ DuckDB Execution Test: {'PASSED' if test1_success else 'FAILED'}")
    print(f"✅ Unicode Path Test: {'PASSED' if test2_success else 'FAILED'}")
    
    if test1_success and test2_success:
        print("\n🎉 ALL TESTS PASSED!")
        print("💡 DuckDB solution successfully eliminates Windows Unicode issues")
        print("🏥 Medical professionals can now execute Python code without errors")
    else:
        print("\n❌ SOME TESTS FAILED")
        print("🔧 Please check the backend implementation")
    
    print("\n📝 Next steps:")
    print("1. Test with actual medical datasets")
    print("2. Verify statistical test suggestions work")
    print("3. Confirm frontend integration")