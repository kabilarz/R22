#!/usr/bin/env python3
"""
Comprehensive backend API testing for the statistical analysis application.
Tests all FastAPI endpoints including health, initialization, file upload, and t-test analysis.
"""

import requests
import json
import os
import sys
from pathlib import Path
import time
from datetime import datetime

class StatisticalAnalysisAPITester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.chat_id = None
        self.dataset_id = None
        
    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        if details:
            print(f"   Details: {details}")
        print()

    def test_health_check(self):
        """Test the health check endpoint"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"Status: {data.get('status', 'unknown')}, Message: {data.get('message', 'none')}"
            else:
                details = f"HTTP {response.status_code}: {response.text}"
                
            self.log_test("Health Check", success, details)
            return success
            
        except Exception as e:
            self.log_test("Health Check", False, f"Connection error: {str(e)}")
            return False

    def test_database_initialization(self):
        """Test database initialization"""
        try:
            response = requests.post(f"{self.base_url}/init", timeout=30)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"Initialization result: {data.get('ok', False)}"
            else:
                details = f"HTTP {response.status_code}: {response.text}"
                
            self.log_test("Database Initialization", success, details)
            return success
            
        except Exception as e:
            self.log_test("Database Initialization", False, f"Error: {str(e)}")
            return False

    def test_create_chat(self):
        """Test creating a new chat session"""
        try:
            payload = {"title": f"Test Chat {datetime.now().strftime('%H:%M:%S')}"}
            response = requests.post(
                f"{self.base_url}/chats", 
                json=payload,
                timeout=10
            )
            success = response.status_code == 200
            
            if success:
                data = response.json()
                self.chat_id = data.get('chat_id')
                details = f"Chat ID: {self.chat_id}"
            else:
                details = f"HTTP {response.status_code}: {response.text}"
                
            self.log_test("Create Chat", success, details)
            return success
            
        except Exception as e:
            self.log_test("Create Chat", False, f"Error: {str(e)}")
            return False

    def test_file_upload(self):
        """Test file upload with the test CSV data"""
        try:
            # Create test CSV content
            csv_content = """gender,age,BMI,income
