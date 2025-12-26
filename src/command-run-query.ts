import * as vscode from 'vscode';
import { Query } from '@mdql/mdql';
import { Command } from './command';
import { dataSourceRegistry } from './data-sources/registry';
import { CustomDataSourceQueryExecutor } from './custom-query-executor';
import { createLogger } from './logging';

/**
 * Command to run MDQL queries with data source selection
 */
export class RunQueryCommand implements Command {
  private log = createLogger(RunQueryCommand.name);
  public static id = 'markdown-data-views.run-query';

  id(): string {
    return RunQueryCommand.id;
  }

  register(): vscode.Disposable {
    return vscode.commands.registerCommand(this.id(), async () => {
      try {
        // Get the current editor and selection
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showErrorMessage('No active editor');
          return;
        }

        // Get the selected text or use the entire document
        const selection = editor.selection;
        const queryText = selection.isEmpty
          ? editor.document.getText()
          : editor.document.getText(selection);

        if (!queryText.trim()) {
          vscode.window.showErrorMessage('No query text selected');
          return;
        }

        // Get list of available data sources
        const dataSources = dataSourceRegistry.listDataSources();
        if (dataSources.length === 0) {
          vscode.window.showErrorMessage(
            'No data sources configured. Please configure data sources in settings.'
          );
          return;
        }

        // Show quick pick for data source selection
        const selected = await vscode.window.showQuickPick(
          dataSources.map(ds => ({
            label: ds.label,
            description: ds.id,
            dataSource: ds,
          })),
          {
            placeHolder: 'Select a data source',
            matchOnDescription: true,
          }
        );

        if (!selected) {
          return; // User cancelled
        }

        this.log.info(`Running query against data source: ${selected.dataSource.id}`);

        // Parse and execute the query
        const query = Query.parse(queryText.trim());
        const executor = new CustomDataSourceQueryExecutor(selected.dataSource);
        const result = await executor.execute(query);

        // Display results
        await this.displayResults(result, selected.dataSource.label);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.log.error(`Query execution failed: ${message}`);
        vscode.window.showErrorMessage(`Query failed: ${message}`);
      }
    });
  }

  private async displayResults(
    result: { columns: any[]; rows: any[] },
    dataSourceLabel: string
  ): Promise<void> {
    // Create a webview panel to display results
    const panel = vscode.window.createWebviewPanel(
      'mdqlResults',
      `MDQL Results - ${dataSourceLabel}`,
      vscode.ViewColumn.Two,
      {
        enableScripts: true,
      }
    );

    // Generate HTML table
    const html = this.generateResultsHtml(result);
    panel.webview.html = html;
  }

  private generateResultsHtml(result: { columns: any[]; rows: any[] }): string {
    const columnNames = result.columns.map(col => col.name || 'Unknown');
    
    const headerRow = columnNames.map(name => `<th>${this.escapeHtml(name)}</th>`).join('');
    
    const bodyRows = result.rows
      .map(row => {
        const cells = columnNames
          .map(colName => {
            const value = row[colName];
            return `<td>${this.escapeHtml(String(value ?? ''))}</td>`;
          })
          .join('');
        return `<tr>${cells}</tr>`;
      })
      .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MDQL Results</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid var(--vscode-panel-border);
            padding: 8px 12px;
            text-align: left;
        }
        th {
            background-color: var(--vscode-editor-selectionBackground);
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: var(--vscode-list-hoverBackground);
        }
        .info {
            margin-bottom: 10px;
            color: var(--vscode-descriptionForeground);
        }
    </style>
</head>
<body>
    <div class="info">Total rows: ${result.rows.length}</div>
    <table>
        <thead>
            <tr>${headerRow}</tr>
        </thead>
        <tbody>
            ${bodyRows}
        </tbody>
    </table>
</body>
</html>`;
  }

  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
