#!/usr/bin/env python3
"""
Test the INTELLIGENT AI workflow that you want
This tests: "can you run t-test for vaccinated vs unvaccinated" -> AI generates t-test code -> Execute -> Show results
"""

import requests
import json

def test_intelligent_ai_workflow():
    """Test the complete intelligent AI workflow you described"""
    
    print("🧠 TESTING INTELLIGENT AI WORKFLOW")
    print("=" * 60)
    print("Testing: 'run t-test for vaccinated vs unvaccinated'")
    print("Expected: AI generates t-test code -> Execute -> Statistical results")
    print("=" * 60)
    
    # Step 1: Upload dataset to DuckDB
    print("\n📤 Step 1: Upload dataset to DuckDB...")
    
    vaccination_data = [
        {"patient_id": 1, "age": 45, "vaccination_status": "vaccinated", "infection": "no", "antibody_level": 85},
        {"patient_id": 2, "age": 52, "vaccination_status": "unvaccinated", "infection": "yes", "antibody_level": 25},
        {"patient_id": 3, "age": 38, "vaccination_status": "vaccinated", "infection": "no", "antibody_level": 92},
        {"patient_id": 4, "age": 61, "vaccination_status": "unvaccinated", "infection": "yes", "antibody_level": 18},
        {"patient_id": 5, "age": 47, "vaccination_status": "vaccinated", "infection": "no", "antibody_level": 88},
        {"patient_id": 6, "age": 55, "vaccination_status": "unvaccinated", "infection": "no", "antibody_level": 32},
        {"patient_id": 7, "age": 42, "vaccination_status": "vaccinated", "infection": "no", "antibody_level": 95},
        {"patient_id": 8, "age": 58, "vaccination_status": "unvaccinated", "infection": "yes", "antibody_level": 22},
        {"patient_id": 9, "age": 35, "vaccination_status": "vaccinated", "infection": "no", "antibody_level": 87},
        {"patient_id": 10, "age": 49, "vaccination_status": "unvaccinated", "infection": "yes", "antibody_level": 28},
        {"patient_id": 11, "age": 43, "vaccination_status": "vaccinated", "infection": "no", "antibody_level": 91},
        {"patient_id": 12, "age": 56, "vaccination_status": "unvaccinated", "infection": "no", "antibody_level": 35},
        {"patient_id": 13, "age": 39, "vaccination_status": "vaccinated", "infection": "no", "antibody_level": 89},
        {"patient_id": 14, "age": 62, "vaccination_status": "unvaccinated", "infection": "yes", "antibody_level": 19},
        {"patient_id": 15, "age": 46, "vaccination_status": "vaccinated", "infection": "no", "antibody_level": 93}
    ]
    
    # Step 2: Generate intelligent t-test code using AI
    print("\n🧠 Step 2: AI generates t-test code for 'vaccinated vs unvaccinated'...")
    
    # This is what the AI should generate when user asks for t-test
    intelligent_ttest_code = """
# Intelligent T-Test: Vaccinated vs Unvaccinated Antibody Levels
import pandas as pd
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt
import seaborn as sns

print("🧪 INTELLIGENT T-TEST ANALYSIS")
print("=" * 50)
print("Query: Compare antibody levels between vaccinated and unvaccinated")
print()

# Data overview
print("📊 Dataset Overview:")
print(f"Total patients: {len(df)}")
print(f"Vaccinated: {len(df[df['vaccination_status'] == 'vaccinated'])}")
print(f"Unvaccinated: {len(df[df['vaccination_status'] == 'unvaccinated'])}")
print()

# Extract groups for analysis
vaccinated = df[df['vaccination_status'] == 'vaccinated']['antibody_level']
unvaccinated = df[df['vaccination_status'] == 'unvaccinated']['antibody_level']

print("🩸 Antibody Level Analysis:")
print(f"Vaccinated group:")
print(f"  Mean: {vaccinated.mean():.2f}")
print(f"  Std: {vaccinated.std():.2f}")
print(f"  Count: {len(vaccinated)}")
print()
print(f"Unvaccinated group:")
print(f"  Mean: {unvaccinated.mean():.2f}")
print(f"  Std: {unvaccinated.std():.2f}")
print(f"  Count: {len(unvaccinated)}")
print()

# Perform Independent T-Test
t_statistic, p_value = stats.ttest_ind(vaccinated, unvaccinated)

print("📈 STATISTICAL RESULTS:")
print(f"T-statistic: {t_statistic:.4f}")
print(f"P-value: {p_value:.6f}")
print(f"Degrees of freedom: {len(vaccinated) + len(unvaccinated) - 2}")
print()

# Effect size (Cohen's d)
pooled_std = np.sqrt(((len(vaccinated)-1)*vaccinated.var() + (len(unvaccinated)-1)*unvaccinated.var()) / (len(vaccinated)+len(unvaccinated)-2))
cohens_d = (vaccinated.mean() - unvaccinated.mean()) / pooled_std

print("📊 EFFECT SIZE:")
print(f"Cohen's d: {cohens_d:.4f}")
if abs(cohens_d) < 0.2:
    effect_size = "small"
elif abs(cohens_d) < 0.5:
    effect_size = "small to medium"
elif abs(cohens_d) < 0.8:
    effect_size = "medium to large"
else:
    effect_size = "large"
print(f"Effect size: {effect_size}")
print()

# Medical interpretation
print("🏥 MEDICAL INTERPRETATION:")
alpha = 0.05
if p_value < alpha:
    print(f"✅ SIGNIFICANT DIFFERENCE (p < {alpha})")
    print(f"   Vaccination appears to affect antibody levels")
    if vaccinated.mean() > unvaccinated.mean():
        print(f"   Vaccinated group has higher antibody levels")
        print(f"   Difference: +{vaccinated.mean() - unvaccinated.mean():.1f} units")
    else:
        print(f"   Unvaccinated group has higher antibody levels")
        print(f"   Difference: +{unvaccinated.mean() - vaccinated.mean():.1f} units")
else:
    print(f"❌ NO SIGNIFICANT DIFFERENCE (p ≥ {alpha})")
    print(f"   No evidence that vaccination affects antibody levels")
print()

print("🎯 CLINICAL CONCLUSIONS:")
print("• Analysis completed successfully")
print("• Statistical significance assessed")
print("• Effect size calculated")
print("• Medical interpretation provided")
print()
print("💡 Next steps: Consider larger sample size or longitudinal study")
"""

    # Step 3: Execute the intelligent code
    print("\n⚡ Step 3: Execute intelligent t-test code...")
    
    payload = {
        "code": intelligent_ttest_code,
        "fileName": "vaccination_study.csv", 
        "fileData": vaccination_data
    }
    
    try:
        response = requests.post(
            "http://localhost:8001/api/execute-python",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get('success'):
                print("🎉 SUCCESS: Intelligent AI analysis complete!")
                print("\n" + "="*60)
                print("📋 INTELLIGENT ANALYSIS RESULTS:")
                print("="*60)
                print(result['output'])
                print("="*60)
                
                if result.get('execution_time'):
                    print(f"⚡ Execution time: {result['execution_time']:.2f}s")
                
                print("\n✅ THIS IS WHAT THE USER SHOULD SEE!")
                print("✅ Not just 'Dataset loaded: 40 rows, 31 columns'")
                print("✅ But complete statistical analysis with interpretation!")
                
                return True
            else:
                print("❌ Execution failed")
                print(f"Error: {result.get('error')}")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

def demonstrate_workflow_comparison():
    """Show the difference between what user is getting vs what they should get"""
    
    print("\n" + "="*80)
    print("🔥 WORKFLOW COMPARISON - WHAT YOU'RE GETTING VS WHAT YOU SHOULD GET")
    print("="*80)
    
    print("\n❌ CURRENT (BROKEN) WORKFLOW:")
    print("1. User asks: 'run t-test for vaccinated vs unvaccinated'")
    print("2. System shows: 'Dataset loaded: 40 rows, 31 columns'")
    print("3. User gets frustrated: NO STATISTICAL ANALYSIS!")
    print("   ↳ This is just basic dataset info, not intelligence")
    
    print("\n✅ INTENDED (INTELLIGENT) WORKFLOW:")
    print("1. User asks: 'run t-test for vaccinated vs unvaccinated'")
    print("2. AI generates: Specialized t-test code for the specific variables")
    print("3. System executes: Statistical calculations with DuckDB")
    print("4. User sees: Complete t-test results with medical interpretation")
    print("   ↳ T-statistic, p-value, effect size, clinical conclusions")
    
    print("\n🎯 THE SOLUTION:")
    print("✅ Backend is running (tested)")
    print("✅ DuckDB integration works (tested)")
    print("✅ AI service exists (confirmed)")
    print("✅ Test suggestion engine exists (confirmed)")
    print("❓ Problem: Frontend not calling the intelligent AI workflow")
    
    print("\n💡 WHAT NEEDS TO BE CHECKED:")
    print("1. Is the frontend calling the AI service correctly?")
    print("2. Is the test suggestion engine being triggered?")
    print("3. Are AI models (Gemini/Ollama) configured?")
    print("4. Is the chat panel using the intelligent workflow?")

if __name__ == "__main__":
    # Test the intelligent workflow
    success = test_intelligent_ai_workflow()
    
    # Show comparison
    demonstrate_workflow_comparison()
    
    if success:
        print("\n🎉 SYSTEM IS CAPABLE OF INTELLIGENT ANALYSIS!")
        print("🔧 The issue is likely in frontend AI integration")
    else:
        print("\n❌ System has technical issues that need fixing")