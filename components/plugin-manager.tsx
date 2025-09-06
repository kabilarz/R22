'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Download, 
  Trash2, 
  Search, 
  Star, 
  Clock, 
  HardDrive, 
  Info,
  CheckCircle,
  AlertCircle,
  Package,
  TrendingUp,
  Shuffle,
  Target,
  Grid3X3,
  Link,
  ExternalLink,
  Package2,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  StatisticalTest, 
  PluginCategory,
  pluginManager,
  PLUGIN_CATEGORIES 
} from '@/lib/plugin-system'

interface PluginManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PluginManager({ open, onOpenChange }: PluginManagerProps) {
  const [installedTests, setInstalledTests] = useState<StatisticalTest[]>([])
  const [availableTests, setAvailableTests] = useState<StatisticalTest[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isInstalling, setIsInstalling] = useState<string | null>(null)
  const [isUninstalling, setIsUninstalling] = useState<string | null>(null)

  // Load plugin data
  useEffect(() => {
    if (open) {
      loadPluginData()
    }
  }, [open])

  const loadPluginData = async () => {
    try {
      // Load plugin status from backend
      await pluginManager.loadPluginStatus()
      
      setInstalledTests(pluginManager.getInstalledTests())
      setAvailableTests(pluginManager.getAvailableTests())
    } catch (error) {
      console.error('Failed to load plugin data:', error)
      toast.error('Failed to load plugin data')
    }
  }

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'parametric': return <TrendingUp className="w-4 h-4" />
      case 'nonparametric': return <Shuffle className="w-4 h-4" />
      case 'survival': return <Clock className="w-4 h-4" />
      case 'regression': return <Target className="w-4 h-4" />
      case 'categorical': return <Grid3X3 className="w-4 h-4" />
      case 'correlation': return <Link className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  const handleInstallTest = async (testId: string) => {
    setIsInstalling(testId)
    try {
      await pluginManager.installTest(testId)
      loadPluginData()
      toast.success('Statistical test installed successfully')
    } catch (error) {
      toast.error(`Installation failed: ${error}`)
    } finally {
      setIsInstalling(null)
    }
  }

  const handleUninstallTest = async (testId: string) => {
    setIsUninstalling(testId)
    try {
      await pluginManager.uninstallTest(testId)
      loadPluginData()
      toast.success('Statistical test uninstalled successfully')
    } catch (error) {
      toast.error(`Uninstall failed: ${error}`)
    } finally {
      setIsUninstalling(null)
    }
  }

