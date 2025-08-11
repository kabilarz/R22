# Nemo - Complete User Guide

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Interface Overview](#interface-overview)
- [File Upload & Management](#file-upload--management)
- [AI-Powered Data Analysis](#ai-powered-data-analysis)
- [SPSS Data Editor](#spss-data-editor)
- [Python Code Sandbox](#python-code-sandbox)
- [Data Visualizations](#data-visualizations)
- [Configuration & Settings](#configuration--settings)
- [Advanced Features](#advanced-features)
- [Tips & Best Practices](#tips--best-practices)
- [Troubleshooting](#troubleshooting)

---

## Getting Started

### First Time Setup

#### Step 1: Access Nemo
1. Open your web browser (Chrome, Firefox, Safari, or Edge recommended)
2. Navigate to the Nemo application URL
3. The application will load with a two-panel interface

#### Step 2: Understand the Interface
- **Left Panel**: File management, tools, and navigation
- **Right Panel**: AI chat interface for data analysis
- **Collapsible Design**: Use the toggle button to expand/collapse the left panel

#### Step 3: Optional AI Configuration
If you want to use AI-powered analysis features:
1. Get a free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click the Settings button (gear icon) in the chat panel
3. Enter your API key and select a model
4. Click "Save Configuration"

> **Note**: You can use Nemo without an API key for data editing and Python analysis, but AI chat features will be unavailable.

---

## Interface Overview

### Main Layout

#### Left Panel Components
- **Files Tab**: Upload and manage datasets
- **Charts Tab**: View automatic data visualizations
- **Python Tab**: Interactive code execution environment
- **Control Icons**: Theme toggle, settings, and help

#### Right Panel Components
- **Chat Header**: Shows selected file and AI model
- **Data Preview**: Quick overview of selected dataset
- **Chat Messages**: Conversation with AI about your data
- **Input Area**: Type questions and send messages

### Navigation Controls

#### Panel Controls
- **Collapse/Expand**: Toggle button to show/hide left panel
- **Tab Switching**: Click tabs to switch between different tools
- **Theme Toggle**: Switch between light and dark modes

#### Keyboard Shortcuts
- **Enter**: Send chat message
- **Shift+Enter**: New line in message input
- **Ctrl+F**: Find data (in SPSS editor)
- **Ctrl+H**: Find and replace (in SPSS editor)

---

## File Upload & Management

### Uploading Files

#### Method 1: Drag and Drop
1. Open the **Files** tab in the left panel
2. Drag your data file from your computer
3. Drop it into the upload area marked "Drop files here or click to browse"
4. Wait for the upload confirmation message

#### Method 2: Browse and Select
1. Click "Browse Files" in the upload area
2. Navigate to your data file using the file dialog
3. Select the file and click "Open"
4. Wait for the upload confirmation message

#### Supported File Formats
- **CSV files** (.csv): Comma-separated values
- **JSON files** (.json): JavaScript Object Notation
- **Excel files** (.xlsx, .xls): Microsoft Excel spreadsheets

### Managing Uploaded Files

#### File Information Display
Each uploaded file shows:
- **File name**: Original filename
- **Data summary**: Number of rows and columns
- **Upload time**: When the file was added
- **File size**: Size of the uploaded file

#### File Actions
- **Select for Chat**: Click on a file to activate AI analysis
- **View Data**: Click the table icon to open SPSS Data Editor
- **Delete File**: Click the trash icon to remove the file

#### File Status Indicators
- **Green checkmark**: Successfully processed
- **Yellow warning**: Processed with warnings
- **Red error**: Failed to process

---

## AI-Powered Data Analysis

### Setting Up AI Features

#### Configuring API Access
1. Click the **Settings** button (gear icon) in the chat panel
2. Enter your Google Gemini API key
3. Select your preferred AI model:
   - **Gemini 1.5 Flash**: Fastest responses, good for general queries
   - **Gemini 1.5 Pro**: Most capable, best for complex analysis
   - **Gemini Pro**: Balanced performance and capability
4. Click "Save Configuration"

#### Model Selection
You can change models anytime using the dropdown in the chat panel:
- Use **Flash** for quick questions and summaries
- Use **Pro** for complex analysis and insights
- Use **Gemini Pro** for balanced performance

### Using AI Chat

#### Starting a Conversation
1. **Upload a dataset** using the file upload area
2. **Select the file** by clicking on it in the Files tab
3. **Read the welcome message** that appears in the chat
4. **Type your question** in the input area at the bottom
5. **Press Enter** or click the Send button

#### Effective Question Types

##### Statistical Queries
- "What's the average value in the price column?"
- "How many unique categories are there?"
- "What's the standard deviation of the sales data?"
- "Show me the correlation between variables X and Y"

##### Pattern Recognition
- "What trends do you see in this data?"
- "Can you identify any seasonal patterns?"
- "What are the most common values in each column?"
- "Are there any obvious outliers?"

##### Comparative Analysis
- "Compare performance between different groups"
- "What's the difference between categories A and B?"
- "Show me the top 10 performers"
- "Which segment has the highest growth rate?"

##### Insight Generation
- "What interesting patterns do you notice?"
- "What recommendations can you make?"
- "What should I investigate further?"
- "What story does this data tell?"

#### Code Generation Requests
- "Generate Python code for frequency analysis"
- "Create a t-test for comparing groups"
- "Write code for descriptive statistics"
- "Show me how to create a correlation matrix"

### Understanding AI Responses

#### Response Components
AI responses typically include:
- **Analysis Summary**: Key findings and insights
- **Statistical Results**: Numerical results and calculations
- **Visualizations**: Descriptions of patterns and trends
- **Recommendations**: Suggested next steps or investigations
- **Code Examples**: Python code for further analysis

#### Markdown Formatting
Responses are formatted with:
- **Headers**: For organizing information
- **Lists**: For multiple points or findings
- **Code blocks**: For Python code examples
- **Tables**: For structured data presentation
- **Emphasis**: For highlighting important points

---

## SPSS Data Editor

The SPSS Data Editor provides professional-grade data editing capabilities similar to IBM SPSS Statistics.

### Accessing the Data Editor

#### Opening the Editor
1. Upload a data file to the Files tab
2. Click the **table icon** next to the file name
3. The editor opens in full-screen mode
4. Use the **X button** in the top-right to close and return

### Data View Tab

#### Interface Overview
- **Row numbers**: Displayed in the leftmost column
- **Column headers**: Variable names with Excel-style letters (A, B, C...)
- **Data cells**: Individual data values that can be edited
- **Scrollbars**: Horizontal and vertical for large datasets

#### Editing Data

##### Cell Editing
1. **Click on any cell** to select it
2. **Double-click or press Enter** to start editing
3. **Type the new value**
4. **Press Enter** to confirm changes
5. **Press Escape** to cancel editing

##### Navigation Methods
- **Arrow keys**: Move between cells
- **Tab/Shift+Tab**: Move horizontally
- **Enter**: Move to next row
- **Page Up/Down**: Navigate quickly through rows
- **Home/End**: Jump to beginning/end of row

#### Adding and Deleting Data

##### Adding Rows (Cases)
1. Click the **"+" button** next to "Cases"
2. New row appears at the bottom of the data
3. Enter data in the new row
4. Row is automatically saved

##### Deleting Rows
1. **Click the row number** to select entire row
2. Click the **"-" button** next to "Cases"
3. Confirm deletion in the dialog
4. Row is permanently removed

##### Adding Variables (Columns)
1. Click the **"+" button** next to "Variables"
2. New column appears on the right
3. Configure variable properties in Variable View
4. Start entering data in the new column

##### Deleting Variables
1. **Click the column header** to select entire column
2. Click the **"-" button** next to "Variables"  
3. Confirm deletion in the dialog
4. Column and all data is permanently removed

### Variable View Tab

#### Variable Properties
The Variable View allows you to configure metadata for each variable:

##### Basic Properties
- **Name**: Variable identifier (no spaces, starts with letter)
- **Type**: Data type (Numeric, String, Date)
- **Width**: Display width for the variable
- **Decimals**: Number of decimal places (for numeric variables)

##### Display Properties  
- **Label**: Descriptive name for the variable
- **Values**: Labels for numeric codes (e.g., 1=Male, 2=Female)
- **Missing**: Specify which values represent missing data
- **Columns**: Display width in Data View

##### Statistical Properties
- **Align**: Text alignment (Left, Center, Right)
- **Measure**: Measurement scale:
  - **Scale**: Continuous numeric data
  - **Ordinal**: Ordered categories
  - **Nominal**: Unordered categories
- **Role**: Variable role in analysis (Input, Target, Both, etc.)

#### Configuring Variables

##### Setting Data Types
1. **Click in the Type column** for a variable
2. **Select from dropdown**:
   - **Numeric**: Numbers (integers and decimals)
   - **String**: Text data
   - **Date**: Date and time values
3. **Configure additional properties** as needed

##### Adding Value Labels
1. **Click in the Values column** for a variable
2. **Click the "..." button** to open the Values dialog
3. **Add value-label pairs** (e.g., 1 = "Strongly Disagree")
4. **Click OK** to save

##### Setting Missing Values
1. **Click in the Missing column** for a variable
2. **Choose missing value type**:
   - **None**: No missing values defined
   - **Discrete**: Specific values (e.g., -99, -88)
   - **Range**: Range of values (e.g., -99 to -90)
3. **Enter the missing value codes**

### Search and Replace Functions

#### Find Function (Ctrl+F)
1. **Press Ctrl+F** or use the Find button
2. **Enter search term** in the dialog
3. **Configure options**:
   - **Case sensitive**: Match exact case
   - **Whole cell**: Match entire cell contents
4. **Use navigation buttons**:
   - **Next**: Find next occurrence
   - **Previous**: Find previous occurrence

#### Find and Replace (Ctrl+H)
1. **Press Ctrl+H** or use the Replace button
2. **Enter search term** in "Find" field
3. **Enter replacement** in "Replace" field
4. **Configure options** as needed
5. **Choose replacement method**:
   - **Replace**: Replace current match
   - **Replace All**: Replace all occurrences at once

### Exporting Data

#### CSV Export
1. **Make any desired edits** to your data
2. **Click "Export CSV"** button in the toolbar
3. **Choose file location** and name
4. **Click Save** to download the file

The exported file includes:
- All current data values
- Variable names as headers
- Proper CSV formatting
- Any edits made in the editor

---

## Python Code Sandbox

The Python Sandbox provides an interactive environment for statistical analysis and custom data processing.

### Accessing the Sandbox

#### Opening Python Environment
1. **Click the "Python" tab** in the left panel
2. The sandbox opens with:
   - **Code editor**: Syntax-highlighted Python editor
   - **Template selector**: Pre-built analysis templates
   - **Run button**: Execute code with uploaded data
   - **Results area**: Output and error display

### Using Templates

#### Available Templates

##### Frequency Analysis Template
```python
# Frequency Analysis
for column in df.select_dtypes(include=['object', 'category']).columns:
    print(f"\n{column} - Frequency Distribution:")
    print(df[column].value_counts())
    print(f"Missing values: {df[column].isnull().sum()}")
```

**Use for:**
- Analyzing categorical data distributions
- Counting unique values in text columns
- Identifying missing data patterns

##### Descriptive Statistics Template
```python
# Descriptive Statistics
print("Dataset Shape:", df.shape)
print("\nData Types:")
print(df.dtypes)
print("\nDescriptive Statistics:")
print(df.describe(include='all'))
print("\nMissing Values:")
print(df.isnull().sum())
```

**Use for:**
- Getting overview of dataset structure
- Computing summary statistics
- Understanding data types and quality

##### T-Test Analysis Template
```python
# T-Test Analysis
import scipy.stats as stats

numeric_columns = df.select_dtypes(include=[np.number]).columns
if len(numeric_columns) >= 2:
    col1, col2 = numeric_columns[0], numeric_columns[1]
    statistic, p_value = stats.ttest_ind(df[col1].dropna(), df[col2].dropna())
    print(f"T-test between {col1} and {col2}:")
    print(f"Statistic: {statistic:.4f}")
    print(f"P-value: {p_value:.4f}")
    print(f"Significant: {'Yes' if p_value < 0.05 else 'No'}")
```

**Use for:**
- Comparing means between two groups
- Statistical hypothesis testing
- Determining statistical significance

#### Loading Templates
1. **Click "Load Template"** dropdown
2. **Select desired template** from the list
3. **Template code loads** into the editor
4. **Modify as needed** for your analysis
5. **Click "Run Code"** to execute

### Writing Custom Code

#### Available Libraries
The sandbox includes popular data science libraries:
- **pandas**: Data manipulation and analysis (`pd`)
- **numpy**: Numerical computing (`np`)
- **matplotlib**: Plotting and visualization (`plt`)
- **seaborn**: Statistical visualization (`sns`)
- **scipy**: Scientific computing (`stats`, `optimize`, etc.)

#### Accessing Your Data
Your uploaded data is automatically available as:
```python
df  # pandas DataFrame with your data
```

#### Basic Data Exploration
```python
# View data structure
print(df.info())
print(df.head())

# Check for missing values
print(df.isnull().sum())

# Get column names
print(df.columns.tolist())

# Basic statistics
print(df.describe())
```

#### Creating Visualizations
```python
import matplotlib.pyplot as plt
import seaborn as sns

# Simple histogram
plt.figure(figsize=(10, 6))
df['column_name'].hist(bins=20)
plt.title('Distribution of Column Name')
plt.show()

# Correlation heatmap
plt.figure(figsize=(12, 8))
numeric_df = df.select_dtypes(include=[np.number])
sns.heatmap(numeric_df.corr(), annot=True, cmap='coolwarm', center=0)
plt.title('Correlation Matrix')
plt.show()
```

### Running Code

#### Execution Process
1. **Write or load code** in the editor
2. **Click "Run Code"** button
3. **Wait for execution** (may take a few seconds)
4. **View results** in the output area
5. **Check for errors** if code fails

#### Understanding Output
- **Standard Output**: Print statements and results
- **Error Messages**: Python errors and traceback
- **Execution Time**: How long the code took to run
- **Exit Code**: 0 for success, non-zero for errors

#### Error Handling
Common errors and solutions:
- **NameError**: Variable not defined - check spelling
- **KeyError**: Column doesn't exist - check column names
- **ImportError**: Library not available - use included libraries only
- **SyntaxError**: Invalid Python syntax - check code carefully

### Advanced Analysis Examples

#### Statistical Analysis
```python
# Correlation analysis
correlations = df.corr()
print("Strong correlations (>0.7):")
for i in range(len(correlations.columns)):
    for j in range(i+1, len(correlations.columns)):
        if abs(correlations.iloc[i, j]) > 0.7:
            print(f"{correlations.columns[i]} - {correlations.columns[j]}: {correlations.iloc[i, j]:.3f}")

# Outlier detection using IQR method
def find_outliers(series):
    Q1 = series.quantile(0.25)
    Q3 = series.quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    return series[(series < lower_bound) | (series > upper_bound)]

# Apply to numeric columns
for col in df.select_dtypes(include=[np.number]).columns:
    outliers = find_outliers(df[col])
    if len(outliers) > 0:
        print(f"\n{col} outliers: {len(outliers)} values")
        print(outliers.values[:5])  # Show first 5 outliers
```

#### Data Visualization
```python
# Create multiple subplots
fig, axes = plt.subplots(2, 2, figsize=(15, 10))

# Distribution plot
df['numeric_column'].hist(ax=axes[0, 0], bins=20)
axes[0, 0].set_title('Distribution')

# Box plot
df.boxplot(column='numeric_column', ax=axes[0, 1])
axes[0, 1].set_title('Box Plot')

# Scatter plot
df.plot.scatter(x='column1', y='column2', ax=axes[1, 0])
axes[1, 0].set_title('Scatter Plot')

# Bar chart for categories
df['category_column'].value_counts().plot.bar(ax=axes[1, 1])
axes[1, 1].set_title('Category Counts')

plt.tight_layout()
plt.show()
```

---

## Data Visualizations

### Accessing Charts

#### Chart Generation
1. **Upload a data file** to the Files tab
2. **Click the "Charts" tab** in the left panel
3. **Charts are automatically generated** based on data types
4. **Scroll through different visualizations**

#### Types of Automatic Charts

##### Statistical Summary
- **Data overview**: Rows, columns, file size
- **Column types**: Numeric, text, date breakdown  
- **Missing values**: Count and percentage
- **Sample data**: First few rows preview

##### Numeric Data Visualizations
- **Bar charts**: For numeric columns with reasonable value ranges
- **Histograms**: Distribution of continuous variables
- **Summary statistics**: Mean, median, standard deviation
- **Percentile information**: Min, 25th, 50th, 75th, max

##### Categorical Data Visualizations
- **Pie charts**: Distribution of categories (for columns with ≤10 categories)
- **Bar charts**: Frequency count for each category
- **Top categories**: Most common values
- **Unique count**: Number of distinct values

##### Date/Time Visualizations
- **Line charts**: Time series trends (when date columns detected)
- **Date range**: Earliest and latest dates
- **Temporal patterns**: Distribution over time periods

#### Interactive Features
- **Responsive design**: Charts adapt to screen size
- **Color coding**: Consistent colors across related charts
- **Hover information**: Additional details on chart elements
- **Legend**: Clear labeling of chart components

### Interpreting Visualizations

#### Statistical Insights
Look for:
- **Distribution shapes**: Normal, skewed, bimodal patterns
- **Outliers**: Values far from typical range
- **Missing data**: Gaps that need attention
- **Data quality**: Inconsistencies or errors

#### Pattern Recognition
Identify:
- **Trends**: Increasing, decreasing, or stable patterns
- **Seasonality**: Regular recurring patterns
- **Correlations**: Relationships between variables
- **Clustering**: Groups of similar values

---

## Configuration & Settings

### AI Configuration

#### API Key Management
1. **Click Settings button** (gear icon) in chat panel
2. **Enter API key** from Google AI Studio
3. **Test connection** by asking a simple question
4. **Update key** anytime using the same dialog

#### Model Selection
Choose based on your needs:
- **Gemini 1.5 Flash**: 
  - Fastest responses (< 2 seconds)
  - Good for simple queries and summaries
  - Lower token usage
- **Gemini 1.5 Pro**:
  - Most sophisticated analysis
  - Better for complex insights
  - Higher accuracy for technical questions
- **Gemini Pro**:
  - Balanced speed and capability
  - Good general-purpose model

### Interface Customization

#### Theme Selection
- **Light Mode**: High contrast, good for bright environments
- **Dark Mode**: Easier on eyes, good for low-light use
- **Auto**: Follows system preference
- **Toggle**: Click sun/moon icon to switch instantly

#### Panel Layout
- **Expanded**: Full left panel with labels and details
- **Collapsed**: Icon-only left panel for more chat space
- **Toggle**: Click menu button to switch modes
- **Responsive**: Automatically adapts to screen size

### Data Preferences

#### File Handling
Settings are automatically configured:
- **Auto-detection**: File types detected from extension
- **Error handling**: Graceful handling of parsing errors
- **Memory management**: Efficient storage of large files
- **Format conversion**: Automatic standardization

#### Display Options
- **Row limits**: Large datasets show manageable previews
- **Column formatting**: Automatic width adjustment
- **Date parsing**: Intelligent date format recognition
- **Number formatting**: Appropriate decimal places

---

## Advanced Features

### Batch Processing

#### Multiple File Analysis
1. **Upload several files** to the Files tab
2. **Switch between files** by clicking on different ones
3. **Compare datasets** by asking questions about similarities/differences
4. **Combine insights** from multiple data sources

#### Cross-File Queries
Examples of multi-file questions:
- "How does this dataset compare to the previous one?"
- "What patterns are consistent across all my files?"
- "Which dataset has the most complete data?"

### Complex Analysis Workflows

#### Step-by-Step Analysis
1. **Upload data** and get initial summary
2. **Clean data** using SPSS editor
3. **Explore patterns** with AI chat
4. **Run statistical tests** in Python sandbox  
5. **Generate reports** from chat history
6. **Export results** as needed

#### Research Methodology
- **Exploratory Data Analysis**: Start with summary statistics and visualizations
- **Hypothesis Formation**: Use AI to identify interesting patterns
- **Statistical Testing**: Validate findings with Python analysis
- **Interpretation**: Get AI insights on statistical results
- **Documentation**: Save important findings and code

### Collaboration Features

#### Sharing Results
- **Export data**: Download cleaned datasets as CSV
- **Copy chat**: Select and copy AI responses for reports
- **Save code**: Copy Python code for external use
- **Screenshot charts**: Capture visualizations for presentations

#### Documentation
- **Chat history**: Maintains conversation for reference
- **Version tracking**: See data changes over time
- **Analysis log**: Record of all processing steps

---

## Tips & Best Practices

### Data Preparation

#### Before Uploading
- **Clean data**: Remove unnecessary columns and fix obvious errors
- **Consistent formatting**: Use standard date formats and number representations
- **Column headers**: Use clear, descriptive variable names
- **File size**: Keep files under 100MB for optimal performance

#### File Organization
- **Meaningful names**: Use descriptive filenames
- **Version control**: Include dates or version numbers in names
- **Format choice**: CSV is often the most reliable format
- **Backup originals**: Keep copies of raw data files

### Effective AI Interaction

#### Question Techniques
- **Be specific**: "What's the correlation between sales and marketing spend?" vs "Analyze this data"
- **Ask follow-ups**: Build on previous responses with deeper questions
- **Request examples**: "Can you show me Python code for this analysis?"
- **Seek interpretation**: "What does this pattern mean for my business?"

#### Progressive Analysis
1. **Start broad**: "Summarize this dataset"
2. **Get specific**: "Focus on the top 10 customers"
3. **Go deeper**: "What factors drive their high performance?"
4. **Take action**: "What strategies would you recommend?"

### SPSS Editor Efficiency

#### Navigation Shortcuts
- **Use keyboard**: Arrow keys are faster than mouse clicking
- **Batch editing**: Select multiple cells for simultaneous changes
- **Copy/paste**: Use Ctrl+C and Ctrl+V for data entry
- **Find/replace**: Use for systematic data cleaning

#### Data Quality
- **Check for duplicates**: Use Python to find duplicate rows
- **Validate ranges**: Ensure values are within expected bounds
- **Consistent categories**: Standardize categorical variables
- **Handle missing data**: Decide on strategy before analysis

### Python Code Best Practices

#### Code Organization
- **Comment your code**: Explain what each section does
- **Use functions**: Break complex analysis into reusable functions
- **Test incrementally**: Run small sections before running entire analysis
- **Error handling**: Use try/except blocks for robust code

#### Performance Tips
- **Filter early**: Reduce data size before complex operations
- **Use vectorized operations**: Pandas methods are faster than loops
- **Monitor memory**: Be aware of large intermediate results
- **Sample large data**: Test with subsets before full analysis

### Troubleshooting Common Issues

#### Upload Problems
- **Check format**: Ensure file is CSV, JSON, or Excel
- **Verify encoding**: Use UTF-8 encoding when possible
- **Reduce size**: Try with smaller file first
- **Clear cache**: Refresh browser if uploads fail

#### AI Response Issues
- **Check API key**: Ensure key is valid and has quota remaining
- **Simplify question**: Try shorter, more direct queries
- **Select data**: Make sure a file is selected before asking
- **Wait for response**: Allow time for processing

#### Performance Issues
- **Close other tabs**: Free up browser memory
- **Restart browser**: Clear temporary data
- **Try smaller data**: Test with subset of large files
- **Check system resources**: Ensure adequate RAM and CPU

---

## Troubleshooting

### Common Issues and Solutions

#### File Upload Issues

##### "File format not supported"
**Solution:**
1. Check file extension (.csv, .json, .xlsx, .xls only)
2. Try saving in a different format
3. Open file in text editor to verify content

##### "File too large" 
**Solution:**
1. Reduce file size to under 100MB
2. Remove unnecessary columns
3. Filter to relevant rows only
4. Try with sample of data first

##### "Parse error" or corrupted data
**Solution:**
1. Check file encoding (should be UTF-8)
2. Verify CSV delimiter (comma vs semicolon)
3. Look for special characters or formatting issues
4. Try opening file in Excel first to verify structure

#### AI Chat Issues

##### "API key not configured"
**Solution:**
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click Settings button in chat panel
3. Enter key and click "Save Configuration"
4. Try asking a simple question to test

##### "Rate limit exceeded"
**Solution:**
1. Wait a few minutes before trying again
2. Check usage limits in Google AI Studio
3. Consider upgrading to paid tier for higher limits
4. Try asking fewer or simpler questions

##### AI responses are unhelpful or incorrect
**Solution:**
1. Try rephrasing your question more specifically
2. Switch to a more capable model (Gemini 1.5 Pro)
3. Provide more context in your question
4. Break complex questions into smaller parts

#### SPSS Data Editor Issues

##### Editor opens but data doesn't show
**Solution:**
1. Refresh the browser page
2. Try with a smaller dataset
3. Check if file uploaded successfully
4. Close and reopen the data editor

##### Navigation is slow or unresponsive
**Solution:**
1. Use keyboard navigation instead of mouse
2. Close other browser tabs to free memory
3. Try with a smaller dataset
4. Restart browser if problem persists

##### Can't edit cells or changes don't save
**Solution:**
1. Double-click cell to enter edit mode
2. Press Enter to confirm changes
3. Check if data is very large (may cause delays)
4. Try refreshing and reopening editor

#### Python Sandbox Issues

##### "Python not found" or execution fails
**Solution:**
1. Install Python 3.7+ on your computer
2. Make sure Python is in system PATH
3. Install required libraries: `pip install pandas numpy matplotlib seaborn scipy`
4. Restart the browser after Python installation

##### Code runs but no output appears
**Solution:**
1. Add print statements to see results
2. Check for syntax errors in code
3. Verify data is loaded (try `print(df.head())`)
4. Look for error messages in output area

##### ImportError for libraries
**Solution:**
1. Use only pre-imported libraries (pandas, numpy, matplotlib, seaborn, scipy)
2. Check library names are correct (`pd` for pandas, `np` for numpy)
3. Don't try to install additional libraries
4. Use alternative methods with available libraries

### Performance Troubleshooting

#### Application loads slowly
**Solutions:**
1. Check internet connection speed
2. Clear browser cache and cookies
3. Disable browser extensions temporarily
4. Try using a different browser
5. Close unnecessary browser tabs

#### Large file processing is slow
**Solutions:**
1. Break large files into smaller chunks
2. Remove unnecessary columns before upload
3. Filter data to relevant subset
4. Use more powerful computer if available
5. Process data in stages rather than all at once

#### Browser crashes or freezes
**Solutions:**
1. Reduce dataset size
2. Close other applications to free memory
3. Use browser task manager to identify memory usage
4. Restart browser and try again
5. Try using a different browser

### Getting Additional Help

#### Self-Help Resources
1. **Review this User Guide** for detailed instructions
2. **Check the FAQ** for common questions
3. **Try with sample data** to isolate issues
4. **Test basic functionality** before complex analysis

#### System Requirements Check
- **Browser**: Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **Internet**: Stable connection for AI features
- **Memory**: At least 4GB RAM recommended for large datasets
- **Python**: Version 3.7+ for code execution features

#### Diagnostic Steps
1. **Test with small file**: Verify basic functionality works
2. **Check browser console**: Look for error messages (F12 key)
3. **Try incognito/private mode**: Rule out extension conflicts
4. **Clear browser data**: Remove cached files and cookies
5. **Update browser**: Ensure you have the latest version

Remember: Nemo is designed to be user-friendly and robust. Most issues can be resolved by refreshing the page, using smaller datasets, or checking your API configuration. The application works best with clean, well-structured data files under 100MB.