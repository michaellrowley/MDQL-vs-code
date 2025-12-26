import * as parquet from 'parquetjs';
import {
  DataSource,
  Table,
  Column,
  Row,
  ParquetDataSourceConfig,
} from './types';

/**
 * Data source that reads from a local Parquet file
 */
export class ParquetFileDataSource implements DataSource {
  public readonly id: string;
  public readonly label: string;
  private readonly path: string;

  constructor(config: ParquetDataSourceConfig) {
    this.id = config.id;
    this.label = config.label;
    this.path = config.path;
  }

  async listTables(): Promise<string[]> {
    return ['main'];
  }

  async getTable(name: string): Promise<Table> {
    if (name !== 'main') {
      throw new Error(`Table '${name}' not found. Only 'main' table is available.`);
    }

    const reader = await parquet.ParquetReader.openFile(this.path);
    const schema = reader.getSchema();
    
    // Build columns from schema
    const columns: Column[] = schema.fieldList.map(field => ({
      name: field.name,
      type: field.primitiveType || field.originalType || 'unknown',
    }));

    // Read all rows
    const cursor = reader.getCursor();
    const rows: Row[] = [];
    
    let record = await cursor.next();
    while (record) {
      rows.push(record);
      record = await cursor.next();
    }

    await reader.close();

    return { columns, rows };
  }
}
