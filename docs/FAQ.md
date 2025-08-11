# Nemo - Frequently Asked Questions (FAQ)

## 📋 Table of Contents

- [General Questions](#general-questions)
- [Getting Started](#getting-started)
- [File Upload & Data Processing](#file-upload--data-processing)
- [AI Chat & Analysis](#ai-chat--analysis)
- [SPSS Data Editor](#spss-data-editor)
- [Python Code Sandbox](#python-code-sandbox)
- [Troubleshooting](#troubleshooting)
- [Performance & Limitations](#performance--limitations)
- [Configuration & Settings](#configuration--settings)

---

## General Questions

### What is Nemo?
Nemo is a modern, AI-powered data analysis platform that allows you to upload datasets and interact with them using natural language queries. It combines the power of Google Gemini AI with professional data editing tools to provide comprehensive data analysis capabilities.

### What makes Nemo different from other data analysis tools?
- **Natural Language Interface**: Ask questions about your data in plain English
- **SPSS-Style Data Editor**: Professional data editing with Variable and Data views
- **Python Code Sandbox**: Execute Python code directly within the application
- **Real-time AI Analysis**: Get instant insights and statistical analysis
- **Multi-format Support**: Works with CSV, JSON, Excel files
- **No Installation Required**: Runs entirely in your web browser

### Is Nemo free to use?
The core application is free to use. However, you'll need a Google Gemini API key for AI-powered analysis features. You can get a free API key from Google AI Studio with generous usage limits.

### What browsers are supported?
Nemo works best on modern browsers including:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Getting Started

### How do I start using Nemo?
1. **Upload Your Data**: Drag and drop or browse to upload CSV, JSON, or Excel files
2. **Select a File**: Click on any uploaded file to activate the AI chat
3. **Ask Questions**: Use natural language to query your data
4. **Explore Tools**: Use the SPSS Data Editor and Python Sandbox for advanced analysis

### Do I need to install anything?
No! Nemo runs entirely in your web browser. However, for Python code execution, you'll need Python 3.7+ installed on your local machine.

### How do I get a Gemini API key?
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and add it to Nemo's configuration (Settings button in chat panel)

### Can I use Nemo without an API key?
Yes! You can upload files, use the SPSS Data Editor, and run Python code without an API key. However, you won't be able to use the AI chat features.

---

## File Upload & Data Processing

### What file formats are supported?
- **CSV files** (.csv)
- **JSON files** (.json)
- **Excel files** (.xlsx, .xls)

### What's the maximum file size?
Browser-dependent, typically up to 2GB for modern browsers. For optimal performance, we recommend files under 100MB.

### Why isn't my file uploading?
Common issues and solutions:
- **Unsupported format**: Ensure your file is CSV, JSON, or Excel format
- **File too large**: Try with a smaller file first
- **Corrupted file**: Try opening the file in another application first
- **Browser issues**: Try refreshing the page or using a different browser

### How does Nemo handle different data types?
Nemo automatically detects and handles:
- **Numbers**: Integer and decimal values
- **Text**: String data and categories
- **Dates**: Various date formats (YYYY-MM-DD, MM/DD/YYYY, etc.)
- **Boolean**: True/false values
- **Missing Data**: Empty cells, null values, "N/A", etc.

### Can I edit my data after uploading?
Yes! Use the SPSS Data Editor by clicking the table icon next to any uploaded file. You can:
- Edit individual cells
- Add/delete rows and columns
- Configure variable properties
- Set data types and labels
- Export edited data as CSV

---

## AI Chat & Analysis

### What kind of questions can I ask?
You can ask virtually anything about your data:
- **Statistics**: "What's the average age in this dataset?"
- **Trends**: "What trends do you see over time?"
- **Comparisons**: "Compare sales performance by region"
- **Insights**: "What interesting patterns do you notice?"
- **Code Generation**: "Generate Python code for frequency analysis"

### Why am I getting an error when asking questions?
Common issues:
- **No API key**: Configure your Gemini API key in settings
- **No file selected**: Select a file before asking questions
- **API quota exceeded**: Check your Google AI Studio usage limits
- **Network issues**: Check your internet connection

### How accurate are the AI responses?
The AI provides analysis based on your data, but you should always verify important findings. The AI is excellent for:
- Generating statistical summaries
- Identifying patterns and trends
- Creating Python code for analysis
- Providing insights and recommendations

### Can I ask follow-up questions?
Yes! The AI maintains context throughout your conversation about a specific dataset. You can ask follow-up questions and build on previous analyses.

### What AI models are available?
- **Gemini 1.5 Flash** (Default): Fast responses, good for general analysis
- **Gemini 1.5 Pro**: More detailed analysis, better for complex queries
- **Gemini Pro**: Balanced performance and capabilities

---

## SPSS Data Editor

### How do I access the SPSS Data Editor?
Click the table icon next to any uploaded file in the Files tab. This opens a full-screen professional data editor.

### What's the difference between Data View and Variable View?
- **Data View**: Shows your actual data in rows and columns, like a spreadsheet
- **Variable View**: Shows variable properties (data types, labels, formats, etc.)

### How do I navigate the data editor?
- **Arrow Keys**: Move between cells
- **Tab/Shift+Tab**: Navigate horizontally
- **Enter**: Start editing a cell
- **Ctrl+F**: Find data
- **Ctrl+H**: Find and replace

### Can I add or delete rows and columns?
Yes! Use the + and - buttons in the Data View to:
- Add new rows (cases)
- Delete selected rows
- Add new variables (columns)
- Delete variables

### How do I configure variable properties?
Switch to Variable View to set:
- **Data Type**: Numeric, String, Date
- **Label**: Descriptive name for the variable
- **Width/Decimals**: Display formatting
- **Measurement Scale**: Scale, Ordinal, Nominal
- **Missing Values**: Define what represents missing data

### Can I export my edited data?
Yes! Click the "Export CSV" button to download your edited data as a CSV file.

### Why is the navigation slow or unresponsive?
Try these solutions:
- Refresh the browser page
- Use a more powerful device for large datasets
- Break large datasets into smaller chunks
- Use keyboard navigation instead of mouse clicking

---

## Python Code Sandbox

### How do I access the Python Sandbox?
Click the "Python" tab in the left panel to access the interactive Python environment.

### Do I need Python installed?
Yes! You need Python 3.7+ installed on your local machine for code execution to work.

### What libraries are available?
Common data science libraries are pre-imported:
- **pandas**: Data manipulation and analysis
- **numpy**: Numerical computing
- **matplotlib**: Plotting and visualization
- **seaborn**: Statistical visualization
- **scipy**: Scientific computing

### How do I access my uploaded data in Python?
Your uploaded data is automatically available as a pandas DataFrame called `df`. For example:
```python
# View data structure
print(df.info())

# Show first few rows
print(df.head())

# Get summary statistics
print(df.describe())
```

### What templates are available?
Pre-built templates include:
- **Frequency Analysis**: Analyze categorical data distributions
- **Descriptive Statistics**: Comprehensive statistical summaries
- **T-Test Analysis**: Statistical hypothesis testing

### Why isn't my Python code running?
Common issues:
- **Python not installed**: Install Python 3.7+ on your machine
- **No data uploaded**: Upload a file first
- **Syntax errors**: Check your Python code for errors
- **Missing libraries**: Install required packages with pip

### Can I save my Python code?
The code persists in your browser session. For permanent storage, copy and paste your code to a local file.

---

## Troubleshooting

### The application won't load
1. Check your internet connection
2. Try refreshing the page (Ctrl+R or Cmd+R)
3. Clear your browser cache and cookies
4. Try using a different browser
5. Disable browser extensions temporarily

### Files aren't uploading
1. Ensure file format is supported (CSV, JSON, Excel)
2. Check file size (recommended under 100MB)
3. Try uploading a smaller test file first
4. Refresh the page and try again

### AI chat isn't working
1. Check if you have a Gemini API key configured
2. Verify your API key is correct
3. Check your Google AI Studio usage limits
4. Select a file before asking questions
5. Try a simpler question first

### SPSS Data Editor is slow
1. Refresh the browser page
2. Try with a smaller dataset
3. Close other browser tabs
4. Use keyboard navigation instead of mouse
5. Try using a more powerful device

### Python code execution fails
1. Ensure Python 3.7+ is installed on your machine
2. Install required libraries: `pip install pandas numpy matplotlib seaborn scipy`
3. Upload a data file first
4. Check your code for syntax errors
5. Try running the template examples first

### Performance is slow
1. Close unnecessary browser tabs
2. Try with smaller datasets
3. Restart your browser
4. Use a more powerful device
5. Clear browser cache

---

## Performance & Limitations

### What are the file size limits?
- **Recommended**: Under 100MB for optimal performance
- **Maximum**: Browser-dependent, typically up to 2GB
- **Large files**: May cause slower performance

### How many files can I upload?
There's no strict limit, but performance may degrade with many large files. For best results, work with 5-10 files at a time.

### Are there API usage limits?
Yes, Google Gemini API has usage limits:
- **Free tier**: Generous limits for personal use
- **Paid tier**: Higher limits for heavy usage
- Check your usage at [Google AI Studio](https://makersuite.google.com/)

### Does Nemo work offline?
No, Nemo requires an internet connection for:
- AI chat features (Gemini API)
- Loading the web application
- Python code execution uses local Python but needs the web interface

### Is my data stored anywhere?
- **Local only**: All data processing happens in your browser
- **No cloud storage**: Files are not uploaded to external servers
- **API calls**: Only analysis requests are sent to Google Gemini
- **Privacy**: Your raw data never leaves your device

---

## Configuration & Settings

### How do I configure the Gemini API?
1. Click the Settings button (gear icon) in the chat panel
2. Enter your API key from Google AI Studio
3. Select your preferred model
4. Click "Save Configuration"

### Can I change the AI model?
Yes! Use the model dropdown in the chat panel to select:
- Gemini 1.5 Flash (fastest)
- Gemini 1.5 Pro (most capable)
- Gemini Pro (balanced)

### How do I switch between light and dark mode?
Click the theme toggle button (sun/moon icon) in the left panel to switch between light and dark modes.

### Are my settings saved?
Yes, your API key, model selection, and theme preference are saved in your browser's local storage.

### How do I reset my configuration?
Clear your browser's local storage for the Nemo domain, or manually delete the settings in your browser's developer tools.

### Can I customize the interface?
Currently, the interface layout is fixed, but we're planning customization options in future updates.

---

## Need More Help?

If you can't find an answer to your question:

1. **Check the User Guide** for detailed step-by-step instructions
2. **Review the Technical Documentation** for advanced topics
3. **Try the example queries** provided in the chat interface
4. **Start with smaller datasets** to test functionality
5. **Check your browser console** for error messages

For additional support, ensure you have:
- The latest version of your browser
- A stable internet connection
- Python 3.7+ installed (for code execution)
- A valid Gemini API key (for AI features)

Remember: Nemo is designed to be intuitive and user-friendly. Most issues can be resolved by refreshing the page or trying with a smaller dataset first.