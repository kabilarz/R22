#!/usr/bin/env python3
"""
MEDICAL QUICK STATS - One-Click Statistical Analysis
============================================
For Medical Doctors - Just Click Run!

This script automatically:
✅ Installs required libraries 
✅ Loads medical data
✅ Performs statistical analysis
✅ Shows visual results
✅ Provides medical interpretation

No technical knowledge required - Just run and see results!
"""

import subprocess
import sys
import os

# Auto-install required packages
def install_packages():
    """Auto-install required packages if not available"""
    required_packages = [
        'pandas', 'numpy', 'matplotlib', 'seaborn', 'scipy', 'statsmodels'
    ]
    
    print("🔧 Checking required packages...")
    
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
plt.style.use('seaborn-v0_8')
sns.set_palette("husl")

def create_sample_medical_data():
    """Create realistic medical data for demonstration"""
    np.random.seed(42)  # For reproducible results
    
    n_patients = 200
    
    # Generate realistic medical data
    data = {
        'patient_id': range(1, n_patients + 1),
        'age': np.random.normal(55, 15, n_patients).clip(18, 90),
        'gender': np.random.choice(['Male', 'Female'], n_patients),
        'treatment_group': np.random.choice(['Treatment', 'Control'], n_patients),
        'baseline_bp_systolic': np.random.normal(140, 20, n_patients).clip(90, 200),
        'baseline_bp_diastolic': np.random.normal(90, 15, n_patients).clip(60, 120),
        'baseline_cholesterol': np.random.normal(220, 40, n_patients).clip(120, 350),
        'baseline_bmi': np.random.normal(28, 5, n_patients).clip(18, 45),
        'comorbidities': np.random.randint(0, 4, n_patients),
        'smoking_status': np.random.choice(['Never', 'Former', 'Current'], n_patients, p=[0.5, 0.3, 0.2]),
    }
    
    # Create follow-up measurements with treatment effect
    treatment_effect = np.where(data['treatment_group'] == 'Treatment', -15, -5)
    noise = np.random.normal(0, 10, n_patients)
    
    data['followup_bp_systolic'] = data['baseline_bp_systolic'] + treatment_effect + noise
    data['followup_bp_diastolic'] = data['baseline_bp_diastolic'] + (treatment_effect * 0.6) + (noise * 0.8)
    data['followup_cholesterol'] = data['baseline_cholesterol'] + (treatment_effect * 0.8) + noise
    data['followup_bmi'] = data['baseline_bmi'] + np.random.normal(-1, 2, n_patients)
    
    # Calculate changes
    data['bp_systolic_change'] = data['followup_bp_systolic'] - data['baseline_bp_systolic']
    data['bp_diastolic_change'] = data['followup_bp_diastolic'] - data['baseline_bp_diastolic']
    data['cholesterol_change'] = data['followup_cholesterol'] - data['baseline_cholesterol']
    data['bmi_change'] = data['followup_bmi'] - data['baseline_bmi']
    
    return pd.DataFrame(data)

