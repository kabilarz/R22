import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import os

# Enhanced error handling for file reading
def load_clinical_data():
    """Load clinical trial data from available sources"""
    
    # List of possible file locations
    data_files = [
        'clinical_trial_hypertension.json',
        'demo_datasets/clinical_trial_hypertension.csv',
        'demo_datasets/clinical_trial_hypertension.json',
        'clinical_trial_hypertension.csv'
    ]
    
    for file_path in data_files:
        if os.path.exists(file_path):
            print(f"📂 Found data file: {file_path}")
            try:
                if file_path.endswith('.json'):
                    df = pd.read_json(file_path)
                elif file_path.endswith('.csv'):
                    df = pd.read_csv(file_path)
                
                print(f"✅ Dataset loaded: {len(df)} rows, {len(df.columns)} columns")
                print(f"📋 Columns: {list(df.columns)}")
                return df
                
            except Exception as e:
                print(f"⚠️ Error reading {file_path}: {e}")
                continue
    
    print("❌ Error: No clinical trial data found in any expected location.")
    print("Expected files:")
    for file_path in data_files:
        print(f"  - {file_path}")
    return None

# Load the data
print("🏥 CLINICAL TRIAL HYPERTENSION ANALYSIS")
print("=" * 50)

df = load_clinical_data()

if df is None:
    print("Cannot proceed without data. Please ensure the data file exists.")
    exit()

print("\n" + "="*50)
print("📊 DATA OVERVIEW")
print("="*50)
print(f"Dataset shape: {df.shape}")
print(f"Total patients: {len(df)}")

# Show first few rows
print("\n📋 Sample data:")
print(df.head())

# Data info
print("\n📊 Data types and missing values:")
print(df.info())

# Data Cleaning - Identify numeric columns dynamically
print("\n" + "="*50)
print("🔧 DATA CLEANING")
print("="*50)

# Get numeric columns
numeric_columns = df.select_dtypes(include=[np.number]).columns.tolist()
potential_numeric = []

# Check columns that might be numeric but stored as strings
for col in df.columns:
    if col not in numeric_columns:
        # Try to convert a sample to see if it's numeric
        sample_values = df[col].dropna().head(10)
        try:
            pd.to_numeric(sample_values)
            potential_numeric.append(col)
        except:
            pass

print(f"📊 Already numeric columns: {numeric_columns}")
print(f"🔄 Potentially numeric columns: {potential_numeric}")

# Convert potential numeric columns
for col in potential_numeric:
    try:
        df[col] = pd.to_numeric(df[col], errors='coerce')
        print(f"✅ Converted '{col}' to numeric")
    except Exception as e:
        print(f"⚠️ Warning: Could not convert column '{col}' to numeric: {e}")

# Update numeric columns list
numeric_columns = df.select_dtypes(include=[np.number]).columns.tolist()

# Identify categorical columns
categorical_columns = df.select_dtypes(include=['object']).columns.tolist()

print(f"\n📈 Final numeric columns ({len(numeric_columns)}): {numeric_columns}")
print(f"📊 Categorical columns ({len(categorical_columns)}): {categorical_columns}")

# Frequency Analysis for Categorical Variables
print("\n" + "="*50)
print("📊 FREQUENCY ANALYSIS")
print("="*50)

for col in categorical_columns:
    if df[col].nunique() < 20:  # Only show if not too many categories
        print(f"\n🔍 Frequency Distribution for '{col}':")
        freq_dist = df[col].value_counts()
        print(freq_dist)
        
        # Show percentages
        print("\nPercentages:")
        print((freq_dist / len(df) * 100).round(2))
        print("-" * 30)

# Basic Statistical Summary
print("\n" + "="*50)
print("📈 DESCRIPTIVE STATISTICS")
print("="*50)

if len(numeric_columns) > 0:
    print("\n📊 Summary statistics for numeric variables:")
    print(df[numeric_columns].describe().round(2))
else:
    print("⚠️ No numeric columns found for statistical summary")

# Treatment Group Analysis (if exists)
print("\n" + "="*50)
print("💊 TREATMENT GROUP ANALYSIS")
print("="*50)

treatment_cols = [col for col in df.columns if 'treatment' in col.lower()]
if treatment_cols:
    treatment_col = treatment_cols[0]
    print(f"📋 Treatment groups in '{treatment_col}':")
    treatment_counts = df[treatment_col].value_counts()
    print(treatment_counts)
    
    # Analyze primary outcome by treatment group if available
    outcome_cols = [col for col in df.columns if 'outcome' in col.lower() or 'primary' in col.lower()]
    if outcome_cols:
        outcome_col = outcome_cols[0]
        print(f"\n🎯 Primary outcomes by treatment group:")
        outcome_table = pd.crosstab(df[treatment_col], df[outcome_col], margins=True)
        print(outcome_table)
        
        # Calculate success rates
        print(f"\n📊 Success rates by treatment group:")
        success_rates = df.groupby(treatment_col)[outcome_col].apply(
            lambda x: (x == 'Improved').sum() / len(x) * 100 if 'Improved' in x.values else 'N/A'
        )
        print(success_rates)

# Blood Pressure Analysis (if available)
print("\n" + "="*50)
print("🩸 BLOOD PRESSURE ANALYSIS")
print("="*50)

