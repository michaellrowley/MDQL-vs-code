const parquet = require('parquetjs');
const path = require('path');

async function createTestParquetFile() {
  const schema = new parquet.ParquetSchema({
    name: { type: 'UTF8' },
    age: { type: 'INT32' },
    city: { type: 'UTF8' }
  });

  const outputPath = path.join(__dirname, 'test.parquet');
  const writer = await parquet.ParquetWriter.openFile(schema, outputPath);

  await writer.appendRow({ name: 'Alice', age: 30, city: 'New York' });
  await writer.appendRow({ name: 'Bob', age: 25, city: 'Los Angeles' });
  await writer.appendRow({ name: 'Charlie', age: 35, city: 'Chicago' });

  await writer.close();
  console.log('Test parquet file created:', outputPath);
}

createTestParquetFile().catch(console.error);
