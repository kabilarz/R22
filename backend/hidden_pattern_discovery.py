"""
Hidden Pattern Discovery Engine - Revolutionary feature that reveals statistical insights 
and relationships that would typically be overlooked by average researchers.
"""

import sys
import os

import uuid
import json
import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
from data_store import get_connection, query_dataset
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import DBSCAN
from scipy.stats import pearsonr, spearmanr
from scipy.spatial.distance import pdist, squareform
import warnings
warnings.filterwarnings('ignore')

class DiscoverySession:
    """Represents a discovery session for pattern detection"""
    
    def __init__(self, dataset_id: str, parameters: Dict[str, Any]):
        self.session_id = str(uuid.uuid4())
        self.dataset_id = dataset_id
        self.parameters = parameters
        self.status = "pending"
        self.started_at = datetime.now()
        self.completed_at = None
        self.patterns_found = 0

class DiscoveredPattern:
    """Represents a discovered pattern"""
    
    def __init__(self, session_id: str, pattern_type: str, variables: List[str], 
                 strength: float, significance: float, description: str):
        self.pattern_id = str(uuid.uuid4())
        self.session_id = session_id
        self.type = pattern_type
        self.variables = variables
        self.strength = strength
        self.significance = significance
        self.description = description
        self.discovered_at = datetime.now()

class DetectedAnomaly:
    """Represents a detected anomaly"""
    
    def __init__(self, session_id: str, data_point_id: str, variables: List[str], 
                 deviation_score: float, medical_significance: str):
        self.anomaly_id = str(uuid.uuid4())
        self.session_id = session_id
        self.data_point_id = data_point_id
        self.variables = variables
        self.deviation_score = deviation_score
        self.medical_significance = medical_significance
        self.detected_at = datetime.now()

class HiddenCorrelation:
    """Represents a hidden correlation"""
    
    def __init__(self, session_id: str, variable_a: str, variable_b: str, 
                 correlation_type: str, strength: float, p_value: float, explanation: str):
        self.correlation_id = str(uuid.uuid4())
        self.session_id = session_id
        self.variable_a = variable_a
        self.variable_b = variable_b
        self.correlation_type = correlation_type
        self.strength = strength
        self.p_value = p_value
        self.explanation = explanation
        self.discovered_at = datetime.now()

