import * as fs from 'fs';
import { parse } from 'csv-parse';
import {
  DataSource,
  Table,
  Column,
  Row,
  CsvDataSourceConfig,
} from './types';

/**
 * Data source that reads from a local CSV file
 */
export class CsvFileDataSource implements DataSource {
  public readonly id: string;
  public readonly label: string;
  private readonly path: string;
  private readonly delimiter: string;
  private readonly header: boolean;

  constructor(config: CsvDataSourceConfig) {
    this.id = config.id;
    this.label = config.label;
    this.path = config.path;
    this.delimiter = config.delimiter ?? ',';
    this.header = config.header ?? true;
  }

  async listTables(): Promise<string[]> {
    return ['main'];
  }

  async getTable(name: string): Promise<Table> {
    if (name !== 'main') {
      throw new Error(`Table '${name}' not found. Only 'main' table is available.`);
    }

    return new Promise((resolve, reject) => {
      const rows: Row[] = [];
      let columns: Column[] = [];
      let isFirstRow = true;

      const parser = parse({
        delimiter: this.delimiter,
        columns: this.header,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        skip_empty_lines: true,
        trim: true,
      });

      const stream = fs.createReadStream(this.path);
      
      stream.on('error', (error) => {
        reject(new Error(`Failed to read CSV file: ${error.message}`));
      });

      parser.on('readable', () => {
        let record;
        while ((record = parser.read()) !== null) {
          if (this.header) {
            // csv-parse already provides column names
            if (isFirstRow) {
              columns = Object.keys(record).map(name => ({ name }));
              isFirstRow = false;
            }
            rows.push(record);
          } else {
            // No header - generate column names
            if (isFirstRow) {
              columns = Object.keys(record).map((_, idx) => ({
                name: `col${idx + 1}`,
              }));
              isFirstRow = false;
            }
            // Convert array to object with generated column names
            const row: Row = {};
            Object.values(record).forEach((value, idx) => {
              row[`col${idx + 1}`] = value;
            });
            rows.push(row);
          }
        }
      });

      parser.on('error', (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      });

      parser.on('end', () => {
        resolve({ columns, rows });
      });

      stream.pipe(parser);
    });
  }
}
