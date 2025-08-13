"""
DuckDB data store operations for the statistical analysis app.
Handles database initialization, dataset storage, variable metadata, and analysis logging.
"""

import duckdb
import pandas as pd
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
import json

# Database and data paths
DATA_DIR = Path(__file__).parent / "data"
DATASETS_DIR = Path(__file__).parent / "datasets"
DB_PATH = DATA_DIR / "app.duckdb"

def ensure_directories():
    """Ensure data and datasets directories exist."""
    DATA_DIR.mkdir(exist_ok=True)
    DATASETS_DIR.mkdir(exist_ok=True)

def get_connection():
    """Get a DuckDB connection."""
    ensure_directories()
    return duckdb.connect(str(DB_PATH))

def init_store() -> None:
    """Initialize DuckDB database with required tables."""
    ensure_directories()
    
    conn = get_connection()
    try:
        # Create datasets table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS datasets (
                dataset_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                path TEXT NOT NULL,
                n_rows BIGINT NOT NULL,
                created_at TIMESTAMP DEFAULT now()
            )
        """)
        
        # Create variables table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS variables (
                dataset_id TEXT NOT NULL,
                name TEXT NOT NULL,
                type TEXT,
                label TEXT,
                measure TEXT,
                role TEXT,
                missing TEXT,
                PRIMARY KEY (dataset_id, name)
            )
        """)
        
        # Create chats table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS chats (
                chat_id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT now()
            )
        """)
        
        # Create runs table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS runs (
                run_id TEXT PRIMARY KEY,
                chat_id TEXT NOT NULL,
                dataset_id TEXT NOT NULL,
                analysis TEXT NOT NULL,
                params JSON NOT NULL,
                result JSON NOT NULL,
                created_at TIMESTAMP DEFAULT now()
            )
        """)
        
        print("Database initialized successfully")
        
    finally:
        conn.close()

def start_chat(title: str) -> str:
    """Create a new chat session and return chat_id."""
    chat_id = str(uuid.uuid4())
    
    conn = get_connection()
    try:
        conn.execute(
            "INSERT INTO chats (chat_id, title) VALUES (?, ?)",
            [chat_id, title]
        )
        return chat_id
    finally:
        conn.close()

def save_dataset(df: pd.DataFrame, name: str) -> str:
    """
    Save dataset as Parquet file and create DuckDB view.
    Returns dataset_id.
    """
    dataset_id = str(uuid.uuid4())
    parquet_path = DATASETS_DIR / f"{dataset_id}.parquet"
    
    # Save as Parquet
    df.to_parquet(parquet_path, index=False)
    
    conn = get_connection()
    try:
        # Insert into datasets table
        conn.execute(
            "INSERT INTO datasets (dataset_id, name, path, n_rows) VALUES (?, ?, ?, ?)",
            [dataset_id, name, str(parquet_path), len(df)]
        )
        
        # Create DuckDB view
        view_name = f"v_{dataset_id.replace('-', '_')}"
        conn.execute(f"CREATE OR REPLACE VIEW {view_name} AS SELECT * FROM '{parquet_path}'")
        
        return dataset_id
        
    finally:
        conn.close()

def upsert_variables(dataset_id: str, variables: List[Dict[str, Any]]) -> None:
    """Update or insert variable metadata for a dataset."""
    conn = get_connection()
    try:
        # Delete existing variables for this dataset
        conn.execute("DELETE FROM variables WHERE dataset_id = ?", [dataset_id])
        
        # Insert new variables
        for var in variables:
            conn.execute("""
                INSERT INTO variables (dataset_id, name, type, label, measure, role, missing)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, [
                dataset_id,
                var.get('name', ''),
                var.get('type', ''),
                var.get('label', ''),
                var.get('measure', ''),
                var.get('role', ''),
                var.get('missing', '')
            ])
            
    finally:
        conn.close()

def get_variables(dataset_id: str) -> List[Dict[str, Any]]:
    """Get variable metadata for a dataset."""
    conn = get_connection()
    try:
        result = conn.execute(
            "SELECT name, type, label, measure, role, missing FROM variables WHERE dataset_id = ?",
            [dataset_id]
        ).fetchall()
        
        return [
            {
                'name': row[0],
                'type': row[1],
                'label': row[2],
                'measure': row[3],
                'role': row[4],
                'missing': row[5]
            }
            for row in result
        ]
    finally:
        conn.close()

def get_dataset_info(dataset_id: str) -> Optional[Dict[str, Any]]:
    """Get dataset information."""
    conn = get_connection()
    try:
        result = conn.execute(
            "SELECT dataset_id, name, path, n_rows, created_at FROM datasets WHERE dataset_id = ?",
            [dataset_id]
        ).fetchone()
        
        if result:
            return {
                'dataset_id': result[0],
                'name': result[1],
                'path': result[2],
                'n_rows': result[3],
                'created_at': result[4]
            }
        return None
    finally:
        conn.close()

def log_run(chat_id: str, dataset_id: str, analysis: str, params_dict: Dict[str, Any], result_dict: Dict[str, Any]) -> str:
    """Log an analysis run and return run_id."""
    run_id = str(uuid.uuid4())
    
    conn = get_connection()
    try:
        conn.execute("""
            INSERT INTO runs (run_id, chat_id, dataset_id, analysis, params, result)
            VALUES (?, ?, ?, ?, ?, ?)
        """, [
            run_id,
            chat_id,
            dataset_id,
            analysis,
            json.dumps(params_dict),
            json.dumps(result_dict)
        ])
        return run_id
    finally:
        conn.close()

def get_chat_history(chat_id: str) -> List[Dict[str, Any]]:
    """Retrieve past runs for a chat."""
    conn = get_connection()
    try:
        result = conn.execute("""
            SELECT run_id, analysis, params, result, created_at
            FROM runs
            WHERE chat_id = ?
            ORDER BY created_at
        """, [chat_id]).fetchall()
        
        return [
            {
                'run_id': row[0],
                'analysis': row[1],
                'params': json.loads(row[2]) if row[2] else {},
                'result': json.loads(row[3]) if row[3] else {},
                'created_at': row[4]
            }
            for row in result
        ]
    finally:
        conn.close()

def get_all_datasets() -> List[Dict[str, Any]]:
    """Get all datasets."""
    conn = get_connection()
    try:
        result = conn.execute(
            "SELECT dataset_id, name, n_rows, created_at FROM datasets ORDER BY created_at DESC"
        ).fetchall()
        
        return [
            {
                'dataset_id': row[0],
                'name': row[1],
                'n_rows': row[2],
                'created_at': row[3]
            }
            for row in result
        ]
    finally:
        conn.close()

def query_dataset(dataset_id: str, query: str) -> pd.DataFrame:
    """Execute a query against a dataset view."""
    view_name = f"v_{dataset_id.replace('-', '_')}"
    
    conn = get_connection()
    try:
        # Replace placeholder with actual view name
        query = query.replace(f"v_{dataset_id}", view_name)
        result = conn.execute(query).fetchdf()
        return result
    finally:
        conn.close()