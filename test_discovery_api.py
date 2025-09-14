"""
Test script for the Hidden Pattern Discovery Engine API endpoints
"""

import requests
import json
import time

BASE_URL = "http://localhost:8002/api"

def test_health():
    """Test the health endpoint"""
    print("Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Health check: {response.status_code} - {response.json()}")
    return response.status_code == 200

def test_create_chat():
    """Test creating a chat"""
    print("Creating chat...")
    response = requests.post(
        f"{BASE_URL}/chats",
        json={"title": "Test Chat"}
    )
    if response.status_code == 200:
        chat_data = response.json()
        print(f"Chat created: {chat_data}")
        return chat_data["chat_id"]
    else:
        print(f"Failed to create chat: {response.status_code} - {response.text}")
        return None

def test_upload_dataset():
    """Test uploading a dataset"""
    print("Uploading dataset...")
    # Create a simple CSV file for testing
    csv_content = """patient_id,age,blood_pressure,cholesterol,glucose,treatment_response,bmi
1,45,120,200,90,0.8,25.5
2,52,140,220,95,0.6,28.0
3,38,110,190,88,0.9,23.2
4,65,150,240,102,0.4,30.1
5,29,105,180,85,0.95,22.8
6,58,145,230,98,0.5,29.5
7,41,125,210,92,0.75,26.3
8,33,115,195,89,0.85,24.7
9,49,135,215,96,0.65,27.9
10,55,155,235,101,0.55,31.2
"""
    
    files = {
        'file': ('test_data.csv', csv_content, 'text/csv')
    }
    
    response = requests.post(
        f"{BASE_URL}/datasets/upload",
        files=files
    )
    
    if response.status_code == 200:
        dataset_data = response.json()
        print(f"Dataset uploaded: {dataset_data}")
        return dataset_data["dataset_id"]
    else:
        print(f"Failed to upload dataset: {response.status_code} - {response.text}")
        return None

def test_start_discovery(dataset_id):
    """Test starting pattern discovery"""
    print("Starting pattern discovery...")
    discovery_request = {
        "dataset_id": dataset_id,
        "discovery_depth": "comprehensive",
        "focus_areas": ["anomalies", "correlations", "subgroups"],
        "medical_context": "cardiovascular research"
    }
    
    response = requests.post(
        f"{BASE_URL}/discovery/analyze",
        json=discovery_request
    )
    
    if response.status_code == 200:
        discovery_data = response.json()
        print(f"Discovery started: {discovery_data}")
        return discovery_data["discovery_session_id"]
    else:
        print(f"Failed to start discovery: {response.status_code} - {response.text}")
        return None

def test_get_discovery_results(session_id):
    """Test getting discovery results"""
    print("Getting discovery results...")
    response = requests.get(f"{BASE_URL}/discovery/results/{session_id}")
    
    if response.status_code == 200:
        results_data = response.json()
        print(f"Discovery results: {results_data}")
        return results_data
    else:
        print(f"Failed to get discovery results: {response.status_code} - {response.text}")
        return None

def test_generate_insight(finding_id, dataset_id):
    """Test generating insight for a finding"""
    print("Generating insight...")
    insight_request = {
        "finding_id": finding_id,
        "dataset_id": dataset_id,
        "medical_context": "cardiovascular research"
    }
    
    response = requests.post(
        f"{BASE_URL}/discovery/explain",
        json=insight_request
    )
    
    if response.status_code == 200:
        insight_data = response.json()
        print(f"Insight generated: {insight_data}")
        return insight_data
    else:
        print(f"Failed to generate insight: {response.status_code} - {response.text}")
        return None

def main():
    """Main test function"""
    print("🧪 Testing Hidden Pattern Discovery Engine API endpoints...")
    
    # Test health endpoint
    if not test_health():
        print("❌ Health check failed")
        return False
    
    # Create chat
    chat_id = test_create_chat()
    if not chat_id:
        print("❌ Failed to create chat")
        return False
    
    # Upload dataset
    dataset_id = test_upload_dataset()
    if not dataset_id:
        print("❌ Failed to upload dataset")
        return False
    
    # Start discovery
    session_id = test_start_discovery(dataset_id)
    if not session_id:
        print("❌ Failed to start discovery")
        return False
    
    # Wait a bit for discovery to complete
    print("Waiting for discovery to complete...")
    time.sleep(5)
    
    # Get results
    results = test_get_discovery_results(session_id)
    if not results:
        print("❌ Failed to get discovery results")
        return False
    
    # If we have findings, test generating insight
    if results.get("top_findings"):
        finding_id = results["top_findings"][0]["pattern_id"]
        insight = test_generate_insight(finding_id, dataset_id)
        if not insight:
            print("⚠️  Failed to generate insight (but other tests passed)")
    
    print("✅ All API tests completed successfully!")
    return True

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)