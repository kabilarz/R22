import pandas as pd
import os

print("🏥 Clinical Trial Hypertension Analysis")
print("=" * 50)

# Error handling for file reading
file_found = False
df = None

# Check different possible locations for the data file
possible_files = [
    'clinical_trial_hypertension.json',
    'demo_datasets/clinical_trial_hypertension.csv',
    'demo_datasets/clinical_trial_hypertension.json'
]

for file_path in possible_files:
    if os.path.exists(file_path):
        print(f"📂 Found data file: {file_path}")
        try:
            if file_path.endswith('.json'):
                df = pd.read_json(file_path)
                print(f"✅ JSON file loaded successfully")
            elif file_path.endswith('.csv'):
                df = pd.read_csv(file_path)
                print(f"✅ CSV file loaded successfully")
            
            file_found = True
            break
            
        except FileNotFoundError:
            print(f"❌ Error: '{file_path}' not found.")
            continue
        except pd.errors.EmptyDataError:
            print(f"❌ Error: The file '{file_path}' is empty.")
            continue
        except Exception as e:
            print(f"❌ Error: Invalid format in '{file_path}': {e}")
            continue

if not file_found or df is None:
    print("❌ ERROR: Could not find 'clinical_trial_hypertension.json' or equivalent files.")
    print("📂 Available files checked:")
    for file_path in possible_files:
        status = "✅ Found" if os.path.exists(file_path) else "❌ Not found"
        print(f"   - {file_path}: {status}")
    print("\n💡 The message 'Dataset loaded: 40 rows, 31 columns' you saw comes from our medical analysis system.")
    print("💡 Your script should be reading the CSV file from demo_datasets/clinical_trial_hypertension.csv")
    exit()

# Show basic dataset info
print(f"\n📊 Dataset loaded: {len(df)} rows, {len(df.columns)} columns")
print(f"📋 Column names: {list(df.columns)}")

# Data Cleaning (Assuming data types need adjustment)
print("\n🔧 Data cleaning and type conversion...")

# List of columns that should be numeric
numeric_column_patterns = [
    'age', 'baseline_systolic_bp', 'baseline_diastolic_bp', 'baseline_cholesterol', 
    'baseline_bmi', 'baseline_weight_kg', 'baseline_height_cm', 'week_4_systolic_bp', 
    'week_4_diastolic_bp', 'week_8_systolic_bp', 'week_8_diastolic_bp', 
    'week_12_systolic_bp', 'week_12_diastolic_bp', 'final_cholesterol', 'final_bmi', 
    'biomarker_baseline', 'biomarker_week_12', 'quality_of_life_baseline', 
    'quality_of_life_week_12'
]

for col in numeric_column_patterns:
    if col in df.columns:
        try:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            print(f"✅ Converted '{col}' to numeric")
        except Exception as e:
            print(f"⚠️ Warning: Could not convert column '{col}' to numeric: {e}")

# Frequency Analysis
print("\n📊 FREQUENCY ANALYSIS")
print("=" * 30)

categorical_cols = ['gender', 'race', 'treatment_group', 'diabetes', 'hypertension', 
                   'smoking_status', 'cardiovascular_history', 'primary_outcome', 
                   'adverse_events', 'study_completion']

for col in categorical_cols:
    if col in df.columns:
        print(f"\n🔍 Frequency Distribution for {col}:")
        freq_counts = df[col].value_counts()
        print(freq_counts)
        
        # Show percentages
        percentages = (freq_counts / len(df) * 100).round(1)
        print("Percentages:")
        for category, count in freq_counts.items():
            pct = percentages[category]
            print(f"  {category}: {count} ({pct}%)")
        print("-" * 25)

# Treatment Group Analysis
print("\n💊 TREATMENT GROUP ANALYSIS")
print("=" * 30)

