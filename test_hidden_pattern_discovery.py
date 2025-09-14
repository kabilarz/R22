"""
Test script for the Hidden Pattern Discovery Engine
"""

import sys
import os
import pandas as pd
import numpy as np
from backend.hidden_pattern_discovery import HiddenPatternDiscoveryEngine
from backend.data_store import init_store, save_dataset_with_activation

def create_test_dataset():
    """Create a test dataset with known patterns"""
    # Create a dataset with some clear patterns
    np.random.seed(42)
    
    n_samples = 1000
    
    # Create correlated variables
    x = np.random.normal(0, 1, n_samples)
    y = 2 * x + np.random.normal(0, 0.5, n_samples)  # Strong positive correlation
    z = -1.5 * x + np.random.normal(0, 0.3, n_samples)  # Strong negative correlation
    
    # Create some anomalies
    anomalies = np.random.choice(n_samples, 20, replace=False)
    y[anomalies] += np.random.normal(0, 5, 20)  # Add large deviations
    
    # Create dataset
    data = {
        'patient_id': range(1, n_samples + 1),
        'age': np.random.randint(18, 80, n_samples),
        'blood_pressure': 120 + 10 * x + np.random.normal(0, 5, n_samples),
        'cholesterol': 200 + 15 * y + np.random.normal(0, 10, n_samples),
        'glucose': 90 + 8 * z + np.random.normal(0, 7, n_samples),
        'treatment_response': y + np.random.normal(0, 0.2, n_samples),
        'bmi': 25 + 3 * np.random.normal(0, 1, n_samples)
    }
    
    df = pd.DataFrame(data)
    return df

def test_hidden_pattern_discovery():
    """Test the Hidden Pattern Discovery Engine"""
    print("🧪 Testing Hidden Pattern Discovery Engine...")
    
    # Initialize the database
    print("🔧 Initializing database...")
    init_store()
    
    # Create and save test dataset
    print("📊 Creating test dataset...")
    df = create_test_dataset()
    dataset_id = save_dataset_with_activation(df, "test_medical_data.csv")
    print(f"✅ Dataset saved with ID: {dataset_id}")
    
    # Initialize the discovery engine
    print("🚀 Initializing discovery engine...")
    discovery_engine = HiddenPatternDiscoveryEngine()
    
    # Run complete discovery
    print("🔍 Running complete discovery...")
    parameters = {
        "discovery_depth": "comprehensive",
        "focus_areas": ["anomalies", "correlations", "subgroups"],
        "medical_context": "cardiovascular research"
    }
    
    try:
        session_id = discovery_engine.run_complete_discovery(dataset_id, parameters)
        print(f"✅ Discovery completed with session ID: {session_id}")
        
        # Get session info
        session_info = discovery_engine.get_session_info(session_id)
        print(f"📋 Session info: {session_info}")
        
        # Get results
        patterns = discovery_engine.get_discovered_patterns(session_id)
        anomalies = discovery_engine.get_detected_anomalies(session_id)
        correlations = discovery_engine.get_hidden_correlations(session_id)
        
        print(f"📈 Patterns found: {len(patterns)}")
        print(f"⚠️  Anomalies detected: {len(anomalies)}")
        print(f"🔗 Correlations discovered: {len(correlations)}")
        
        # Display top correlations
        if correlations:
            print("\n🔗 Top correlations:")
            sorted_correlations = sorted(correlations, key=lambda x: abs(x['strength']), reverse=True)
            for corr in sorted_correlations[:5]:
                print(f"  - {corr['variable_a']} ↔ {corr['variable_b']}: {corr['strength']:.4f} (p={corr['p_value']:.4f})")
        
        # Display top patterns
        if patterns:
            print("\n🔍 Top patterns:")
            sorted_patterns = sorted(patterns, key=lambda x: x['strength'], reverse=True)
            for pattern in sorted_patterns[:5]:
                print(f"  - {pattern['type']}: {pattern['description']}")
        
        # Display anomalies
        if anomalies:
            print(f"\n⚠️  Detected anomalies: {len(anomalies)}")
            print("  Showing first 5 anomalies:")
            for anomaly in anomalies[:5]:
                print(f"    - Data point {anomaly['data_point_id']}: score {anomaly['deviation_score']:.4f}")
        
        print("\n✅ Hidden Pattern Discovery Engine test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error during discovery: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_hidden_pattern_discovery()
    sys.exit(0 if success else 1)