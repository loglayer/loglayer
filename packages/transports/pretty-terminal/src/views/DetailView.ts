import chalk from "chalk";
import wrap from "wrap-ansi";
import type { LogEntry } from "../types.js";
import * as prettyjson from "../vendor/prettyjson.js";
import type { DetailViewConfig, View } from "./types.js";
import { formatTimestamp, getLevelColor } from "./utils.js";

/**
 * Handles rendering of the detail view mode.
 * Shows a full-screen view of a single log entry with:
 * - Previous/next log context
 * - Full timestamp information
 * - Pretty-printed data
 * - Navigation help
 */
export class DetailView implements View {
  private termWidth: number;
  private config: DetailViewConfig;
  private detailViewContent: string[] = [];

  constructor(config: DetailViewConfig) {
    this.config = config;
    this.termWidth = process.stdout.columns || 80;
  }

  public updateTerminalWidth(width: number): void {
    this.termWidth = width;
  }

  /**
   * Formats a compact single-line version of a log entry
   */
  private formatCompactLogLine(entry: LogEntry | null, prefix = ""): string {
    if (!entry) return "";

    const levelColor = getLevelColor(entry.level, this.config.config.colors);
    const logId = this.config.config.logIdColor(`[${entry.id}]`);
    const line = `${prefix}${levelColor(entry.level.toUpperCase())} ${logId} ${entry.message}`;
    return this.config.config.separatorColor(wrap(line, this.termWidth, { hard: true }));
  }

  /**
   * Formats a timestamp into a human-readable relative time
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

  public render(): void {
    console.clear();

    // Add padding at the top to handle terminal buffer overflow
    console.log("\n".repeat(5));

    // If in JSON view mode, show raw JSON
    if (this.config.isJsonView) {
      if (this.config.entry.data) {
        console.log(JSON.stringify(JSON.parse(this.config.entry.data)));
      } else {
        console.log("{}");
      }
      console.log(`\n${this.config.config.separatorColor("TAB to return to detailed view")}`);
      return;
    }

    // Calculate fixed header content (previous entry)
    const headerContent: string[] = [];
    if (this.config.prevEntry) {
      const prevLine = this.formatCompactLogLine(this.config.prevEntry, "← ");
      headerContent.push(prevLine);
      headerContent.push(this.config.config.separatorColor("─".repeat(this.termWidth)));
    }

    // Calculate fixed footer content (next entry)
    const footerContent: string[] = [];
    if (this.config.nextEntry) {
      footerContent.push(this.config.config.separatorColor("─".repeat(this.termWidth)));
      const nextLine = this.formatCompactLogLine(this.config.nextEntry, "→ ");
      footerContent.push(nextLine);
    }
    footerContent.push(""); // Empty line before help text
    footerContent.push(this.config.config.separatorColor("↑/↓ scroll • Q/W page up/down • J raw JSON"));
    footerContent.push(this.config.config.separatorColor("←/→ navigate • A/S first/last log • C toggle arrays"));

    // Calculate main scrollable content
    const mainContent: string[] = [];
    const levelColor = getLevelColor(this.config.entry.level, this.config.config.colors);

    // Build header with filter context if present
    let headerText = `=== Log Detail [${this.config.entry.id}] (${this.config.currentLogIndex} / ${this.config.totalLogs})`;
    if (this.config.filterText) {
      headerText += ` [Filter: ${this.config.filterText}]`;
    }
    headerText += " ===";

    const header = levelColor(headerText);
    mainContent.push(header);

    // Format timestamp with both ISO and relative time
    const timestamp = new Date(this.config.entry.timestamp);
    const isoTime = formatTimestamp(this.config.entry.timestamp, this.config.config.dataValueColor);
    const relativeTime = this.formatRelativeTime(timestamp);
    mainContent.push(`${this.config.config.labelColor("Timestamp:")} ${isoTime} (${relativeTime})`);

    mainContent.push(
      `${this.config.config.labelColor("Level:")} ${levelColor.bold(this.config.entry.level.toUpperCase())}`,
    );

    if (this.config.entry.message) {
      mainContent.push(
        `${this.config.config.labelColor("Message:")} ${this.config.config.dataValueColor(this.config.entry.message)}`,
      );
    } else {
      mainContent.push(
        `${this.config.config.labelColor("Message:")} ${this.config.config.dataValueColor.dim("(no message)")}`,
      );
    }

    // Pretty-print structured data if present
    if (this.config.entry.data) {
      mainContent.push(this.config.config.labelColor("\nData:"));
      const jsonLines = prettyjson
        .render(JSON.parse(this.config.entry.data), {
          ...this.config.config.jsonColors,
          defaultIndentation: 2,
          collapseArrays: this.config.isArraysCollapsed,
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
    const bufferSpace = 4; // Extra buffer to prevent content from being cut off
    const topPadding = 2; // Account for the padding we added at the top
    const availableHeight = Math.max(
      0,
      process.stdout.rows - headerHeight - footerHeight - scrollIndicatorLines - bufferSpace - topPadding,
    );

    // Render fixed header
    for (const line of headerContent) {
      console.log(line);
    }

    // Show scroll indicator if needed
    if (this.config.scrollPos > 0) {
      console.log(chalk.dim("↑ More content above"));
    }

    // Display visible portion of main content
    const startIndex = this.config.scrollPos;
    const visibleContent = mainContent.slice(startIndex, startIndex + availableHeight);
    for (const line of visibleContent) {
      console.log(line);
    }

    // Show scroll indicator if there's more content below
    if (this.config.scrollPos + availableHeight < mainContent.length) {
      console.log(chalk.dim("↓ More content below"));
    } else {
      console.log(chalk.dim("End of content"));
    }

    // Render fixed footer
    for (const line of footerContent) {
      console.log(line);
    }
  }

  /**
   * Gets the maximum scroll position based on current content and window size
   */
  public getMaxScrollPosition(): number {
    const headerHeight = this.config.prevEntry ? 2 : 0;
    const footerHeight = 5;
    const scrollIndicatorLines = 2;
    const bufferSpace = 2;
    const topPadding = 2; // Account for the padding we added at the top
    const availableHeight = Math.max(
      0,
      process.stdout.rows - headerHeight - footerHeight - scrollIndicatorLines - bufferSpace - topPadding,
    );

    return Math.max(0, this.detailViewContent.length - availableHeight);
  }
}
