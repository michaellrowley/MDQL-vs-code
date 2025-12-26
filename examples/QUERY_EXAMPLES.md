# MDQL Data Source Query Examples

This file contains example MDQL queries to demonstrate the new data source feature.

## CSV Data Source Example

Query all expenses:

```mdql
TABLE date,category,description,amount FROM main
```

Query food expenses only:

```mdql
TABLE date,description,amount FROM main WHERE category='Food'
```

## Parquet Data Source Example

Query all analytics events:

```mdql
TABLE timestamp,event_type,user_id,page FROM main
```

Query page views only:

```mdql
TABLE timestamp,user_id,page,duration_seconds FROM main WHERE event_type='page_view'
```

## How to Use

1. Configure data sources in your VS Code settings (see examples/csv/README.md or examples/parquet/README.md)
2. Select the query text above
3. Open Command Palette (Ctrl+Shift+P or Cmd+Shift+P)
4. Run "Markdown DataViews: Run MDQL Query"
5. Select your configured data source
6. View the results in a new panel

## Expected Results

The results will be displayed in a formatted table with:
- Column headers from your data
- All matching rows
- Syntax highlighting
- Row count summary