male,25,23.5,50000
female,30,22.1,55000
male,35,25.2,60000
female,28,21.8,52000
male,32,24.7,58000
female,27,23.9,54000
male,29,26.1,56000
female,31,22.5,59000
male,26,24.3,51000
female,33,23.7,62000"""

            # Prepare file upload
            files = {
                'file': ('test_data.csv', csv_content, 'text/csv')
            }
            
            response = requests.post(
                f"{self.base_url}/datasets/upload",
                files=files,
                timeout=30
            )
            success = response.status_code == 200
            
            if success:
                data = response.json()
                self.dataset_id = data.get('dataset_id')
                details = f"Dataset ID: {self.dataset_id}, Name: {data.get('name')}, Rows: {data.get('n_rows')}"
            else:
                details = f"HTTP {response.status_code}: {response.text}"
                
            self.log_test("File Upload", success, details)
            return success
            
        except Exception as e:
            self.log_test("File Upload", False, f"Error: {str(e)}")
            return False

    def test_get_datasets(self):
        """Test retrieving all datasets"""
        try:
            response = requests.get(f"{self.base_url}/datasets", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                datasets = data.get('datasets', [])
                details = f"Found {len(datasets)} datasets"
                if datasets:
                    details += f", Latest: {datasets[0].get('name', 'unknown')}"
            else:
                details = f"HTTP {response.status_code}: {response.text}"
                
            self.log_test("Get Datasets", success, details)
            return success
            
        except Exception as e:
            self.log_test("Get Datasets", False, f"Error: {str(e)}")
            return False

    def test_get_dataset_details(self):
        """Test getting detailed dataset information"""
        if not self.dataset_id:
            self.log_test("Get Dataset Details", False, "No dataset ID available")
            return False
            
        try:
            response = requests.get(f"{self.base_url}/datasets/{self.dataset_id}", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                dataset_info = data.get('dataset', {})
                summary = data.get('summary', {})
                details = f"Rows: {dataset_info.get('n_rows')}, Columns: {summary.get('n_columns')}"
            else:
                details = f"HTTP {response.status_code}: {response.text}"
                
            self.log_test("Get Dataset Details", success, details)
            return success
            
        except Exception as e:
            self.log_test("Get Dataset Details", False, f"Error: {str(e)}")
            return False

    def test_ttest_analysis(self):
        """Test t-test statistical analysis"""
        if not self.chat_id or not self.dataset_id:
            self.log_test("T-Test Analysis", False, "Missing chat_id or dataset_id")
            return False
            
        try:
            payload = {
                "chat_id": self.chat_id,
                "dataset_id": self.dataset_id,
                "group_col": "gender",
                "value_col": "BMI"
            }
            
            response = requests.post(
                f"{self.base_url}/analysis/ttest",
                json=payload,
                timeout=30
            )
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"Run ID: {data.get('run_id')}, "
                details += f"Male n={data.get('n_male')}, Female n={data.get('n_female')}, "
                details += f"p-value: {data.get('p_value')}"
                
                if data.get('error'):
                    details += f", Error: {data.get('error')}"
            else:
                details = f"HTTP {response.status_code}: {response.text}"
                
            self.log_test("T-Test Analysis", success, details)
            return success
            
        except Exception as e:
            self.log_test("T-Test Analysis", False, f"Error: {str(e)}")
            return False

    def test_get_chat_history(self):
        """Test retrieving chat history"""
        if not self.chat_id:
            self.log_test("Get Chat History", False, "No chat ID available")
            return False
            
        try:
            response = requests.get(f"{self.base_url}/history/{self.chat_id}", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                history = data.get('history', [])
                details = f"Found {len(history)} analysis runs"
                if history:
                    latest = history[-1]
                    details += f", Latest: {latest.get('analysis')} at {latest.get('created_at')}"
            else:
                details = f"HTTP {response.status_code}: {response.text}"
                
            self.log_test("Get Chat History", success, details)
            return success
            
        except Exception as e:
            self.log_test("Get Chat History", False, f"Error: {str(e)}")
            return False

    def test_data_persistence(self):
        """Test that data is properly persisted as Parquet files"""
        try:
            datasets_dir = Path(__file__).parent / "backend" / "datasets"
            if not datasets_dir.exists():
                datasets_dir = Path(__file__).parent / "datasets"
            
            if datasets_dir.exists():
                parquet_files = list(datasets_dir.glob("*.parquet"))
                success = len(parquet_files) > 0
                details = f"Found {len(parquet_files)} Parquet files in {datasets_dir}"
            else:
                success = False
                details = f"Datasets directory not found at {datasets_dir}"
                
            self.log_test("Data Persistence Check", success, details)
            return success
            
        except Exception as e:
            self.log_test("Data Persistence Check", False, f"Error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting Statistical Analysis Backend API Tests")
        print("=" * 60)
        
        # Test sequence
        tests = [
            ("Health Check", self.test_health_check),
            ("Database Initialization", self.test_database_initialization),
            ("Create Chat", self.test_create_chat),
            ("File Upload", self.test_file_upload),
            ("Get Datasets", self.test_get_datasets),
            ("Get Dataset Details", self.test_get_dataset_details),
            ("T-Test Analysis", self.test_ttest_analysis),
            ("Get Chat History", self.test_get_chat_history),
            ("Data Persistence", self.test_data_persistence),
        ]
        
        for test_name, test_func in tests:
            test_func()
            time.sleep(0.5)  # Brief pause between tests
        
        # Summary
        print("=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed! Backend is working correctly.")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed. Backend needs attention.")
            return 1

def main():
    """Main test execution"""
    tester = StatisticalAnalysisAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())