/**
 * LogRenderer handles all terminal output formatting and rendering.
 * Provides multiple view modes with different levels of detail:
 * - Simple view for real-time log output
 * - Compact view for context in detailed view
 * - Detailed view for inspecting individual logs
 * - Selection view for browsing and filtering logs
 *
 * Features:
 * - Color-coded log levels
 * - Structured data formatting
 * - Terminal width awareness
 * - Pretty-printed JSON
 * - Truncation of long content
 */

import chalk from "chalk";
import truncate from "cli-truncate";
import wrap from "wrap-ansi";
import type { DetailedViewConfig, LogEntry, ViewConfig } from "./types.js";
import * as prettyjson from "./vendor/prettyjson.js";

/**
 * Handles all log rendering functionality.
 * Manages different view modes and formatting options.
 * Automatically adjusts to terminal size changes.
 */
export class LogRenderer {
  /** Current terminal width in characters */
  private termWidth: number;

  /** Maximum depth for displaying nested objects inline */
  private maxInlineDepth: number;

  /** Maximum length for inline data before truncating */
  private maxInlineLength: number;

  /** Whether arrays are currently collapsed in detail view */
  private isArraysCollapsed = false;

  /** Color and formatting config for simple log view */
  private simpleViewConfig: Required<ViewConfig>;

  /** Color and formatting config for detailed view */
  private detailedViewConfig: Required<DetailedViewConfig>;

  /** Current scroll position in detailed view */
  private detailViewScrollPos = 0;

  /** Cached content lines for detailed view */
  private detailViewContent: string[] = [];

  /**
   * Creates a new LogRenderer instance.
   *
   * @param simpleViewConfig - Configuration for simple log view
   * @param detailedViewConfig - Configuration for detailed view
   * @param maxInlineDepth - Maximum depth for inline object display
   * @param maxInlineLength - Maximum length before truncation
   */
  constructor(
    simpleViewConfig: Required<ViewConfig>,
    detailedViewConfig: Required<DetailedViewConfig>,
    maxInlineDepth: number,
    maxInlineLength: number,
  ) {
    this.simpleViewConfig = simpleViewConfig;
    this.detailedViewConfig = detailedViewConfig;
    this.maxInlineDepth = maxInlineDepth;
    this.maxInlineLength = maxInlineLength;
    this.termWidth = process.stdout.columns || 80;

    // Update terminal width when window is resized
    process.stdout.on("resize", () => {
      this.termWidth = process.stdout.columns || 80;
    });
  }

  /**
   * Gets the appropriate color for a log level.
   * Handles both simple and detailed view color schemes.
   *
   * @param level - Log level (trace, debug, info, etc.)
   * @param isDetailView - Whether to use detailed view colors
   * @returns Chalk instance for the color
   */
  private getLevelColor(level: string, isDetailView = false) {
    const colors = isDetailView ? this.detailedViewConfig.colors : this.simpleViewConfig.colors;
    return colors[level] || chalk.white;
  }

