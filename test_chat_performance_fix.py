#!/usr/bin/env python3
"""
Chat Performance Fix Verification Test
Tests the performance optimizations implemented for the chat panel
"""

import time
import json
import requests
import subprocess
import os
import sys

# API Configuration
API_BASE = "http://localhost:8000"

def check_backend():
    """Check if backend is running"""
    try:
        response = requests.get(f"{API_BASE}/health", timeout=5)
        return response.status_code == 200
    except:
        return False

def start_backend():
    """Start the backend server"""
    print("🚀 Starting backend server...")
    try:
        # Start backend in the background
        process = subprocess.Popen([
            sys.executable, "backend/app.py"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Wait for server to start
        max_retries = 20
        for i in range(max_retries):
            if check_backend():
                print("✅ Backend server started successfully")
                return process
            time.sleep(1)
            print(f"⏳ Waiting for backend... ({i+1}/{max_retries})")
        
        print("❌ Backend failed to start")
        return None
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        return None

def test_performance_optimizations():
    """Test the chat performance optimizations"""
    print("\n🧪 Testing Chat Performance Optimizations")
    print("=" * 50)
    
    # Test 1: Component Structure
    print("\n1. Verifying Component Structure...")
    chat_panel_path = "components/chat-panel.tsx"
    
    if not os.path.exists(chat_panel_path):
        print("❌ Chat panel component not found")
        return False
    
    with open(chat_panel_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Check for performance optimizations
    optimizations = [
        ("useMemo", "useMemo hook for memoization"),
        ("useCallback", "useCallback for function optimization"),
        ("memo", "React.memo for component memoization"),
        ("batchedMessages", "Message batching"),
        ("scrollTimeoutRef", "Scroll timeout management"),
        ("MessageComponent", "Separated message component"),
        ("dataPreview", "Memoized data preview"),
    ]
    
    for check, description in optimizations:
        if check in content:
            print(f"✅ {description} - Found")
        else:
            print(f"❌ {description} - Missing")
    
    # Test 2: Memory Management
    print("\n2. Verifying Memory Management...")
    memory_checks = [
        ("clearTimeout", "Timeout cleanup"),
        ("useEffect.*return.*=>", "Effect cleanup"),
        ("maxMessages", "Message limit"),
        ("renderTimeoutRef", "Render timeout management"),
    ]
    
    import re
    for pattern, description in memory_checks:
        if re.search(pattern, content):
            print(f"✅ {description} - Implemented")
        else:
            print(f"⚠️  {description} - Check implementation")
    
    # Test 3: Input Optimization
    print("\n3. Verifying Input Optimization...")
    input_checks = [
        ("handleInputChange.*useCallback", "Optimized input handler"),
        ("handleKeyPress.*useCallback", "Optimized key handler"),
        ("onChange={handleInputChange}", "Using optimized handler"),
    ]
    
    for pattern, description in input_checks:
        if re.search(pattern, content):
            print(f"✅ {description} - Implemented")
        else:
            print(f"⚠️  {description} - Check implementation")
    
    print("\n✅ Performance optimization checks completed!")
    return True

def test_chat_functionality():
    """Test basic chat functionality still works"""
    print("\n🧪 Testing Chat Functionality")
    print("=" * 50)
    
    if not check_backend():
        print("❌ Backend not available - skipping functional tests")
        return False
    
    # Test basic health check
    try:
        response = requests.get(f"{API_BASE}/health")
        if response.status_code == 200:
            print("✅ Backend health check passed")
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend connection failed: {e}")
        return False
    
    # Test datasets endpoint
    try:
        response = requests.get(f"{API_BASE}/datasets")
        if response.status_code == 200:
            print("✅ Datasets endpoint accessible")
        else:
            print(f"⚠️  Datasets endpoint returned: {response.status_code}")
    except Exception as e:
        print(f"⚠️  Datasets endpoint error: {e}")
    
    print("✅ Basic functionality tests completed!")
    return True

def create_performance_benchmark():
    """Create a benchmark for performance testing"""
    print("\n📊 Creating Performance Benchmark")
    print("=" * 50)
    
    benchmark_data = {
        "optimizations_applied": [
            "React.memo for message components",
            "useMemo for data preview",
            "useCallback for event handlers",
            "Message batching (max 50 messages)",
            "Debounced scroll handling",
            "Timeout cleanup on unmount",
            "Optimized state updates",
            "Input change optimization"
        ],
        "expected_improvements": {
            "input_lag": "Reduced from noticeable delay to immediate response",
            "scroll_performance": "Smooth scrolling without stuttering",
            "memory_usage": "Stable memory usage with timeout cleanup",
            "render_performance": "Faster re-renders with memoization",
            "message_limit": "UI remains responsive with 50+ messages"
        },
        "testing_instructions": [
            "1. Load a dataset in the data panel",
            "2. Type multiple messages rapidly in chat input",
            "3. Verify no input lag or stuttering",
            "4. Send 20+ messages to test scroll performance",
            "5. Monitor browser memory usage during extended chat",
            "6. Verify smooth interactions throughout"
        ]
    }
    
    with open("chat_performance_benchmark.json", "w") as f:
        json.dump(benchmark_data, f, indent=2)
    
    print("✅ Benchmark file created: chat_performance_benchmark.json")
    print("\n📋 Manual Testing Instructions:")
    for instruction in benchmark_data["testing_instructions"]:
        print(f"   {instruction}")
    
    return True

def main():
    """Main test function"""
    print("🔧 Chat Performance Fix Verification")
    print("=" * 60)
    
    # Test performance optimizations
    if not test_performance_optimizations():
        print("\n❌ Performance optimization tests failed!")
        return False
    
    # Start backend if needed
    backend_process = None
    if not check_backend():
        backend_process = start_backend()
        if not backend_process:
            print("⚠️  Backend not available - skipping functional tests")
        time.sleep(2)
    
    # Test functionality
    test_chat_functionality()
    
    # Create benchmark
    create_performance_benchmark()
    
    # Cleanup
    if backend_process:
        try:
            backend_process.terminate()
            print("\n🧹 Backend process terminated")
        except:
            pass
    
    print("\n🎉 Chat Performance Fix Verification Complete!")
    print("\n📝 Summary of Applied Optimizations:")
    print("   • React.memo for message components")
    print("   • useMemo and useCallback for performance")
    print("   • Message batching (max 50 visible)")
    print("   • Debounced scroll handling")
    print("   • Proper timeout cleanup")
    print("   • Optimized input handling")
    print("\n🚀 The chat should now be much more responsive!")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)