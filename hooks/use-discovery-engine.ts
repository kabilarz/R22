import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

export interface DiscoveryRequest {
  dataset_id: string;
  discovery_depth: string;
  focus_areas: string[];
  medical_context?: string;
}

export interface DiscoveryResponse {
  discovery_session_id: string;
  status: string;
  estimated_completion?: string;
}

export interface PatternResult {
  pattern_id: string;
  type: string;
  variables: string[];
  strength: number;
  significance: number;
  description: string;
  discovered_at: string;
}

export interface DiscoveryResults {
  session_id: string;
  patterns_found: number;
  significant_findings: number;
  anomalies_detected: number;
  hidden_correlations: number;
  top_findings: PatternResult[];
}

export interface InsightRequest {
  finding_id: string;
  dataset_id: string;
  medical_context?: string;
}

export interface InsightResponse {
  explanation: string;
  supporting_evidence: string[];
  research_implications: string[];
  confidence: number;
}

export function useDiscoveryEngine() {
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoverySessionId, setDiscoverySessionId] = useState<string | null>(null);
  const [discoveryResults, setDiscoveryResults] = useState<DiscoveryResults | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<PatternResult | null>(null);
  const [insight, setInsight] = useState<InsightResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startDiscovery = useCallback(async (request: DiscoveryRequest) => {
    setIsDiscovering(true);
    setError(null);
    setDiscoveryResults(null);
    setSelectedFinding(null);
    setInsight(null);

    try {
      const response = await api.post<DiscoveryResponse>('/api/discovery/analyze', request);
      setDiscoverySessionId(response.discovery_session_id);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start pattern discovery';
      setError(errorMessage);
      throw err;
    } finally {
      setIsDiscovering(false);
    }
  }, []);

  const fetchDiscoveryResults = useCallback(async (sessionId: string) => {
    try {
      const results = await api.get<DiscoveryResults>(`/api/discovery/results/${sessionId}`);
      setDiscoveryResults(results);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch discovery results';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const generateInsight = useCallback(async (request: InsightRequest) => {
    try {
      const response = await api.post<InsightResponse>('/api/discovery/explain', request);
      setInsight(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate insight';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const resetDiscovery = useCallback(() => {
    setIsDiscovering(false);
    setDiscoverySessionId(null);
    setDiscoveryResults(null);
    setSelectedFinding(null);
    setInsight(null);
    setError(null);
  }, []);

  return {
    // State
    isDiscovering,
    discoverySessionId,
    discoveryResults,
    selectedFinding,
    insight,
    error,
    
    // Actions
    startDiscovery,
    fetchDiscoveryResults,
    generateInsight,
    resetDiscovery
  };
}