#!/usr/bin/env python3
"""
MEDICAL DATA DEMO - Instant Statistical Results
==============================================
For Medical Doctors - Just Click Run!

This is a simplified version that runs immediately
and shows exactly what doctors need to see.
"""

import sys
import subprocess
import os

def install_if_needed():
    """Install packages only if needed"""
    try:
        import pandas
        import numpy 
        import matplotlib
        import seaborn
        import scipy
        print("✅ All packages already available!")
        return True
    except ImportError:
        print("📦 Installing required packages (one-time setup)...")
        packages = ['pandas', 'numpy', 'matplotlib', 'seaborn', 'scipy']
        
        for package in packages:
            try:
                subprocess.check_call([sys.executable, "-m", "pip", "install", package, "--quiet"])
                print(f"   ✅ {package} installed")
            except:
                print(f"   ⚠️ {package} installation skipped")
        return True

# Quick install check
install_if_needed()

# Now import everything
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
import warnings
warnings.filterwarnings('ignore')

# Set medical-grade plotting style
plt.style.use('default')
sns.set_palette("husl")

def create_quick_medical_data():
    """Create immediate medical data for demonstration"""
    np.random.seed(42)  # Reproducible results
    
    n = 100  # 100 patients
    
    # Patient data
    age = np.random.normal(60, 12, n).clip(30, 80)
    treatment = np.random.choice(['Control', 'Treatment'], n)
    
    # Blood pressure (with treatment effect)
    baseline_bp = np.random.normal(150, 20, n).clip(120, 200)
    treatment_effect = np.where(treatment == 'Treatment', -20, -5)
    followup_bp = baseline_bp + treatment_effect + np.random.normal(0, 15, n)
    
    # Cholesterol
    baseline_chol = np.random.normal(240, 30, n).clip(180, 320)
    chol_effect = np.where(treatment == 'Treatment', -30, -8)
    followup_chol = baseline_chol + chol_effect + np.random.normal(0, 20, n)
    
    # Quality of life (0-100)
    baseline_qol = np.random.normal(60, 15, n).clip(20, 100)
    qol_effect = np.where(treatment == 'Treatment', +15, +3)
    followup_qol = baseline_qol + qol_effect + np.random.normal(0, 12, n)
    
    return pd.DataFrame({
        'patient_id': range(1, n+1),
        'age': age.round(0),
        'treatment': treatment,
        'baseline_bp': baseline_bp.round(0),
        'followup_bp': followup_bp.round(0),
        'bp_change': (followup_bp - baseline_bp).round(1),
        'baseline_cholesterol': baseline_chol.round(0),
        'followup_cholesterol': followup_chol.round(0),
        'cholesterol_change': (followup_chol - baseline_chol).round(1),
        'baseline_qol': baseline_qol.round(1),
        'followup_qol': followup_qol.round(1),
        'qol_change': (followup_qol - baseline_qol).round(1)
    })