  /**
   * Formats a timestamp into a human-readable string.
   * Format: HH:MM:SS.mmm
   *
   * @param timestamp - Unix timestamp in milliseconds
   * @returns Formatted and colored timestamp string
   */
  private formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return this.simpleViewConfig.logIdColor(
      `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}.${date.getMilliseconds().toString().padStart(3, "0")}`,
    );
  }

  /**
   * Formats structured data for inline display.
   * Handles nested objects, arrays, and primitive values.
   * Truncates output to maintain readability.
   *
   * @param data - Data to format
   * @returns Formatted string with color coding
   */
  private formatInlineData(data: any): string {
    if (!data) return "";

    const formatValue = (value: any): string => {
      if (typeof value === "string") return value;
      if (typeof value === "number" || typeof value === "boolean") return value.toString();
      if (value === null) return "null";
      if (value === undefined) return "undefined";
      if (Array.isArray(value)) return "[...]";
      if (typeof value === "object") return "{...}";
      return value.toString();
    };

    const pairs: string[] = [];
    const traverse = (obj: any, prefix = "", depth = 0) => {
      if (depth >= this.maxInlineDepth) return;

      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (value && typeof value === "object" && !Array.isArray(value)) {
          traverse(value, fullKey, depth + 1);
        } else {
          pairs.push(
            `${this.simpleViewConfig.dataKeyColor(fullKey)}=${this.simpleViewConfig.dataValueColor(formatValue(value))}`,
          );
        }
      }
    };

    traverse(data);
    const result = pairs.join(" ");
    return truncate(result, this.maxInlineLength);
  }

  /**
   * Renders a single log line in simple view format.
   * Format: [timestamp] LEVEL [id] message data
   *
   * @param entry - Log entry to render
   */
  public renderLogLine(entry: LogEntry): void {
    const levelColor = this.getLevelColor(entry.level);
    const timestamp = this.formatTimestamp(entry.timestamp);
    const chevron = levelColor(`▶ ${entry.level.toUpperCase()} `);
    const logId = this.simpleViewConfig.logIdColor(`[${entry.id}]`);
    const message = entry.message;
    const data = entry.data ? this.formatInlineData(JSON.parse(entry.data)) : "";

    const line = `${timestamp} ${chevron}${logId} ${message}${data ? ` ${data}` : ""}`;
    console.log(wrap(line, this.termWidth, { hard: true }));
  }

  /**
   * Formats a compact single-line version of a log entry.
   * Used for showing context in detailed view.
   *
   * @param entry - Log entry to render
   * @param prefix - Optional prefix (e.g., "←" for previous entry)
   * @returns Formatted log line
   */
  private formatCompactLogLine(entry: LogEntry | null, prefix = ""): string {
    if (!entry) return "";

    const levelColor = this.getLevelColor(entry.level, true);
    const logId = this.detailedViewConfig.logIdColor(`[${entry.id}]`);
    const line = `${prefix}${levelColor(entry.level.toUpperCase())} ${logId} ${entry.message}`;
    return this.detailedViewConfig.separatorColor(wrap(line, this.termWidth, { hard: true }));
  }

  /**
   * Renders the detailed view of a log entry.
   * Shows full entry details with context and formatted data.
   *
   * @param entry - Log entry to show in detail
   * @param prevEntry - Previous entry for context
   * @param nextEntry - Next entry for context
   * @param scrollPos - Current scroll position
   */
  public renderDetailView(
    entry: LogEntry,
    prevEntry: LogEntry | null,
    nextEntry: LogEntry | null,
    scrollPos = 0,
  ): void {
    console.clear();

    // If in JSON view mode, show raw JSON
    if (this.isJsonView) {
      if (entry.data) {
        console.log(JSON.stringify(JSON.parse(entry.data)));
      } else {
        console.log("{}");
      }
      console.log(`\n${this.detailedViewConfig.separatorColor("TAB to return to detailed view")}`);
      return;
    }

    // Calculate fixed header content (previous entry)
    const headerContent: string[] = [];
    if (prevEntry) {
      const prevLine = this.formatCompactLogLine(prevEntry, "← ");
      headerContent.push(prevLine);
      headerContent.push(this.detailedViewConfig.separatorColor("─".repeat(this.termWidth)));
    }

    // Calculate fixed footer content (next entry)
    const footerContent: string[] = [];
    if (nextEntry) {
      footerContent.push(this.detailedViewConfig.separatorColor("─".repeat(this.termWidth)));
      const nextLine = this.formatCompactLogLine(nextEntry, "→ ");
      footerContent.push(nextLine);
    }
    footerContent.push(""); // Empty line before help text
    footerContent.push(
      this.detailedViewConfig.separatorColor("TAB to exit • ↑/↓ scroll • Q/W page up/down • J raw JSON"),
    );
    footerContent.push(this.detailedViewConfig.separatorColor("←/→ navigate • A/S first/last log • C toggle arrays"));

    // Calculate main scrollable content
    const mainContent: string[] = [];
    const levelColor = this.getLevelColor(entry.level, true);
    const header = levelColor(`=== Log Detail [${entry.id}] ===`);
    mainContent.push(header);

    // Format timestamp with both ISO and relative time
    const timestamp = new Date(entry.timestamp);
    const isoTime = timestamp.toISOString();
    const relativeTime = this.formatRelativeTime(timestamp);
    mainContent.push(
      `${this.detailedViewConfig.labelColor("Timestamp:")} ${this.detailedViewConfig.dataValueColor(isoTime)} (${relativeTime})`,
    );

    mainContent.push(`${this.detailedViewConfig.labelColor("Level:")} ${levelColor.bold(entry.level.toUpperCase())}`);
    mainContent.push(
      `${this.detailedViewConfig.labelColor("Message:")} ${this.detailedViewConfig.dataValueColor(entry.message)}`,
    );

    // Pretty-print structured data if present
    if (entry.data) {
      mainContent.push(this.detailedViewConfig.labelColor("\nData:"));
      const jsonLines = prettyjson
        .render(JSON.parse(entry.data), {
          ...this.detailedViewConfig.jsonColors,
          defaultIndentation: 2,
          collapseArrays: this.isArraysCollapsed,
        })
        .split("\n");
      mainContent.push(...jsonLines);
    }

    // Store the complete content for future scrolling
    this.detailViewContent = mainContent;

    // Calculate available height for main content
    const headerHeight = headerContent.length;
    const footerHeight = footerContent.length;
    const scrollIndicatorLines = 2; // Space for up/down indicators
    const bufferSpace = 2; // Extra buffer to prevent content from being cut off
    const availableHeight = Math.max(
      0,
      process.stdout.rows - headerHeight - footerHeight - scrollIndicatorLines - bufferSpace,
    );

    // Calculate scroll position
    this.detailViewScrollPos = Math.max(0, Math.min(scrollPos, mainContent.length - availableHeight));

    // Render fixed header
    for (const line of headerContent) {
      console.log(line);
    }

    // Show scroll indicator if needed
    if (this.detailViewScrollPos > 0) {
      console.log(chalk.dim("↑ More content above"));
    }

    // Display visible portion of main content
    const startIndex = this.detailViewScrollPos;
    const visibleContent = mainContent.slice(startIndex, startIndex + availableHeight);
    for (const line of visibleContent) {
      console.log(line);
    }

    // Show scroll indicator if there's more content below
    if (this.detailViewScrollPos + availableHeight < mainContent.length) {
      console.log(chalk.dim("↓ More content below"));
    }

    // Render fixed footer
    for (const line of footerContent) {
      console.log(line);
    }
  }

  /**
   * Updates the scroll position in detailed view
   * @param delta - Number of lines to scroll (positive for down, negative for up)
   */
  public scrollDetailView(delta: number): void {
    // Calculate the same heights as in renderDetailView
    const headerHeight = 2; // Previous log + separator
    const footerHeight = 5; // Next log + separator + blank line + 2 help text lines
    const scrollIndicatorLines = 2; // Up/down indicators
    const bufferSpace = 2; // Extra buffer to prevent content from being cut off
    const availableHeight = Math.max(
      0,
      process.stdout.rows - headerHeight - footerHeight - scrollIndicatorLines - bufferSpace,
    );

    const maxScroll = Math.max(0, this.detailViewContent.length - availableHeight);
    this.detailViewScrollPos = Math.max(0, Math.min(maxScroll, this.detailViewScrollPos + delta));
  }

  /**
   * Gets the current scroll position
   */
  public getDetailViewScrollPos(): number {
    return this.detailViewScrollPos;
  }

  /**
   * Renders the interactive selection view.
   * Shows a scrollable list of logs with current selection.
   *
   * Features:
   * - Pagination for large log sets
   * - Active filter display
   * - Scroll indicators
   * - Selected item highlighting
   *
   * @param logs - Array of log entries to display
   * @param selectedIndex - Index of currently selected log
   * @param filterText - Current filter text (if any)
   * @param newLogCount - Number of new logs since last render (optional)
   */
  public renderSelectionView(logs: LogEntry[], selectedIndex: number, filterText: string, newLogCount = 0): void {
    console.clear();

    // Calculate available height for logs
    const headerHeight = filterText ? 2 : 0; // Filter + separator line
    const footerHeight = 2; // Help text + blank line before it
    const availableHeight = process.stdout.rows - headerHeight - footerHeight;

    // Show active filter if any
    if (filterText) {
      console.log(chalk.cyan("Filter:"), chalk.white(filterText));
      console.log(chalk.dim("─".repeat(this.termWidth)));
    }

    if (logs.length === 0) {
      console.log(chalk.yellow("No matching logs found"));
    } else {
      // Calculate the window of logs to show
      const visibleLines = Math.min(availableHeight, 20); // Show at most 20 lines at a time
      const bottomPadding = 2; // Keep selected item this many lines from the bottom

      let startIdx = Math.max(0, selectedIndex - (visibleLines - bottomPadding - 1));
      const endIdx = Math.min(logs.length, startIdx + visibleLines);

      // Adjust start index if we're near the end
      if (endIdx - startIdx < visibleLines && endIdx < logs.length) {
        startIdx = Math.max(0, endIdx - visibleLines);
      }

      // Show scroll indicator if there are logs above
      if (startIdx > 0) {
        console.log(chalk.dim("  ↑ More logs above"));
      }

      // Render visible logs with selection highlight
      logs.slice(startIdx, endIdx).forEach((entry, index) => {
        const actualIndex = startIdx + index;
        const isSelected = actualIndex === selectedIndex;
        const prefix = isSelected ? this.simpleViewConfig.selectorColor("► ") : "  ";
        const timestamp = this.formatTimestamp(entry.timestamp);
        const levelColor = this.getLevelColor(entry.level);
        const chevron = levelColor(`${entry.level.toUpperCase()} `);
        const logId = chalk.dim(`[${entry.id}]`);
        const message = entry.message;
        const data = entry.data ? this.formatInlineData(JSON.parse(entry.data)) : "";

        // Construct and wrap the main line
        const mainLine = `${prefix}${timestamp} ${chevron}${logId} ${message}`;
        console.log(wrap(mainLine, this.termWidth - 2, { hard: true }));

        // If there's data, show it on the next line with indentation only when selected
        if (data) {
          const wrappedData = wrap(data, this.termWidth - (isSelected ? 6 : 2), { hard: true });
          const indentedLines = wrappedData.split("\n").map((line) => (isSelected ? `    ${line}` : line));
          console.log(indentedLines.join("\n"));
        }
      });

      // Show scroll indicator if there are logs below
      if (endIdx < logs.length || newLogCount > 0) {
        const moreLogsText =
          newLogCount > 0
            ? this.simpleViewConfig.selectorColor(
                `  ↓ ${newLogCount} new log${newLogCount === 1 ? "" : "s"} available (press ↓ to view)`,
              )
            : chalk.dim("  ↓ More logs below");
        console.log(moreLogsText);
      }
    }

    // Show help text
    console.log(chalk.dim("\nType to filter • Enter to view details • TAB to exit"));
  }

  /**
   * Formats a timestamp into a human-readable relative time
   * @param timestamp - Date to format
   * @returns Formatted relative time string
   */
  private formatRelativeTime(timestamp: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "yesterday";
    if (diffDays < 30) return `${diffDays}d ago`;

    return timestamp.toLocaleDateString();
  }

  /** Whether we're showing raw JSON view */
  private isJsonView = false;

  /**
   * Toggles JSON view state
   */
  public toggleJsonView(): void {
    this.isJsonView = !this.isJsonView;
  }

  /**
   * Gets current JSON view state
   */
  public isInJsonView(): boolean {
    return this.isJsonView;
  }

  /**
   * Toggles array collapse state in detail view
   */
  public toggleArrayCollapse(): void {
    this.isArraysCollapsed = !this.isArraysCollapsed;
  }
}
