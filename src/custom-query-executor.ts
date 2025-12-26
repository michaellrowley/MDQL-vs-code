import { Query, KeyValueObject } from '@mdql/mdql';
import { DataSource, Table, QueryResult } from './data-sources/types';

/**
 * Executes MDQL queries against custom data sources
 */
export class CustomDataSourceQueryExecutor {
  constructor(private dataSource: DataSource) {}

  /**
   * Execute a query against the data source
   */
  async execute(query: Query): Promise<QueryResult> {
    // If the data source supports native query execution, use it
    if (this.dataSource.executeQuery) {
      return this.dataSource.executeQuery(query.toString());
    }

    // Otherwise, fetch the table and apply filters/projections manually
    // For now, we'll get the main table by default
    const tableName = 'main'; // Could extract from query in future
    const table = await this.dataSource.getTable(tableName);

    // Apply query operations
    let result = this.applyFilter(table.rows, query);
    result = this.applyProjection(result, query, table);
    result = this.applySorting(result, query);

    return {
      columns: table.columns.filter(col => 
        query.fields.length === 0 || query.fields.includes(col.name)
      ),
      rows: result,
    };
  }

  private applyFilter(rows: KeyValueObject[], query: Query): KeyValueObject[] {
    if (!query.filter || query.filter.length === 0) {
      return rows;
    }

    return rows.filter(row => {
      return query.filter.every(filter => {
        const value = row[filter.field];
        const filterValue = filter.value;

        if (value === undefined || value === null) {
          return false;
        }

        const valueStr = String(value).toLowerCase();
        const filterStr = String(filterValue).toLowerCase();

        // Handle different filter operators
        // This is a simplified version - the actual MDQL filter operators
        // would need to be properly mapped
        return valueStr.includes(filterStr) || valueStr === filterStr;
      });
    });
  }

  private applyProjection(
    rows: KeyValueObject[],
    query: Query,
    table: Table
  ): KeyValueObject[] {
    if (!query.fields || query.fields.length === 0) {
      return rows;
    }

    return rows.map(row => {
      const projected: KeyValueObject = {};
      query.fields.forEach(field => {
        if (row.hasOwnProperty(field)) {
          projected[field] = row[field];
        }
      });
      return projected;
    });
  }

  private applySorting(
    rows: KeyValueObject[],
    query: Query
  ): KeyValueObject[] {
    if (!query.sorter) {
      return rows;
    }

    return query.sorter.apply(rows);
  }
}
