"""
ERROR HANDLING STANDARDS FOR NEMO MEDICAL AI PLATFORM
======================================================

This module provides standardized error handling patterns for all components.
"""

import logging
import traceback
from typing import Dict, Any, Optional
from datetime import datetime

class NemoErrorHandler:
    """Centralized error handling for medical data analysis"""
    
    def __init__(self, component_name: str):
        self.component_name = component_name
        self.logger = self._setup_logger()
    
    def _setup_logger(self) -> logging.Logger:
        """Setup component-specific logger"""
        logger = logging.getLogger(f"nemo.{self.component_name}")
        logger.setLevel(logging.INFO)
        
        if not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)
        
        return logger
    
    def handle_medical_data_error(self, error: Exception, context: str) -> Dict[str, Any]:
        """Handle medical data processing errors"""
        error_response = {
            "success": False,
            "error_type": "medical_data_error",
            "error_message": str(error),
            "context": context,
            "timestamp": datetime.now().isoformat(),
            "component": self.component_name
        }
        
        self.logger.error(f"Medical data error in {context}: {error}")
        self.logger.debug(traceback.format_exc())
        
        return error_response
    
    def handle_statistical_analysis_error(self, error: Exception, test_name: str) -> Dict[str, Any]:
        """Handle statistical analysis errors"""
        error_response = {
            "success": False,
            "error_type": "statistical_analysis_error",
            "test_name": test_name,
            "error_message": str(error),
            "timestamp": datetime.now().isoformat(),
            "component": self.component_name,
            "recommendations": self._get_statistical_error_recommendations(error, test_name)
        }
        
        self.logger.error(f"Statistical analysis error in {test_name}: {error}")
        
        return error_response
    
    def handle_ai_service_error(self, error: Exception, model_name: str) -> Dict[str, Any]:
        """Handle AI service errors with fallback suggestions"""
        error_response = {
            "success": False,
            "error_type": "ai_service_error",
            "model_name": model_name,
            "error_message": str(error),
            "timestamp": datetime.now().isoformat(),
            "component": self.component_name,
            "fallback_available": True,
            "recommendations": "Consider using cloud AI fallback or local alternative model"
        }
        
        self.logger.warning(f"AI service error with {model_name}: {error}")
        
        return error_response
    
    def _get_statistical_error_recommendations(self, error: Exception, test_name: str) -> str:
        """Provide medical researcher-friendly error recommendations"""
        error_msg = str(error).lower()
        
        if "sample size" in error_msg or "insufficient" in error_msg:
            return f"Insufficient sample size for {test_name}. Consider using non-parametric alternatives or collecting more data."
        elif "normality" in error_msg:
            return f"Data may not meet normality assumptions for {test_name}. Consider Shapiro-Wilk test or non-parametric alternatives."
        elif "missing" in error_msg or "nan" in error_msg:
            return f"Missing data detected in {test_name}. Review data completeness or consider imputation methods."
        elif "convergence" in error_msg:
            return f"Model convergence issue in {test_name}. Check for multicollinearity or consider regularization."
        else:
            return f"Review data quality and test assumptions for {test_name}. Check documentation for requirements."

# Global error handler instances for each component
backend_error_handler = NemoErrorHandler("backend")
frontend_error_handler = NemoErrorHandler("frontend") 
ai_error_handler = NemoErrorHandler("ai_service")
statistics_error_handler = NemoErrorHandler("statistics")