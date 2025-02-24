import chalk from "chalk";
import wrap from "wrap-ansi";
import type { SelectionViewConfig, View } from "./types.js";
import { formatInlineData, formatTimestamp, getLevelColor } from "./utils.js";

/**
 * Handles rendering of the selection view mode.
 * Shows an interactive list of logs with:
 * - Filtering capability
 * - Selected item highlighting
 * - Full data preview inline
 * - Scroll indicators
 */
export class SelectionView implements View {
  private termWidth: number;
  private config: SelectionViewConfig;

  constructor(config: SelectionViewConfig) {
    this.config = config;
    this.termWidth = process.stdout.columns || 80;
  }

  public updateTerminalWidth(width: number): void {
    this.termWidth = width;
  }

  public render(): void {
    console.clear();

    // Calculate available height for logs
    const headerHeight = this.config.filterText ? 2 : 0; // Filter + separator line
    const footerHeight = 2; // Help text + blank line before it
    const availableHeight = process.stdout.rows - headerHeight - footerHeight;

    // Show active filter if any
    if (this.config.filterText) {
      console.log(chalk.cyan("Filter:"), chalk.white(this.config.filterText));
      console.log(chalk.dim("─".repeat(this.termWidth)));
    }

    if (this.config.logs.length === 0) {
      console.log(chalk.yellow("No matching logs found"));
    } else {
      // Calculate the window of logs to show
      const visibleLines = Math.min(availableHeight, 20); // Show at most 20 lines at a time
      const bottomPadding = 2; // Keep selected item this many lines from the bottom

      let startIdx = Math.max(0, this.config.selectedIndex - (visibleLines - bottomPadding - 1));
      const endIdx = Math.min(this.config.logs.length, startIdx + visibleLines);

      // Adjust start index if we're near the end
      if (endIdx - startIdx < visibleLines && endIdx < this.config.logs.length) {
        startIdx = Math.max(0, endIdx - visibleLines);
      }

      // Show scroll indicator if there are logs above
      if (startIdx > 0) {
        console.log(chalk.dim("  ↑ More logs above"));
      }

      // Render visible logs with selection highlight
      this.config.logs.slice(startIdx, endIdx).forEach((entry, index) => {
        const actualIndex = startIdx + index;
        const isSelected = actualIndex === this.config.selectedIndex;
        const prefix = isSelected ? this.config.config.selectorColor("► ") : "  ";
        const timestamp = formatTimestamp(entry.timestamp, this.config.config.logIdColor);
        const levelColor = getLevelColor(entry.level, this.config.config.colors);
        const chevron = levelColor(`${entry.level.toUpperCase()} `);
        const logId = chalk.dim(`[${entry.id}]`);
        const message = entry.message;
        const data = entry.data ? ` ${formatInlineData(JSON.parse(entry.data), this.config.config, 0, 0, true)}` : "";

        // Construct and wrap the main line with full data
        const mainLine = `${prefix}${timestamp} ${chevron}${logId} ${message}${data}`;
        const wrappedText = wrap(mainLine, this.termWidth - 2, { hard: true });

        if (isSelected) {
          // For selected items, add indentation to all lines except the first
          const lines = wrappedText.split("\n");
          console.log(lines[0]);
          for (const line of lines.slice(1)) {
            console.log(`    ${line}`);
          }
        } else {
          console.log(wrappedText);
        }
      });

      // Show scroll indicator if there are logs below
      if (endIdx < this.config.logs.length || this.config.newLogCount > 0) {
        const moreLogsText =
          this.config.newLogCount > 0
            ? this.config.config.selectorColor(
                `  ↓ ${this.config.newLogCount} new log${this.config.newLogCount === 1 ? "" : "s"} available (press ↓ to view)`,
              )
            : chalk.dim("  ↓ More logs below");
        console.log(moreLogsText);
      }
    }

    // Show help text
    console.log(chalk.dim("\nType to filter • Enter to view details • TAB to exit"));
  }
}
