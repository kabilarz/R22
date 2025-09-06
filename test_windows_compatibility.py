#!/usr/bin/env python3
"""
Test script to verify Windows compatibility fix for enhanced_python_executor.py
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

def test_windows_compatibility():
    """Test if the enhanced_python_executor is Windows compatible"""
    
    print("🧪 Testing Windows compatibility fix...")
    
    try:
        # Test 1: Import the module
        print("📦 Testing module import...")
        from backend.enhanced_python_executor import python_executor, HAS_RESOURCE, HAS_PSUTIL
        print("✅ Module imported successfully")
        
        # Test 2: Check compatibility flags
        print(f"🔍 Resource module available: {HAS_RESOURCE}")
        print(f"🔍 Psutil module available: {HAS_PSUTIL}")
        
        # Test 3: Test executor initialization
        print("🔧 Testing executor initialization...")
        stats = python_executor.get_execution_stats()
        print("✅ Executor initialized successfully")
        
        # Test 4: Print system info
        print("\n📊 System Information:")
        for key, value in stats.items():
            print(f"  {key}: {value}")
        
        # Test 5: Test simple code execution
        print("\n🧪 Testing simple code execution...")
        test_code = """
print("Hello from Windows-compatible executor!")
import sys
print(f"Python version: {sys.version}")
result = 2 + 2
print(f"2 + 2 = {result}")
"""
        
        execution_result = python_executor.execute_code(test_code, [])
        
        if execution_result.success:
            print("✅ Code execution successful!")
            print(f"📤 Output: {execution_result.output}")
            print(f"⏱️ Execution time: {execution_result.execution_time:.3f}s")
            print(f"💾 Memory used: {execution_result.memory_used} MB")
        else:
            print(f"❌ Code execution failed: {execution_result.error}")
            return False
        
        print("\n🎉 All tests passed! Windows compatibility fix is working.")
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_windows_compatibility()
    sys.exit(0 if success else 1)