class HiddenPatternDiscoveryEngine:
    """Main engine for discovering hidden patterns in medical datasets"""
    
    def __init__(self):
        self.contamination_rate = 0.1  # Default contamination rate for anomaly detection
        self.random_state = 42  # For reproducible results
        
    def start_discovery_session(self, dataset_id: str, parameters: Dict[str, Any]) -> str:
        """Start a new discovery session and return session_id"""
        session = DiscoverySession(dataset_id, parameters)
        
        conn = get_connection()
        try:
            conn.execute("""
                INSERT INTO discovery_sessions 
                (session_id, dataset_id, parameters, status, started_at)
                VALUES (?, ?, ?, ?, ?)
            """, [
                session.session_id,
                session.dataset_id,
                json.dumps(session.parameters),
                session.status,
                session.started_at
            ])
            return session.session_id
        finally:
            conn.close()
    
    def update_session_status(self, session_id: str, status: str, patterns_found: int = 0):
        """Update the status of a discovery session"""
        conn = get_connection()
        try:
            conn.execute("""
                UPDATE discovery_sessions 
                SET status = ?, completed_at = ?, patterns_found = ?
                WHERE session_id = ?
            """, [
                status,
                datetime.now() if status == 'completed' else None,
                patterns_found,
                session_id
            ])
        finally:
            conn.close()
    
    def get_session_info(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get information about a discovery session"""
        conn = get_connection()
        try:
            result = conn.execute("""
                SELECT session_id, dataset_id, parameters, status, started_at, completed_at, patterns_found
                FROM discovery_sessions
                WHERE session_id = ?
            """, [session_id]).fetchone()
            
            if result:
                return {
                    'session_id': result[0],
                    'dataset_id': result[1],
                    'parameters': json.loads(result[2]) if result[2] else {},
                    'status': result[3],
                    'started_at': result[4],
                    'completed_at': result[5],
                    'patterns_found': result[6]
                }
            return None
        finally:
            conn.close()
    
    def save_discovered_pattern(self, pattern: DiscoveredPattern):
        """Save a discovered pattern to the database"""
        conn = get_connection()
        try:
            conn.execute("""
                INSERT INTO discovered_patterns 
                (pattern_id, session_id, type, variables, strength, significance, description, discovered_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, [
                pattern.pattern_id,
                pattern.session_id,
                pattern.type,
                json.dumps(pattern.variables),
                pattern.strength,
                pattern.significance,
                pattern.description,
                pattern.discovered_at
            ])
        finally:
            conn.close()
    
    def save_detected_anomaly(self, anomaly: DetectedAnomaly):
        """Save a detected anomaly to the database"""
        conn = get_connection()
        try:
            conn.execute("""
                INSERT INTO detected_anomalies 
                (anomaly_id, session_id, data_point_id, variables, deviation_score, medical_significance, detected_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, [
                anomaly.anomaly_id,
                anomaly.session_id,
                anomaly.data_point_id,
                json.dumps(anomaly.variables),
                anomaly.deviation_score,
                anomaly.medical_significance,
                anomaly.detected_at
            ])
        finally:
            conn.close()
    
    def save_hidden_correlation(self, correlation: HiddenCorrelation):
        """Save a hidden correlation to the database"""
        conn = get_connection()
        try:
            conn.execute("""
                INSERT INTO hidden_correlations 
                (correlation_id, session_id, variable_a, variable_b, correlation_type, strength, p_value, explanation, discovered_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, [
                correlation.correlation_id,
                correlation.session_id,
                correlation.variable_a,
                correlation.variable_b,
                correlation.correlation_type,
                correlation.strength,
                correlation.p_value,
                correlation.explanation,
                correlation.discovered_at
            ])
        finally:
            conn.close()
    
    def get_discovered_patterns(self, session_id: str) -> List[Dict[str, Any]]:
        """Get all discovered patterns for a session"""
        conn = get_connection()
        try:
            result = conn.execute("""
                SELECT pattern_id, session_id, type, variables, strength, significance, description, discovered_at
                FROM discovered_patterns
                WHERE session_id = ?
                ORDER BY strength DESC
            """, [session_id]).fetchall()
            
            return [
                {
                    'pattern_id': row[0],
                    'session_id': row[1],
                    'type': row[2],
                    'variables': json.loads(row[3]) if row[3] else [],
                    'strength': float(row[4]) if row[4] else 0.0,
                    'significance': float(row[5]) if row[5] else 0.0,
                    'description': row[6],
                    'discovered_at': row[7]
                }
                for row in result
            ]
        finally:
            conn.close()
    
    def get_detected_anomalies(self, session_id: str) -> List[Dict[str, Any]]:
        """Get all detected anomalies for a session"""
        conn = get_connection()
        try:
            result = conn.execute("""
                SELECT anomaly_id, session_id, data_point_id, variables, deviation_score, medical_significance, detected_at
                FROM detected_anomalies
                WHERE session_id = ?
                ORDER BY deviation_score DESC
            """, [session_id]).fetchall()
            
            return [
                {
                    'anomaly_id': row[0],
                    'session_id': row[1],
                    'data_point_id': row[2],
                    'variables': json.loads(row[3]) if row[3] else [],
                    'deviation_score': float(row[4]) if row[4] else 0.0,
                    'medical_significance': row[5],
                    'detected_at': row[6]
                }
                for row in result
            ]
        finally:
            conn.close()
    
    def get_hidden_correlations(self, session_id: str) -> List[Dict[str, Any]]:
        """Get all hidden correlations for a session"""
        conn = get_connection()
        try:
            result = conn.execute("""
                SELECT correlation_id, session_id, variable_a, variable_b, correlation_type, strength, p_value, explanation, discovered_at
                FROM hidden_correlations
                WHERE session_id = ?
                ORDER BY ABS(strength) DESC
            """, [session_id]).fetchall()
            
            return [
                {
                    'correlation_id': row[0],
                    'session_id': row[1],
                    'variable_a': row[2],
                    'variable_b': row[3],
                    'correlation_type': row[4],
                    'strength': float(row[5]) if row[5] else 0.0,
                    'p_value': float(row[6]) if row[6] else 1.0,
                    'explanation': row[7],
                    'discovered_at': row[8]
                }
                for row in result
            ]
        finally:
            conn.close()
    
    def run_anomaly_detection(self, session_id: str, dataset_id: str) -> List[DetectedAnomaly]:
        """Run anomaly detection using Isolation Forest"""
        # Load dataset
        df = query_dataset(dataset_id, f"SELECT * FROM v_{dataset_id.replace('-', '_')}")
        
        # Select only numeric columns for anomaly detection
        numeric_df = df.select_dtypes(include=[np.number])
        
        if numeric_df.empty:
            return []
        
        # Standardize the data
        scaler = StandardScaler()
        scaled_data = scaler.fit_transform(numeric_df)
        
        # Apply Isolation Forest
        iso_forest = IsolationForest(
            contamination=self.contamination_rate,
            random_state=self.random_state
        )
        anomaly_labels = iso_forest.fit_predict(scaled_data)
        anomaly_scores = iso_forest.decision_function(scaled_data)
        
        # Identify anomalies (labeled as -1)
        anomaly_indices = np.where(anomaly_labels == -1)[0]
        
        anomalies = []
        for idx in anomaly_indices:
            # Calculate deviation score (convert to 0-1 scale)
            deviation_score = (anomaly_scores[idx] - anomaly_scores.min()) / (anomaly_scores.max() - anomaly_scores.min())
            
            # Create anomaly object
            anomaly = DetectedAnomaly(
                session_id=session_id,
                data_point_id=str(idx),
                variables=numeric_df.columns.tolist(),
                deviation_score=float(deviation_score),
                medical_significance=f"Potential outlier with anomaly score {anomaly_scores[idx]:.4f}"
            )
            
            anomalies.append(anomaly)
            self.save_detected_anomaly(anomaly)
        
        return anomalies
    
    def run_correlation_discovery(self, session_id: str, dataset_id: str) -> List[HiddenCorrelation]:
        """Discover hidden correlations between variables"""
        # Load dataset
        df = query_dataset(dataset_id, f"SELECT * FROM v_{dataset_id.replace('-', '_')}")
        
        # Select only numeric columns for correlation analysis
        numeric_df = df.select_dtypes(include=[np.number])
        
        if numeric_df.empty or numeric_df.shape[1] < 2:
            return []
        
        correlations = []
        
        # Calculate Pearson correlations
        for i, col1 in enumerate(numeric_df.columns):
            for col2 in numeric_df.columns[i+1:]:
                try:
                    # Pearson correlation
                    pearson_corr, pearson_p = pearsonr(numeric_df[col1], numeric_df[col2])
                    
                    if abs(pearson_corr) > 0.5:  # Only save moderately strong correlations
                        correlation = HiddenCorrelation(
                            session_id=session_id,
                            variable_a=col1,
                            variable_b=col2,
                            correlation_type="pearson",
                            strength=float(pearson_corr),
                            p_value=float(pearson_p),
                            explanation=f"Pearson correlation coefficient of {pearson_corr:.4f}"
                        )
                        correlations.append(correlation)
                        self.save_hidden_correlation(correlation)
                    
                    # Spearman correlation (for non-linear relationships)
                    spearman_corr, spearman_p = spearmanr(numeric_df[col1], numeric_df[col2])
                    
                    if abs(spearman_corr) > 0.5 and abs(spearman_corr) > abs(pearson_corr):
                        correlation = HiddenCorrelation(
                            session_id=session_id,
                            variable_a=col1,
                            variable_b=col2,
                            correlation_type="spearman",
                            strength=float(spearman_corr),
                            p_value=float(spearman_p),
                            explanation=f"Spearman correlation coefficient of {spearman_corr:.4f} (non-linear relationship)"
                        )
                        correlations.append(correlation)
                        self.save_hidden_correlation(correlation)
                        
                except Exception as e:
                    # Skip pairs that cause errors (e.g., constant values)
                    continue
        
        return correlations
    
    def run_statistical_serendipity(self, session_id: str, dataset_id: str) -> List[DiscoveredPattern]:
        """Run statistical serendipity engine to find unexpected patterns"""
        # Load dataset
        df = query_dataset(dataset_id, f"SELECT * FROM v_{dataset_id.replace('-', '_')}")
        
        # Select only numeric columns for clustering
        numeric_df = df.select_dtypes(include=[np.number])
        
        if numeric_df.empty:
            return []
        
        patterns = []
        
        # Apply DBSCAN clustering to find natural groupings
        scaler = StandardScaler()
        scaled_data = scaler.fit_transform(numeric_df)
        
        # Try different epsilon values to find interesting clusters
        eps_values = [0.3, 0.5, 0.7]
        min_samples = max(3, len(numeric_df) // 20)  # At least 3, or 5% of data size
        
        for eps in eps_values:
            try:
                dbscan = DBSCAN(eps=eps, min_samples=min_samples)
                cluster_labels = dbscan.fit_predict(scaled_data)
                
                # Count unique clusters (excluding noise points labeled as -1)
                unique_clusters = np.unique(cluster_labels)
                unique_clusters = unique_clusters[unique_clusters != -1]
                
                if len(unique_clusters) > 1:
                    # Found interesting clustering pattern
                    pattern = DiscoveredPattern(
                        session_id=session_id,
                        pattern_type="clustering",
                        variables=numeric_df.columns.tolist(),
                        strength=float(len(unique_clusters) / len(unique_clusters + 1)),  # Simple strength metric
                        significance=0.7,  # Placeholder significance
                        description=f"Found {len(unique_clusters)} distinct clusters with DBSCAN (eps={eps}, min_samples={min_samples})"
                    )
                    patterns.append(pattern)
                    self.save_discovered_pattern(pattern)
                    break  # Stop after finding first interesting clustering
                    
            except Exception as e:
                # Continue with next epsilon value if current one fails
                continue
        
        return patterns
    
    def run_counterintuitive_insight_generation(self, session_id: str, dataset_id: str) -> List[DiscoveredPattern]:
        """Generate counterintuitive insights from discovered patterns"""
        # Get previously discovered correlations
        correlations = self.get_hidden_correlations(session_id)
        
        patterns = []
        
        # Look for counterintuitive correlations (strong negative correlations)
        for corr in correlations:
            if corr['strength'] < -0.7:  # Strong negative correlation
                pattern = DiscoveredPattern(
                    session_id=session_id,
                    pattern_type="counterintuitive_correlation",
                    variables=[corr['variable_a'], corr['variable_b']],
                    strength=abs(float(corr['strength'])),
                    significance=float(corr['p_value']),
                    description=f"Counterintuitive strong negative correlation ({corr['strength']:.4f}) between {corr['variable_a']} and {corr['variable_b']}"
                )
                patterns.append(pattern)
                self.save_discovered_pattern(pattern)
        
        return patterns
    
    def run_complete_discovery(self, dataset_id: str, parameters: Dict[str, Any]) -> str:
        """Run complete discovery process and return session_id"""
        # Start discovery session
        session_id = self.start_discovery_session(dataset_id, parameters)
        
        try:
            # Update status to running
            self.update_session_status(session_id, "running")
            
            # Run all discovery components
            anomalies = self.run_anomaly_detection(session_id, dataset_id)
            correlations = self.run_correlation_discovery(session_id, dataset_id)
            patterns = self.run_statistical_serendipity(session_id, dataset_id)
            insights = self.run_counterintuitive_insight_generation(session_id, dataset_id)
            
            # Count total patterns found
            total_patterns = len(anomalies) + len(correlations) + len(patterns) + len(insights)
            
            # Update session status to completed
            self.update_session_status(session_id, "completed", total_patterns)
            
            return session_id
            
        except Exception as e:
            # Update session status to error
            self.update_session_status(session_id, "error")
            raise e

# Global instance of the discovery engine
discovery_engine = HiddenPatternDiscoveryEngine()