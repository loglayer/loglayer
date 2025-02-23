import wrap from "wrap-ansi";
import type { LogEntry } from "../types.js";
import type { SimpleViewConfig, View } from "./types.js";
import { formatInlineData, formatTimestamp, getLevelColor } from "./utils.js";

/**
 * Handles rendering of the simple view mode.
 * Supports three display modes:
 * - Truncated: Shows all log details with truncated data
 * - Condensed: Shows timestamp, level and message
 * - Full: Shows all details with complete data
 */
export class SimpleView implements View {
  private termWidth: number;
  private config: SimpleViewConfig;

  constructor(config: SimpleViewConfig) {
    this.config = config;
    this.termWidth = process.stdout.columns || 80;
  }

  public updateTerminalWidth(width: number): void {
    this.termWidth = width;
  }

  /**
   * Renders a single log entry based on the current view mode
   */
  public renderLogLine(entry: LogEntry): void {
    const levelColor = getLevelColor(entry.level, this.config.config.colors);
    const chevron = levelColor(`▶ ${entry.level.toUpperCase()} `);
    const message = entry.message || "(no message)";
    const timestamp = formatTimestamp(entry.timestamp, this.config.config.logIdColor);

    switch (this.config.viewMode) {
      case "condensed": {
        // Condensed view shows timestamp, level and message
        const condensedLine = `${timestamp} ${chevron}${message}`;
        console.log(wrap(condensedLine, this.termWidth, { hard: true }));
        break;
      }

      case "full": {
        // Full view shows all details with complete data
        const logId = this.config.config.logIdColor(`[${entry.id}]`);
        const fullData = entry.data
          ? formatInlineData(
              JSON.parse(entry.data),
              this.config.config,
              this.config.maxInlineDepth,
              this.config.maxInlineLength,
              true,
            )
          : "";
        const expandedLine = `${timestamp} ${chevron}${logId} ${message}${fullData ? ` ${fullData}` : ""}`;
        console.log(wrap(expandedLine, this.termWidth, { hard: true }));
        break;
      }

      default: {
        // 'truncated'
        // Truncated view shows all details with truncated data
        const logId = this.config.config.logIdColor(`[${entry.id}]`);
        const normalData = entry.data
          ? formatInlineData(
              JSON.parse(entry.data),
              this.config.config,
              this.config.maxInlineDepth,
              this.config.maxInlineLength,
            )
          : "";
        const normalLine = `${timestamp} ${chevron}${logId} ${message}${normalData ? ` ${normalData}` : ""}`;
        console.log(wrap(normalLine, this.termWidth, { hard: true }));
        break;
      }
    }
  }

  public render(): void {
    throw new Error("SimpleView.render() should not be called directly. Use renderLogLine() instead.");
  }
}
