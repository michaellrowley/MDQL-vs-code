import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { parse } from 'csv-parse';
import * as parquet from 'parquetjs';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Readable } from 'stream';
import {
  DataSource,
  Table,
  Column,
  Row,
  S3DataSourceConfig,
} from './types';

/**
 * Data source that reads from S3
 */
export class S3DataSource implements DataSource {
  public readonly id: string;
  public readonly label: string;
  private readonly bucket: string;
  private readonly key: string;
  private readonly format: 'csv' | 'parquet';
  private readonly region?: string;
  private readonly delimiter: string;
  private readonly header: boolean;
  private readonly s3Client: S3Client;

  constructor(config: S3DataSourceConfig) {
    this.id = config.id;
    this.label = config.label;
    this.bucket = config.bucket;
    this.key = config.key;
    this.format = config.format;
    this.region = config.region;
    this.delimiter = config.delimiter ?? ',';
    this.header = config.header ?? true;

    // Initialize S3 client with optional region
    this.s3Client = new S3Client(
      this.region ? { region: this.region } : {}
    );
  }

  async listTables(): Promise<string[]> {
    return ['main'];
  }

  async getTable(name: string): Promise<Table> {
    if (name !== 'main') {
      throw new Error(`Table '${name}' not found. Only 'main' table is available.`);
    }

    if (this.format === 'csv') {
      return this.readCsvFromS3();
    } else {
      return this.readParquetFromS3();
    }
  }

  private async readCsvFromS3(): Promise<Table> {
    const command = new GetObjectCommand({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Bucket: this.bucket,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Key: this.key,
    });

    const response = await this.s3Client.send(command);
    
    if (!response.Body) {
      throw new Error('Empty response from S3');
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

      parser.on('readable', () => {
        let record;
        while ((record = parser.read()) !== null) {
          if (this.header) {
            if (isFirstRow) {
              columns = Object.keys(record).map(name => ({ name }));
              isFirstRow = false;
            }
            rows.push(record);
          } else {
            if (isFirstRow) {
              columns = Object.keys(record).map((_, idx) => ({
                name: `col${idx + 1}`,
              }));
              isFirstRow = false;
            }
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

      // Pipe the S3 stream to the parser
      if (response.Body instanceof Readable) {
        response.Body.pipe(parser);
      } else {
        reject(new Error('Unexpected response body type from S3'));
      }
    });
  }

  private async readParquetFromS3(): Promise<Table> {
    // Download to a temporary file since parquetjs doesn't support streams
    const command = new GetObjectCommand({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Bucket: this.bucket,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Key: this.key,
    });

    const response = await this.s3Client.send(command);
    
    if (!response.Body) {
      throw new Error('Empty response from S3');
    }

    // Create a temporary file
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, `mdql-parquet-${Date.now()}.parquet`);

    try {
      // Stream S3 data to temp file
      await new Promise<void>((resolve, reject) => {
        const writeStream = fs.createWriteStream(tempFile);
        
        writeStream.on('error', reject);
        writeStream.on('finish', () => resolve());

        if (response.Body instanceof Readable) {
          response.Body.pipe(writeStream);
        } else {
          reject(new Error('Unexpected response body type from S3'));
        }
      });

      // Read the parquet file
      const reader = await parquet.ParquetReader.openFile(tempFile);
      const schema = reader.getSchema();
      
      const columns: Column[] = schema.fieldList.map(field => ({
        name: field.name,
        type: field.primitiveType || field.originalType || 'unknown',
      }));

      const cursor = reader.getCursor();
      const rows: Row[] = [];
      
      let record = await cursor.next();
      while (record) {
        rows.push(record);
        record = await cursor.next();
      }

      await reader.close();

      return { columns, rows };
    } finally {
      // Clean up temporary file
      try {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }
}
