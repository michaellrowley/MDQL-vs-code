# Manual Testing Guide

This document provides instructions for manually testing the data source feature.

## Prerequisites

1. Build the extension: `yarn esbuild`
2. Open this project in VS Code
3. Press F5 to launch the Extension Development Host

## Test 1: CSV Data Source

### Setup Configuration

1. In the Extension Development Host, open Settings (Ctrl+,)
2. Search for "markdown-data-views"
3. Click "Edit in settings.json"
4. Add this configuration:

```json
{
  "markdown-data-views.dataSources": [
    {
      "id": "test-expenses",
      "type": "csv",
      "label": "Test Expenses",
      "path": "/home/runner/work/MDQL-vs-code/MDQL-vs-code/examples/csv/expenses.csv",
      "delimiter": ",",
      "header": true
    }
  ]
}
```

**Note:** Replace the path with the absolute path to your examples/csv/expenses.csv file.

### Run Query

1. Create a new markdown file
2. Add this query:
```
TABLE date,category,amount FROM main
```
3. Select the query text
4. Open Command Palette (Ctrl+Shift+P)
5. Run "Markdown DataViews: Run MDQL Query"
6. Select "Test Expenses" from the list
7. Verify results appear in a new panel

### Expected Results

- Should see a table with date, category, and amount columns
- Should have 10 rows of expense data
- All amounts should be displayed correctly

## Test 2: Parquet Data Source

### Setup Configuration

Add this to your settings.json dataSources array:

```json
{
  "id": "test-analytics",
  "type": "parquet",
  "label": "Test Analytics",
  "path": "/home/runner/work/MDQL-vs-code/MDQL-vs-code/examples/parquet/analytics.parquet"
}
```

### Run Query

1. Create a new markdown file
2. Add this query:
```
TABLE timestamp,event_type,user_id,page FROM main
```
3. Select the query and run "Markdown DataViews: Run MDQL Query"
4. Select "Test Analytics"
5. Verify results

### Expected Results

- Should see a table with timestamp, event_type, user_id, and page columns
- Should have 8 rows of analytics events

## Test 3: Multiple Data Sources

### Verify Selection UI

1. With both data sources configured
2. Run the command without selecting any text
3. Verify the Quick Pick shows both "Test Expenses" and "Test Analytics"
4. Verify each has the correct description (id)

## Test 4: Error Handling

### Test Invalid Path

1. Add a data source with an invalid path:
```json
{
  "id": "invalid",
  "type": "csv",
  "label": "Invalid CSV",
  "path": "/nonexistent/file.csv"
}
```
2. Reload the extension
3. Check the output panel for error messages
4. Run a query and select "Invalid CSV"
5. Verify a proper error message is displayed

### Test Invalid Query

1. Select a valid data source
2. Run a query with invalid syntax
3. Verify a proper error message is displayed

## Test 5: Extension Activation

1. Check the Markdown DataViews output channel
2. Verify it shows:
   - "Markdown Data-Views activated"
   - "Registering X data sources"
   - "Registered data source: <id> (<type>)" for each source

## Success Criteria

- [ ] CSV data source loads and queries correctly
- [ ] Parquet data source loads and queries correctly
- [ ] Data source selection UI works properly
- [ ] Results display in a formatted table
- [ ] Error messages are clear and helpful
- [ ] Extension activates without errors
- [ ] Output channel shows proper logging
