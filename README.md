# Markdown Data-Views for Visual Studio Code

Data-driven Markdown views for note-taking and more.
Query information in your markdown documents and inject the result dynamically.



## Features

This extension uses the [Markdown Query Language](https://github.com/MDQL/mdql) to enable dynamic data views within markdown documents.


![](./images/DemoPreview.gif)
![](./images/DemoFilters.gif)

You can also inject the result directly into your markdown document to store the returned data within your git repository.


Example:

This code block in any markdown document

    ```mdql
    TASKLIST status,text FROM tasks
    ```

will render as
![](./images/2023-08-05-23-03-06.png)

### Custom Data Sources

The extension now supports querying external data sources beyond markdown files:

- **CSV Files**: Query local CSV files with configurable delimiters and headers
- **Parquet Files**: Query local Parquet files with automatic schema detection
- **S3 Objects**: Query CSV and Parquet files stored in AWS S3 buckets

#### Configuration

Configure data sources in your VS Code settings (`settings.json`):

```json
{
  "markdown-data-views.dataSources": [
    {
      "id": "expenses",
      "type": "csv",
      "label": "My Expenses",
      "path": "/path/to/expenses.csv",
      "delimiter": ",",
      "header": true
    },
    {
      "id": "analytics",
      "type": "parquet",
      "label": "Analytics Data",
      "path": "/path/to/analytics.parquet"
    },
    {
      "id": "s3-data",
      "type": "s3",
      "label": "S3 Sales Data",
      "bucket": "my-bucket",
      "key": "data/sales.csv",
      "format": "csv",
      "region": "us-east-1"
    }
  ]
}
```

#### Running Queries

1. Open a markdown file with your MDQL query
2. Open the Command Palette (Ctrl+Shift+P or Cmd+Shift+P)
3. Run "Markdown DataViews: Run MDQL Query"
4. Select your data source from the list
5. View results in a new panel

Example query:
```mdql
TABLE date,category,amount FROM main WHERE amount>50
```

For detailed examples and configuration options, see the [examples](./examples) directory:
- [CSV Example](./examples/csv/README.md)
- [Parquet Example](./examples/parquet/README.md)
- [S3 Example](./examples/s3/README.md)

## Requirements
Recommended Extensions are:
- [Markdown all in one](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one)

