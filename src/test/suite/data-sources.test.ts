import * as assert from 'assert';
import * as path from 'path';
import { CsvFileDataSource } from '../../data-sources/csv';
import { ParquetFileDataSource } from '../../data-sources/parquet';
import { DataSourceRegistry } from '../../data-sources/registry';

suite('Data Sources Test Suite', () => {
  const fixturesPath = path.join(__dirname, '..', 'fixtures');

  suite('CSV Data Source', () => {
    test('should list main table', async () => {
      const csvPath = path.join(fixturesPath, 'test.csv');
      const dataSource = new CsvFileDataSource({
        type: 'csv',
        id: 'test-csv',
        label: 'Test CSV',
        path: csvPath,
        header: true,
      });

      const tables = await dataSource.listTables();
      assert.strictEqual(tables.length, 1);
      assert.strictEqual(tables[0], 'main');
    });

    test('should read CSV with headers', async () => {
      const csvPath = path.join(fixturesPath, 'test.csv');
      const dataSource = new CsvFileDataSource({
        type: 'csv',
        id: 'test-csv',
        label: 'Test CSV',
        path: csvPath,
        header: true,
      });

      const table = await dataSource.getTable('main');
      
      assert.strictEqual(table.columns.length, 3);
      assert.strictEqual(table.columns[0].name, 'name');
      assert.strictEqual(table.columns[1].name, 'age');
      assert.strictEqual(table.columns[2].name, 'city');
      
      assert.strictEqual(table.rows.length, 3);
      assert.strictEqual(table.rows[0].name, 'Alice');
      assert.strictEqual(table.rows[0].age, '30');
      assert.strictEqual(table.rows[0].city, 'New York');
    });

    test('should throw error for non-existent table', async () => {
      const csvPath = path.join(fixturesPath, 'test.csv');
      const dataSource = new CsvFileDataSource({
        type: 'csv',
        id: 'test-csv',
        label: 'Test CSV',
        path: csvPath,
      });

      await assert.rejects(
        async () => await dataSource.getTable('nonexistent'),
        /Table 'nonexistent' not found/
      );
    });
  });

  suite('Parquet Data Source', () => {
    test('should list main table', async () => {
      const parquetPath = path.join(fixturesPath, 'test.parquet');
      const dataSource = new ParquetFileDataSource({
        type: 'parquet',
        id: 'test-parquet',
        label: 'Test Parquet',
        path: parquetPath,
      });

      const tables = await dataSource.listTables();
      assert.strictEqual(tables.length, 1);
      assert.strictEqual(tables[0], 'main');
    });

    test('should read Parquet file', async () => {
      const parquetPath = path.join(fixturesPath, 'test.parquet');
      const dataSource = new ParquetFileDataSource({
        type: 'parquet',
        id: 'test-parquet',
        label: 'Test Parquet',
        path: parquetPath,
      });

      const table = await dataSource.getTable('main');
      
      assert.strictEqual(table.columns.length, 3);
      assert.strictEqual(table.columns[0].name, 'name');
      assert.strictEqual(table.columns[1].name, 'age');
      assert.strictEqual(table.columns[2].name, 'city');
      
      assert.strictEqual(table.rows.length, 3);
      assert.strictEqual(table.rows[0].name, 'Alice');
      assert.strictEqual(table.rows[0].age, 30);
      assert.strictEqual(table.rows[0].city, 'New York');
    });

    test('should throw error for non-existent table', async () => {
      const parquetPath = path.join(fixturesPath, 'test.parquet');
      const dataSource = new ParquetFileDataSource({
        type: 'parquet',
        id: 'test-parquet',
        label: 'Test Parquet',
        path: parquetPath,
      });

      await assert.rejects(
        async () => await dataSource.getTable('nonexistent'),
        /Table 'nonexistent' not found/
      );
    });
  });

  suite('Data Source Registry', () => {
    test('should register and retrieve CSV data source', () => {
      const registry = new DataSourceRegistry();
      const csvPath = path.join(fixturesPath, 'test.csv');
      
      registry.registerDataSource({
        type: 'csv',
        id: 'test-csv',
        label: 'Test CSV',
        path: csvPath,
      });

      const dataSource = registry.getDataSource('test-csv');
      assert.ok(dataSource);
      assert.strictEqual(dataSource.id, 'test-csv');
      assert.strictEqual(dataSource.label, 'Test CSV');
    });

    test('should list all registered data sources', () => {
      const registry = new DataSourceRegistry();
      const csvPath = path.join(fixturesPath, 'test.csv');
      const parquetPath = path.join(fixturesPath, 'test.parquet');
      
      registry.registerDataSource({
        type: 'csv',
        id: 'csv1',
        label: 'CSV 1',
        path: csvPath,
      });

      registry.registerDataSource({
        type: 'parquet',
        id: 'parquet1',
        label: 'Parquet 1',
        path: parquetPath,
      });

      const dataSources = registry.listDataSources();
      assert.strictEqual(dataSources.length, 2);
    });

    test('should unregister data source', () => {
      const registry = new DataSourceRegistry();
      const csvPath = path.join(fixturesPath, 'test.csv');
      
      registry.registerDataSource({
        type: 'csv',
        id: 'test-csv',
        label: 'Test CSV',
        path: csvPath,
      });

      assert.ok(registry.hasDataSource('test-csv'));
      registry.unregisterDataSource('test-csv');
      assert.ok(!registry.hasDataSource('test-csv'));
    });

    test('should clear all data sources', () => {
      const registry = new DataSourceRegistry();
      const csvPath = path.join(fixturesPath, 'test.csv');
      
      registry.registerDataSource({
        type: 'csv',
        id: 'test-csv',
        label: 'Test CSV',
        path: csvPath,
      });

      assert.strictEqual(registry.listDataSources().length, 1);
      registry.clear();
      assert.strictEqual(registry.listDataSources().length, 0);
    });
  });
});
