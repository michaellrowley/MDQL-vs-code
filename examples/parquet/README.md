# Parquet Example: Analytics

This example demonstrates querying a local Parquet file using MDQL.

## Configuration

Add the following to your VS Code `settings.json`:

```json
{
  "markdown-data-views.dataSources": [
    {
      "id": "analytics-parquet",
      "type": "parquet",
      "label": "Analytics (Parquet)",
      "path": "/absolute/path/to/examples/parquet/analytics.parquet"
    }
  ]
}
```

**Note:** Replace `/absolute/path/to/` with the actual path to your repository.

## Sample Data

The Parquet file contains web analytics events with the following columns:
- `timestamp`: Event timestamp
- `event_type`: Type of event (page_view, click, purchase)
- `user_id`: User identifier
- `page`: Page URL
- `duration_seconds`: Time spent on page

## Sample Queries

### Query 1: List all events
```mdql
TABLE timestamp,event_type,user_id,page FROM main
```

### Query 2: Filter page view events
```mdql
TABLE timestamp,user_id,page,duration_seconds FROM main WHERE event_type='page_view'
```

### Query 3: Find long sessions
```mdql
TABLE user_id,page,duration_seconds FROM main WHERE duration_seconds>100
```

## Running the Query

1. Open this file or create a new markdown file
2. Write an MDQL query in a code block with `mdql` language
3. Open the Command Palette (Ctrl+Shift+P or Cmd+Shift+P)
4. Run "Markdown DataViews: Run MDQL Query"
5. Select "Analytics (Parquet)" from the data source list
6. View the results in a new panel

## Regenerating the Sample File

If you need to recreate the analytics.parquet file, run:

```bash
node create-parquet.js
```
