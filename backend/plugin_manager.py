"""
Plugin Manager Backend for Nemo Medical AI Platform

This module handles the backend logic for managing statistical test plugins,
including installation, removal, and dependency management.
"""

import json
import importlib
import subprocess
import sys
from typing import Dict, List, Any, Optional
from pathlib import Path
from datetime import datetime

class PluginManagerBackend:
    """Backend plugin management for statistical tests"""
    
    def __init__(self):
        self.plugins_dir = Path("plugins")
        self.plugins_dir.mkdir(exist_ok=True)
        self.installed_plugins_file = self.plugins_dir / "installed.json"
        self.load_installed_plugins()
        
    def load_installed_plugins(self):
        """Load list of installed plugins from storage"""
        if self.installed_plugins_file.exists():
            with open(self.installed_plugins_file, 'r') as f:
                self.installed_plugins = set(json.load(f))
        else:
            # Core plugins are always installed (TOP 10 ESSENTIAL TESTS)
            self.installed_plugins = {
                "descriptive_stats",
                "independent_ttest", 
                "paired_ttest",
                "chi_square",
                "correlation_pearson",
                "mann_whitney",
                "wilcoxon_signed_rank",
                "anova_oneway",
                "fisher_exact",
                "shapiro_wilk"
            }
            self.save_installed_plugins()
    
    def save_installed_plugins(self):
        """Save list of installed plugins to storage"""
        with open(self.installed_plugins_file, 'w') as f:
            json.dump(list(self.installed_plugins), f)
    
    def is_plugin_installed(self, plugin_id: str) -> bool:
        """Check if a plugin is installed"""
        return plugin_id in self.installed_plugins
    
    def get_plugin_dependencies(self, plugin_id: str) -> List[str]:
        """Get dependencies for a plugin"""
        # This would normally read from plugin metadata
        # For now, return hardcoded dependencies
        dependencies = {
            "anova_oneway": [],
            "anova_twoway": [],
            "mann_whitney": [],
            "wilcoxon_signed_rank": [],
            "kaplan_meier": [],
            "cox_regression": ["kaplan_meier"],
            "linear_regression": [],
            "logistic_regression": []
        }
        return dependencies.get(plugin_id, [])
    
    def get_python_requirements(self, plugin_id: str) -> List[str]:
        """Get Python package requirements for a plugin"""
        requirements = {
            "descriptive_stats": ["pandas", "numpy"],
            "independent_ttest": ["scipy"],
            "paired_ttest": ["scipy"],
            "chi_square": ["scipy"],
            "correlation_pearson": ["scipy", "pandas"],
            "anova_oneway": ["scipy", "statsmodels"],
            "anova_twoway": ["statsmodels", "scipy"],
            "mann_whitney": ["scipy"],
            "wilcoxon_signed_rank": ["scipy"],
            "kaplan_meier": ["lifelines"],
            "cox_regression": ["lifelines"],
            "linear_regression": ["sklearn", "statsmodels"],
            "logistic_regression": ["sklearn", "statsmodels"]
        }
        return requirements.get(plugin_id, [])
    
    def check_python_requirements(self, requirements: List[str]) -> Dict[str, bool]:
        """Check if required Python packages are available"""
        availability = {}
        for package in requirements:
            try:
                importlib.import_module(package)
                availability[package] = True
            except ImportError:
                availability[package] = False
        return availability
    
    def install_python_requirements(self, requirements: List[str]) -> bool:
        """Install missing Python packages"""
        try:
            missing_packages = []
            for package in requirements:
                try:
                    importlib.import_module(package)
                except ImportError:
                    missing_packages.append(package)
            
            if missing_packages:
                # Install missing packages
                subprocess.run([
                    sys.executable, "-m", "pip", "install", *missing_packages
                ], check=True, capture_output=True)
                
                # Verify installation
                for package in missing_packages:
                    importlib.import_module(package)
            
            return True
        except (subprocess.CalledProcessError, ImportError) as e:
            print(f"Failed to install requirements: {e}")
            return False
    
    def install_plugin(self, plugin_id: str) -> Dict[str, Any]:
        """Install a statistical test plugin"""
        try:
            # Check if already installed
            if self.is_plugin_installed(plugin_id):
                return {
                    "success": False,
                    "error": "Plugin is already installed"
                }
            
            # Check dependencies
            dependencies = self.get_plugin_dependencies(plugin_id)
            for dep in dependencies:
                if not self.is_plugin_installed(dep):
                    return {
                        "success": False,
                        "error": f"Missing dependency: {dep}. Please install it first."
                    }
            
            # Check and install Python requirements
            requirements = self.get_python_requirements(plugin_id)
            if not self.install_python_requirements(requirements):
                return {
                    "success": False,
                    "error": "Failed to install required Python packages"
                }
            
            # Mark plugin as installed
            self.installed_plugins.add(plugin_id)
            self.save_installed_plugins()
            
            # Import the plugin module to verify it works
            try:
                self.import_plugin_functions(plugin_id)
            except Exception as e:
                # Rollback installation
                self.installed_plugins.discard(plugin_id)
                self.save_installed_plugins()
                return {
                    "success": False,
                    "error": f"Plugin verification failed: {str(e)}"
                }
            
            return {
                "success": True,
                "message": f"Plugin {plugin_id} installed successfully",
                "installed_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Installation failed: {str(e)}"
            }
    
    def uninstall_plugin(self, plugin_id: str) -> Dict[str, Any]:
        """Uninstall a statistical test plugin"""
        try:
            # Check if plugin exists and is installed
            if not self.is_plugin_installed(plugin_id):
                return {
                    "success": False,
                    "error": "Plugin is not installed"
                }
            
            # Check if it's a core plugin (TOP 10 ESSENTIAL TESTS)
            core_plugins = {
                "descriptive_stats", "independent_ttest", "paired_ttest", 
                "chi_square", "correlation_pearson", "mann_whitney",
                "wilcoxon_signed_rank", "anova_oneway", "fisher_exact", "shapiro_wilk"
            }
            if plugin_id in core_plugins:
                return {
                    "success": False,
                    "error": "Cannot uninstall core plugins"
                }
            
            # Check if other plugins depend on this one
            dependent_plugins = []
            for installed_plugin in self.installed_plugins:
                dependencies = self.get_plugin_dependencies(installed_plugin)
                if plugin_id in dependencies:
                    dependent_plugins.append(installed_plugin)
            
            if dependent_plugins:
                return {
                    "success": False,
                    "error": f"Cannot uninstall: {', '.join(dependent_plugins)} depend on this plugin"
                }
            
            # Remove plugin
            self.installed_plugins.discard(plugin_id)
            self.save_installed_plugins()
            
            return {
                "success": True,
                "message": f"Plugin {plugin_id} uninstalled successfully"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Uninstallation failed: {str(e)}"
            }
    
    def import_plugin_functions(self, plugin_id: str):
        """Import and verify plugin functions"""
        # This would normally import actual plugin modules
        # For now, just verify that required libraries are available
        requirements = self.get_python_requirements(plugin_id)
        for package in requirements:
            importlib.import_module(package)
    
    def get_plugin_info(self, plugin_id: str) -> Dict[str, Any]:
        """Get detailed information about a plugin"""
        return {
            "id": plugin_id,
            "is_installed": self.is_plugin_installed(plugin_id),
            "dependencies": self.get_plugin_dependencies(plugin_id),
            "python_requirements": self.get_python_requirements(plugin_id),
            "python_availability": self.check_python_requirements(
                self.get_python_requirements(plugin_id)
            )
        }
    
    def get_all_plugins_status(self) -> Dict[str, Any]:
        """Get status of all available plugins"""
        # Core plugins (always available)
        core_plugin_ids = [
            "descriptive_stats", "independent_ttest", "paired_ttest", 
            "chi_square", "correlation_pearson", "mann_whitney",
            "wilcoxon_signed_rank", "anova_oneway", "fisher_exact", "shapiro_wilk"
        ]
        
        # Optional downloadable plugins
        optional_plugin_ids = [
            "anova_twoway", "repeated_anova", "kruskal_wallis", "friedman_test",
            "kaplan_meier", "cox_regression", "log_rank_test", "linear_regression",
            "logistic_regression", "poisson_regression"
        ]
        
        all_plugin_ids = core_plugin_ids + optional_plugin_ids
        
        return {
            "plugins": {pid: self.get_plugin_info(pid) for pid in all_plugin_ids},
            "installed_count": len(self.installed_plugins),
            "available_count": len(all_plugin_ids) - len(self.installed_plugins),
            "total_count": len(all_plugin_ids)
        }

# Global plugin manager instance
plugin_manager_backend = PluginManagerBackend()