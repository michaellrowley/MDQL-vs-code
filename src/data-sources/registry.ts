import { DataSource, DataSourceConfig } from './types';
import { CsvFileDataSource } from './csv';
import { ParquetFileDataSource } from './parquet';
import { S3DataSource } from './s3';

/**
 * Registry for managing data sources
 */
export class DataSourceRegistry {
  private dataSources: Map<string, DataSource> = new Map();

  /**
   * Register a data source from configuration
   */
  registerDataSource(config: DataSourceConfig): void {
    let dataSource: DataSource;

    switch (config.type) {
      case 'csv':
        dataSource = new CsvFileDataSource(config);
        break;
      case 'parquet':
        dataSource = new ParquetFileDataSource(config);
        break;
      case 's3':
        dataSource = new S3DataSource(config);
        break;
      default:
        throw new Error(`Unknown data source type: ${(config as any).type}`);
    }

    this.dataSources.set(config.id, dataSource);
  }

  /**
   * Get a data source by ID
   */
  getDataSource(id: string): DataSource | undefined {
    return this.dataSources.get(id);
  }

  /**
   * List all registered data sources
   */
  listDataSources(): DataSource[] {
    return Array.from(this.dataSources.values());
  }

  /**
   * Check if a data source exists
   */
  hasDataSource(id: string): boolean {
    return this.dataSources.has(id);
  }

  /**
   * Unregister a data source
   */
  unregisterDataSource(id: string): boolean {
    return this.dataSources.delete(id);
  }

  /**
   * Clear all data sources
   */
  clear(): void {
    this.dataSources.clear();
  }
}

// Singleton instance
export const dataSourceRegistry = new DataSourceRegistry();
