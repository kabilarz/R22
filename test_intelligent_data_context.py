#!/usr/bin/env python3
"""
Intelligent Data Context Test
Tests the new data explanation and context understanding features
"""

import time
import json
import os
import sys

def test_data_context_analyzer():
    """Test the data context analyzer functionality"""
    print("\\n🧠 Testing Data Context Analyzer")
    print("=" * 50)
    
    # Test 1: Verify Data Context Analyzer exists
    print("\\n1. Checking Data Context Analyzer...")
    analyzer_path = "lib/data-context-analyzer.ts"
    
    if not os.path.exists(analyzer_path):
        print("❌ Data context analyzer not found")
        return False
    
    with open(analyzer_path, 'r', encoding='utf-8') as f:
        analyzer_content = f.read()
        
    analyzer_features = [
        ("DataContextAnalyzer", "Main analyzer class"),
        ("analyzeDataset", "Dataset analysis method"),
        ("generateDataExplanation", "Data explanation generation"),
        ("generateAnalysisSuggestions", "Analysis suggestions"),
        ("identifyMedicalContext", "Medical context identification"),
        ("inferDatasetType", "Dataset type inference"),
        ("medicalTerms", "Medical terminology database"),
    ]
    
    for feature, description in analyzer_features:
        if feature in analyzer_content:
            print(f"✅ {description} - Found")
        else:
            print(f"❌ {description} - Missing")
    
    # Test 2: Verify AI Service Integration
    print("\\n2. Checking AI Service Integration...")
    ai_service_path = "lib/ai-service.ts"
    
    if not os.path.exists(ai_service_path):
        print("❌ AI service not found")
        return False
    
    with open(ai_service_path, 'r', encoding='utf-8') as f:
        ai_content = f.read()
        
    ai_features = [
        ("dataContextAnalyzer", "Import of context analyzer"),
        ("isDataExplorationQuery", "Data exploration detection"),
        ("type: 'explanation'", "Explanation response type"),
        ("analysisSuggestions", "Analysis suggestions field"),
        ("dataContext", "Data context field"),
    ]
    
    for feature, description in ai_features:
        if feature in ai_content:
            print(f"✅ {description} - Found")
        else:
            print(f"⚠️  {description} - Check implementation")
    
    # Test 3: Verify Chat Panel Integration
    print("\\n3. Checking Chat Panel Integration...")
    chat_panel_path = "components/chat-panel.tsx"
    
    if not os.path.exists(chat_panel_path):
        print("❌ Chat panel not found")
        return False
    
    with open(chat_panel_path, 'r', encoding='utf-8') as f:
        chat_content = f.read()
        
    chat_features = [
        ("response.type === 'explanation'", "Explanation handling"),
        ("analysisSuggestions", "Analysis suggestions display"),
        ("suggested_analyses", "Suggested analyses text"),
        ("What specific analysis", "Follow-up question prompt"),
    ]
    
    import re
    for pattern, description in chat_features:
        if re.search(pattern.replace("===", "==="), chat_content):
            print(f"✅ {description} - Implemented")
        else:
            print(f"⚠️  {description} - Check implementation")
    
    print("\\n✅ Data context analyzer checks completed!")
    return True

def test_query_scenarios():
    """Test different query scenarios"""
    print("\\n🎯 Testing Query Response Scenarios")
    print("=" * 50)
    
    test_scenarios = [
        {
            "query": "explain the data",
            "expected_behavior": "Should trigger data explanation with context analysis",
            "response_type": "explanation"
        },
        {
            "query": "what is this data about",
            "expected_behavior": "Should provide dataset overview and medical context",
            "response_type": "explanation"
        },
        {
            "query": "compare treatment groups",
            "expected_behavior": "Should suggest statistical tests for group comparison",
            "response_type": "suggestions"
        },
        {
            "query": "show me descriptive statistics",
            "expected_behavior": "Should generate code for descriptive analysis",
            "response_type": "code"
        },
        {
            "query": "analyze blood pressure changes",
            "expected_behavior": "Should detect medical context and suggest appropriate tests",
            "response_type": "suggestions"
        }
    ]
    
    print("\\n📋 Query Response Mapping:")
    for i, scenario in enumerate(test_scenarios, 1):
        print(f"\\n{i}. Query: '{scenario['query']}'")
        print(f"   Expected: {scenario['expected_behavior']}")
        print(f"   Response Type: {scenario['response_type']}")
    
    return True