bp_cols = [col for col in df.columns if 'bp' in col.lower() or 'blood' in col.lower() or 'systolic' in col.lower() or 'diastolic' in col.lower()]
if bp_cols:
    print(f"📊 Blood pressure columns found: {bp_cols}")
    
    # Baseline vs Final comparison
    baseline_systolic = [col for col in bp_cols if 'baseline' in col.lower() and 'systolic' in col.lower()]
    final_systolic = [col for col in bp_cols if ('week_12' in col.lower() or 'final' in col.lower()) and 'systolic' in col.lower()]
    
    if baseline_systolic and final_systolic:
        baseline_col = baseline_systolic[0]
        final_col = final_systolic[0]
        
        print(f"\n📊 Blood pressure changes:")
        print(f"Baseline {baseline_col}: {df[baseline_col].mean():.1f} ± {df[baseline_col].std():.1f} mmHg")
        print(f"Final {final_col}: {df[final_col].mean():.1f} ± {df[final_col].std():.1f} mmHg")
        
        # Calculate change
        bp_change = df[final_col] - df[baseline_col]
        print(f"Average change: {bp_change.mean():.1f} ± {bp_change.std():.1f} mmHg")

# Adverse Events Analysis
print("\n" + "="*50)
print("⚠️ ADVERSE EVENTS ANALYSIS")
print("="*50)

adverse_cols = [col for col in df.columns if 'adverse' in col.lower() or 'side' in col.lower()]
if adverse_cols:
    adverse_col = adverse_cols[0]
    print(f"📊 Adverse events distribution:")
    adverse_counts = df[adverse_col].value_counts()
    print(adverse_counts)
    
    # Calculate percentage
    print(f"\nPercentages:")
    print((adverse_counts / len(df) * 100).round(2))

# Create Visualizations
print("\n" + "="*50)
print("📈 CREATING VISUALIZATIONS")
print("="*50)

try:
    # Set up the plotting style
    plt.style.use('default')
    sns.set_palette("Set2")
    
    # Create figure with subplots
    fig, axes = plt.subplots(2, 2, figsize=(15, 12))
    fig.suptitle('Clinical Trial Analysis - Hypertension Treatment', fontsize=16, fontweight='bold')
    
    # Plot 1: Treatment group distribution
    if treatment_cols and outcome_cols:
        treatment_col = treatment_cols[0]
        outcome_col = outcome_cols[0]
        
        sns.countplot(data=df, x=treatment_col, hue=outcome_col, ax=axes[0,0])
        axes[0,0].set_title('Treatment Outcomes by Group')
        axes[0,0].tick_params(axis='x', rotation=45)
    
    # Plot 2: Age distribution
    if 'age' in df.columns:
        df['age'].hist(bins=15, ax=axes[0,1], alpha=0.7, color='skyblue')
        axes[0,1].set_title('Age Distribution')
        axes[0,1].set_xlabel('Age (years)')
        axes[0,1].set_ylabel('Frequency')
    
    # Plot 3: Blood pressure changes (if available)
    if baseline_systolic and final_systolic:
        baseline_col = baseline_systolic[0]
        final_col = final_systolic[0]
        
        bp_data = pd.DataFrame({
            'Baseline': df[baseline_col],
            'Final': df[final_col]
        })
        bp_data.plot(kind='box', ax=axes[1,0])
        axes[1,0].set_title('Blood Pressure: Baseline vs Final')
        axes[1,0].set_ylabel('Systolic BP (mmHg)')
    
    # Plot 4: Adverse events
    if adverse_cols:
        adverse_col = adverse_cols[0]
        adverse_counts = df[adverse_col].value_counts()
        
        # Create pie chart
        axes[1,1].pie(adverse_counts.values, labels=adverse_counts.index, autopct='%1.1f%%')
        axes[1,1].set_title('Adverse Events Distribution')
    
    plt.tight_layout()
    plt.show()
    print("✅ Visualizations created successfully!")
    
except Exception as e:
    print(f"⚠️ Error creating visualizations: {e}")

# Medical Insights Summary
print("\n" + "="*50)
print("🏥 MEDICAL INSIGHTS SUMMARY")
print("="*50)

print("\n🔍 Key Findings:")

# Treatment effectiveness
if treatment_cols and outcome_cols:
    treatment_col = treatment_cols[0]
    outcome_col = outcome_cols[0]
    
    improvement_rates = df.groupby(treatment_col)[outcome_col].apply(
        lambda x: (x == 'Improved').sum() / len(x) * 100 if 'Improved' in x.values else 0
    )
    print(f"\n💊 Treatment Success Rates:")
    for group, rate in improvement_rates.items():
        print(f"  - {group}: {rate:.1f}%")

# Safety profile
if adverse_cols:
    adverse_col = adverse_cols[0]
    total_adverse = (df[adverse_col] != 'None').sum()
    adverse_rate = (total_adverse / len(df)) * 100
    print(f"\n⚠️ Safety Profile:")
    print(f"  - Patients with adverse events: {total_adverse}/{len(df)} ({adverse_rate:.1f}%)")
    print(f"  - Most common adverse event: {df[adverse_col].value_counts().index[1] if len(df[adverse_col].value_counts()) > 1 else 'None'}")

# Study completion
completion_cols = [col for col in df.columns if 'completion' in col.lower()]
if completion_cols:
    completion_col = completion_cols[0]
    completion_rate = (df[completion_col] == 'Yes').sum() / len(df) * 100
    print(f"\n📋 Study Completion:")
    print(f"  - Completion rate: {completion_rate:.1f}%")

print(f"\n📊 Overall Study Summary:")
print(f"  - Total participants: {len(df)}")
print(f"  - Study duration: 12 weeks")
print(f"  - Variables measured: {len(df.columns)}")

print("\n🎯 Recommendations for Further Analysis:")
print("  1. Statistical significance testing (t-tests, chi-square)")
print("  2. Survival analysis for time-to-event outcomes")
print("  3. Regression analysis for confounding factors")
print("  4. Subgroup analysis by demographics")
print("  5. Dose-response relationship analysis")

print("\n✅ Analysis Complete!")
print("=" * 50)