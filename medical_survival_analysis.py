#!/usr/bin/env python3
"""
MEDICAL SURVIVAL ANALYSIS - One-Click Kaplan-Meier Analysis
==========================================================
For Medical Doctors - Just Click Run!

This script automatically:
✅ Installs survival analysis libraries
✅ Creates sample patient survival data  
✅ Performs Kaplan-Meier survival analysis
✅ Shows survival curves and statistics
✅ Provides medical interpretation

Perfect for oncology, cardiology, and clinical research!
"""

import subprocess
import sys
import os

# Auto-install required packages
def install_packages():
    """Auto-install required packages if not available"""
    required_packages = [
        'pandas', 'numpy', 'matplotlib', 'seaborn', 'scipy', 'lifelines'
    ]
    
    print("🔧 Installing survival analysis packages...")
    
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
from lifelines import KaplanMeierFitter
from lifelines.statistics import logrank_test
from lifelines.plotting import plot_lifetimes
import warnings
warnings.filterwarnings('ignore')

# Set style for medical-grade plots
plt.style.use('seaborn-v0_8')
sns.set_palette("Set1")

def create_survival_data():
    """Create realistic medical survival data"""
    np.random.seed(42)  # For reproducible results
    
    n_patients = 150
    
    # Generate patient data
    data = {
        'patient_id': range(1, n_patients + 1),
        'age': np.random.normal(65, 12, n_patients).clip(30, 90),
        'gender': np.random.choice(['Male', 'Female'], n_patients),
        'treatment': np.random.choice(['Standard', 'Experimental'], n_patients),
        'stage': np.random.choice(['I', 'II', 'III', 'IV'], n_patients, p=[0.2, 0.3, 0.3, 0.2]),
        'baseline_performance': np.random.choice(['Good', 'Poor'], n_patients, p=[0.7, 0.3])
    }
    
    # Generate survival times based on treatment and stage
    base_survival = 365  # Base survival of 1 year
    
    # Treatment effect
    treatment_multiplier = np.where(data['treatment'] == 'Experimental', 1.4, 1.0)
    
    # Stage effect
    stage_multipliers = {'I': 2.0, 'II': 1.5, 'III': 1.0, 'IV': 0.6}
    stage_multiplier = [stage_multipliers[stage] for stage in data['stage']]
    
    # Age effect (older patients have slightly worse outcomes)
    age_effect = 1.0 - (np.array(data['age']) - 50) * 0.01
    age_effect = np.clip(age_effect, 0.5, 1.5)
    
    # Performance status effect
    performance_multiplier = np.where(data['baseline_performance'] == 'Good', 1.3, 0.8)
    
    # Calculate survival times with Weibull distribution
    shape_param = 1.5  # Weibull shape parameter
    scale_param = base_survival * treatment_multiplier * stage_multiplier * age_effect * performance_multiplier
    
    survival_times = np.random.weibull(shape_param, n_patients) * scale_param
    
    # Generate censoring (some patients are still alive at end of study)
    study_duration = 1095  # 3 years
    observed = survival_times < study_duration
    
    # Apply censoring
    data['survival_time_days'] = np.minimum(survival_times, study_duration)
    data['event_occurred'] = observed.astype(int)  # 1 = death, 0 = censored
    
    return pd.DataFrame(data)

