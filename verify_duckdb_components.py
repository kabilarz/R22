#!/usr/bin/env python3
"""
Quick verification that DuckDB solution components are working
"""

def verify_duckdb_imports():
    """Verify all required imports work"""
    try:
        print("🧪 Verifying DuckDB solution components...")
        
        # Test DuckDB import
        import duckdb
        print("✅ DuckDB imported successfully")
        
        # Test pandas import
        import pandas as pd
        print("✅ Pandas imported successfully")
        
        # Test data_store imports
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
        
        from data_store import get_connection, save_dataset, init_store
        print("✅ Data store functions imported successfully")
        
        # Test enhanced executor
        from enhanced_python_executor import EnhancedPythonExecutor
        print("✅ Enhanced Python executor imported successfully")
        
        # Test database initialization
        init_store()
        print("✅ Database initialized successfully")
        
        # Test database connection
        conn = get_connection()
        conn.close()
        print("✅ Database connection test successful")
        
        print("\n🎉 ALL COMPONENTS VERIFIED!")
        print("💡 DuckDB solution is ready for testing")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Verification error: {e}")
        return False

if __name__ == "__main__":
    verify_duckdb_imports()