  const getFilteredTests = (tests: StatisticalTest[]) => {
    let filtered = tests

    // Filter by search query
    if (searchQuery) {
      filtered = pluginManager.searchTests(searchQuery).filter(test => 
        tests.some(t => t.id === test.id)
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(test => test.category === selectedCategory)
    }

    return filtered
  }

  const StatisticalTestCard = ({ test, isInstalled }: { test: StatisticalTest, isInstalled: boolean }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {test.name}
              {test.isCore && <Badge variant="secondary" className="text-xs">
                <Star className="w-3 h-3 mr-1" />
                Core
              </Badge>}
              {isInstalled && !test.isCore && <Badge variant="default" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Installed
              </Badge>}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {test.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getCategoryIcon(test.category)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Medical Applications */}
          <div>
            <h4 className="text-sm font-medium mb-2">Medical Applications:</h4>
            <div className="flex flex-wrap gap-1">
              {test.medicalApplications.slice(0, 3).map((app, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {app}
                </Badge>
              ))}
              {test.medicalApplications.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{test.medicalApplications.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          {/* Dependencies & Libraries */}
          {(!test.isCore && (test.dependencies.length > 0 || test.pythonLibraries.length > 0)) && (
            <div className="bg-muted/30 p-3 rounded-md space-y-2">
              {test.dependencies.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-1 mb-1">
                    <Package2 className="w-3 h-3" />
                    Required Tests:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {test.dependencies.map((dep, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {dep}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {test.pythonLibraries.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-1 mb-1">
                    <ExternalLink className="w-3 h-3" />
                    Python Libraries:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {test.pythonLibraries.map((lib, index) => (
                      <Badge key={index} variant="secondary" className="text-xs font-mono">
                        {lib}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {!isInstalled && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  Will be downloaded and installed automatically
                </div>
              )}
            </div>
          )}

          {/* Example */}
          {test.examples.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-1">Example:</h4>
              <p className="text-xs text-muted-foreground italic">
                "{test.examples[0].sampleQuery}"
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            {isInstalled ? (
              test.isCore ? (
                <Badge variant="secondary" className="text-xs">
                  Core - Cannot Remove
                </Badge>
              ) : (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleUninstallTest(test.id)}
                  disabled={isUninstalling === test.id}
                >
                  {isUninstalling === test.id ? (
                    <>Uninstalling...</>
                  ) : (
                    <>
                      <Trash2 className="w-3 h-3 mr-1" />
                      Uninstall
                    </>
                  )}
                </Button>
              )
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => handleInstallTest(test.id)}
                disabled={isInstalling === test.id}
              >
                {isInstalling === test.id ? (
                  <>Installing...</>
                ) : (
                  <>
                    <Download className="w-3 h-3 mr-1" />
                    Install
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const CategoryOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {PLUGIN_CATEGORIES.map((category) => {
        const categoryTests = pluginManager.getTestsByCategory(category.id)
        const installedCount = categoryTests.filter(test => 
          pluginManager.isTestInstalled(test.id)
        ).length

        return (
          <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedCategory(category.id)}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                {getCategoryIcon(category.id)}
                <div>
                  <CardTitle className="text-base">{category.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {installedCount}/{category.testCount} installed
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Statistical Test Plugin Manager
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="installed">
              Installed ({installedTests.length})
            </TabsTrigger>
            <TabsTrigger value="available">
              Available ({availableTests.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 mt-4">
            <TabsContent value="overview" className="mt-0 h-full">
              <ScrollArea className="h-full">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Lean Core Architecture</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Nemo ships with only 10 essential core statistical tests to keep the app lightweight. 
                      Additional specialized tests can be downloaded on-demand based on your research needs, 
                      complete with their Python dependencies.
                    </p>
                    <CategoryOverview />
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Installation Information</h3>
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-md space-y-2">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-600" />
                        <h4 className="font-medium text-blue-900">Smart Dependency Management</h4>
                      </div>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Python libraries are automatically downloaded and installed</li>
                        <li>• Dependencies are checked before installation</li>
                        <li>• Core tests are always available (no download required)</li>
                        <li>• Optional tests keep your installation lean until needed</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Total Tests</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">
                            {installedTests.length + availableTests.length}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Installed</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold text-green-600">
                            {installedTests.length}
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Available</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold text-blue-600">
                            {availableTests.length}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="installed" className="mt-0 h-full">
              <div className="space-y-4 h-full flex flex-col">
                {/* Search and Filter */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search installed tests..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <select 
                    className="px-3 py-2 border rounded-md text-sm"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {PLUGIN_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Installed Tests List */}
                <ScrollArea className="flex-1">
                  <div className="space-y-1">
                    {getFilteredTests(installedTests).map(test => (
                      <StatisticalTestCard key={test.id} test={test} isInstalled={true} />
                    ))}
                    {getFilteredTests(installedTests).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="w-12 h-12 mx-auto mb-2" />
                        <p>No installed tests match your criteria</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="available" className="mt-0 h-full">
              <div className="space-y-4 h-full flex flex-col">
                {/* Search and Filter */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search available tests..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <select 
                    className="px-3 py-2 border rounded-md text-sm"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {PLUGIN_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Available Tests List */}
                <ScrollArea className="flex-1">
                  <div className="space-y-1">
                    {getFilteredTests(availableTests).map(test => (
                      <StatisticalTestCard key={test.id} test={test} isInstalled={false} />
                    ))}
                    {getFilteredTests(availableTests).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Download className="w-12 h-12 mx-auto mb-2" />
                        <p>No available tests match your criteria</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}