def run_survival_analysis():
    """Run comprehensive survival analysis"""
    
    print("🏥 MEDICAL SURVIVAL ANALYSIS - KAPLAN-MEIER")
    print("=" * 60)
    
    # Create or load data
    print("📊 Creating sample survival data...")
    df = create_survival_data()
    
    print(f"✅ Dataset created: {len(df)} patients")
    print(f"📋 Events observed: {df['event_occurred'].sum()}")
    print(f"📋 Censored patients: {(1 - df['event_occurred']).sum()}")
    print()
    
    # Create comprehensive survival analysis plots
    fig = plt.figure(figsize=(20, 16))
    
    # 1. OVERALL SURVIVAL CURVE
    print("1️⃣ OVERALL SURVIVAL ANALYSIS")
    print("-" * 30)
    
    kmf = KaplanMeierFitter()
    kmf.fit(df['survival_time_days'], df['event_occurred'], label='All Patients')
    
    plt.subplot(3, 3, 1)
    kmf.plot_survival_function()
    plt.title('📈 Overall Survival Curve', fontsize=14, fontweight='bold')
    plt.xlabel('Time (Days)')
    plt.ylabel('Survival Probability')
    plt.grid(True, alpha=0.3)
    
    # Print survival statistics
    median_survival = kmf.median_survival_time_
    survival_12m = kmf.survival_function_at_times(365).iloc[0] if len(kmf.survival_function_at_times(365)) > 0 else "N/A"
    survival_24m = kmf.survival_function_at_times(730).iloc[0] if len(kmf.survival_function_at_times(730)) > 0 else "N/A"
    
    print(f"📊 Median survival: {median_survival:.0f} days ({median_survival/30.4:.1f} months)")
    print(f"📊 12-month survival: {survival_12m:.3f} ({survival_12m*100:.1f}%)" if survival_12m != "N/A" else "📊 12-month survival: N/A")
    print(f"📊 24-month survival: {survival_24m:.3f} ({survival_24m*100:.1f}%)" if survival_24m != "N/A" else "📊 24-month survival: N/A")
    print()
    
    # 2. SURVIVAL BY TREATMENT GROUP
    print("2️⃣ SURVIVAL BY TREATMENT")
    print("-" * 30)
    
    plt.subplot(3, 3, 2)
    
    # Fit KM curves for each treatment
    treatments = df['treatment'].unique()
    colors = ['blue', 'red']
    
    survival_stats = {}
    
    for i, treatment in enumerate(treatments):
        treatment_data = df[df['treatment'] == treatment]
        kmf_treatment = KaplanMeierFitter()
        kmf_treatment.fit(treatment_data['survival_time_days'], 
                         treatment_data['event_occurred'], 
                         label=f'{treatment} (n={len(treatment_data)})')
        kmf_treatment.plot_survival_function(color=colors[i])
        
        # Store statistics
        median_surv = kmf_treatment.median_survival_time_
        survival_stats[treatment] = {
            'median': median_surv,
            'n_patients': len(treatment_data),
            'n_events': treatment_data['event_occurred'].sum()
        }
        
        print(f"💊 {treatment}:")
        print(f"   Patients: {len(treatment_data)}")
        print(f"   Events: {treatment_data['event_occurred'].sum()}")
        print(f"   Median survival: {median_surv:.0f} days ({median_surv/30.4:.1f} months)")
    
    plt.title('💊 Survival by Treatment', fontsize=14, fontweight='bold')
    plt.xlabel('Time (Days)')
    plt.ylabel('Survival Probability')
    plt.grid(True, alpha=0.3)
    plt.legend()
    
    # Log-rank test
    standard_data = df[df['treatment'] == 'Standard']
    experimental_data = df[df['treatment'] == 'Experimental']
    
    results = logrank_test(standard_data['survival_time_days'], 
                          experimental_data['survival_time_days'],
                          standard_data['event_occurred'], 
                          experimental_data['event_occurred'])
    
    print(f"🔬 Log-rank test p-value: {results.p_value:.4f}")
    print(f"🔬 Treatment difference: {'Significant' if results.p_value < 0.05 else 'Not significant'}")
    print()
    
    # 3. SURVIVAL BY DISEASE STAGE
    print("3️⃣ SURVIVAL BY DISEASE STAGE")
    print("-" * 30)
    
    plt.subplot(3, 3, 3)
    
    stages = sorted(df['stage'].unique())
    stage_colors = ['green', 'yellow', 'orange', 'red']
    
    for i, stage in enumerate(stages):
        stage_data = df[df['stage'] == stage]
        kmf_stage = KaplanMeierFitter()
        kmf_stage.fit(stage_data['survival_time_days'], 
                     stage_data['event_occurred'], 
                     label=f'Stage {stage} (n={len(stage_data)})')
        kmf_stage.plot_survival_function(color=stage_colors[i])
        
        median_surv = kmf_stage.median_survival_time_
        print(f"🎯 Stage {stage}: Median survival {median_surv:.0f} days ({median_surv/30.4:.1f} months)")
    
    plt.title('🎯 Survival by Disease Stage', fontsize=14, fontweight='bold')
    plt.xlabel('Time (Days)')
    plt.ylabel('Survival Probability')
    plt.grid(True, alpha=0.3)
    plt.legend()
    print()
    
    # 4. PATIENT CHARACTERISTICS TABLE
    plt.subplot(3, 3, 4)
    plt.axis('off')
    
    char_summary = []
    char_summary.append("👥 PATIENT CHARACTERISTICS")
    char_summary.append("=" * 30)
    char_summary.append(f"Total patients: {len(df)}")
    char_summary.append(f"Median age: {df['age'].median():.1f} years")
    char_summary.append("")
    char_summary.append("Gender distribution:")
    for gender in df['gender'].unique():
        count = (df['gender'] == gender).sum()
        pct = count / len(df) * 100
        char_summary.append(f"  {gender}: {count} ({pct:.1f}%)")
    
    char_summary.append("")
    char_summary.append("Treatment distribution:")
    for treatment in df['treatment'].unique():
        count = (df['treatment'] == treatment).sum()
        pct = count / len(df) * 100
        char_summary.append(f"  {treatment}: {count} ({pct:.1f}%)")
    
    char_summary.append("")
    char_summary.append("Stage distribution:")
    for stage in sorted(df['stage'].unique()):
        count = (df['stage'] == stage).sum()
        pct = count / len(df) * 100
        char_summary.append(f"  Stage {stage}: {count} ({pct:.1f}%)")
    
    plt.text(0.05, 0.95, '\n'.join(char_summary), transform=plt.gca().transAxes,
             fontsize=11, verticalalignment='top', fontfamily='monospace',
             bbox=dict(boxstyle='round', facecolor='lightgreen', alpha=0.8))
    
    # 5. AGE DISTRIBUTION
    plt.subplot(3, 3, 5)
    plt.hist(df['age'], bins=15, alpha=0.7, edgecolor='black', color='skyblue')
    plt.title('📊 Age Distribution', fontsize=14, fontweight='bold')
    plt.xlabel('Age (years)')
    plt.ylabel('Number of Patients')
    plt.grid(True, alpha=0.3)
    
    # 6. SURVIVAL TIME DISTRIBUTION
    plt.subplot(3, 3, 6)
    plt.hist(df['survival_time_days']/30.4, bins=20, alpha=0.7, edgecolor='black', color='lightcoral')
    plt.title('⏱️ Survival Time Distribution', fontsize=14, fontweight='bold')
    plt.xlabel('Survival Time (months)')
    plt.ylabel('Number of Patients')
    plt.grid(True, alpha=0.3)
    
    # 7. PERFORMANCE STATUS ANALYSIS
    plt.subplot(3, 3, 7)
    
    for performance in df['baseline_performance'].unique():
        perf_data = df[df['baseline_performance'] == performance]
        kmf_perf = KaplanMeierFitter()
        kmf_perf.fit(perf_data['survival_time_days'], 
                    perf_data['event_occurred'], 
                    label=f'{performance} Performance (n={len(perf_data)})')
        kmf_perf.plot_survival_function()
    
    plt.title('💪 Survival by Performance Status', fontsize=14, fontweight='bold')
    plt.xlabel('Time (Days)')
    plt.ylabel('Survival Probability')
    plt.grid(True, alpha=0.3)
    plt.legend()
    
    # 8. RISK TABLE
    plt.subplot(3, 3, 8)
    plt.axis('off')
    
    risk_summary = []
    risk_summary.append("⚠️ RISK FACTORS ANALYSIS")
    risk_summary.append("=" * 25)
    
    # Age effect
    old_patients = df[df['age'] > df['age'].median()]
    young_patients = df[df['age'] <= df['age'].median()]
    
    old_median = KaplanMeierFitter().fit(old_patients['survival_time_days'], 
                                        old_patients['event_occurred']).median_survival_time_
    young_median = KaplanMeierFitter().fit(young_patients['survival_time_days'], 
                                          young_patients['event_occurred']).median_survival_time_
    
    risk_summary.append("📈 Age Effect:")
    risk_summary.append(f"  Older (>{df['age'].median():.0f}y): {old_median:.0f} days")
    risk_summary.append(f"  Younger (≤{df['age'].median():.0f}y): {young_median:.0f} days")
    risk_summary.append("")
    
    # Treatment effect size
    exp_median = survival_stats['Experimental']['median']
    std_median = survival_stats['Standard']['median']
    improvement = ((exp_median - std_median) / std_median) * 100
    
    risk_summary.append("💊 Treatment Effect:")
    risk_summary.append(f"  Improvement: {improvement:.1f}%")
    risk_summary.append(f"  P-value: {results.p_value:.4f}")
    risk_summary.append("")
    
    risk_summary.append("🎯 Clinical Significance:")
    if results.p_value < 0.001:
        risk_summary.append("  *** Highly significant")
    elif results.p_value < 0.01:
        risk_summary.append("  ** Very significant")
    elif results.p_value < 0.05:
        risk_summary.append("  * Significant")
    else:
        risk_summary.append("  Not statistically significant")
    
    plt.text(0.05, 0.95, '\n'.join(risk_summary), transform=plt.gca().transAxes,
             fontsize=11, verticalalignment='top', fontfamily='monospace',
             bbox=dict(boxstyle='round', facecolor='lightyellow', alpha=0.8))
    
    # 9. MEDICAL RECOMMENDATIONS
    plt.subplot(3, 3, 9)
    plt.axis('off')
    
    recommendations = []
    recommendations.append("🩺 MEDICAL INTERPRETATION")
    recommendations.append("=" * 25)
    recommendations.append("")
    
    if results.p_value < 0.05:
        recommendations.append("✅ SIGNIFICANT FINDINGS:")
        recommendations.append("• Treatment shows benefit")
        recommendations.append("• Consider for clinical use")
        recommendations.append("• Monitor long-term effects")
    else:
        recommendations.append("❌ NON-SIGNIFICANT:")
        recommendations.append("• No treatment benefit shown")
        recommendations.append("• Consider larger trial")
        recommendations.append("• Review study design")
    
    recommendations.append("")
    recommendations.append("📋 NEXT STEPS:")
    recommendations.append("• Validate with larger cohort")
    recommendations.append("• Analyze quality of life")
    recommendations.append("• Cost-effectiveness study")
    recommendations.append("• Biomarker analysis")
    recommendations.append("")
    recommendations.append("⚠️ LIMITATIONS:")
    recommendations.append("• Simulated data")
    recommendations.append("• Single-center study")
    recommendations.append("• Short follow-up")
    
    plt.text(0.05, 0.95, '\n'.join(recommendations), transform=plt.gca().transAxes,
             fontsize=10, verticalalignment='top', fontfamily='monospace',
             bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.8))
    
    # Adjust layout and save
    plt.tight_layout()
    plt.suptitle('🏥 MEDICAL SURVIVAL ANALYSIS DASHBOARD', 
                 fontsize=16, fontweight='bold', y=0.98)
    
    # Save the plot
    plt.savefig('survival_analysis_results.png', dpi=300, bbox_inches='tight')
    print("💾 Results saved as 'survival_analysis_results.png'")
    
    # Show the plot
    plt.show()
    
    # FINAL SUMMARY
    print("\n" + "="*60)
    print("🎯 SURVIVAL ANALYSIS SUMMARY")
    print("="*60)
    print(f"📊 Total patients analyzed: {len(df)}")
    print(f"📊 Events observed: {df['event_occurred'].sum()} ({df['event_occurred'].mean()*100:.1f}%)")
    print(f"💊 Treatment effect p-value: {results.p_value:.4f}")
    print(f"📈 Experimental vs Standard: {improvement:+.1f}% survival benefit")
    print("✅ Kaplan-Meier curves generated successfully!")
    print("📊 Log-rank test completed")
    print("💾 High-resolution plots saved")
    print("\n🏥 Ready for clinical interpretation and presentation!")

if __name__ == "__main__":
    try:
        run_survival_analysis()
        input("\n👆 Press Enter to close...")
    except Exception as e:
        print(f"\n❌ Error occurred: {e}")
        print("🔧 Please check your environment and try again.")
        input("\n👆 Press Enter to close...")