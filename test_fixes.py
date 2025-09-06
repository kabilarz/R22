#!/usr/bin/env python3
"""
Test both fixes:
1. Auto-scroll behavior (manual test)
2. Python execution indentation fix
"""

import requests
import json

def test_python_execution_fix():
    """Test that Python execution now works without indentation errors"""
    
    print("🧪 Testing Python execution fix...")
    
    # Simple test data
    test_data = [
        {"name": "Alice", "age": 25, "status": "vaccinated"},
        {"name": "Bob", "age": 30, "status": "unvaccinated"},
    ]
    
    # Simple test code that should work now
    test_code = """
print("Testing fixed Python execution...")
print(f"Data shape: {df.shape}")
print("Columns:", list(df.columns))

# Test basic analysis
for index, row in df.iterrows():
    print(f"{row['name']}: {row['age']} years old, {row['status']}")

print("✅ Execution successful!")
"""
    
    payload = {
        "code": test_code,
        "fileName": "test_data.csv",
        "fileData": test_data
    }
    
    try:
        print("📤 Sending request to backend...")
        response = requests.post(
            "http://localhost:8001/api/execute-python",
            json=payload,
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get('success'):
                print("🎉 SUCCESS: Python execution fix working!")
                print("\n📋 Output:")
                print("-" * 40)
                print(result['output'])
                print("-" * 40)
                return True
            else:
                print("❌ FAILED: Still getting errors")
                print("Error:", result.get('error'))
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR: Backend not running")
        print("💡 Start backend with: cd backend && python app.py")
        return False
    except Exception as e:
        print(f"❌ Test error: {e}")
        return False

def test_instructions():
    """Instructions for testing auto-scroll"""
    print("\n🧪 Testing Auto-scroll Fix...")
    print("=" * 50)
    print("📱 MANUAL TEST INSTRUCTIONS:")
    print("1. Open the application in your browser")
    print("2. Load a data file")
    print("3. Send a message in the chat")
    print("4. ✅ CHECK: Does the chat immediately scroll to show your message?")
    print("5. Send a longer message that generates AI response")
    print("6. ✅ CHECK: Does the chat scroll to show the AI response?")
    print("7. Execute Python code")
    print("8. ✅ CHECK: Does the chat scroll to show the results?")
    print("\n📱 EXPECTED BEHAVIOR:")
    print("• Instant scroll after sending message (like WhatsApp)")
    print("• Smooth scroll to AI responses")
    print("• Auto-scroll to Python execution results")
    print("• No manual scrolling needed")

if __name__ == "__main__":
    print("🚀 Testing Both Fixes...")
    print("=" * 50)
    
    # Test 1: Python execution fix
    python_success = test_python_execution_fix()
    
    # Test 2: Auto-scroll instructions
    test_instructions()
    
    print("\n" + "=" * 50)
    print("📊 RESULTS SUMMARY")
    print("=" * 50)
    print(f"🐍 Python Execution Fix: {'✅ PASSED' if python_success else '❌ FAILED'}")
    print("📱 Auto-scroll Fix: ✅ IMPLEMENTED (test manually)")
    
    if python_success:
        print("\n🎉 Python execution is now working!")
        print("💬 Auto-scroll improvements have been implemented!")
        print("🏥 Medical professionals can now use the system without issues!")
    else:
        print("\n❌ Python execution still needs work")
        print("🔧 Check the backend logs for more details")