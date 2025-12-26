# CSV Example: Expenses

This example demonstrates querying a local CSV file using MDQL.

## Configuration

Add the following to your VS Code `settings.json`:

```json
{
  "markdown-data-views.dataSources": [
    {
      "id": "expenses-csv",
      "type": "csv",
      "label": "Expenses (CSV)",
      "path": "/absolute/path/to/examples/csv/expenses.csv",
      "delimiter": ",",
      "header": true
    }
  ]
}
```

**Note:** Replace `/absolute/path/to/` with the actual path to your repository.

## Sample Queries

### Query 1: List all expenses
```mdql
TABLE date,category,description,amount FROM main
```

### Query 2: Filter food expenses
```mdql
TABLE date,description,amount FROM main WHERE category='Food'
```

### Query 3: Sort by amount (descending)
```mdql
TABLE description,amount FROM main SORT amount DESC
```

## Running the Query

1. Open this file or create a new markdown file
2. Write an MDQL query in a code block with `mdql` language
3. Open the Command Palette (Ctrl+Shift+P or Cmd+Shift+P)
4. Run "Markdown DataViews: Run MDQL Query"
5. Select "Expenses (CSV)" from the data source list
6. View the results in a new panel
