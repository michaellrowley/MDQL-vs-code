const parquet = require('parquetjs');
const path = require('path');

async function createParquetFile() {
  // Define schema
  const schema = new parquet.ParquetSchema({
    timestamp: { type: 'TIMESTAMP_MILLIS' },
    event_type: { type: 'UTF8' },
    user_id: { type: 'INT64' },
    page: { type: 'UTF8' },
    duration_seconds: { type: 'INT32' }
  });

  // Create writer
  const outputPath = path.join(__dirname, 'analytics.parquet');
  const writer = await parquet.ParquetWriter.openFile(schema, outputPath);

  // Write sample data
  const data = [
    { timestamp: new Date('2024-01-15T10:00:00Z'), event_type: 'page_view', user_id: 1001, page: '/home', duration_seconds: 45 },
    { timestamp: new Date('2024-01-15T10:05:00Z'), event_type: 'page_view', user_id: 1002, page: '/products', duration_seconds: 120 },
    { timestamp: new Date('2024-01-15T10:10:00Z'), event_type: 'click', user_id: 1001, page: '/home', duration_seconds: 5 },
    { timestamp: new Date('2024-01-15T10:15:00Z'), event_type: 'page_view', user_id: 1003, page: '/about', duration_seconds: 30 },
    { timestamp: new Date('2024-01-15T10:20:00Z'), event_type: 'page_view', user_id: 1002, page: '/checkout', duration_seconds: 180 },
    { timestamp: new Date('2024-01-15T10:25:00Z'), event_type: 'click', user_id: 1003, page: '/about', duration_seconds: 3 },
    { timestamp: new Date('2024-01-15T10:30:00Z'), event_type: 'page_view', user_id: 1001, page: '/products', duration_seconds: 90 },
    { timestamp: new Date('2024-01-15T10:35:00Z'), event_type: 'purchase', user_id: 1002, page: '/checkout', duration_seconds: 300 }
  ];

  for (const row of data) {
    await writer.appendRow(row);
  }

  await writer.close();
  console.log('Parquet file created successfully:', outputPath);
}

createParquetFile().catch(console.error);
