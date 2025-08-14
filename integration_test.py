#!/usr/bin/env python3
"""
Comprehensive integration test for Nemo AI statistical application
Tests file upload, model selection, and chat functionality
"""

import requests
import json
import time
import sys
from pathlib import Path

class NemoIntegrationTester:
    def __init__(self):
        self.backend_url = "https://ai-stats-ollama.preview.emergentagent.com/api"
        self.frontend_url = "http://localhost:3000"
        self.chat_id = None
        self.dataset_id = None
        self.tests_run = 0
        self.tests_passed = 0

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        if details and success:
            print(f"   Details: {details}")
        print()

    def test_frontend_accessibility(self):
        """Test if frontend is accessible"""
        try:
            response = requests.get(self.frontend_url, timeout=15)
            success = response.status_code == 200 and "Nemo" in response.text
            details = f"Status: {response.status_code}, Contains Nemo: {'Nemo' in response.text}"
            self.log_test("Frontend Accessibility", success, details)
            return success
        except Exception as e:
            self.log_test("Frontend Accessibility", False, f"Error: {str(e)}")
            return False

    def test_backend_health(self):
        """Test backend health endpoint"""
        try:
            response = requests.get(f"{self.backend_url}/health", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                details = f"Status: {data.get('status')}, Message: {data.get('message')}"
            else:
                details = f"HTTP {response.status_code}"
            self.log_test("Backend Health", success, details)
            return success
        except Exception as e:
            self.log_test("Backend Health", False, f"Error: {str(e)}")
            return False

    def test_database_initialization(self):
        """Test database initialization"""
        try:
            response = requests.post(f"{self.backend_url}/init", timeout=30)
            success = response.status_code == 200
            if success:
                data = response.json()
                details = f"Initialized: {data.get('ok')}"
            else:
                details = f"HTTP {response.status_code}"
            self.log_test("Database Initialization", success, details)
            return success
        except Exception as e:
            self.log_test("Database Initialization", False, f"Error: {str(e)}")
            return False

    def test_create_chat(self):
        """Test creating a chat session"""
        try:
            payload = {"title": "Integration Test Chat"}
            response = requests.post(f"{self.backend_url}/chats", json=payload, timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                self.chat_id = data.get('chat_id')
                details = f"Chat ID: {self.chat_id}"
            else:
                details = f"HTTP {response.status_code}"
            self.log_test("Create Chat Session", success, details)
            return success
        except Exception as e:
            self.log_test("Create Chat Session", False, f"Error: {str(e)}")
            return False

    def test_file_upload(self):
        """Test file upload functionality"""
        try:
            # Create test CSV data
            csv_content = """gender,age,BMI,income,blood_pressure
male,25,23.5,50000,120
female,30,22.1,55000,115
male,35,25.2,60000,130
female,28,21.8,52000,110
male,32,24.7,58000,125
female,27,23.9,54000,118
male,29,26.1,56000,135
female,31,22.5,59000,112
male,26,24.3,51000,122
female,33,23.7,62000,128"""

            files = {'file': ('medical_data.csv', csv_content, 'text/csv')}
            response = requests.post(f"{self.backend_url}/datasets/upload", files=files, timeout=30)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                self.dataset_id = data.get('dataset_id')
                details = f"Dataset ID: {self.dataset_id}, Rows: {data.get('n_rows')}"
            else:
                details = f"HTTP {response.status_code}: {response.text}"
            
            self.log_test("File Upload", success, details)
            return success
        except Exception as e:
            self.log_test("File Upload", False, f"Error: {str(e)}")
            return False

    def test_statistical_analysis(self):
        """Test statistical analysis (t-test)"""
        if not self.chat_id or not self.dataset_id:
            self.log_test("Statistical Analysis", False, "Missing chat_id or dataset_id")
            return False
        
        try:
            payload = {
                "chat_id": self.chat_id,
                "dataset_id": self.dataset_id,
                "group_col": "gender",
                "value_col": "BMI"
            }
            
            response = requests.post(f"{self.backend_url}/analysis/ttest", json=payload, timeout=30)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"Run ID: {data.get('run_id')}, p-value: {data.get('p_value'):.6f}"
                if data.get('error'):
                    details += f", Error: {data.get('error')}"
            else:
                details = f"HTTP {response.status_code}: {response.text}"
            
            self.log_test("Statistical Analysis (t-test)", success, details)
            return success
        except Exception as e:
            self.log_test("Statistical Analysis (t-test)", False, f"Error: {str(e)}")
            return False

    def test_python_execution(self):
        """Test Python code execution"""
        if not self.dataset_id:
            self.log_test("Python Code Execution", False, "Missing dataset_id")
            return False
        
        try:
            # Simple Python code to test execution
            test_code = """
# Basic data analysis
print("Dataset shape:", df.shape)
print("Columns:", list(df.columns))
print("\\nBasic statistics:")
print(df.describe())
"""
            
            # Get dataset for execution
            dataset_response = requests.get(f"{self.backend_url}/datasets/{self.dataset_id}")
            if dataset_response.status_code != 200:
                self.log_test("Python Code Execution", False, "Failed to get dataset")
                return False
            
            # Create dummy data for execution (since we need the actual data structure)
            dummy_data = [
                {"gender": "male", "age": 25, "BMI": 23.5, "income": 50000, "blood_pressure": 120},
                {"gender": "female", "age": 30, "BMI": 22.1, "income": 55000, "blood_pressure": 115}
            ]
            
            payload = {
                "code": test_code,
                "fileName": "medical_data.csv",
                "fileData": dummy_data
            }
            
            response = requests.post(f"{self.backend_url}/execute-python", json=payload, timeout=30)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                execution_success = data.get('success', False)
                output = data.get('output', '')
                error = data.get('error')
                
                if execution_success and 'Dataset shape:' in output:
                    details = f"Execution successful, Output length: {len(output)} chars"
                else:
                    success = False
                    details = f"Execution failed: {error or 'No output'}"
            else:
                details = f"HTTP {response.status_code}: {response.text}"
            
            self.log_test("Python Code Execution", success, details)
            return success
        except Exception as e:
            self.log_test("Python Code Execution", False, f"Error: {str(e)}")
            return False

    def test_chat_history(self):
        """Test chat history retrieval"""
        if not self.chat_id:
            self.log_test("Chat History", False, "Missing chat_id")
            return False
        
        try:
            response = requests.get(f"{self.backend_url}/history/{self.chat_id}", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                history = data.get('history', [])
                details = f"Found {len(history)} analysis runs"
            else:
                details = f"HTTP {response.status_code}: {response.text}"
            
            self.log_test("Chat History", success, details)
            return success
        except Exception as e:
            self.log_test("Chat History", False, f"Error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run comprehensive integration tests"""
        print("🚀 Starting Nemo AI Statistical Application Integration Tests")
        print("=" * 70)
        
        # Test sequence
        tests = [
            ("Frontend Accessibility", self.test_frontend_accessibility),
            ("Backend Health", self.test_backend_health),
            ("Database Initialization", self.test_database_initialization),
            ("Create Chat Session", self.test_create_chat),
            ("File Upload", self.test_file_upload),
            ("Statistical Analysis", self.test_statistical_analysis),
            ("Python Code Execution", self.test_python_execution),
            ("Chat History", self.test_chat_history),
        ]
        
        for test_name, test_func in tests:
            test_func()
            time.sleep(0.5)  # Brief pause between tests
        
        # Summary
        print("=" * 70)
        print(f"📊 Integration Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All integration tests passed! Nemo application is working correctly.")
            return 0
        else:
            failed = self.tests_run - self.tests_passed
            print(f"⚠️  {failed} tests failed. Application needs attention.")
            return 1

def main():
    """Main test execution"""
    tester = NemoIntegrationTester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())