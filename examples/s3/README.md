# S3 Example: Querying Data from AWS S3

This example demonstrates querying CSV and Parquet files stored in AWS S3 using MDQL.

## Prerequisites

1. AWS credentials configured on your system (via environment variables, AWS CLI, or credentials file)
2. An S3 bucket with read permissions
3. CSV or Parquet files uploaded to your S3 bucket

## Configuration

### Example 1: CSV File in S3

Add the following to your VS Code `settings.json`:

```json
{
  "markdown-data-views.dataSources": [
    {
      "id": "s3-sales-csv",
      "type": "s3",
      "label": "Sales Data (S3 CSV)",
      "bucket": "my-data-bucket",
      "key": "data/sales/2024/sales.csv",
      "format": "csv",
      "region": "us-east-1",
      "delimiter": ",",
      "header": true
    }
  ]
}
```

### Example 2: Parquet File in S3

```json
{
  "markdown-data-views.dataSources": [
    {
      "id": "s3-logs-parquet",
      "type": "s3",
      "label": "Server Logs (S3 Parquet)",
      "bucket": "my-logs-bucket",
      "key": "logs/2024/01/server-logs.parquet",
      "format": "parquet",
      "region": "us-west-2"
    }
  ]
}
```

### Configuration Options

- `id`: Unique identifier for the data source (required)
- `type`: Must be "s3" (required)
- `label`: Display name in the UI (required)
- `bucket`: S3 bucket name (required)
- `key`: S3 object key/path (required)
- `format`: File format - "csv" or "parquet" (required)
- `region`: AWS region (optional, defaults to AWS SDK default resolution)
- `delimiter`: CSV delimiter (optional, default: ",", only for CSV format)
- `header`: Whether CSV has header row (optional, default: true, only for CSV format)

## AWS Credentials

The extension uses the AWS SDK's default credential provider chain:

1. Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
2. Shared credentials file (`~/.aws/credentials`)
3. ECS container credentials
4. EC2 instance credentials

**Security Note:** Never commit AWS credentials to your repository. Always use environment variables or AWS credential files.

## Sample Queries

### Query CSV Data
```mdql
TABLE date,product,quantity,revenue FROM main
```

### Filter and Sort
```mdql
TABLE product,revenue FROM main WHERE revenue>1000 SORT revenue DESC
```

### Aggregate by Category
```mdql
TABLE category,COUNT(*) FROM main WHERE status='completed'
```

## Running the Query

1. Ensure your AWS credentials are configured
2. Update the S3 bucket and key in your settings
3. Open a markdown file with your MDQL query
4. Open the Command Palette (Ctrl+Shift+P or Cmd+Shift+P)
5. Run "Markdown DataViews: Run MDQL Query"
6. Select your S3 data source from the list
7. View the results in a new panel

## Testing with Public S3 Data

For testing purposes, you can use publicly available datasets. Some examples:

- AWS Public Datasets: https://registry.opendata.aws/
- Common Crawl: https://commoncrawl.org/

Example configuration for a public dataset:

```json
{
  "id": "public-test",
  "type": "s3",
  "label": "Test Public Data",
  "bucket": "your-public-bucket",
  "key": "test-data.csv",
  "format": "csv",
  "region": "us-east-1"
}
```

## Troubleshooting

### Access Denied Error
- Verify your AWS credentials are correctly configured
- Ensure the IAM user/role has `s3:GetObject` permission for the bucket and key
- Check that the bucket name and key are correct

### Region Errors
- Specify the correct region where your bucket is located
- Some buckets may require specific region configuration

### Large Files
- The extension downloads S3 files to memory/temp storage
- For very large files, consider using a subset or aggregating data server-side first
