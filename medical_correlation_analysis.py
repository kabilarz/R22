#!/usr/bin/env python3
"""
MEDICAL CORRELATION MATRIX - One-Click Analysis
==============================================
For Medical Doctors - Just Click Run!

This script automatically:
✅ Installs required libraries
✅ Uses your clinical data OR creates sample data
✅ Generates correlation heatmaps
✅ Shows statistical significance  
✅ Provides medical interpretation
✅ Saves high-quality plots

Perfect for finding relationships in clinical data!
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
    
    print("🔧 Installing correlation analysis packages...")
    
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
from scipy.stats import pearsonr, spearmanr
import warnings
warnings.filterwarnings('ignore')

# Set style for medical-grade plots
plt.style.use('default')
sns.set_palette("RdBu_r")

def load_clinical_data():
    """Try to load clinical data from various sources"""
    
    # Try to load from common file formats
    data_files = [
        'clinical_trial_hypertension.json',
        'demo_datasets/clinical_trial_hypertension.json',
        'demo_datasets/clinical_trial_hypertension.csv',
        'clinical_trial_hypertension.csv',
        'medical_data.csv',
        'patient_data.csv',
        'clinical_data.xlsx'
    ]
    
    for file_path in data_files:
        if os.path.exists(file_path):
            try:
                print(f"📂 Found data file: {file_path}")
                
                if file_path.endswith('.json'):
                    with open(file_path, 'r') as f:
                        data = json.load(f)
                    return pd.DataFrame(data)
                elif file_path.endswith('.csv'):
                    return pd.read_csv(file_path)
                elif file_path.endswith('.xlsx'):
                    return pd.read_excel(file_path)
                    
            except Exception as e:
                print(f"⚠️ Could not load {file_path}: {e}")
                continue
    
    # If no data found, create comprehensive sample data
    print("📊 No clinical data found. Creating comprehensive sample dataset...")
    return create_comprehensive_medical_data()

def create_comprehensive_medical_data():
    """Create comprehensive medical dataset for correlation analysis"""
    np.random.seed(42)  # For reproducible results
    
    n_patients = 250
    
    print("🏥 Generating realistic medical data with known correlations...")
    
    # Base patient characteristics
    age = np.random.normal(58, 15, n_patients).clip(18, 90)
    gender_numeric = np.random.choice([0, 1], n_patients)  # 0=Female, 1=Male
    
    # Cardiovascular measurements with realistic correlations
    # Age effect on blood pressure
    baseline_systolic_bp = 120 + (age - 40) * 0.8 + np.random.normal(0, 15, n_patients)
    baseline_diastolic_bp = 80 + (age - 40) * 0.4 + np.random.normal(0, 10, n_patients)
    
    # BMI with age and gender effects
    bmi = 25 + (age - 40) * 0.1 + gender_numeric * 2 + np.random.normal(0, 4, n_patients)
    
    # Cholesterol correlated with age and BMI
    baseline_cholesterol = 180 + (age - 40) * 1.2 + (bmi - 25) * 3 + np.random.normal(0, 30, n_patients)
    
    # Weight derived from BMI (adding some realistic noise)
    height_cm = 170 + gender_numeric * 15 + np.random.normal(0, 8, n_patients)
    baseline_weight_kg = (bmi * (height_cm/100)**2) + np.random.normal(0, 3, n_patients)
    
    # Laboratory values with medical correlations
    # Glucose correlated with BMI and age
    glucose = 90 + (bmi - 25) * 2 + (age - 40) * 0.5 + np.random.normal(0, 15, n_patients)
    
    # Creatinine with age and gender effects
    creatinine = 0.9 + (age - 40) * 0.005 + gender_numeric * 0.2 + np.random.normal(0, 0.2, n_patients)
    
    # Hemoglobin with gender effect
    hemoglobin = 13 + gender_numeric * 2 + np.random.normal(0, 1.5, n_patients)
    
    # White blood cell count
    wbc = 7 + np.random.normal(0, 2, n_patients).clip(3, 15)
    
    # Biomarkers with clinical correlations
    # CRP (inflammation marker)
    crp = np.random.exponential(2, n_patients).clip(0, 20)
    
    # Troponin (cardiac marker) - elevated in some patients
    troponin = np.random.exponential(0.1, n_patients)
    # Add some elevated cases
    elevated_cases = np.random.choice(n_patients, size=int(n_patients * 0.1), replace=False)
    troponin[elevated_cases] += np.random.exponential(5, len(elevated_cases))
    
    # Treatment assignments
    treatment_group = np.random.choice(['Control', 'Treatment'], n_patients)
    
    # Follow-up measurements with treatment effects
    treatment_effect_systolic = np.where(treatment_group == 'Treatment', -12, -3)
    treatment_effect_diastolic = np.where(treatment_group == 'Treatment', -8, -2)
    treatment_effect_cholesterol = np.where(treatment_group == 'Treatment', -25, -5)
    
    # Add some random variation
    noise_systolic = np.random.normal(0, 12, n_patients)
    noise_diastolic = np.random.normal(0, 8, n_patients)
    noise_cholesterol = np.random.normal(0, 20, n_patients)
    
    week_12_systolic_bp = baseline_systolic_bp + treatment_effect_systolic + noise_systolic
    week_12_diastolic_bp = baseline_diastolic_bp + treatment_effect_diastolic + noise_diastolic
    final_cholesterol = baseline_cholesterol + treatment_effect_cholesterol + noise_cholesterol
    
    # Quality of life scores (0-100 scale)
    quality_of_life_baseline = 70 - (baseline_systolic_bp - 120) * 0.2 + np.random.normal(0, 15, n_patients)
    quality_of_life_week_12 = quality_of_life_baseline + 5 - treatment_effect_systolic * 0.5 + np.random.normal(0, 10, n_patients)
    
    # Ensure realistic ranges
    data = {
        'patient_id': range(1, n_patients + 1),
        'age': age.clip(18, 90),
        'gender': ['Female' if g == 0 else 'Male' for g in gender_numeric],
        'gender_numeric': gender_numeric,
        'baseline_systolic_bp': baseline_systolic_bp.clip(90, 200),
        'baseline_diastolic_bp': baseline_diastolic_bp.clip(50, 120),
        'baseline_cholesterol': baseline_cholesterol.clip(120, 400),
        'baseline_bmi': bmi.clip(16, 45),
        'baseline_weight_kg': baseline_weight_kg.clip(40, 150),
        'baseline_height_cm': height_cm.clip(140, 200),
        'glucose_mg_dl': glucose.clip(70, 300),
        'creatinine_mg_dl': creatinine.clip(0.5, 3.0),
        'hemoglobin_g_dl': hemoglobin.clip(8, 18),
        'wbc_count': wbc.clip(3, 15),
        'crp_mg_l': crp,
        'troponin_ng_ml': troponin.clip(0, 50),
        'treatment_group': treatment_group,
        'week_12_systolic_bp': week_12_systolic_bp.clip(80, 180),
        'week_12_diastolic_bp': week_12_diastolic_bp.clip(45, 110),
        'final_cholesterol': final_cholesterol.clip(100, 350),
        'quality_of_life_baseline': quality_of_life_baseline.clip(0, 100),
        'quality_of_life_week_12': quality_of_life_week_12.clip(0, 100),
    }
    
    # Calculate change variables
    df = pd.DataFrame(data)
    df['systolic_bp_change'] = df['week_12_systolic_bp'] - df['baseline_systolic_bp']
    df['diastolic_bp_change'] = df['week_12_diastolic_bp'] - df['baseline_diastolic_bp']
    df['cholesterol_change'] = df['final_cholesterol'] - df['baseline_cholesterol']
    df['quality_of_life_change'] = df['quality_of_life_week_12'] - df['quality_of_life_baseline']
    
    return df

def run_correlation_analysis():
    """Run comprehensive correlation analysis"""
    
    print("🏥 MEDICAL CORRELATION ANALYSIS")
    print("=" * 50)
    
    # Load data
    df = load_clinical_data()
    
    print(f"✅ Dataset loaded: {len(df)} patients")
    print(f"📋 Variables: {len(df.columns)} columns")
    print()
    
    # Identify numeric columns for correlation
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    
    # Remove ID columns
    numeric_cols = [col for col in numeric_cols if 'id' not in col.lower()]
    
    print(f"🔢 Numeric variables for correlation: {len(numeric_cols)}")
    for i, col in enumerate(numeric_cols):
        print(f"   {i+1:2d}. {col}")
    print()
    
    # Create correlation matrix
    correlation_matrix = df[numeric_cols].corr()
    
    # Create significance matrix
    n = len(df)
    significance_matrix = np.zeros_like(correlation_matrix)
    
    for i, col1 in enumerate(numeric_cols):
        for j, col2 in enumerate(numeric_cols):
            if i != j:
                # Calculate p-value for correlation
                corr_coef, p_value = pearsonr(df[col1].dropna(), df[col2].dropna())
                significance_matrix[i, j] = p_value
    
    # Create comprehensive analysis plots
    fig = plt.figure(figsize=(24, 18))
    
    # 1. MAIN CORRELATION HEATMAP
    plt.subplot(3, 4, (1, 6))  # Span multiple grid positions
    
    # Create mask for non-significant correlations
    mask = significance_matrix > 0.05
    np.fill_diagonal(mask, False)  # Always show diagonal
    
    # Create the heatmap
    sns.heatmap(correlation_matrix, 
                annot=True, 
                cmap='RdBu_r', 
                center=0,
                square=True, 
                linewidths=0.5, 
                fmt='.2f',
                cbar_kws={'label': 'Correlation Coefficient'},
                mask=None)  # Show all correlations
    
    plt.title('🔗 MEDICAL CORRELATION MATRIX\n(All Correlations)', 
              fontsize=16, fontweight='bold', pad=20)
    plt.xticks(rotation=45, ha='right')
    plt.yticks(rotation=0)
    
    # 2. SIGNIFICANT CORRELATIONS ONLY
    plt.subplot(3, 4, (3, 8))
    
    # Mask non-significant correlations
    masked_corr = correlation_matrix.copy()
    masked_corr[mask] = 0
    
    sns.heatmap(masked_corr, 
                annot=True, 
                cmap='RdBu_r', 
                center=0,
                square=True, 
                linewidths=0.5, 
                fmt='.2f',
                cbar_kws={'label': 'Correlation Coefficient'})
    
    plt.title('🎯 SIGNIFICANT CORRELATIONS ONLY\n(p < 0.05)', 
              fontsize=16, fontweight='bold', pad=20)
    plt.xticks(rotation=45, ha='right')
    plt.yticks(rotation=0)
    
    # 3. STRONGEST CORRELATIONS ANALYSIS
    plt.subplot(3, 4, 9)
    plt.axis('off')
    
    # Find strongest correlations
    corr_pairs = []
    for i in range(len(correlation_matrix.columns)):
        for j in range(i+1, len(correlation_matrix.columns)):
            corr_val = correlation_matrix.iloc[i, j]
            p_val = significance_matrix[i, j]
            var1 = correlation_matrix.columns[i]
            var2 = correlation_matrix.columns[j]
            
            if abs(corr_val) > 0.3:  # Only moderate+ correlations
                corr_pairs.append((var1, var2, corr_val, p_val))
    
    # Sort by absolute correlation strength
    corr_pairs.sort(key=lambda x: abs(x[2]), reverse=True)
    
    strongest_corr = []
    strongest_corr.append("🔝 STRONGEST CORRELATIONS")
    strongest_corr.append("=" * 30)
    strongest_corr.append("")
    
    for i, (var1, var2, corr, p_val) in enumerate(corr_pairs[:10]):
        strength = "Very Strong" if abs(corr) > 0.8 else "Strong" if abs(corr) > 0.6 else "Moderate"
        direction = "positive" if corr > 0 else "negative"
        significance = "***" if p_val < 0.001 else "**" if p_val < 0.01 else "*" if p_val < 0.05 else "ns"
        
        strongest_corr.append(f"{i+1:2d}. {var1}")
        strongest_corr.append(f"    ↔ {var2}")
        strongest_corr.append(f"    r = {corr:+.3f} ({strength} {direction}) {significance}")
        strongest_corr.append(f"    p = {p_val:.4f}")
        strongest_corr.append("")
    
    plt.text(0.05, 0.95, '\n'.join(strongest_corr), transform=plt.gca().transAxes,
             fontsize=9, verticalalignment='top', fontfamily='monospace',
             bbox=dict(boxstyle='round', facecolor='lightgreen', alpha=0.8))
    
    # 4. MEDICAL INTERPRETATION
    plt.subplot(3, 4, 10)
    plt.axis('off')
    
    medical_interpretation = []
    medical_interpretation.append("🩺 MEDICAL INSIGHTS")
    medical_interpretation.append("=" * 20)
    medical_interpretation.append("")
    
    # Look for medically relevant correlations
    medical_patterns = {
        'baseline_systolic_bp': ['baseline_diastolic_bp', 'age', 'baseline_bmi'],
        'baseline_cholesterol': ['baseline_bmi', 'age'],
        'creatinine_mg_dl': ['age'],
        'hemoglobin_g_dl': ['gender_numeric'],
        'glucose_mg_dl': ['baseline_bmi'],
    }
    
    found_patterns = []
    for key_var, related_vars in medical_patterns.items():
        if key_var in correlation_matrix.columns:
            for related_var in related_vars:
                if related_var in correlation_matrix.columns:
                    corr_val = correlation_matrix.loc[key_var, related_var]
                    if abs(corr_val) > 0.3:
                        found_patterns.append((key_var, related_var, corr_val))
    
    if found_patterns:
        medical_interpretation.append("🔍 Key Clinical Findings:")
        for key_var, related_var, corr_val in found_patterns:
            direction = "increases" if corr_val > 0 else "decreases"
            medical_interpretation.append(f"• {related_var} {direction}")
            medical_interpretation.append(f"  with {key_var}")
            medical_interpretation.append(f"  (r={corr_val:.3f})")
            medical_interpretation.append("")
    
    medical_interpretation.append("⚠️ CLINICAL CONSIDERATIONS:")
    medical_interpretation.append("• Strong correlations may indicate")
    medical_interpretation.append("  underlying pathophysiology")
    medical_interpretation.append("• Consider confounding variables")
    medical_interpretation.append("• Correlation ≠ causation")
    medical_interpretation.append("• Validate in larger cohorts")
    
    plt.text(0.05, 0.95, '\n'.join(medical_interpretation), transform=plt.gca().transAxes,
             fontsize=9, verticalalignment='top', fontfamily='monospace',
             bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.8))
    
    # 5. STATISTICS SUMMARY
    plt.subplot(3, 4, 11)
    plt.axis('off')
    
    stats_summary = []
    stats_summary.append("📊 STATISTICAL SUMMARY")
    stats_summary.append("=" * 22)
    stats_summary.append("")
    stats_summary.append(f"Total variables: {len(numeric_cols)}")
    stats_summary.append(f"Total correlations: {len(corr_pairs)}")
    stats_summary.append("")
    
    # Count significant correlations
    sig_001 = sum(1 for _, _, _, p in corr_pairs if p < 0.001)
    sig_01 = sum(1 for _, _, _, p in corr_pairs if 0.001 <= p < 0.01)
    sig_05 = sum(1 for _, _, _, p in corr_pairs if 0.01 <= p < 0.05)
    
    stats_summary.append("Significance levels:")
    stats_summary.append(f"  p < 0.001: {sig_001} (***)")
    stats_summary.append(f"  p < 0.01:  {sig_01} (**)")
    stats_summary.append(f"  p < 0.05:  {sig_05} (*)")
    stats_summary.append("")
    
    # Correlation strength distribution
    strong_corr = sum(1 for _, _, corr, _ in corr_pairs if abs(corr) > 0.6)
    moderate_corr = sum(1 for _, _, corr, _ in corr_pairs if 0.3 < abs(corr) <= 0.6)
    
    stats_summary.append("Correlation strength:")
    stats_summary.append(f"  Strong (|r| > 0.6): {strong_corr}")
    stats_summary.append(f"  Moderate (|r| > 0.3): {moderate_corr}")
    stats_summary.append("")
    
    stats_summary.append("📈 SAMPLE SIZE:")
    stats_summary.append(f"  N = {len(df)} patients")
    stats_summary.append(f"  Power: {'Adequate' if len(df) > 100 else 'Limited'}")
    
    plt.text(0.05, 0.95, '\n'.join(stats_summary), transform=plt.gca().transAxes,
             fontsize=9, verticalalignment='top', fontfamily='monospace',
             bbox=dict(boxstyle='round', facecolor='lightyellow', alpha=0.8))
    
    # 6. SCATTER PLOT OF STRONGEST CORRELATION
    if corr_pairs:
        plt.subplot(3, 4, 12)
        
        strongest_var1, strongest_var2, strongest_corr, strongest_p = corr_pairs[0]
        
        x_data = df[strongest_var1].dropna()
        y_data = df[strongest_var2].dropna()
        
        # Align the data
        aligned_data = df[[strongest_var1, strongest_var2]].dropna()
        
        plt.scatter(aligned_data[strongest_var1], aligned_data[strongest_var2], 
                   alpha=0.6, s=30, color='darkblue')
        
        # Add trend line
        z = np.polyfit(aligned_data[strongest_var1], aligned_data[strongest_var2], 1)
        p = np.poly1d(z)
        plt.plot(aligned_data[strongest_var1].sort_values(), 
                p(aligned_data[strongest_var1].sort_values()), 
                "r--", alpha=0.8, linewidth=2)
        
        plt.xlabel(strongest_var1.replace('_', ' ').title())
        plt.ylabel(strongest_var2.replace('_', ' ').title())
        plt.title(f'🎯 Strongest Correlation\nr = {strongest_corr:.3f}, p = {strongest_p:.4f}', 
                 fontweight='bold')
        plt.grid(True, alpha=0.3)
        
        # Add correlation info box
        plt.text(0.05, 0.95, f'r = {strongest_corr:.3f}\np = {strongest_p:.4f}', 
                transform=plt.gca().transAxes,
                bbox=dict(boxstyle='round', facecolor='white', alpha=0.8),
                verticalalignment='top')
    
    # Adjust layout and save
    plt.tight_layout()
    plt.suptitle('🏥 MEDICAL CORRELATION ANALYSIS DASHBOARD', 
                 fontsize=18, fontweight='bold', y=0.98)
    
    # Save the plot
    plt.savefig('correlation_analysis_results.png', dpi=300, bbox_inches='tight')
    print("💾 Results saved as 'correlation_analysis_results.png'")
    
    # Show the plot
    plt.show()
    
    # Print summary to console
    print("\n" + "="*60)
    print("🎯 CORRELATION ANALYSIS SUMMARY")
    print("="*60)
    print(f"📊 Total patients: {len(df)}")
    print(f"🔢 Variables analyzed: {len(numeric_cols)}")
    print(f"🔗 Significant correlations (p<0.05): {sig_001 + sig_01 + sig_05}")
    
    if corr_pairs:
        print(f"💪 Strongest correlation: {corr_pairs[0][0]} ↔ {corr_pairs[0][1]} (r={corr_pairs[0][2]:.3f})")
    
    print("✅ Correlation matrix generated successfully!")
    print("📊 Statistical significance calculated")
    print("💾 High-resolution plots saved")
    print("\n🏥 Ready for clinical interpretation!")

if __name__ == "__main__":
    try:
        run_correlation_analysis()
        input("\n👆 Press Enter to close...")
    except Exception as e:
        print(f"\n❌ Error occurred: {e}")
        print("🔧 Please check your data and try again.")
        import traceback
        traceback.print_exc()
        input("\n👆 Press Enter to close...")