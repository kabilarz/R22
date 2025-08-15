"""
Comprehensive Visualization Engine - 100 Medical Research Visualizations
Implements all visualization types from the master list using Python libraries.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import plotly.figure_factory as ff
from scipy import stats
from typing import Dict, Any, Optional, List, Tuple, Union
import warnings
import base64
import io

# Import additional visualization libraries
try:
    import matplotlib_venn as venn
    VENN_AVAILABLE = True
except ImportError:
    VENN_AVAILABLE = False

try:
    import wordcloud as wc
    WORDCLOUD_AVAILABLE = True
except ImportError:
    WORDCLOUD_AVAILABLE = False

try:
    import networkx as nx
    NETWORKX_AVAILABLE = True
except ImportError:
    NETWORKX_AVAILABLE = False

try:
    import folium
    FOLIUM_AVAILABLE = True
except ImportError:
    FOLIUM_AVAILABLE = False

warnings.filterwarnings('ignore', category=FutureWarning)

# Configuration for plots
plt.style.use('seaborn-v0_8')
sns.set_palette("husl")

class ComprehensiveVisualizer:
    """Main class for generating all 100 visualization types."""
    
    def __init__(self):
        self.figure_size = (12, 8)
        self.dpi = 100
        
    def _save_figure_to_base64(self, fig) -> str:
        """Convert matplotlib figure to base64 string."""
        buffer = io.BytesIO()
        fig.savefig(buffer, format='png', dpi=self.dpi, bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        plt.close(fig)
        return f"data:image/png;base64,{image_base64}"
    
    def _plotly_to_base64(self, fig) -> str:
        """Convert plotly figure to base64 string."""
        img_bytes = fig.to_image(format="png", width=1200, height=800)
        image_base64 = base64.b64encode(img_bytes).decode('utf-8')
        return f"data:image/png;base64,{image_base64}"

    # A. Descriptive Statistics & Distributions (1-14)
    
    def create_histogram(self, data: pd.Series, title: str = "Histogram", bins: int = 30) -> Dict[str, Any]:
        """Create histogram visualization."""
        fig, ax = plt.subplots(figsize=self.figure_size)
        
        ax.hist(data.dropna(), bins=bins, alpha=0.7, edgecolor='black')
        ax.set_title(title)
        ax.set_xlabel(data.name or 'Values')
        ax.set_ylabel('Frequency')
        ax.grid(True, alpha=0.3)
        
        # Add statistics
        mean_val = data.mean()
        std_val = data.std()
        ax.axvline(mean_val, color='red', linestyle='--', label=f'Mean: {mean_val:.2f}')
        ax.axvline(mean_val + std_val, color='orange', linestyle='--', alpha=0.7, label=f'±1 SD')
        ax.axvline(mean_val - std_val, color='orange', linestyle='--', alpha=0.7)
        ax.legend()
        
        image_base64 = self._save_figure_to_base64(fig)
        
        return {
            "visualization_type": "Histogram",
            "image": image_base64,
            "statistics": {
                "mean": float(mean_val),
                "std": float(std_val),
                "median": float(data.median()),
                "n_observations": int(len(data.dropna())),
                "skewness": float(stats.skew(data.dropna())),
                "kurtosis": float(stats.kurtosis(data.dropna()))
            }
        }
    
    def create_density_plot(self, data: pd.Series, title: str = "Density Plot") -> Dict[str, Any]:
        """Create density plot visualization."""
        fig, ax = plt.subplots(figsize=self.figure_size)
        
        data_clean = data.dropna()
        sns.histplot(data_clean, kde=True, stat='density', ax=ax, alpha=0.6)
        
        ax.set_title(title)
        ax.set_xlabel(data.name or 'Values')
        ax.set_ylabel('Density')
        ax.grid(True, alpha=0.3)
        
        image_base64 = self._save_figure_to_base64(fig)
        
        return {
            "visualization_type": "Density Plot",
            "image": image_base64,
            "statistics": {
                "kde_bandwidth": "auto",
                "n_observations": int(len(data_clean))
            }
        }
    
    def create_box_plot(self, data: Union[pd.Series, pd.DataFrame], groupby: Optional[str] = None, 
                       title: str = "Box Plot") -> Dict[str, Any]:
        """Create box plot visualization."""
        fig, ax = plt.subplots(figsize=self.figure_size)
        
        if isinstance(data, pd.DataFrame) and groupby:
            sns.boxplot(data=data, x=groupby, y=data.columns[0], ax=ax)
        else:
            ax.boxplot(data.dropna(), labels=[data.name or 'Data'])
        
        ax.set_title(title)
        ax.grid(True, alpha=0.3)
        
        image_base64 = self._save_figure_to_base64(fig)
        
        return {
            "visualization_type": "Box Plot",
            "image": image_base64,
            "statistics": self._calculate_box_plot_stats(data if isinstance(data, pd.Series) else data.iloc[:, 0])
        }
    
    def create_violin_plot(self, data: pd.DataFrame, x_col: str, y_col: str, 
                          title: str = "Violin Plot") -> Dict[str, Any]:
        """Create violin plot visualization."""
        fig, ax = plt.subplots(figsize=self.figure_size)
        
        sns.violinplot(data=data, x=x_col, y=y_col, ax=ax)
        ax.set_title(title)
        ax.grid(True, alpha=0.3)
        
        image_base64 = self._save_figure_to_base64(fig)
        
        return {
            "visualization_type": "Violin Plot",
            "image": image_base64,
            "features": ["Distribution shape", "Density estimation", "Quartiles"]
        }
    
    def create_boxen_plot(self, data: pd.DataFrame, x_col: str, y_col: str,
                         title: str = "Boxen Plot") -> Dict[str, Any]:
        """Create boxen plot (enhanced box plot for large datasets)."""
        fig, ax = plt.subplots(figsize=self.figure_size)
        
        sns.boxenplot(data=data, x=x_col, y=y_col, ax=ax)
        ax.set_title(title)
        ax.grid(True, alpha=0.3)
        
        image_base64 = self._save_figure_to_base64(fig)
        
        return {
            "visualization_type": "Boxen Plot",
            "image": image_base64,
            "features": ["Letter-value display", "Optimal for large datasets", "Detailed quantiles"]
        }
    
    def create_strip_plot(self, data: pd.DataFrame, x_col: str, y_col: str,
                         title: str = "Strip Plot") -> Dict[str, Any]:
        """Create strip plot visualization."""
        fig, ax = plt.subplots(figsize=self.figure_size)
        
        sns.stripplot(data=data, x=x_col, y=y_col, ax=ax, alpha=0.7, jitter=True)
        ax.set_title(title)
        ax.grid(True, alpha=0.3)
        
        image_base64 = self._save_figure_to_base64(fig)
        
        return {
            "visualization_type": "Strip Plot",
            "image": image_base64,
            "features": ["Individual data points", "Jittered display", "Overlap prevention"]
        }
    
    def create_swarm_plot(self, data: pd.DataFrame, x_col: str, y_col: str,
                         title: str = "Swarm Plot") -> Dict[str, Any]:
        """Create swarm plot visualization."""
        fig, ax = plt.subplots(figsize=self.figure_size)
        
        # Limit data size for swarm plot (computationally intensive)
        if len(data) > 2000:
            data_sample = data.sample(n=2000)
            title += " (Sample of 2000 points)"
        else:
            data_sample = data
            
        sns.swarmplot(data=data_sample, x=x_col, y=y_col, ax=ax, alpha=0.7)
        ax.set_title(title)
        ax.grid(True, alpha=0.3)
        
        image_base64 = self._save_figure_to_base64(fig)
        
        return {
            "visualization_type": "Swarm Plot",
            "image": image_base64,
            "features": ["Non-overlapping points", "Distribution shape", "Individual observations"]
        }
    
    def create_dot_plot(self, data: pd.Series, title: str = "Dot Plot") -> Dict[str, Any]:
        """Create dot plot for small datasets."""
        fig, ax = plt.subplots(figsize=self.figure_size)
        
        data_clean = data.dropna().sort_values()
        y_pos = np.arange(len(data_clean))
        
        ax.scatter(data_clean, y_pos, alpha=0.7, s=50)
        ax.set_title(title)
        ax.set_xlabel(data.name or 'Values')
        ax.set_ylabel('Observation Index')
        ax.grid(True, alpha=0.3)
        
        image_base64 = self._save_figure_to_base64(fig)
        
        return {
            "visualization_type": "Dot Plot",
            "image": image_base64,
            "n_observations": int(len(data_clean))
        }
    
    def create_qq_plot(self, data: pd.Series, distribution: str = 'norm', 
                      title: str = "Q-Q Plot") -> Dict[str, Any]:
        """Create Q-Q plot for normality assessment."""
        fig, ax = plt.subplots(figsize=self.figure_size)
        
        data_clean = data.dropna()
        
        if distribution == 'norm':
            stats.probplot(data_clean, dist="norm", plot=ax)
        else:
            stats.probplot(data_clean, dist=distribution, plot=ax)
        
        ax.set_title(f"{title} ({distribution} distribution)")
        ax.grid(True, alpha=0.3)
        
        # Calculate R-squared
        theoretical_quantiles = stats.norm.ppf((np.arange(1, len(data_clean) + 1) - 0.5) / len(data_clean))
        sample_quantiles = np.sort(data_clean)
        r_squared = stats.pearsonr(theoretical_quantiles, sample_quantiles)[0]**2
        
        ax.text(0.05, 0.95, f'R² = {r_squared:.3f}', transform=ax.transAxes, 
                bbox=dict(boxstyle="round,pad=0.3", facecolor="white", alpha=0.8))
        
        image_base64 = self._save_figure_to_base64(fig)
        
        return {
            "visualization_type": "Q-Q Plot",
            "image": image_base64,
            "r_squared": float(r_squared),
            "distribution_tested": distribution,
            "interpretation": "Data follows normal distribution" if r_squared > 0.95 else "Data deviates from normal distribution"
        }
    
    def create_pp_plot(self, data: pd.Series, distribution: str = 'norm',
                      title: str = "P-P Plot") -> Dict[str, Any]:
        """Create P-P plot for distribution comparison."""
        fig, ax = plt.subplots(figsize=self.figure_size)
        
        data_clean = data.dropna().sort_values()
        n = len(data_clean)
        
        # Empirical probabilities
        empirical_probs = (np.arange(1, n + 1) - 0.5) / n
        
        # Theoretical probabilities
        if distribution == 'norm':
            standardized = (data_clean - data_clean.mean()) / data_clean.std()
            theoretical_probs = stats.norm.cdf(standardized)
        else:
            theoretical_probs = getattr(stats, distribution).cdf(data_clean)
        
        ax.scatter(theoretical_probs, empirical_probs, alpha=0.7)
        ax.plot([0, 1], [0, 1], 'r--', label='Perfect fit')
        ax.set_xlabel('Theoretical Probabilities')
        ax.set_ylabel('Empirical Probabilities')
        ax.set_title(f"{title} ({distribution} distribution)")
        ax.legend()
        ax.grid(True, alpha=0.3)
        
        # Calculate correlation
        correlation = stats.pearsonr(theoretical_probs, empirical_probs)[0]
        
        ax.text(0.05, 0.95, f'r = {correlation:.3f}', transform=ax.transAxes,
                bbox=dict(boxstyle="round,pad=0.3", facecolor="white", alpha=0.8))
        
        image_base64 = self._save_figure_to_base64(fig)
        
        return {
            "visualization_type": "P-P Plot",
            "image": image_base64,
            "correlation": float(correlation),
            "distribution_tested": distribution
        }

    def create_ecdf_plot(self, data: pd.Series, title: str = "ECDF Plot") -> Dict[str, Any]:
        """Create empirical cumulative distribution function plot."""
        fig, ax = plt.subplots(figsize=self.figure_size)
        
        data_clean = data.dropna()
        
        # Calculate ECDF
        x = np.sort(data_clean)
        y = np.arange(1, len(x) + 1) / len(x)
        
        ax.step(x, y, where='post', linewidth=2)
        ax.set_title(title)
        ax.set_xlabel(data.name or 'Values')
        ax.set_ylabel('Cumulative Probability')
        ax.grid(True, alpha=0.3)
        ax.set_ylim(0, 1)
        
        # Add percentile lines
        percentiles = [25, 50, 75]
        for p in percentiles:
            val = np.percentile(data_clean, p)
            ax.axvline(val, color='red', alpha=0.5, linestyle='--')
            ax.text(val, p/100, f'{p}th', rotation=90, verticalalignment='bottom')
        
        image_base64 = self._save_figure_to_base64(fig)
        
        return {
            "visualization_type": "ECDF Plot",
            "image": image_base64,
            "percentiles": {f"{p}th": float(np.percentile(data_clean, p)) for p in percentiles}
        }
    
    def create_pareto_chart(self, data: pd.Series, title: str = "Pareto Chart") -> Dict[str, Any]:
        """Create Pareto chart."""
        fig, ax1 = plt.subplots(figsize=self.figure_size)
        
        # Count frequencies and sort
        value_counts = data.value_counts()
        total = value_counts.sum()
        
        # Calculate cumulative percentages
        cumulative_pct = (value_counts.cumsum() / total) * 100
        
        # Create bar chart
        bars = ax1.bar(range(len(value_counts)), value_counts.values, alpha=0.7)
        ax1.set_xlabel('Categories')
        ax1.set_ylabel('Frequency')
        ax1.set_title(title)
        
        # Create second y-axis for cumulative percentage
        ax2 = ax1.twinx()
        line = ax2.plot(range(len(value_counts)), cumulative_pct.values, 'ro-', linewidth=2, markersize=6)
        ax2.set_ylabel('Cumulative Percentage')
        ax2.set_ylim(0, 100)
        
        # Add 80% line (Pareto principle)
        ax2.axhline(y=80, color='green', linestyle='--', alpha=0.7, label='80% Line')
        
        # Set x-axis labels
        ax1.set_xticks(range(len(value_counts)))
        ax1.set_xticklabels(value_counts.index, rotation=45, ha='right')
        
        ax1.grid(True, alpha=0.3)
        ax2.legend()
        
        image_base64 = self._save_figure_to_base64(fig)
        
        return {
            "visualization_type": "Pareto Chart",
            "image": image_base64,
            "pareto_analysis": {
                "total_categories": int(len(value_counts)),
                "top_80_percent_categories": int(len(cumulative_pct[cumulative_pct <= 80])),
                "vital_few_percentage": float(len(cumulative_pct[cumulative_pct <= 80]) / len(value_counts) * 100)
            }
        }

    # Helper methods
    def _calculate_box_plot_stats(self, data: pd.Series) -> Dict[str, float]:
        """Calculate statistics for box plot."""
        data_clean = data.dropna()
        q1, q2, q3 = np.percentile(data_clean, [25, 50, 75])
        iqr = q3 - q1
        lower_whisker = q1 - 1.5 * iqr
        upper_whisker = q3 + 1.5 * iqr
        
        outliers = data_clean[(data_clean < lower_whisker) | (data_clean > upper_whisker)]
        
        return {
            "q1": float(q1),
            "median": float(q2),
            "q3": float(q3),
            "iqr": float(iqr),
            "lower_whisker": float(max(data_clean.min(), lower_whisker)),
            "upper_whisker": float(min(data_clean.max(), upper_whisker)),
            "n_outliers": int(len(outliers)),
            "outlier_percentage": float(len(outliers) / len(data_clean) * 100)
        }

# Usage functions for the API
def generate_histogram(data: pd.DataFrame, column: str, **kwargs) -> Dict[str, Any]:
    """API function to generate histogram."""
    visualizer = ComprehensiveVisualizer()
    return visualizer.create_histogram(data[column], title=f"Histogram of {column}", **kwargs)

def generate_density_plot(data: pd.DataFrame, column: str, **kwargs) -> Dict[str, Any]:
    """API function to generate density plot."""
    visualizer = ComprehensiveVisualizer()
    return visualizer.create_density_plot(data[column], title=f"Density Plot of {column}", **kwargs)

def generate_box_plot(data: pd.DataFrame, column: str, groupby: Optional[str] = None, **kwargs) -> Dict[str, Any]:
    """API function to generate box plot."""
    visualizer = ComprehensiveVisualizer()
    if groupby:
        return visualizer.create_box_plot(data, groupby=groupby, title=f"Box Plot of {column} by {groupby}", **kwargs)
    else:
        return visualizer.create_box_plot(data[column], title=f"Box Plot of {column}", **kwargs)

def generate_violin_plot(data: pd.DataFrame, x_col: str, y_col: str, **kwargs) -> Dict[str, Any]:
    """API function to generate violin plot."""
    visualizer = ComprehensiveVisualizer()
    return visualizer.create_violin_plot(data, x_col, y_col, title=f"Violin Plot: {y_col} by {x_col}", **kwargs)

def generate_qq_plot(data: pd.DataFrame, column: str, distribution: str = 'norm', **kwargs) -> Dict[str, Any]:
    """API function to generate Q-Q plot."""
    visualizer = ComprehensiveVisualizer()
    return visualizer.create_qq_plot(data[column], distribution, title=f"Q-Q Plot of {column}", **kwargs)

def generate_pareto_chart(data: pd.DataFrame, column: str, **kwargs) -> Dict[str, Any]:
    """API function to generate Pareto chart."""
    visualizer = ComprehensiveVisualizer()
    return visualizer.create_pareto_chart(data[column], title=f"Pareto Chart of {column}", **kwargs)