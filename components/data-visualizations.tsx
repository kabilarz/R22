'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Table as TableIcon, Heart, Stethoscope } from 'lucide-react'
import { MedicalVisualizations } from './medical-visualizations'

interface DataVisualizationsProps {
  data: any[]
  fileName: string
  analysisResults?: any
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function DataVisualizations({ data, fileName, analysisResults }: DataVisualizationsProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No data to visualize</p>
        </CardContent>
      </Card>
    )
  }

  const columns = Object.keys(data[0])
  const numericColumns = getNumericColumns(data, columns)
  const categoricalColumns = getCategoricalColumns(data, columns)
  const isMedicalData = detectMedicalData(columns)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        {isMedicalData ? (
          <>
            <Heart className="h-5 w-5 text-red-500" />
            <h3 className="text-lg font-semibold">Medical Data Analysis</h3>
          </>
        ) : (
          <>
            <BarChart3 className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Data Visualizations</h3>
          </>
        )}
        <Badge variant="outline">{fileName}</Badge>
      </div>

      <Tabs defaultValue={isMedicalData ? "medical" : "standard"} className="space-y-4">
        <TabsList>
          {isMedicalData && (
            <TabsTrigger value="medical" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Medical Analysis
            </TabsTrigger>
          )}
          <TabsTrigger value="standard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Standard Charts
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <TableIcon className="h-4 w-4" />
            Data Summary
          </TabsTrigger>
        </TabsList>

        {isMedicalData && (
          <TabsContent value="medical">
            <MedicalVisualizations data={data} fileName={fileName} analysisResults={analysisResults} />
          </TabsContent>
        )}

        <TabsContent value="standard">
          <StandardVisualizations 
            data={data} 
            fileName={fileName} 
            columns={columns}
            numericColumns={numericColumns}
            categoricalColumns={categoricalColumns}
          />
        </TabsContent>

        <TabsContent value="summary">
          <DataSummary data={data} columns={columns} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StandardVisualizations({ data, fileName, columns, numericColumns, categoricalColumns }: {
  data: any[], fileName: string, columns: string[], numericColumns: string[], categoricalColumns: string[]
}) {

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Data Visualizations</h3>
        <Badge variant="outline">{fileName}</Badge>
      </div>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TableIcon className="h-4 w-4" />
            Dataset Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{data.length}</div>
              <div className="text-sm text-muted-foreground">Total Rows</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{columns.length}</div>
              <div className="text-sm text-muted-foreground">Columns</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{numericColumns.length}</div>
              <div className="text-sm text-muted-foreground">Numeric Columns</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{categoricalColumns.length}</div>
              <div className="text-sm text-muted-foreground">Categorical Columns</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Data Preview (First 10 Rows)</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map(column => (
                    <TableHead key={column}>{column}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.slice(0, 10).map((row, index) => (
                  <TableRow key={index}>
                    {columns.map(column => (
                      <TableCell key={column}>
                        {String(row[column] || '').length > 50 
                          ? String(row[column]).substring(0, 50) + '...'
                          : String(row[column] || '')
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Numeric Data Charts */}
      {numericColumns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Numeric Data Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.slice(0, 20)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={columns[0]} />
                  <YAxis />
                  <Tooltip />
                  {numericColumns.slice(0, 3).map((column, index) => (
                    <Bar key={column} dataKey={column} fill={COLORS[index]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categorical Data Charts */}
      {categoricalColumns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              Categorical Data Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoricalColumns.slice(0, 2).map(column => {
              const distribution = getCategoricalDistribution(data, column)
              return (
                <div key={column} className="mb-6">
                  <h4 className="text-sm font-medium mb-3">{column}</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {distribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Time Series (if date column exists) */}
      {hasDateColumn(data, columns) && numericColumns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Time Series Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.slice(0, 50)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={getDateColumn(data, columns)} />
                  <YAxis />
                  <Tooltip />
                  {numericColumns.slice(0, 2).map((column, index) => (
                    <Line 
                      key={column} 
                      type="monotone" 
                      dataKey={column} 
                      stroke={COLORS[index]} 
                      strokeWidth={2}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

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

function getCategoricalDistribution(data: any[], column: string) {
  const distribution: { [key: string]: number } = {}
  
  data.forEach(row => {
    const value = String(row[column] || 'Unknown')
    distribution[value] = (distribution[value] || 0) + 1
  })

  return Object.entries(distribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10) // Top 10 categories
}

function hasDateColumn(data: any[], columns: string[]): boolean {
  return columns.some(column => {
    const sampleValues = data.slice(0, 10).map(row => row[column])
    return sampleValues.some(value => {
      const date = new Date(value)
      return !isNaN(date.getTime()) && value !== null && value !== undefined
    })
  })
}

function getDateColumn(data: any[], columns: string[]): string {
  return columns.find(column => {
    const sampleValues = data.slice(0, 10).map(row => row[column])
    return sampleValues.some(value => {
      const date = new Date(value)
      return !isNaN(date.getTime()) && value !== null && value !== undefined
    })
  }) || columns[0]
}