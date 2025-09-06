'use client'

import { useState } from 'react'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
  MenubarShortcut,
} from "@/components/ui/menubar"
import { 
  FileText, 
  Settings, 
  Eye, 
  Wrench, 
  HelpCircle, 
  FolderOpen, 
  Save, 
  Printer,
  Edit3,
  Copy,
  Scissors,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Monitor,
  Puzzle,
  Calculator,
  Database,
  Info
} from 'lucide-react'

interface MenuBarProps {
  onPluginManagerOpen: () => void
  onAboutOpen: () => void
}

export function MenuBar({ onPluginManagerOpen, onAboutOpen }: MenuBarProps) {
  const handleFileAction = (action: string) => {
    // TODO: Implement file actions
    console.log(`File action: ${action}`)
  }

  const handleEditAction = (action: string) => {
    // TODO: Implement edit actions
    console.log(`Edit action: ${action}`)
  }

  const handleViewAction = (action: string) => {
    // TODO: Implement view actions
    console.log(`View action: ${action}`)
  }

  return (
    <div className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Menubar className="border-none bg-transparent px-2 py-1">
        {/* File Menu */}
        <MenubarMenu>
          <MenubarTrigger className="text-sm font-normal px-2 py-1.5 cursor-pointer">
            <FileText className="w-4 h-4 mr-1.5" />
            File
          </MenubarTrigger>
          <MenubarContent align="start" className="min-w-[200px]">
            <MenubarItem onClick={() => handleFileAction('new')}>
              <FileText className="w-4 h-4 mr-2" />
              New Dataset
              <MenubarShortcut>Ctrl+N</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={() => handleFileAction('open')}>
              <FolderOpen className="w-4 h-4 mr-2" />
              Open Dataset...
              <MenubarShortcut>Ctrl+O</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => handleFileAction('save')}>
              <Save className="w-4 h-4 mr-2" />
              Save Analysis
              <MenubarShortcut>Ctrl+S</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={() => handleFileAction('save-as')}>
              <Save className="w-4 h-4 mr-2" />
              Save As...
              <MenubarShortcut>Ctrl+Shift+S</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => handleFileAction('export')}>
              <Printer className="w-4 h-4 mr-2" />
              Export Results...
              <MenubarShortcut>Ctrl+E</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => handleFileAction('recent')}>
              Recent Files
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* Edit Menu */}
        <MenubarMenu>
          <MenubarTrigger className="text-sm font-normal px-2 py-1.5 cursor-pointer">
            <Edit3 className="w-4 h-4 mr-1.5" />
            Edit
          </MenubarTrigger>
          <MenubarContent align="start" className="min-w-[180px]">
            <MenubarItem onClick={() => handleEditAction('undo')}>
              <Undo className="w-4 h-4 mr-2" />
              Undo
              <MenubarShortcut>Ctrl+Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={() => handleEditAction('redo')}>
              <Redo className="w-4 h-4 mr-2" />
              Redo
              <MenubarShortcut>Ctrl+Y</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => handleEditAction('cut')}>
              <Scissors className="w-4 h-4 mr-2" />
              Cut
              <MenubarShortcut>Ctrl+X</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={() => handleEditAction('copy')}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
              <MenubarShortcut>Ctrl+C</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={() => handleEditAction('paste')}>
              <Copy className="w-4 h-4 mr-2" />
              Paste
              <MenubarShortcut>Ctrl+V</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => handleEditAction('find')}>
              Find in Data...
              <MenubarShortcut>Ctrl+F</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* View Menu */}
        <MenubarMenu>
          <MenubarTrigger className="text-sm font-normal px-2 py-1.5 cursor-pointer">
            <Eye className="w-4 h-4 mr-1.5" />
            View
          </MenubarTrigger>
          <MenubarContent align="start" className="min-w-[200px]">
            <MenubarItem onClick={() => handleViewAction('zoom-in')}>
              <ZoomIn className="w-4 h-4 mr-2" />
              Zoom In
              <MenubarShortcut>Ctrl++</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={() => handleViewAction('zoom-out')}>
              <ZoomOut className="w-4 h-4 mr-2" />
              Zoom Out
              <MenubarShortcut>Ctrl+-</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={() => handleViewAction('reset-zoom')}>
              <Monitor className="w-4 h-4 mr-2" />
              Reset Zoom
              <MenubarShortcut>Ctrl+0</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => handleViewAction('data-view')}>
              <Database className="w-4 h-4 mr-2" />
              Data View
              <MenubarShortcut>F2</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={() => handleViewAction('analysis-view')}>
              <Calculator className="w-4 h-4 mr-2" />
              Analysis View
              <MenubarShortcut>F3</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => handleViewAction('toggle-panels')}>
              Toggle Side Panels
              <MenubarShortcut>F11</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* Tools Menu - This is where our plugin system will go */}
        <MenubarMenu>
          <MenubarTrigger className="text-sm font-normal px-2 py-1.5 cursor-pointer">
            <Wrench className="w-4 h-4 mr-1.5" />
            Tools
          </MenubarTrigger>
          <MenubarContent align="start" className="min-w-[200px]">
            <MenubarItem onClick={onPluginManagerOpen}>
              <Puzzle className="w-4 h-4 mr-2" />
              Plugin Manager...
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => handleViewAction('statistical-tests')}>
              <Calculator className="w-4 h-4 mr-2" />
              Statistical Tests
            </MenubarItem>
            <MenubarItem onClick={() => handleViewAction('data-visualization')}>
              <Monitor className="w-4 h-4 mr-2" />
              Data Visualization
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => handleViewAction('preferences')}>
              <Settings className="w-4 h-4 mr-2" />
              Preferences...
              <MenubarShortcut>Ctrl+,</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* Help Menu */}
        <MenubarMenu>
          <MenubarTrigger className="text-sm font-normal px-2 py-1.5 cursor-pointer">
            <HelpCircle className="w-4 h-4 mr-1.5" />
            Help
          </MenubarTrigger>
          <MenubarContent align="start" className="min-w-[180px]">
            <MenubarItem onClick={() => handleViewAction('user-guide')}>
              <FileText className="w-4 h-4 mr-2" />
              User Guide
              <MenubarShortcut>F1</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={() => handleViewAction('tutorials')}>
              Video Tutorials
            </MenubarItem>
            <MenubarItem onClick={() => handleViewAction('statistical-help')}>
              Statistical Methods Help
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => handleViewAction('keyboard-shortcuts')}>
              Keyboard Shortcuts
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={onAboutOpen}>
              <Info className="w-4 h-4 mr-2" />
              About Nemo
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  )
}