def run_complete_medical_analysis():
    """Run comprehensive medical statistical analysis"""
    
    print("🏥 MEDICAL QUICK STATS - COMPREHENSIVE ANALYSIS")
    print("=" * 60)
    
    # Load or create data
    try:
        # Try to load existing demo data
        if os.path.exists('demo_datasets/clinical_trial_hypertension.csv'):
            print("📊 Loading clinical trial data...")
            df = pd.read_csv('demo_datasets/clinical_trial_hypertension.csv')
        else:
            print("📊 Creating sample medical data...")
            df = create_sample_medical_data()
    except:
        print("📊 Creating sample medical data...")
        df = create_sample_medical_data()
    
    print(f"✅ Dataset loaded: {len(df)} patients")
    print(f"📋 Variables: {list(df.columns)}")
    print()
    
    # Create comprehensive analysis plots
    fig = plt.figure(figsize=(20, 16))
    
    # 1. DESCRIPTIVE STATISTICS SUMMARY
    print("1️⃣ DESCRIPTIVE STATISTICS")
    print("-" * 30)
    
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    desc_stats = df[numeric_cols].describe()
    print(desc_stats.round(2))
    print()
    
    # 2. TREATMENT COMPARISON (if treatment groups exist)
    if 'treatment_group' in df.columns:
        print("2️⃣ TREATMENT GROUP COMPARISON")
        print("-" * 30)
        
        # T-test for continuous variables
        treatment_vars = [col for col in df.columns if 'change' in col.lower() or 'followup' in col.lower()]
        
        for var in treatment_vars[:3]:  # Limit to first 3 variables
            if var in df.columns:
                treatment_data = df[df['treatment_group'] == 'Treatment'][var].dropna()
                control_data = df[df['treatment_group'] == 'Control'][var].dropna()
                
                if len(treatment_data) > 0 and len(control_data) > 0:
                    t_stat, p_value = stats.ttest_ind(treatment_data, control_data)
                    
                    print(f"📈 {var}:")
                    print(f"   Treatment mean: {treatment_data.mean():.2f} ± {treatment_data.std():.2f}")
                    print(f"   Control mean: {control_data.mean():.2f} ± {control_data.std():.2f}")
                    print(f"   p-value: {p_value:.4f} {'(Significant)' if p_value < 0.05 else '(Not significant)'}")
                    print()
    
    # 3. CORRELATION ANALYSIS
    print("3️⃣ CORRELATION ANALYSIS")
    print("-" * 30)
    
    # Select numeric columns for correlation
    corr_cols = [col for col in numeric_cols if 'baseline' in col.lower() or 'age' in col.lower()][:6]
    if len(corr_cols) >= 2:
        correlation_matrix = df[corr_cols].corr()
        
        # Plot correlation heatmap
        plt.subplot(3, 4, 1)
        sns.heatmap(correlation_matrix, annot=True, cmap='RdBu_r', center=0, 
                   square=True, linewidths=0.5, fmt='.2f')
        plt.title('🔗 Variable Correlations', fontsize=14, fontweight='bold')
        plt.xticks(rotation=45, ha='right')
        plt.yticks(rotation=0)
        
        # Print strongest correlations
        corr_pairs = []
        for i in range(len(correlation_matrix.columns)):
            for j in range(i+1, len(correlation_matrix.columns)):
                corr_val = correlation_matrix.iloc[i, j]
                if abs(corr_val) > 0.3:  # Only show moderate+ correlations
                    corr_pairs.append((correlation_matrix.columns[i], 
                                     correlation_matrix.columns[j], corr_val))
        
        corr_pairs.sort(key=lambda x: abs(x[2]), reverse=True)
        
        print("🔗 Strongest correlations:")
        for var1, var2, corr in corr_pairs[:5]:
            strength = "Strong" if abs(corr) > 0.7 else "Moderate" if abs(corr) > 0.5 else "Weak-Moderate"
            direction = "positive" if corr > 0 else "negative"
            print(f"   {var1} ↔ {var2}: {corr:.3f} ({strength} {direction})")
        print()
    
    # 4. DISTRIBUTION PLOTS
    if len(numeric_cols) >= 3:
        for i, col in enumerate(numeric_cols[:3]):
            plt.subplot(3, 4, i+2)
            plt.hist(df[col].dropna(), bins=20, alpha=0.7, edgecolor='black')
            plt.title(f'📊 {col}', fontsize=12, fontweight='bold')
            plt.xlabel(col)
            plt.ylabel('Frequency')
            plt.grid(True, alpha=0.3)
    
    # 5. BOX PLOTS FOR GROUP COMPARISONS
    if 'treatment_group' in df.columns and len(treatment_vars) > 0:
        for i, var in enumerate(treatment_vars[:3]):
            if var in df.columns:
                plt.subplot(3, 4, i+5)
                df.boxplot(column=var, by='treatment_group', ax=plt.gca())
                plt.title(f'📦 {var} by Treatment')
                plt.suptitle('')  # Remove automatic title
                plt.xticks(rotation=45)
    
    # 6. SCATTER PLOTS
    if len(numeric_cols) >= 4:
        pairs = [(numeric_cols[0], numeric_cols[1]), 
                (numeric_cols[2], numeric_cols[3]) if len(numeric_cols) > 3 else (numeric_cols[0], numeric_cols[2])]
        
        for i, (x_var, y_var) in enumerate(pairs[:2]):
            plt.subplot(3, 4, i+8)
            plt.scatter(df[x_var], df[y_var], alpha=0.6, s=30)
            plt.xlabel(x_var)
            plt.ylabel(y_var)
            plt.title(f'🎯 {x_var} vs {y_var}')
            plt.grid(True, alpha=0.3)
            
            # Add correlation coefficient
            corr_coef = df[x_var].corr(df[y_var])
            plt.text(0.05, 0.95, f'r = {corr_coef:.3f}', transform=plt.gca().transAxes,
                    bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))
    
    # 7. STATISTICAL TESTS SUMMARY
    plt.subplot(3, 4, (10, 12))
    plt.axis('off')
    
    # Prepare statistical summary
    stats_summary = []
    stats_summary.append("📋 STATISTICAL TESTS SUMMARY")
    stats_summary.append("=" * 35)
    
    # Normality tests
    if len(numeric_cols) > 0:
        test_col = numeric_cols[0]
        if len(df[test_col].dropna()) > 3:
            stat, p_val = stats.shapiro(df[test_col].dropna()[:50])  # Limit for Shapiro-Wilk
            stats_summary.append(f"🔬 Normality Test ({test_col}):")
            stats_summary.append(f"   Shapiro-Wilk p = {p_val:.4f}")
            stats_summary.append(f"   {'Normal distribution' if p_val > 0.05 else 'Non-normal distribution'}")
            stats_summary.append("")
    
    # Treatment effect summary
    if 'treatment_group' in df.columns and len(treatment_vars) > 0:
        stats_summary.append("💊 TREATMENT EFFECTS:")
        significant_effects = []
        for var in treatment_vars[:3]:
            if var in df.columns:
                treatment_data = df[df['treatment_group'] == 'Treatment'][var].dropna()
                control_data = df[df['treatment_group'] == 'Control'][var].dropna()
                
                if len(treatment_data) > 0 and len(control_data) > 0:
                    t_stat, p_value = stats.ttest_ind(treatment_data, control_data)
                    if p_value < 0.05:
                        significant_effects.append(f"   ✅ {var}: p = {p_value:.4f}")
                    else:
                        significant_effects.append(f"   ❌ {var}: p = {p_value:.4f}")
        
        stats_summary.extend(significant_effects)
        stats_summary.append("")
    
    # Medical interpretation
    stats_summary.append("🩺 MEDICAL INTERPRETATION:")
    stats_summary.append("• Review p-values < 0.05 for significance")
    stats_summary.append("• Consider clinical relevance vs statistical significance")
    stats_summary.append("• Validate findings with larger samples")
    stats_summary.append("• Consult statistical expert for complex analyses")
    
    # Display summary
    plt.text(0.05, 0.95, '\n'.join(stats_summary), transform=plt.gca().transAxes,
             fontsize=10, verticalalignment='top', fontfamily='monospace',
             bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.8))
    
    # Adjust layout and save
    plt.tight_layout()
    plt.suptitle('🏥 MEDICAL STATISTICAL ANALYSIS DASHBOARD', 
                 fontsize=16, fontweight='bold', y=0.98)
    
    # Save the plot
    plt.savefig('medical_analysis_results.png', dpi=300, bbox_inches='tight')
    print("💾 Results saved as 'medical_analysis_results.png'")
    
    # Show the plot
    plt.show()
    
    # 8. FINAL RECOMMENDATIONS
    print("\n" + "="*60)
    print("🎯 FINAL RECOMMENDATIONS FOR MEDICAL PROFESSIONALS")
    print("="*60)
    print("✅ Statistical analysis completed successfully!")
    print("📊 Visual results displayed and saved as PNG file")
    print("🔍 Review correlation patterns for clinical insights")
    print("📈 Examine treatment effects for therapeutic value")
    print("⚠️  Always validate with appropriate sample sizes")
    print("👥 Consider consulting biostatistician for complex studies")
    print("📋 Document all assumptions and limitations")
    print("\n🏥 Happy analyzing! Your data tells important medical stories.")

if __name__ == "__main__":
    try:
        run_complete_medical_analysis()
        input("\n👆 Press Enter to close...")
    except Exception as e:
        print(f"\n❌ Error occurred: {e}")
        print("🔧 Please check your data and try again.")
        input("\n👆 Press Enter to close...")