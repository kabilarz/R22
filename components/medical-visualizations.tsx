'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter,
  AreaChart, Area, ComposedChart, ReferenceLine, ReferenceArea,
  BoxPlot
} from 'recharts'
import { 
  TrendingUp, BarChart3, PieChart as PieChartIcon, Activity, 
  Target, Users, Heart, Stethoscope, AlertTriangle, CheckCircle 
} from 'lucide-react'
import React, { useState, useMemo } from 'react'

interface MedicalVisualizationsProps {
  data: any[]
  fileName: string
  analysisResults?: any
}

const MEDICAL_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16']
const SEVERITY_COLORS = {
  'Low': '#10B981',
  'Normal': '#3B82F6', 
  'Moderate': '#F59E0B',
  'High': '#EF4444',
  'Critical': '#DC2626'
}

export function MedicalVisualizations({ data, fileName, analysisResults }: MedicalVisualizationsProps) {
  const [selectedVisualization, setSelectedVisualization] = useState<string>('overview')
  
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Stethoscope className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">No medical data to visualize</p>
        </CardContent>
      </Card>
    )
  }

  const columns = Object.keys(data[0])
  const numericColumns = getNumericColumns(data, columns)
  const categoricalColumns = getCategoricalColumns(data, columns)
  const medicalColumns = identifyMedicalColumns(columns)

  const visualizations = [
    { id: 'overview', label: 'Medical Overview', icon: Heart },
    { id: 'vitals', label: 'Vital Signs', icon: Activity },
    { id: 'demographics', label: 'Demographics', icon: Users },
    { id: 'outcomes', label: 'Outcomes Analysis', icon: Target },
    { id: 'box-plots', label: 'Box Plots', icon: BarChart3 },
    { id: 'survival', label: 'Survival Curves', icon: TrendingUp },
    { id: 'roc', label: 'ROC Analysis', icon: AlertTriangle }
  ]

  const renderVisualization = () => {
    switch (selectedVisualization) {
      case 'overview':
        return <MedicalOverview data={data} columns={columns} medicalColumns={medicalColumns} />
      case 'vitals':
        return <VitalSignsCharts data={data} numericColumns={numericColumns} medicalColumns={medicalColumns} />
      case 'demographics':
        return <DemographicsCharts data={data} categoricalColumns={categoricalColumns} />
      case 'outcomes':
        return <OutcomesAnalysis data={data} columns={columns} />
      case 'box-plots':
        return <BoxPlotVisualizations data={data} numericColumns={numericColumns} categoricalColumns={categoricalColumns} />
      case 'survival':
        return <SurvivalCurves data={data} analysisResults={analysisResults} />
      case 'roc':
        return <ROCCurves data={data} analysisResults={analysisResults} />
      default:
        return <MedicalOverview data={data} columns={columns} medicalColumns={medicalColumns} />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-semibold">Medical Data Visualizations</h3>
          <Badge variant="outline">{fileName}</Badge>
        </div>
        
        <Select value={selectedVisualization} onValueChange={setSelectedVisualization}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select visualization" />
          </SelectTrigger>
          <SelectContent>
            {visualizations.map((viz) => (
              <SelectItem key={viz.id} value={viz.id}>
                <div className="flex items-center gap-2">
                  <viz.icon className="h-4 w-4" />
                  {viz.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main Visualization */}
      {renderVisualization()}
    </div>
  )
}

// Medical Overview Component
function MedicalOverview({ data, columns, medicalColumns }: { data: any[], columns: string[], medicalColumns: any }) {
  const stats = useMemo(() => ({
    totalPatients: data.length,
    avgAge: medicalColumns.age ? calculateMean(data, medicalColumns.age) : null,
    genderDistribution: medicalColumns.gender ? getFrequencyDistribution(data, medicalColumns.gender) : null,
    vitalSigns: medicalColumns.vitals.length,
    completeness: calculateDataCompleteness(data, columns)
  }), [data, columns, medicalColumns])

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />
            Medical Dataset Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalPatients}</div>
              <div className="text-sm text-blue-600">Total Patients</div>
            </div>
            {stats.avgAge && (
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.avgAge.toFixed(1)}</div>
                <div className="text-sm text-green-600">Average Age</div>
              </div>
            )}
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.vitalSigns}</div>
              <div className="text-sm text-purple-600">Vital Signs</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.completeness.toFixed(1)}%</div>
              <div className="text-sm text-orange-600">Data Complete</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gender Distribution */}
      {stats.genderDistribution && (
        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.genderDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.genderDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={MEDICAL_COLORS[index % MEDICAL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Vital Signs Charts Component
function VitalSignsCharts({ data, numericColumns, medicalColumns }: { data: any[], numericColumns: string[], medicalColumns: any }) {
  const vitalSigns = medicalColumns.vitals.filter((col: string) => numericColumns.includes(col))
  
  if (vitalSigns.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Activity className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">No vital signs data found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {vitalSigns.map((vital: string, index: number) => {
        const vitalData = data.map((row, idx) => ({
          patient: `Patient ${idx + 1}`,
          value: parseFloat(row[vital]) || 0,
          status: getVitalSignStatus(vital, parseFloat(row[vital]) || 0)
        })).filter(d => d.value > 0).slice(0, 50) // Limit to first 50 patients

        const referenceRanges = getVitalSignReferenceRanges(vital)

        return (
          <Card key={vital}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                {formatVitalSignName(vital)}
                <Badge variant="outline">{vitalData.length} patients</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={vitalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="patient" hide />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name, props) => [
                        `${value} ${getVitalSignUnit(vital)}`, 
                        formatVitalSignName(vital)
                      ]}
                      labelFormatter={(label) => `${label}`}
                    />
                    
                    {/* Reference ranges */}
                    {referenceRanges.normal && (
                      <ReferenceArea 
                        y1={referenceRanges.normal.min} 
                        y2={referenceRanges.normal.max} 
                        fill="#10B981" 
                        fillOpacity={0.1}
                      />
                    )}
                    
                    <Bar dataKey="value" fill={MEDICAL_COLORS[index % MEDICAL_COLORS.length]} />
                    
                    {/* Reference lines */}
                    {referenceRanges.normal && (
                      <>
                        <ReferenceLine y={referenceRanges.normal.min} stroke="#10B981" strokeDasharray="2 2" />
                        <ReferenceLine y={referenceRanges.normal.max} stroke="#10B981" strokeDasharray="2 2" />
                      </>
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              
              {/* Status Summary */}
              <div className="mt-4 flex gap-4">
                {Object.entries(
                  vitalData.reduce((acc: any, d) => {
                    acc[d.status] = (acc[d.status] || 0) + 1
                    return acc
                  }, {})
                ).map(([status, count]) => (
                  <div key={status} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: (SEVERITY_COLORS as any)[status] || '#6B7280' }}
                    />
                    <span className="text-sm">{status}: {count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// Demographics Charts Component  
function DemographicsCharts({ data, categoricalColumns }: { data: any[], categoricalColumns: string[] }) {
  const demographicColumns = categoricalColumns.filter(col => 
    col.toLowerCase().includes('gender') || 
    col.toLowerCase().includes('age_group') ||
    col.toLowerCase().includes('race') ||
    col.toLowerCase().includes('ethnicity') ||
    col.toLowerCase().includes('insurance')
  )

  if (demographicColumns.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">No demographic data found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {demographicColumns.map((column, index) => {
        const distribution = getFrequencyDistribution(data, column)
        
        return (
          <Card key={column}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {formatColumnName(column)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribution} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="value" fill={MEDICAL_COLORS[index % MEDICAL_COLORS.length]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-2 text-sm text-muted-foreground">
                Total: {distribution.reduce((sum, item) => sum + item.value, 0)} patients
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// Box Plot Visualizations Component
function BoxPlotVisualizations({ data, numericColumns, categoricalColumns }: { 
  data: any[], numericColumns: string[], categoricalColumns: string[] 
}) {
  if (numericColumns.length === 0 || categoricalColumns.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">Need both numeric and categorical data for box plots</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {numericColumns.slice(0, 3).map((numericCol, index) => (
        <Card key={numericCol}>
          <CardHeader>
            <CardTitle>
              Distribution of {formatColumnName(numericCol)} by {formatColumnName(categoricalColumns[0])}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={createBoxPlotData(data, numericCol, categoricalColumns[0])}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Scatter dataKey="value" fill={MEDICAL_COLORS[index % MEDICAL_COLORS.length]} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Outcomes Analysis Component
function OutcomesAnalysis({ data, columns }: { data: any[], columns: string[] }) {
  const outcomeColumns = columns.filter(col => 
    col.toLowerCase().includes('outcome') ||
    col.toLowerCase().includes('status') ||
    col.toLowerCase().includes('result') ||
    col.toLowerCase().includes('discharge') ||
    col.toLowerCase().includes('mortality')
  )

  if (outcomeColumns.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Target className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">No outcome variables identified</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {outcomeColumns.map((outcome, index) => {
        const distribution = getFrequencyDistribution(data, outcome)
        const positiveOutcomes = distribution.filter(d => 
          d.name.toLowerCase().includes('success') ||
          d.name.toLowerCase().includes('recovered') ||
          d.name.toLowerCase().includes('improved') ||
          d.name.toLowerCase().includes('discharged') ||
          d.name === '1' || d.name === 'true'
        )
        
        const successRate = positiveOutcomes.length > 0 ? 
          (positiveOutcomes.reduce((sum, d) => sum + d.value, 0) / data.length * 100) : 0

        return (
          <Card key={outcome}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  {formatColumnName(outcome)}
                </div>
                <Badge variant={successRate > 70 ? "default" : successRate > 50 ? "secondary" : "destructive"}>
                  {successRate.toFixed(1)}% Success Rate
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distribution.map((entry, idx) => (
                        <Cell 
                          key={`cell-${idx}`} 
                          fill={getOutcomeColor(entry.name)} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// Survival Curves Component (placeholder for actual analysis results)
function SurvivalCurves({ data, analysisResults }: { data: any[], analysisResults?: any }) {
  if (!analysisResults?.kaplan_meier) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">Run Kaplan-Meier analysis to view survival curves</p>
          <Button className="mt-4" disabled>
            Run Survival Analysis
          </Button>
        </CardContent>
      </Card>
    )
  }

  const survivalData = analysisResults.kaplan_meier.survival_curve || []
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Kaplan-Meier Survival Curve
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={survivalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" label={{ value: 'Time', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Survival Probability', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Line type="stepAfter" dataKey="survival" stroke="#3B82F6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// ROC Curves Component (placeholder for actual analysis results)
function ROCCurves({ data, analysisResults }: { data: any[], analysisResults?: any }) {
  if (!analysisResults?.roc_analysis) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground">Run ROC analysis to view ROC curves</p>
          <Button className="mt-4" disabled>
            Run ROC Analysis  
          </Button>
        </CardContent>
      </Card>
    )
  }

  const rocData = analysisResults.roc_analysis.roc_curve || []
  const auc = analysisResults.roc_analysis.auc || 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            ROC Curve Analysis
          </div>
          <Badge variant={auc > 0.8 ? "default" : auc > 0.7 ? "secondary" : "destructive"}>
            AUC: {auc.toFixed(3)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rocData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fpr" label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Line type="linear" dataKey="tpr" stroke="#EF4444" strokeWidth={2} dot={false} />
              <ReferenceLine x={0} y={0} stroke="#666" />
              <ReferenceLine x={1} y={1} stroke="#666" strokeDasharray="2 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper functions
function getNumericColumns(data: any[], columns: string[]): string[] {
  return columns.filter(column => {
    const values = data.slice(0, 100).map(row => row[column])
    const numericValues = values.filter(val => !isNaN(parseFloat(val)) && isFinite(val))
    return numericValues.length > values.length * 0.5
  })
}

function getCategoricalColumns(data: any[], columns: string[]): string[] {
  return columns.filter(column => {
    const values = data.slice(0, 100).map(row => row[column])
    const uniqueValues = new Set(values)
    return uniqueValues.size < values.length * 0.5 && uniqueValues.size < 20
  })
}

function identifyMedicalColumns(columns: string[]) {
  return {
    age: columns.find(col => col.toLowerCase().includes('age')),
    gender: columns.find(col => col.toLowerCase().includes('gender') || col.toLowerCase().includes('sex')),
    vitals: columns.filter(col => 
      col.toLowerCase().includes('bp') || col.toLowerCase().includes('blood_pressure') ||
      col.toLowerCase().includes('hr') || col.toLowerCase().includes('heart_rate') ||
      col.toLowerCase().includes('temp') || col.toLowerCase().includes('temperature') ||
      col.toLowerCase().includes('weight') || col.toLowerCase().includes('height') ||
      col.toLowerCase().includes('bmi') || col.toLowerCase().includes('pulse') ||
      col.toLowerCase().includes('o2') || col.toLowerCase().includes('oxygen')
    ),
    labs: columns.filter(col =>
      col.toLowerCase().includes('glucose') || col.toLowerCase().includes('cholesterol') ||
      col.toLowerCase().includes('hdl') || col.toLowerCase().includes('ldl') ||
      col.toLowerCase().includes('creatinine') || col.toLowerCase().includes('bun') ||
      col.toLowerCase().includes('wbc') || col.toLowerCase().includes('rbc') ||
      col.toLowerCase().includes('hemoglobin') || col.toLowerCase().includes('hgb')
    )
  }
}

function calculateMean(data: any[], column: string): number {
  const values = data.map(row => parseFloat(row[column])).filter(val => !isNaN(val))
  return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0
}

function getFrequencyDistribution(data: any[], column: string) {
  const distribution: { [key: string]: number } = {}
  
  data.forEach(row => {
    const value = String(row[column] || 'Unknown')
    distribution[value] = (distribution[value] || 0) + 1
  })

  return Object.entries(distribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
}

function calculateDataCompleteness(data: any[], columns: string[]): number {
  const totalCells = data.length * columns.length
  const completeCells = data.reduce((count, row) => {
    return count + columns.filter(col => row[col] !== null && row[col] !== undefined && row[col] !== '').length
  }, 0)
  
  return (completeCells / totalCells) * 100
}

function formatColumnName(column: string): string {
  return column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function formatVitalSignName(vital: string): string {
  const mapping: { [key: string]: string } = {
    'bp': 'Blood Pressure',
    'hr': 'Heart Rate', 
    'temp': 'Temperature',
    'o2': 'Oxygen Saturation',
    'bmi': 'BMI'
  }
  
  const lower = vital.toLowerCase()
  for (const [key, value] of Object.entries(mapping)) {
    if (lower.includes(key)) return value
  }
  
  return formatColumnName(vital)
}

function getVitalSignUnit(vital: string): string {
  const lower = vital.toLowerCase()
  if (lower.includes('bp') || lower.includes('pressure')) return 'mmHg'
  if (lower.includes('hr') || lower.includes('heart_rate') || lower.includes('pulse')) return 'bpm'
  if (lower.includes('temp')) return '°F'
  if (lower.includes('o2')) return '%'
  if (lower.includes('weight')) return 'lbs'
  if (lower.includes('height')) return 'in'
  if (lower.includes('bmi')) return 'kg/m²'
  return ''
}

function getVitalSignStatus(vital: string, value: number): string {
  const lower = vital.toLowerCase()
  
  if (lower.includes('bp') || lower.includes('pressure')) {
    if (value < 90) return 'Low'
    if (value < 120) return 'Normal'
    if (value < 140) return 'High'
    return 'Critical'
  }
  
  if (lower.includes('hr') || lower.includes('heart_rate')) {
    if (value < 60) return 'Low'
    if (value < 100) return 'Normal'
    if (value < 120) return 'High'
    return 'Critical'
  }
  
  return 'Normal'
}

function getVitalSignReferenceRanges(vital: string) {
  const lower = vital.toLowerCase()
  
  if (lower.includes('bp') || lower.includes('pressure')) {
    return { normal: { min: 90, max: 120 }, high: { min: 140, max: 180 } }
  }
  
  if (lower.includes('hr') || lower.includes('heart_rate')) {
    return { normal: { min: 60, max: 100 }, high: { min: 100, max: 120 } }
  }
  
  return {}
}

function createBoxPlotData(data: any[], numericCol: string, categoricalCol: string) {
  const grouped = data.reduce((acc: any, row) => {
    const category = row[categoricalCol]
    const value = parseFloat(row[numericCol])
    
    if (!isNaN(value)) {
      if (!acc[category]) acc[category] = []
      acc[category].push(value)
    }
    
    return acc
  }, {})
  
  const result: any[] = []
  Object.entries(grouped).forEach(([category, values]: [string, any]) => {
    values.forEach((value: number, index: number) => {
      result.push({
        category,
        value,
        index
      })
    })
  })
  
  return result
}

function getOutcomeColor(outcome: string): string {
  const lower = outcome.toLowerCase()
  if (lower.includes('success') || lower.includes('recovered') || lower.includes('improved') || lower === '1' || lower === 'true') {
    return '#10B981' // Green
  }
  if (lower.includes('failed') || lower.includes('died') || lower.includes('worse') || lower === '0' || lower === 'false') {
    return '#EF4444' // Red
  }
  return '#6B7280' // Gray
}