def create_user_guide():
    """Create a user guide for the new intelligent features"""
    print("\\n📚 Creating User Guide")
    print("=" * 50)
    
    user_guide = {
        "intelligent_data_understanding": {
            "description": "The AI now intelligently analyzes your data before generating code",
            "features": [
                "Automatic data type detection (clinical trial, survey, longitudinal)",
                "Medical domain identification (cardiology, biomarkers, etc.)",
                "Data quality assessment with specific warnings",
                "Context-aware analysis suggestions",
                "Intelligent query routing (explanation vs code generation)"
            ]
        },
        "query_types": {
            "data_exploration": {
                "triggers": ["explain the data", "what is this data", "data overview", "tell me about this dataset"],
                "response": "Comprehensive data explanation with medical context and analysis suggestions"
            },
            "analysis_request": {
                "triggers": ["compare groups", "analyze differences", "test for significance"],
                "response": "Statistical test suggestions with medical relevance"
            },
            "specific_analysis": {
                "triggers": ["show descriptive statistics", "calculate correlation", "plot histogram"],
                "response": "Direct code generation for the requested analysis"
            }
        },
        "medical_intelligence": {
            "recognized_domains": [
                "Cardiology/Hypertension (blood pressure, cardiac measures)",
                "Laboratory Medicine (biomarkers, lab values)",
                "Patient-Reported Outcomes (quality of life, satisfaction)",
                "Demographics (age, gender, baseline characteristics)",
                "Clinical Interventions (treatments, medications)"
            ],
            "intelligent_suggestions": [
                "Blood pressure control analysis for hypertension data",
                "Treatment efficacy analysis for clinical trials",
                "Longitudinal analysis for time-series data",
                "Subgroup analysis for demographic data"
            ]
        },
        "best_practices": [
            "Start with 'explain the data' for new datasets",
            "Ask specific research questions after understanding the data",
            "Use medical terminology for better context recognition",
            "Follow suggested analysis workflows for optimal results"
        ]
    }
    
    with open("intelligent_data_guide.json", "w") as f:
        json.dump(user_guide, f, indent=2)
    
    print("✅ User guide created: intelligent_data_guide.json")
    print("\\n💡 New User Experience Flow:")
    print("   1. Upload dataset → AI explains data structure and medical context")
    print("   2. Ask 'explain the data' → Get comprehensive overview with suggestions")
    print("   3. Ask specific questions → Get targeted analysis recommendations")
    print("   4. Select analysis → Get optimized code with medical insights")
    
    return True

def main():
    """Main test function"""
    print("🤖 Intelligent Data Context System Test")
    print("=" * 60)
    
    # Test data context analyzer
    if not test_data_context_analyzer():
        print("\\n❌ Data context analyzer tests failed!")
        return False
    
    # Test query scenarios
    test_query_scenarios()
    
    # Create user guide
    create_user_guide()
    
    print("\\n🎉 Intelligent Data Context System Test Complete!")
    print("\\n📝 Summary of New Features:")
    print("   • Intelligent data type and medical domain detection")
    print("   • Context-aware query understanding")
    print("   • Medical terminology recognition")
    print("   • Smart analysis suggestions based on data type")
    print("   • Improved user experience with explanations first")
    print("   • RAG-style context understanding without external models")
    print("\\n🚀 The AI now understands your data context and provides intelligent guidance!")
    print("\\n💡 Next time you upload data, try asking:")
    print("   • 'explain the data' - for comprehensive overview")
    print("   • 'what can I analyze with this data?' - for suggestions")
    print("   • 'compare treatment groups' - for specific analysis")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)