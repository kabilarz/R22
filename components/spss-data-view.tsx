'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Database, Variable, Download, Save, Trash2, Search, Replace } from 'lucide-react'
import { useVirtualizer } from '@tanstack/react-virtual'

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  data: any[]
  uploadedAt: Date
}

interface VariableInfo {
  name: string
  type: 'numeric' | 'string' | 'date'
  width: number
  decimals: number
  label: string
  values: { [key: string]: string }
  missing: string[]
  columns: number
  align: 'left' | 'center' | 'right'
  measure: 'scale' | 'ordinal' | 'nominal'
  role: 'input' | 'target' | 'both' | 'none' | 'partition' | 'split'
}

interface SPSSDataViewProps {
  file: UploadedFile
  onClose: () => void
  onSave: (updatedData: any[], variables: { [key: string]: VariableInfo }) => void
}

export function SPSSDataView({ file, onClose, onSave }: SPSSDataViewProps) {
  const [activeTab, setActiveTab] = useState<'data' | 'variable'>('data')
  const [editedData, setEditedData] = useState<any[]>([])
  const [variables, setVariables] = useState<{ [key: string]: VariableInfo }>({})
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null)
  const [cellValue, setCellValue] = useState('')
  const [findText, setFindText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [findDialogOpen, setFindDialogOpen] = useState(false)
  const [replaceDialogOpen, setReplaceDialogOpen] = useState(false)
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [foundMatches, setFoundMatches] = useState<{ row: number; col: string }[]>([])
  const [currentMatch, setCurrentMatch] = useState(0)
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: string } | null>(null)

  // ---------- INIT / VARIABLE INFERENCE ----------
  useEffect(() => {
    setEditedData([...file.data])
    if (file.data.length > 0) {
      const cols = Object.keys(file.data[0])
      const varsInfo: { [key: string]: VariableInfo } = {}
      cols.forEach(col => {
        const values = file.data.map(row => row[col])
        const nonEmpty = values.filter((v: any) => v !== null && v !== undefined && v !== '')
        const nums = nonEmpty.filter((v: any) => !isNaN(parseFloat(v)) && isFinite(v))
        varsInfo[col] = {
          name: col,
          type: nums.length > nonEmpty.length * 0.7 ? 'numeric' : 'string',
          width: Math.max(8, Math.min(20, col.length + 2)),
          decimals: 2,
          label: col,
          values: {},
          missing: ['', 'NULL', 'null', 'N/A', 'NA'],
          columns: Math.max(8, Math.min(20, col.length + 2)),
          align: nums.length > nonEmpty.length * 0.7 ? 'right' : 'left',
          measure: nums.length > nonEmpty.length * 0.7 ? 'scale' : 'nominal',
          role: 'input'
        }
        if (varsInfo[col].type === 'string') {
          const uniques = Array.from(new Set(nonEmpty.slice(0, 20)))
          if (uniques.length <= 10 && uniques.length > 1) varsInfo[col].measure = 'nominal'
        }
      })
      setVariables(varsInfo)
    }
  }, [file.data])

  const columns = useMemo(() => (editedData.length > 0 ? Object.keys(editedData[0]) : []), [editedData])

  const getExcelColumnName = (index: number): string => {
    let result = ''
    while (index >= 0) {
      result = String.fromCharCode(65 + (index % 26)) + result
      index = Math.floor(index / 26) - 1
    }
    return result
  }

  const colWidthPx = (col: string) =>
    `${((variables[col]?.columns ?? variables[col]?.width ?? 10) * 8) || 150}px`

  // ---------- EDIT / FIND / REPLACE ----------
  const handleCellEdit = (rowIndex: number, column: string, value: string) => {
    const newData = [...editedData]
    const variable = variables[column]
    let processed: any = value
    if (variable?.type === 'numeric' && value !== '') {
      const numValue = parseFloat(value)
      processed = !isNaN(numValue) ? numValue : value
    }
    newData[rowIndex][column] = processed
    setEditedData(newData)
    setEditingCell(null)
    setCellValue('')
    setSelectedCell({ row: rowIndex, col: column })
  }

  const handleVariableUpdate = (columnName: string, updates: Partial<VariableInfo>) => {
    setVariables(prev => ({ ...prev, [columnName]: { ...prev[columnName], ...updates } }))
  }

  const deleteRow = (rowIndex: number) => {
    setEditedData(prev => prev.filter((_, i) => i !== rowIndex))
    toast.success('Row deleted')
  }

  const exportData = () => {
    try {
      const csv = [
        columns.join(','),
        ...editedData.map(row =>
          columns.map(col => {
            const v = row[col]
            return typeof v === 'string' && v.includes(',') ? `"${v}"` : v
          }).join(',')
        )
      ].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${file.name.replace(/\.[^/.]+$/, '')}_edited.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Data exported successfully')
    } catch {
      toast.error('Failed to export data')
    }
  }

  const saveChanges = () => {
    onSave(editedData, variables)
    toast.success('Changes saved successfully')
  }

  const handleFind = useCallback(() => {
    if (!findText.trim()) {
      setFoundMatches([])
      return
    }
    const matches: { row: number; col: string }[] = []
    const q = caseSensitive ? findText : findText.toLowerCase()
    editedData.forEach((row, r) => {
      columns.forEach(c => {
        const cell = String(row[c] || '')
        const inCell = caseSensitive ? cell : cell.toLowerCase()
        if (inCell.includes(q)) matches.push({ row: r, col: c })
      })
    })
    setFoundMatches(matches)
    setCurrentMatch(0)
    if (matches.length === 0) toast.info('No matches found')
    else toast.success(`Found ${matches.length} matches`)
  }, [findText, editedData, columns, caseSensitive])

  const handleReplace = useCallback((replaceAll: boolean = false) => {
    if (!findText.trim()) {
      toast.error('Please enter text to find')
      return
    }
    let replaced = 0
    const newData = [...editedData]
    const q = caseSensitive ? findText : findText.toLowerCase()
    newData.forEach((row, r) => {
      columns.forEach(c => {
        const cell = String(row[c] || '')
        const inCell = caseSensitive ? cell : cell.toLowerCase()
        if (replaceAll) {
          if (inCell.includes(q)) {
            const re = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), caseSensitive ? 'g' : 'gi')
            row[c] = cell.replace(re, replaceText)
            replaced++
          }
        } else {
          if (currentMatch < foundMatches.length) {
            const m = foundMatches[currentMatch]
            if (m.row === r && m.col === c) {
              const re = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), caseSensitive ? '' : 'i')
              row[c] = cell.replace(re, replaceText)
              replaced++
            }
          }
        }
      })
    })
    if (replaced > 0) {
      setEditedData(newData)
      toast.success(`Replaced ${replaced} occurrence${replaced > 1 ? 's' : ''}`)
      setTimeout(() => handleFind(), 100)
    } else {
      toast.info('No replacements made')
    }
  }, [findText, replaceText, editedData, columns, caseSensitive, currentMatch, foundMatches, handleFind])

  // ---------- VIRTUALIZER (ROWS) ----------
  const ROW_HEIGHT = 28
  // Single scroll container that holds BOTH header and rows
  const scrollRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: editedData.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8
  })

  // Keep active row visible when selection changes
  useEffect(() => {
    if (selectedCell) rowVirtualizer.scrollToIndex(selectedCell.row, { align: 'auto' })
  }, [selectedCell, rowVirtualizer])

  // Keyboard navigation helpers
  const scrollToCell = useCallback((rowIndex: number, colIndex: number) => {
    rowVirtualizer.scrollToIndex(rowIndex, { align: 'auto' })
    requestAnimationFrame(() => {
      const container = scrollRef.current
      if (!container) return
      const el = container.querySelector(
        `[data-cell-row="${rowIndex}"][data-cell-col="${columns[colIndex]}"]`
      ) as HTMLElement | null
      el?.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'nearest', inline: 'nearest' })
    })
  }, [columns, rowVirtualizer])

  const handleCellNavigation = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    if (!selectedCell || editedData.length === 0) return
    const r = selectedCell.row
    const c = columns.indexOf(selectedCell.col)
    let nr = r, nc = c
    if (dir === 'up') nr = Math.max(0, r - 1)
    if (dir === 'down') nr = Math.min(editedData.length - 1, r + 1)
    if (dir === 'left') nc = Math.max(0, c - 1)
    if (dir === 'right') nc = Math.min(columns.length - 1, c + 1)
    if (nr !== r || nc !== c) {
      const next = { row: nr, col: columns[nc] }
      setSelectedCell(next)
      scrollToCell(nr, nc)
    }
  }, [selectedCell, editedData, columns, scrollToCell])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') { e.preventDefault(); setFindDialogOpen(true); return }
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') { e.preventDefault(); setReplaceDialogOpen(true); return }
      if (!findDialogOpen && !replaceDialogOpen && !editingCell) {
        const active = document.activeElement as HTMLElement | null
        if (active && ['INPUT','SELECT','TEXTAREA'].includes(active.tagName)) return
        if (e.key.startsWith('Arrow')) {
          e.preventDefault()
          if (e.key === 'ArrowUp') handleCellNavigation('up')
          if (e.key === 'ArrowDown') handleCellNavigation('down')
          if (e.key === 'ArrowLeft') handleCellNavigation('left')
          if (e.key === 'ArrowRight') handleCellNavigation('right')
        } else if (e.key === 'Enter' && selectedCell && activeTab === 'data') {
          e.preventDefault()
          setEditingCell(selectedCell)
          setCellValue(String(editedData[selectedCell.row][selectedCell.col] || ''))
        } else if (e.key === 'Tab') {
          e.preventDefault()
          if (e.shiftKey) handleCellNavigation('left')
          else handleCellNavigation('right')
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [handleCellNavigation, findDialogOpen, replaceDialogOpen, editingCell, selectedCell, editedData, activeTab])

  const navigateToMatch = (dir: 'next' | 'prev') => {
    if (foundMatches.length === 0) return
    const next = dir === 'next'
      ? (currentMatch + 1) % foundMatches.length
      : (currentMatch - 1 + foundMatches.length) % foundMatches.length
    setCurrentMatch(next)
    const m = foundMatches[next]
    if (m) scrollToCell(m.row, columns.indexOf(m.col))
  }

  const isMatchHighlighted = (r: number, c: string) => foundMatches.some(m => m.row === r && m.col === c)
  const isCurrentMatch   = (r: number, c: string) => foundMatches.length > 0 && foundMatches[currentMatch]?.row === r && foundMatches[currentMatch]?.col === c

  // ---------- RENDER ----------
  return (
    <div className="w-full h-screen flex flex-col bg-background">
      <div className="bg-background flex flex-col min-h-0">
        {/* Top bar */}
        <div className="flex items-center justify-between p-1 border-b">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <h2 className="text-xs font-semibold">SPSS Data View - {file.name}</h2>
            <Badge variant="outline" className="text-xs h-5 px-1">{editedData.length} × {columns.length}</Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button onClick={exportData} variant="outline" size="sm" className="h-6 text-xs px-2">
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
            <Button onClick={saveChanges} variant="outline" size="sm" className="h-6 text-xs px-2">
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>

            {/* Find */}
            <Dialog open={findDialogOpen} onOpenChange={setFindDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-6 text-xs px-2">
                  <Search className="h-3 w-3 mr-1" />
                  Find
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Find in Data</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="find-input">Find what:</Label>
                    <Input
                      id="find-input"
                      value={findText}
                      onChange={(e) => setFindText(e.target.value)}
                      placeholder="Enter text to find"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleFind() }}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="case-sensitive" checked={caseSensitive} onCheckedChange={(c) => setCaseSensitive(c as boolean)} />
                    <Label htmlFor="case-sensitive">Case sensitive</Label>
                  </div>
                  {foundMatches.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{currentMatch + 1} of {foundMatches.length} matches</span>
                      <Button size="sm" onClick={() => navigateToMatch('prev')}>Previous</Button>
                      <Button size="sm" onClick={() => navigateToMatch('next')}>Next</Button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={handleFind}>Find All</Button>
                    <Button variant="outline" onClick={() => setFindDialogOpen(false)}>Close</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Replace */}
            <Dialog open={replaceDialogOpen} onOpenChange={setReplaceDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-6 text-xs px-2">
                  <Replace className="h-3 w-3 mr-1" />
                  Replace
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Find and Replace</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="find-replace-input">Find what:</Label>
                    <Input id="find-replace-input" value={findText} onChange={(e) => setFindText(e.target.value)} placeholder="Enter text to find" />
                  </div>
                  <div>
                    <Label htmlFor="replace-input">Replace with:</Label>
                    <Input id="replace-input" value={replaceText} onChange={(e) => setReplaceText(e.target.value)} placeholder="Enter replacement text" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="case-sensitive-replace" checked={caseSensitive} onCheckedChange={(c) => setCaseSensitive(c as boolean)} />
                    <Label htmlFor="case-sensitive-replace">Case sensitive</Label>
                  </div>
                  {foundMatches.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{currentMatch + 1} of {foundMatches.length} matches</span>
                      <Button size="sm" onClick={() => navigateToMatch('prev')}>Previous</Button>
                      <Button size="sm" onClick={() => navigateToMatch('next')}>Next</Button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={handleFind}>Find All</Button>
                    <Button onClick={() => handleReplace(false)}>Replace</Button>
                    <Button onClick={() => handleReplace(true)} variant="destructive">Replace All</Button>
                    <Button variant="outline" onClick={() => setReplaceDialogOpen(false)}>Close</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button onClick={onClose} variant="ghost" size="sm" className="h-6 text-xs px-2">Close</Button>
          </div>
        </div>

        {/* Tabs header */}
        <div className="px-1 py-0 border-b">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'data' | 'variable')} className="w-full">
            <TabsList className="h-7 p-0">
              <TabsTrigger value="data" className="flex items-center gap-1 h-6 text-xs px-2">
                <Database className="h-3 w-3" /> Data View
              </TabsTrigger>
              <TabsTrigger value="variable" className="flex items-center gap-1 h-6 text-xs px-2">
                <Variable className="h-3 w-3" /> Variable View
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* DATA VIEW (single scroll container) */}
        {activeTab === 'data' && (
          <div
            className="w-full"
            style={{ height: 'calc(100vh - 120px)' }}
            data-table-container
            tabIndex={0}
            onClick={() => {
              if (!selectedCell && editedData.length > 0 && columns.length > 0) {
                setSelectedCell({ row: 0, col: columns[0] })
              }
            }}
          >
            {/* ONE scroll area for header + rows */}
            <div ref={scrollRef} className="relative overflow-auto h-full">
              <div style={{ minWidth: 'max-content' }}>
                {/* Sticky header INSIDE the same scroller */}
                <div className="sticky top-0 z-10 bg-background border-b">
                  <div className="flex">
                    <div className="w-16 p-2 text-left text-xs font-medium text-muted-foreground sticky left-0 bg-background">
                      #
                    </div>
                    {columns.map((column, index) => (
                      <div
                        key={column}
                        className="p-2 text-left font-mono text-xs border-r box-border"
                        style={{ minWidth: '150px', width: colWidthPx(column) }}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {getExcelColumnName(index)}
                          </span>
                          <span className="font-medium">
                            {variables[column]?.label || column}
                          </span>
                          <span className="text-muted-foreground text-[10px]">
                            ({variables[column]?.type})
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="w-16 p-2 text-left text-xs font-medium text-muted-foreground">
                      Actions
                    </div>
                  </div>
                </div>

                {/* Virtualized rows below the sticky header */}
                <div
                  style={{
                    height: rowVirtualizer.getTotalSize(),
                    position: 'relative'
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map(vRow => {
                    const rowIndex = vRow.index
                    const row = editedData[rowIndex]
                    return (
                      <div
                        key={vRow.key}
                        className="absolute inset-x-0 flex hover:bg-muted/50 border-b"
                        style={{ top: vRow.start, height: vRow.size }}
                      >
                        {/* Row index (sticky left) */}
                        <div className="w-16 p-1 text-xs text-muted-foreground font-mono bg-background sticky left-0">
                          {rowIndex + 1}
                        </div>

                        {/* Cells */}
                        {columns.map((column) => {
                          const isHighlighted = isMatchHighlighted(rowIndex, column)
                          const isCurrent = isCurrentMatch(rowIndex, column)
                          const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === column
                          const cellActive = editingCell?.row === rowIndex && editingCell?.col === column
                          return (
                            <div
                              key={`${rowIndex}-${column}`}
                              data-cell-row={rowIndex}
                              data-cell-col={column}
                              className={[
                                'p-1 font-mono text-xs cursor-pointer border-r flex items-center box-border',
                                'hover:bg-blue-50 dark:hover:bg-blue-900/20',
                                isHighlighted ? 'bg-yellow-200 dark:bg-yellow-900/30' : '',
                                isCurrent ? 'ring-2 ring-blue-500 bg-blue-100 dark:bg-blue-900/50' : '',
                                isSelected && !editingCell ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20' : '',
                              ].join(' ')}
                              style={{ minWidth: '150px', width: colWidthPx(column) }}
                              onClick={() => {
                                setSelectedCell({ row: rowIndex, col: column })
                                setEditingCell({ row: rowIndex, col: column })
                                setCellValue(String(row?.[column] ?? ''))
                              }}
                            >
                              {cellActive ? (
                                <Input
                                  value={cellValue}
                                  onChange={(e) => setCellValue(e.target.value)}
                                  onBlur={() => handleCellEdit(rowIndex, column, cellValue)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCellEdit(rowIndex, column, cellValue)
                                    else if (e.key === 'Escape') { setEditingCell(null); setCellValue('') }
                                  }}
                                  className="h-6 text-xs font-mono border-0 p-1 focus:ring-1 w-full"
                                  autoFocus
                                />
                              ) : (
                                <div className="min-h-[24px] flex items-center p-1 w-full truncate">
                                  {String(row?.[column] ?? '')}
                                </div>
                              )}
                            </div>
                          )
                        })}

                        {/* Actions */}
                        <div className="w-16 p-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteRow(rowIndex)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VARIABLE VIEW (unchanged) */}
        {activeTab === 'variable' && (
          <div className="w-full overflow-auto" style={{ height: 'calc(100vh - 120px)' }}>
            <div style={{ minWidth: 'max-content', overflowX: 'auto' }}>
              <table className="border-collapse w-full" style={{ minWidth: '100%', tableLayout: 'auto' }}>
                <thead className="sticky top-0 bg-background z-10">
                  <tr className="border-b bg-gray-100 dark:bg-gray-800">
                    {['', 'Name','Type','Width','Decimals','Label','Values','Missing','Columns','Align','Measure','Role'].map((h, i) => (
                      <th key={i} className="text-left py-0.5 px-1 font-medium text-xs text-gray-600 dark:text-gray-300 relative">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {columns.map((column, index) => {
                    const variable = variables[column]
                    return (
                      <tr key={column} className="border-b hover:bg-blue-50 dark:hover:bg-blue-900/20 h-6">
                        <td className="py-0.5 px-1 text-xs font-mono text-center text-gray-500 bg-gray-50 dark:bg-gray-800">{index + 1}</td>
                        <td className="py-0.5 px-1 ">
                          <div className="text-xs font-mono font-medium text-gray-900 dark:text-gray-100 truncate">{column}</div>
                        </td>
                        <td className="py-0.5 px-1 ">
                          <Select value={variable?.type || 'string'} onValueChange={(v: 'numeric' | 'string' | 'date') => handleVariableUpdate(column, { type: v })}>
                            <SelectTrigger className="h-5 text-xs border-0 bg-transparent px-1 py-0 focus:ring-0"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="numeric">Numeric</SelectItem>
                              <SelectItem value="string">String</SelectItem>
                              <SelectItem value="date">Date</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-0.5 px-1 "><Input type="number" value={variable?.width || 8} onChange={(e) => handleVariableUpdate(column, { width: parseInt(e.target.value) || 8 })} className="h-5 text-xs text-center border-0 bg-transparent px-1 py-0 focus:ring-0" min="1" max="50" /></td>
                        <td className="py-0.5 px-1 "><Input type="number" value={variable?.decimals || 0} onChange={(e) => handleVariableUpdate(column, { decimals: parseInt(e.target.value) || 0 })} className="h-5 text-xs text-center border-0 bg-transparent px-1 py-0 focus:ring-0" min="0" max="10" disabled={variable?.type !== 'numeric'} /></td>
                        <td className="py-0.5 px-1 "><Input value={variable?.label || ''} onChange={(e) => handleVariableUpdate(column, { label: e.target.value })} className="h-5 text-xs border-0 bg-transparent px-1 py-0 focus:ring-0" /></td>
                        <td className="py-0.5 px-1 "><div className="h-5 text-xs text-center text-gray-400 flex items-center justify-center">None</div></td>
                        <td className="py-0.5 px-1 "><div className="h-5 text-xs text-center text-gray-400 flex items-center justify-center">None</div></td>
                        <td className="py-0.5 px-1 "><Input type="number" value={variable?.columns || 8} onChange={(e) => handleVariableUpdate(column, { columns: parseInt(e.target.value) || 8 })} className="h-5 text-xs text-center border-0 bg-transparent px-1 py-0 focus:ring-0" min="1" max="50" /></td>
                        <td className="py-0.5 px-1 ">
                          <Select value={variable?.align || 'left'} onValueChange={(v: 'left' | 'center' | 'right') => handleVariableUpdate(column, { align: v })}>
                            <SelectTrigger className="h-5 text-xs border-0 bg-transparent px-1 py-0 focus:ring-0"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-0.5 px-1 ">
                          <Select value={variable?.measure || 'nominal'} onValueChange={(v: 'scale' | 'ordinal' | 'nominal') => handleVariableUpdate(column, { measure: v })}>
                            <SelectTrigger className="h-5 text-xs border-0 bg-transparent px-1 py-0 focus:ring-0"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="scale">Scale</SelectItem>
                              <SelectItem value="ordinal">Ordinal</SelectItem>
                              <SelectItem value="nominal">Nominal</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-0.5 px-1 ">
                          <Select value={variable?.role || 'input'} onValueChange={(v: 'input' | 'target' | 'both' | 'none' | 'partition' | 'split') => handleVariableUpdate(column, { role: v })}>
                            <SelectTrigger className="h-5 text-xs border-0 bg-transparent px-1 py-0 focus:ring-0"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="input">Input</SelectItem>
                              <SelectItem value="target">Target</SelectItem>
                              <SelectItem value="both">Both</SelectItem>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="partition">Partition</SelectItem>
                              <SelectItem value="split">Split</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
