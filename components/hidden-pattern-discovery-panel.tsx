"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  Zap, 
  Eye, 
  Search,
  Play,
  RefreshCw,
  BarChart3,
  GitBranch,
  Lightbulb
} from 'lucide-react';
import { api } from '@/lib/api';

interface DiscoveryRequest {
  dataset_id: string;
  discovery_depth: string;
  focus_areas: string[];
  medical_context?: string;
}

interface DiscoveryResponse {
  discovery_session_id: string;
  status: string;
  estimated_completion?: string;
}

interface PatternResult {
  pattern_id: string;
  type: string;
  variables: string[];
  strength: number;
  significance: number;
  description: string;
  discovered_at: string;
}

interface DiscoveryResults {
  session_id: string;
  patterns_found: number;
  significant_findings: number;
  anomalies_detected: number;
  hidden_correlations: number;
  top_findings: PatternResult[];
}

interface InsightRequest {
  finding_id: string;
  dataset_id: string;
  medical_context?: string;
}

interface InsightResponse {
  explanation: string;
  supporting_evidence: string[];
  research_implications: string[];
  confidence: number;
}

export function HiddenPatternDiscoveryPanel({ datasetId }: { datasetId: string }) {
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoverySessionId, setDiscoverySessionId] = useState<string | null>(null);
  const [discoveryResults, setDiscoveryResults] = useState<DiscoveryResults | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<PatternResult | null>(null);
  const [insight, setInsight] = useState<InsightResponse | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const startDiscovery = async () => {
    setIsDiscovering(true);
    setError(null);
    setDiscoveryResults(null);
    setSelectedFinding(null);
    setInsight(null);
    setProgress(0);

    try {
      const request: DiscoveryRequest = {
        dataset_id: datasetId,
        discovery_depth: "comprehensive",
        focus_areas: ["anomalies", "correlations", "subgroups"],
        medical_context: "medical research"
      };

      // Simulate progress
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const response = await api.post<DiscoveryResponse>('/api/discovery/analyze', request);
      
      clearInterval(interval);
      setProgress(100);
      
      setDiscoverySessionId(response.discovery_session_id);
      
      // Poll for results
      setTimeout(() => {
        fetchDiscoveryResults(response.discovery_session_id);
      }, 1000);
    } catch (err) {
      setError('Failed to start pattern discovery: ' + (err as Error).message);
      setIsDiscovering(false);
    }
  };

  const fetchDiscoveryResults = async (sessionId: string) => {
    try {
      const results = await api.get<DiscoveryResults>(`/api/discovery/results/${sessionId}`);
      setDiscoveryResults(results);
      setIsDiscovering(false);
    } catch (err) {
      setError('Failed to fetch discovery results: ' + (err as Error).message);
      setIsDiscovering(false);
    }
  };

  const generateInsight = async (finding: PatternResult) => {
    setSelectedFinding(finding);
    setInsight(null);
    
    try {
      const request: InsightRequest = {
        finding_id: finding.pattern_id,
        dataset_id: datasetId,
        medical_context: "medical research"
      };
      
      const response = await api.post<InsightResponse>('/api/discovery/explain', request);
      setInsight(response);
    } catch (err) {
      setError('Failed to generate insight: ' + (err as Error).message);
    }
  };

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'anomaly':
        return <AlertTriangle className="h-4 w-4" />;
      case 'correlation':
        return <GitBranch className="h-4 w-4" />;
      case 'clustering':
        return <BarChart3 className="h-4 w-4" />;
      case 'counterintuitive_correlation':
        return <Zap className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getPatternColor = (type: string) => {
    switch (type) {
      case 'anomaly':
        return 'bg-red-100 text-red-800';
      case 'correlation':
        return 'bg-blue-100 text-blue-800';
      case 'clustering':
        return 'bg-green-100 text-green-800';
      case 'counterintuitive_correlation':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Hidden Pattern Discovery Engine
          </CardTitle>
          <CardDescription>
            Reveal statistical insights and relationships that would typically be overlooked by average researchers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!isDiscovering && !discoveryResults && (
              <div className="text-center py-8">
                <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium mb-2">Discover Hidden Patterns</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Uncover subtle patterns, hidden correlations, and unexpected findings in your medical dataset
                </p>
                <Button onClick={startDiscovery} disabled={isDiscovering}>
                  <Play className="mr-2 h-4 w-4" />
                  Start Discovery
                </Button>
              </div>
            )}

            {isDiscovering && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Discovering hidden patterns...</span>
                </div>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-gray-500 text-center">
                  This may take a few moments as we analyze your dataset for subtle patterns
                </p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {discoveryResults && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Patterns Found</span>
                      </div>
                      <div className="text-2xl font-bold mt-1">{discoveryResults.patterns_found}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">Anomalies</span>
                      </div>
                      <div className="text-2xl font-bold mt-1">{discoveryResults.anomalies_detected}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Correlations</span>
                      </div>
                      <div className="text-2xl font-bold mt-1">{discoveryResults.hidden_correlations}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">Significant</span>
                      </div>
                      <div className="text-2xl font-bold mt-1">{discoveryResults.significant_findings}</div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Top Discoveries</h3>
                  <div className="space-y-3">
                    {discoveryResults.top_findings.map((finding) => (
                      <Card 
                        key={finding.pattern_id} 
                        className={`cursor-pointer hover:shadow-md transition-shadow ${selectedFinding?.pattern_id === finding.pattern_id ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => generateInsight(finding)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                {getPatternIcon(finding.type)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{finding.description}</h4>
                                  <Badge className={getPatternColor(finding.type)}>
                                    {finding.type.replace('_', ' ')}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                  Variables: {finding.variables.join(', ')}
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                  <div className="flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    <span className="text-xs">Strength: {finding.strength.toFixed(3)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Activity className="h-3 w-3" />
                                    <span className="text-xs">p-value: {finding.significance.toFixed(4)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {insight && selectedFinding && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Insight for: {selectedFinding.description}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Explanation</h4>
                          <p className="text-sm text-gray-700">{insight.explanation}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Research Implications</h4>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {insight.research_implications.map((implication, index) => (
                              <li key={index}>{implication}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Confidence</h4>
                          <div className="flex items-center gap-2">
                            <Progress value={insight.confidence * 100} className="w-32" />
                            <span className="text-sm">{(insight.confidence * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-center">
                  <Button onClick={startDiscovery} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Run Discovery Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}