def run_instant_analysis():
    """Run instant medical analysis"""
    
    print("\n" + "="*60)
    print("🏥 MEDICAL INSTANT ANALYSIS - RESULTS")
    print("="*60)
    
    # Create data
    df = create_quick_medical_data()
    print(f"📊 Analyzing {len(df)} patients...")
    print(f"📋 Treatment groups: {df['treatment'].value_counts().to_dict()}")
    
    # Quick statistics
    print("\n1️⃣ TREATMENT COMPARISON (T-TESTS)")
    print("-" * 40)
    
    # Blood pressure analysis
    control_bp = df[df['treatment'] == 'Control']['bp_change']
    treatment_bp = df[df['treatment'] == 'Treatment']['bp_change']
    t_stat, p_val = stats.ttest_ind(treatment_bp, control_bp)
    
    print(f"🩸 Blood Pressure Change:")
    print(f"   Control: {control_bp.mean():.1f} ± {control_bp.std():.1f} mmHg")
    print(f"   Treatment: {treatment_bp.mean():.1f} ± {treatment_bp.std():.1f} mmHg")
    print(f"   p-value: {p_val:.4f} {'✅ SIGNIFICANT!' if p_val < 0.05 else '❌ Not significant'}")
    
    # Cholesterol analysis
    control_chol = df[df['treatment'] == 'Control']['cholesterol_change']
    treatment_chol = df[df['treatment'] == 'Treatment']['cholesterol_change']
    t_stat, p_val = stats.ttest_ind(treatment_chol, control_chol)
    
    print(f"\n🧪 Cholesterol Change:")
    print(f"   Control: {control_chol.mean():.1f} ± {control_chol.std():.1f} mg/dL")
    print(f"   Treatment: {treatment_chol.mean():.1f} ± {treatment_chol.std():.1f} mg/dL")
    print(f"   p-value: {p_val:.4f} {'✅ SIGNIFICANT!' if p_val < 0.05 else '❌ Not significant'}")
    
    # Quality of life analysis
    control_qol = df[df['treatment'] == 'Control']['qol_change']
    treatment_qol = df[df['treatment'] == 'Treatment']['qol_change']
    t_stat, p_val = stats.ttest_ind(treatment_qol, control_qol)
    
    print(f"\n❤️ Quality of Life Change:")
    print(f"   Control: {control_qol.mean():.1f} ± {control_qol.std():.1f} points")
    print(f"   Treatment: {treatment_qol.mean():.1f} ± {treatment_qol.std():.1f} points")
    print(f"   p-value: {p_val:.4f} {'✅ SIGNIFICANT!' if p_val < 0.05 else '❌ Not significant'}")
    
    # Create visualization
    print("\n2️⃣ CREATING VISUAL RESULTS...")
    print("-" * 40)
    
    fig, axes = plt.subplots(2, 3, figsize=(18, 12))
    
    # Box plots for each outcome
    outcomes = ['bp_change', 'cholesterol_change', 'qol_change']
    titles = ['Blood Pressure Change (mmHg)', 'Cholesterol Change (mg/dL)', 'Quality of Life Change']
    colors = ['lightblue', 'lightgreen', 'lightcoral']
    
    for i, (outcome, title, color) in enumerate(zip(outcomes, titles, colors)):
        ax = axes[0, i]
        
        control_data = df[df['treatment'] == 'Control'][outcome]
        treatment_data = df[df['treatment'] == 'Treatment'][outcome]
        
        bp = ax.boxplot([control_data, treatment_data], 
                       labels=['Control', 'Treatment'], 
                       patch_artist=True)
        
        bp['boxes'][0].set_facecolor('lightblue')
        bp['boxes'][1].set_facecolor('lightgreen')
        
        ax.set_title(title, fontweight='bold', fontsize=12)
        ax.set_ylabel('Change from Baseline')
        ax.grid(True, alpha=0.3)
        
        # Add p-value
        _, p_val = stats.ttest_ind(treatment_data, control_data)
        significance = "***" if p_val < 0.001 else "**" if p_val < 0.01 else "*" if p_val < 0.05 else "ns"
        ax.text(0.5, 0.95, f'p = {p_val:.4f} {significance}', 
               transform=ax.transAxes, ha='center', va='top',
               bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))
    
    # Correlation matrix
    ax = axes[1, 0]
    numeric_cols = ['age', 'baseline_bp', 'baseline_cholesterol', 'baseline_qol']
    corr_matrix = df[numeric_cols].corr()
    
    im = ax.imshow(corr_matrix, cmap='RdBu_r', vmin=-1, vmax=1)
    ax.set_xticks(range(len(numeric_cols)))
    ax.set_yticks(range(len(numeric_cols)))
    ax.set_xticklabels([col.replace('baseline_', '').replace('_', ' ').title() for col in numeric_cols], rotation=45)
    ax.set_yticklabels([col.replace('baseline_', '').replace('_', ' ').title() for col in numeric_cols])
    ax.set_title('🔗 Baseline Correlations', fontweight='bold')
    
    # Add correlation values
    for i in range(len(numeric_cols)):
        for j in range(len(numeric_cols)):
            ax.text(j, i, f'{corr_matrix.iloc[i, j]:.2f}', 
                   ha='center', va='center', 
                   color='white' if abs(corr_matrix.iloc[i, j]) > 0.5 else 'black')
    
    # Age distribution
    ax = axes[1, 1]
    ax.hist(df['age'], bins=15, alpha=0.7, color='skyblue', edgecolor='black')
    ax.set_title('📊 Age Distribution', fontweight='bold')
    ax.set_xlabel('Age (years)')
    ax.set_ylabel('Number of Patients')
    ax.grid(True, alpha=0.3)
    
    # Treatment distribution
    ax = axes[1, 2]
    treatment_counts = df['treatment'].value_counts()
    ax.pie(treatment_counts.values, labels=treatment_counts.index, 
           autopct='%1.1f%%', startangle=90, colors=['lightblue', 'lightgreen'])
    ax.set_title('👥 Treatment Distribution', fontweight='bold')
    
    plt.tight_layout()
    plt.suptitle('🏥 MEDICAL ANALYSIS DASHBOARD', fontsize=16, fontweight='bold', y=0.98)
    
    # Save and show
    try:
        plt.savefig('medical_instant_results.png', dpi=300, bbox_inches='tight')
        print("💾 Results saved as 'medical_instant_results.png'")
    except:
        print("⚠️ Could not save image file (display only)")
    
    plt.show()
    
    # Final summary
    print("\n3️⃣ CLINICAL SUMMARY")
    print("-" * 40)
    print("📊 STATISTICAL FINDINGS:")
    
    # Check which outcomes are significant
    outcomes_data = [
        ('Blood Pressure', treatment_bp, control_bp),
        ('Cholesterol', treatment_chol, control_chol),
        ('Quality of Life', treatment_qol, control_qol)
    ]
    
    significant_outcomes = []
    for name, treat_data, ctrl_data in outcomes_data:
        _, p = stats.ttest_ind(treat_data, ctrl_data)
        if p < 0.05:
            improvement = treat_data.mean() - ctrl_data.mean()
            significant_outcomes.append(f"   ✅ {name}: {improvement:+.1f} (p={p:.4f})")
        else:
            significant_outcomes.append(f"   ❌ {name}: No significant difference (p={p:.4f})")
    
    for outcome in significant_outcomes:
        print(outcome)
    
    print(f"\n🎯 BOTTOM LINE:")
    sig_count = sum(1 for _, treat_data, ctrl_data in outcomes_data 
                   if stats.ttest_ind(treat_data, ctrl_data)[1] < 0.05)
    
    if sig_count >= 2:
        print("   🌟 TREATMENT SHOWS SIGNIFICANT BENEFITS!")
        print("   💊 Consider for clinical implementation")
        print("   📋 Validate with larger trials")
    elif sig_count == 1:
        print("   📊 TREATMENT SHOWS SOME BENEFITS")
        print("   🔍 Further investigation recommended")
        print("   📋 Consider dose optimization")
    else:
        print("   ⚠️ NO SIGNIFICANT TREATMENT BENEFITS")
        print("   🔄 Review treatment protocol")
        print("   📊 Consider alternative approaches")
    
    print(f"\n📈 SAMPLE SIZE: {len(df)} patients (adequate for preliminary analysis)")
    print("⚠️ LIMITATIONS: Simulated data for demonstration")
    print("💡 NEXT STEPS: Apply to your real clinical data")
    
    print("\n" + "="*60)
    print("🏥 ANALYSIS COMPLETE! Ready for clinical review.")
    print("="*60)

if __name__ == "__main__":
    try:
        run_instant_analysis()
        print("\n✅ SUCCESS! Your medical analysis is complete.")
        print("📊 High-quality results generated in under 60 seconds.")
        print("🏥 Perfect for quick clinical insights!")
        
        input("\n👆 Press Enter to close...")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("🔧 Please ensure Python is properly installed.")
        input("\n👆 Press Enter to close...")