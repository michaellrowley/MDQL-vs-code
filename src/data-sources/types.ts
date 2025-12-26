/**
 * Column definition in a table
 */
export interface Column {
  name: string;
  type?: string;
}

/**
 * Row data - key-value pairs
 */
export type Row = Record<string, any>;

/**
 * Table with columns and rows
 */
export interface Table {
  columns: Column[];
  rows: Row[];
}

/**
 * Query result with metadata
 */
export interface QueryResult {
  columns: Column[];
  rows: Row[];
}

/**
 * Base data source interface that all implementations must follow
 */
export interface DataSource {
  /**
   * Unique identifier for this data source
   */
  id: string;

  /**
   * Human-readable label for UI display
   */
  label: string;

  /**
   * List all available tables in this data source
   */
  listTables(): Promise<string[]>;

  /**
   * Get a specific table by name
   */
  getTable(name: string): Promise<Table>;

  /**
   * Optional: Execute a query directly (for pushdown optimization)
   */
  executeQuery?(query: string): Promise<QueryResult>;
}

/**
 * Configuration for CSV file data source
 */
export interface CsvDataSourceConfig {
  type: 'csv';
  id: string;
  label: string;
  path: string;
  delimiter?: string;
  header?: boolean;
}

/**
 * Configuration for Parquet file data source
 */
export interface ParquetDataSourceConfig {
  type: 'parquet';
  id: string;
  label: string;
  path: string;
}

/**
 * Configuration for S3 data source
 */
export interface S3DataSourceConfig {
  type: 's3';
  id: string;
  label: string;
  bucket: string;
  key: string;
  format: 'csv' | 'parquet';
  region?: string;
  delimiter?: string;
  header?: boolean;
}

/**
 * Union type of all data source configurations
 */
export type DataSourceConfig =
  | CsvDataSourceConfig
  | ParquetDataSourceConfig
  | S3DataSourceConfig;