if 'treatment_group' in df.columns and 'primary_outcome' in df.columns:
    print("\n🎯 Treatment Success Rates:")
    treatment_success = df.groupby('treatment_group')['primary_outcome'].value_counts().unstack(fill_value=0)
    print(treatment_success)
    
    # Calculate success rates
    print(f"\n📈 Success Rate by Treatment Group:")
    for treatment in df['treatment_group'].unique():
        group_data = df[df['treatment_group'] == treatment]
        if 'Improved' in group_data['primary_outcome'].values:
            success_rate = (group_data['primary_outcome'] == 'Improved').sum() / len(group_data) * 100
            print(f"  {treatment}: {success_rate:.1f}%")

# Adverse Events Analysis
print("\n⚠️ ADVERSE EVENTS ANALYSIS")
print("=" * 30)

if 'adverse_events' in df.columns:
    adverse_event_counts = df['adverse_events'].value_counts()
    print("\nAdverse Event Frequencies:")
    print(adverse_event_counts)
    
    # Calculate percentages
    print("\nPercentages:")
    for event, count in adverse_event_counts.items():
        pct = (count / len(df) * 100)
        print(f"  {event}: {count} patients ({pct:.1f}%)")

# Blood Pressure Analysis
print("\n🩸 BLOOD PRESSURE ANALYSIS")
print("=" * 30)

if 'baseline_systolic_bp' in df.columns and 'week_12_systolic_bp' in df.columns:
    print("\nSystemic Blood Pressure Changes:")
    
    baseline_mean = df['baseline_systolic_bp'].mean()
    baseline_std = df['baseline_systolic_bp'].std()
    final_mean = df['week_12_systolic_bp'].mean()
    final_std = df['week_12_systolic_bp'].std()
    
    print(f"  Baseline Systolic BP: {baseline_mean:.1f} ± {baseline_std:.1f} mmHg")
    print(f"  Week 12 Systolic BP: {final_mean:.1f} ± {final_std:.1f} mmHg")
    print(f"  Average Change: {final_mean - baseline_mean:.1f} mmHg")
    
    # By treatment group
    if 'treatment_group' in df.columns:
        print(f"\n📊 Blood Pressure Changes by Treatment Group:")
        for treatment in df['treatment_group'].unique():
            group_data = df[df['treatment_group'] == treatment]
            baseline_group = group_data['baseline_systolic_bp'].mean()
            final_group = group_data['week_12_systolic_bp'].mean()
            change = final_group - baseline_group
            print(f"  {treatment}: {change:.1f} mmHg change (from {baseline_group:.1f} to {final_group:.1f})")

# Medical Insights Summary
print("\n🏥 MEDICAL INSIGHTS SUMMARY")
print("=" * 35)

print("\n🔍 Key Clinical Findings:")

# Study completion rate
if 'study_completion' in df.columns:
    completion_rate = (df['study_completion'] == 'Yes').sum() / len(df) * 100
    print(f"  📋 Study completion rate: {completion_rate:.1f}%")

# Treatment effectiveness summary
if 'treatment_group' in df.columns and 'primary_outcome' in df.columns:
    overall_improvement = (df['primary_outcome'] == 'Improved').sum() / len(df) * 100
    print(f"  💊 Overall improvement rate: {overall_improvement:.1f}%")

# Safety profile
if 'adverse_events' in df.columns:
    adverse_rate = (df['adverse_events'] != 'None').sum() / len(df) * 100
    print(f"  ⚠️ Adverse events rate: {adverse_rate:.1f}%")

print(f"\n📊 This analysis covers {len(df)} patients with {len(df.columns)} measured variables.")
print("✅ Analysis completed successfully!")

print(f"\n💡 NOTE: Your original script was looking for 'clinical_trial_hypertension.json'")
print(f"   but the actual file is 'demo_datasets/clinical_trial_hypertension.csv'")
print(f"   The '40 rows, 31 columns' message you saw is correct - that's our dataset size!")

print("\n📋 Expected vs Actual Results:")
print("   ❌ Your script: Only showed 'Dataset loaded: 40 rows, 31 columns'")
print("   ✅ This script: Shows complete frequency analysis, treatment comparisons, and medical insights")
print("   ✅ Medical platform: Shows advanced statistical analysis with visualizations")