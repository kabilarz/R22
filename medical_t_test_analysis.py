#!/usr/bin/env python3
"""
MEDICAL T-TEST ANALYSIS - One-Click Statistical Testing
======================================================
For Medical Doctors - Just Click Run!

This script automatically:
✅ Installs required libraries
✅ Uses your clinical data OR creates sample data
✅ Performs multiple types of t-tests
✅ Shows effect sizes and confidence intervals
✅ Provides medical interpretation
✅ Saves publication-ready plots

Perfect for comparing treatment groups and clinical outcomes!
"""

import subprocess
import sys
import os
import json

# Auto-install required packages
def install_packages():
    """Auto-install required packages if not available"""
    required_packages = [
        'pandas', 'numpy', 'matplotlib', 'seaborn', 'scipy'
    ]
    
    print("🔧 Installing statistical testing packages...")
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            print(f"📦 Installing {package}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
    
    print("✅ All packages ready!")

# Install packages first
install_packages()

# Now import everything we need
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
import warnings
warnings.filterwarnings('ignore')

# Set style for medical-grade plots
plt.style.use('default')
sns.set_palette("Set2")

def load_or_create_clinical_data():
    """Load clinical data or create comprehensive sample dataset"""
    
    # Try to load existing data
    data_files = [
        'clinical_trial_hypertension.json',
        'demo_datasets/clinical_trial_hypertension.json',
        'demo_datasets/clinical_trial_hypertension.csv',
        'clinical_data.csv',
        'patient_data.csv'
    ]
    
    for file_path in data_files:
        if os.path.exists(file_path):
            try:
                print(f"📂 Loading data from: {file_path}")
                
                if file_path.endswith('.json'):
                    with open(file_path, 'r') as f:
                        data = json.load(f)
                    return pd.DataFrame(data)
                elif file_path.endswith('.csv'):
                    return pd.read_csv(file_path)
                    
            except Exception as e:
                print(f"⚠️ Could not load {file_path}: {e}")
                continue
    
    # Create sample data if none found
    print("📊 Creating sample clinical trial dataset...")
    return create_clinical_trial_data()

def create_clinical_trial_data():
    """Create realistic clinical trial data for t-test analysis"""
    np.random.seed(42)  # Reproducible results
    
    n_patients = 200
    
    print("🏥 Generating realistic clinical trial data...")
    
    # Patient characteristics
    age = np.random.normal(62, 12, n_patients).clip(30, 85)
    gender = np.random.choice(['Male', 'Female'], n_patients)
    
    # Randomization to treatment groups (1:1 ratio)
    treatment_group = np.random.choice(['Control', 'Treatment'], n_patients)
    
    # Baseline measurements (no treatment effect yet)
    baseline_systolic_bp = np.random.normal(145, 18, n_patients).clip(120, 200)
    baseline_diastolic_bp = np.random.normal(92, 12, n_patients).clip(70, 120)
    baseline_cholesterol = np.random.normal(235, 35, n_patients).clip(150, 350)
    baseline_bmi = np.random.normal(29, 4, n_patients).clip(20, 40)
    baseline_glucose = np.random.normal(110, 20, n_patients).clip(80, 200)
    
    # Quality of life baseline (0-100 scale)
    baseline_qol = np.random.normal(65, 15, n_patients).clip(20, 100)
    
    # Follow-up measurements with realistic treatment effects
    # Treatment group gets better outcomes
    treatment_effect_systolic = np.where(treatment_group == 'Treatment', -18, -3)  # mmHg reduction
    treatment_effect_diastolic = np.where(treatment_group == 'Treatment', -12, -2)  # mmHg reduction
    treatment_effect_cholesterol = np.where(treatment_group == 'Treatment', -32, -8)  # mg/dL reduction
    treatment_effect_bmi = np.where(treatment_group == 'Treatment', -2.1, -0.3)  # kg/m² reduction
    treatment_effect_glucose = np.where(treatment_group == 'Treatment', -15, -2)  # mg/dL reduction
    treatment_effect_qol = np.where(treatment_group == 'Treatment', +18, +5)  # QoL improvement
    
    # Add random variation (noise)
    noise_systolic = np.random.normal(0, 12, n_patients)
    noise_diastolic = np.random.normal(0, 8, n_patients)
    noise_cholesterol = np.random.normal(0, 25, n_patients)
    noise_bmi = np.random.normal(0, 1.5, n_patients)
    noise_glucose = np.random.normal(0, 15, n_patients)
    noise_qol = np.random.normal(0, 12, n_patients)
    
    # Calculate follow-up values
    followup_systolic_bp = baseline_systolic_bp + treatment_effect_systolic + noise_systolic
    followup_diastolic_bp = baseline_diastolic_bp + treatment_effect_diastolic + noise_diastolic
    followup_cholesterol = baseline_cholesterol + treatment_effect_cholesterol + noise_cholesterol
    followup_bmi = baseline_bmi + treatment_effect_bmi + noise_bmi
    followup_glucose = baseline_glucose + treatment_effect_glucose + noise_glucose
    followup_qol = baseline_qol + treatment_effect_qol + noise_qol
    
    # Create DataFrame
    data = {
        'patient_id': range(1, n_patients + 1),
        'age': age,
        'gender': gender,
        'treatment_group': treatment_group,
        'baseline_systolic_bp': baseline_systolic_bp.clip(100, 200),
        'baseline_diastolic_bp': baseline_diastolic_bp.clip(60, 120),
        'baseline_cholesterol': baseline_cholesterol.clip(120, 400),
        'baseline_bmi': baseline_bmi.clip(18, 45),
        'baseline_glucose': baseline_glucose.clip(70, 250),
        'baseline_quality_of_life': baseline_qol.clip(0, 100),
        'followup_systolic_bp': followup_systolic_bp.clip(90, 180),
        'followup_diastolic_bp': followup_diastolic_bp.clip(55, 110),
        'followup_cholesterol': followup_cholesterol.clip(100, 350),
        'followup_bmi': followup_bmi.clip(18, 40),
        'followup_glucose': followup_glucose.clip(70, 200),
        'followup_quality_of_life': followup_qol.clip(0, 100),
    }
    
    df = pd.DataFrame(data)
    
    # Calculate change scores (primary endpoints)
    df['systolic_bp_change'] = df['followup_systolic_bp'] - df['baseline_systolic_bp']
    df['diastolic_bp_change'] = df['followup_diastolic_bp'] - df['baseline_diastolic_bp']
    df['cholesterol_change'] = df['followup_cholesterol'] - df['baseline_cholesterol']
    df['bmi_change'] = df['followup_bmi'] - df['baseline_bmi']
    df['glucose_change'] = df['followup_glucose'] - df['baseline_glucose']
    df['quality_of_life_change'] = df['followup_quality_of_life'] - df['baseline_quality_of_life']
    
    return df

def calculate_cohens_d(group1, group2):
    """Calculate Cohen's d effect size"""
    n1, n2 = len(group1), len(group2)
    pooled_std = np.sqrt(((n1 - 1) * group1.var() + (n2 - 1) * group2.var()) / (n1 + n2 - 2))
    return (group1.mean() - group2.mean()) / pooled_std if pooled_std > 0 else 0

def interpret_effect_size(d):
    """Interpret Cohen's d effect size"""
    abs_d = abs(d)
    if abs_d < 0.2:
        return "Negligible"
    elif abs_d < 0.5:
        return "Small"
    elif abs_d < 0.8:
        return "Medium"
    else:
        return "Large"

def run_ttest_analysis():
    """Run comprehensive t-test analysis"""
    
    print("🏥 MEDICAL T-TEST ANALYSIS")
    print("=" * 50)
    
    # Load data
    df = load_or_create_clinical_data()
    
    print(f"✅ Dataset loaded: {len(df)} patients")
    print(f"📋 Treatment groups: {df['treatment_group'].value_counts().to_dict()}")
    print()
    
    # Identify variables for analysis
    change_vars = [col for col in df.columns if 'change' in col.lower()]
    baseline_vars = [col for col in df.columns if 'baseline' in col.lower()]
    followup_vars = [col for col in df.columns if 'followup' in col.lower()]
    
    print(f"🔢 Change variables: {len(change_vars)}")
    print(f"🔢 Baseline variables: {len(baseline_vars)}")
    print(f"🔢 Follow-up variables: {len(followup_vars)}")
    print()
    
    # Create comprehensive analysis plots
    fig = plt.figure(figsize=(24, 20))
    
    # Prepare results storage
    ttest_results = []
    
    # 1. INDEPENDENT T-TESTS FOR CHANGE VARIABLES
    print("1️⃣ INDEPENDENT T-TESTS (TREATMENT VS CONTROL)")
    print("-" * 50)
    
    plot_idx = 1
    
    for i, var in enumerate(change_vars[:6]):  # Limit to 6 variables for display
        
        # Get data for each group
        control_data = df[df['treatment_group'] == 'Control'][var].dropna()
        treatment_data = df[df['treatment_group'] == 'Treatment'][var].dropna()
        
        if len(control_data) < 3 or len(treatment_data) < 3:
            continue
        
        # Perform independent t-test
        t_stat, p_value = stats.ttest_ind(treatment_data, control_data)
        
        # Calculate effect size
        cohens_d = calculate_cohens_d(treatment_data, control_data)
        
        # Calculate confidence intervals
        n1, n2 = len(treatment_data), len(control_data)
        pooled_std = np.sqrt(((n1 - 1) * treatment_data.var() + (n2 - 1) * control_data.var()) / (n1 + n2 - 2))
        se_diff = pooled_std * np.sqrt(1/n1 + 1/n2)
        mean_diff = treatment_data.mean() - control_data.mean()
        
        df_total = n1 + n2 - 2
        t_critical = stats.t.ppf(0.975, df_total)
        ci_lower = mean_diff - t_critical * se_diff
        ci_upper = mean_diff + t_critical * se_diff
        
        # Store results
        result = {
            'variable': var,
            'control_mean': control_data.mean(),
            'control_std': control_data.std(),
            'control_n': len(control_data),
            'treatment_mean': treatment_data.mean(),
            'treatment_std': treatment_data.std(),
            'treatment_n': len(treatment_data),
            'mean_difference': mean_diff,
            't_statistic': t_stat,
            'p_value': p_value,
            'cohens_d': cohens_d,
            'effect_size_interpretation': interpret_effect_size(cohens_d),
            'ci_lower': ci_lower,
            'ci_upper': ci_upper,
            'significant': p_value < 0.05
        }
        ttest_results.append(result)
        
        # Print results
        print(f"📊 {var.replace('_', ' ').title()}:")
        print(f"   Control: {control_data.mean():.2f} ± {control_data.std():.2f} (n={len(control_data)})")
        print(f"   Treatment: {treatment_data.mean():.2f} ± {treatment_data.std():.2f} (n={len(treatment_data)})")
        print(f"   Difference: {mean_diff:+.2f} [95% CI: {ci_lower:.2f}, {ci_upper:.2f}]")
        print(f"   t = {t_stat:.3f}, p = {p_value:.4f}")
        print(f"   Cohen's d = {cohens_d:.3f} ({interpret_effect_size(cohens_d)} effect)")
        print(f"   {'✅ Significant' if p_value < 0.05 else '❌ Not significant'}")
        print()
        
        # Create box plot
        if plot_idx <= 6:
            plt.subplot(4, 6, plot_idx)
            
            box_data = [control_data, treatment_data]
            box_labels = ['Control', 'Treatment']
            
            bp = plt.boxplot(box_data, labels=box_labels, patch_artist=True)
            bp['boxes'][0].set_facecolor('lightblue')
            bp['boxes'][1].set_facecolor('lightgreen')
            
            plt.title(f'{var.replace("_", " ").title()}\np = {p_value:.4f}', 
                     fontsize=10, fontweight='bold')
            plt.ylabel('Change from Baseline')
            plt.grid(True, alpha=0.3)
            
            # Add significance indicator
            if p_value < 0.001:
                sig_marker = "***"
            elif p_value < 0.01:
                sig_marker = "**"
            elif p_value < 0.05:
                sig_marker = "*"
            else:
                sig_marker = "ns"
            
            plt.text(0.5, 0.95, sig_marker, transform=plt.gca().transAxes,
                    ha='center', va='top', fontsize=14, fontweight='bold')
            
            plot_idx += 1
    
    # 2. PAIRED T-TESTS (BASELINE VS FOLLOW-UP)
    print("2️⃣ PAIRED T-TESTS (BASELINE VS FOLLOW-UP)")
    print("-" * 50)
    
    paired_results = []
    
    # Find matching baseline/followup pairs
    baseline_followup_pairs = []
    for baseline_var in baseline_vars:
        # Look for corresponding followup variable
        var_name = baseline_var.replace('baseline_', '')
        followup_var = f'followup_{var_name}'
        
        if followup_var in df.columns:
            baseline_followup_pairs.append((baseline_var, followup_var))
    
    for baseline_var, followup_var in baseline_followup_pairs[:3]:  # Limit to 3 for display
        
        # Get paired data
        paired_data = df[[baseline_var, followup_var]].dropna()
        
        if len(paired_data) < 5:
            continue
        
        baseline_values = paired_data[baseline_var]
        followup_values = paired_data[followup_var]
        
        # Perform paired t-test
        t_stat, p_value = stats.ttest_rel(baseline_values, followup_values)
        
        # Calculate effect size for paired data
        differences = followup_values - baseline_values
        cohens_d = differences.mean() / differences.std() if differences.std() > 0 else 0
        
        # Calculate confidence interval for mean difference
        n = len(differences)
        t_critical = stats.t.ppf(0.975, n-1)
        se_diff = differences.std() / np.sqrt(n)
        mean_diff = differences.mean()
        ci_lower = mean_diff - t_critical * se_diff
        ci_upper = mean_diff + t_critical * se_diff
        
        # Store results
        paired_result = {
            'baseline_variable': baseline_var,
            'followup_variable': followup_var,
            'baseline_mean': baseline_values.mean(),
            'followup_mean': followup_values.mean(),
            'mean_difference': mean_diff,
            't_statistic': t_stat,
            'p_value': p_value,
            'cohens_d': cohens_d,
            'n_pairs': len(paired_data),
            'ci_lower': ci_lower,
            'ci_upper': ci_upper,
            'significant': p_value < 0.05
        }
        paired_results.append(paired_result)
        
        print(f"📊 {baseline_var.replace('baseline_', '').replace('_', ' ').title()}:")
        print(f"   Baseline: {baseline_values.mean():.2f} ± {baseline_values.std():.2f}")
        print(f"   Follow-up: {followup_values.mean():.2f} ± {followup_values.std():.2f}")
        print(f"   Change: {mean_diff:+.2f} [95% CI: {ci_lower:.2f}, {ci_upper:.2f}]")
        print(f"   t = {t_stat:.3f}, p = {p_value:.4f} (n={len(paired_data)} pairs)")
        print(f"   Cohen's d = {cohens_d:.3f} ({interpret_effect_size(cohens_d)} effect)")
        print(f"   {'✅ Significant change' if p_value < 0.05 else '❌ No significant change'}")
        print()
    
    # 3. RESULTS SUMMARY TABLE
    plt.subplot(4, 6, (13, 18))
    plt.axis('off')
    
    summary_text = []
    summary_text.append("📋 T-TEST RESULTS SUMMARY")
    summary_text.append("=" * 35)
    summary_text.append("")
    summary_text.append("🔬 INDEPENDENT T-TESTS:")
    
    significant_results = [r for r in ttest_results if r['significant']]
    
    for result in ttest_results[:5]:  # Show top 5 results
        var_name = result['variable'].replace('_change', '').replace('_', ' ').title()
        significance = "***" if result['p_value'] < 0.001 else "**" if result['p_value'] < 0.01 else "*" if result['p_value'] < 0.05 else "ns"
        
        summary_text.append(f"• {var_name}:")
        summary_text.append(f"  Δ = {result['mean_difference']:+.2f}, p = {result['p_value']:.4f} {significance}")
        summary_text.append(f"  Effect: {result['effect_size_interpretation']} (d = {result['cohens_d']:.3f})")
        summary_text.append("")
    
    summary_text.append("🔄 PAIRED T-TESTS:")
    for result in paired_results:
        var_name = result['baseline_variable'].replace('baseline_', '').replace('_', ' ').title()
        significance = "***" if result['p_value'] < 0.001 else "**" if result['p_value'] < 0.01 else "*" if result['p_value'] < 0.05 else "ns"
        
        summary_text.append(f"• {var_name}:")
        summary_text.append(f"  Δ = {result['mean_difference']:+.2f}, p = {result['p_value']:.4f} {significance}")
        summary_text.append("")
    
    plt.text(0.05, 0.95, '\n'.join(summary_text), transform=plt.gca().transAxes,
             fontsize=9, verticalalignment='top', fontfamily='monospace',
             bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.8))
    
    # 4. EFFECT SIZE VISUALIZATION
    if ttest_results:
        plt.subplot(4, 6, (19, 24))
        
        variables = [r['variable'].replace('_change', '').replace('_', ' ').title() for r in ttest_results]
        effect_sizes = [r['cohens_d'] for r in ttest_results]
        p_values = [r['p_value'] for r in ttest_results]
        
        # Color code by significance
        colors = ['green' if p < 0.05 else 'orange' if p < 0.1 else 'red' for p in p_values]
        
        bars = plt.barh(variables, effect_sizes, color=colors, alpha=0.7)
        
        plt.xlabel("Cohen's d (Effect Size)")
        plt.title('📊 Effect Sizes by Variable\n(Green=Significant, Orange=Trend, Red=NS)', 
                 fontweight='bold')
        plt.axvline(x=0, color='black', linestyle='-', alpha=0.5)
        plt.axvline(x=0.2, color='gray', linestyle='--', alpha=0.5, label='Small')
        plt.axvline(x=0.5, color='gray', linestyle='--', alpha=0.5, label='Medium')
        plt.axvline(x=0.8, color='gray', linestyle='--', alpha=0.5, label='Large')
        plt.axvline(x=-0.2, color='gray', linestyle='--', alpha=0.5)
        plt.axvline(x=-0.5, color='gray', linestyle='--', alpha=0.5)
        plt.axvline(x=-0.8, color='gray', linestyle='--', alpha=0.5)
        
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
    
    # Adjust layout and save
    plt.tight_layout()
    plt.suptitle('🏥 MEDICAL T-TEST ANALYSIS DASHBOARD', 
                 fontsize=18, fontweight='bold', y=0.98)
    
    # Save the plot
    plt.savefig('ttest_analysis_results.png', dpi=300, bbox_inches='tight')
    print("💾 Results saved as 'ttest_analysis_results.png'")
    
    # Show the plot
    plt.show()
    
    # FINAL SUMMARY
    print("\n" + "="*60)
    print("🎯 T-TEST ANALYSIS SUMMARY")
    print("="*60)
    print(f"📊 Total patients: {len(df)}")
    print(f"🔬 Independent t-tests: {len(ttest_results)}")
    print(f"🔄 Paired t-tests: {len(paired_results)}")
    print(f"✅ Significant results: {len(significant_results)}")
    
    if significant_results:
        print("\n🎯 KEY FINDINGS:")
        for result in significant_results[:3]:
            var_name = result['variable'].replace('_change', '').replace('_', ' ').title()
            print(f"• {var_name}: {result['mean_difference']:+.2f} (p={result['p_value']:.4f})")
    
    print("\n✅ Statistical analysis completed!")
    print("📊 Effect sizes calculated")
    print("📈 Confidence intervals provided")
    print("💾 Publication-ready plots saved")
    print("\n🏥 Ready for clinical interpretation and reporting!")

if __name__ == "__main__":
    try:
        run_ttest_analysis()
        input("\n👆 Press Enter to close...")
    except Exception as e:
        print(f"\n❌ Error occurred: {e}")
        print("🔧 Please check your data and try again.")
        import traceback
        traceback.print_exc()
        input("\n👆 Press Enter to close...")