import wrap from "wrap-ansi";
import type { LogEntry, PrettyTerminalViewMode, SimpleViewConfig } from "../types.js";
import * as prettyjson from "../vendor/prettyjson.js";
import { formatInlineData, formatTimestamp, getLevelColor } from "./utils.js";

/**
 * Handles rendering of the simple view mode.
 * Supports three display modes:
 * - Message-only: Shows timestamp, level and message
 * - Inline: Shows all details with complete data inline
 * - Expanded: Shows timestamp, level, and message on first line, with data on indented separate lines
 */
export class SimpleView {
  private termWidth: number;
  private config: SimpleViewConfig;
  private viewMode: PrettyTerminalViewMode;
  private maxInlineDepth: number;
  private showLogId: boolean;
  private timestampFormat: string | ((timestamp: number) => string);
  private collapseArrays: boolean;
  private flattenNestedObjects: boolean;
  private writeFn: (message: string) => void;

  constructor(config: SimpleViewConfig) {
    this.config = config;
    this.viewMode = config.viewMode;
    this.maxInlineDepth = config.maxInlineDepth;
    this.showLogId = config.showLogId;
    this.timestampFormat = config.timestampFormat;
    this.collapseArrays = config.collapseArrays !== false;
    this.flattenNestedObjects = config.flattenNestedObjects !== false;
    this.termWidth = process.stdout.columns || 120;
    this.writeFn = config.writeFn;
  }

  public updateTerminalWidth(width: number): void {
    this.termWidth = width;
  }

  public getConfig(): SimpleViewConfig {
    return this.config;
  }

  public getViewMode(): PrettyTerminalViewMode {
    return this.viewMode;
  }

  /**
   * Renders a single log entry based on the current view mode
   */
  public renderLogLine(entry: LogEntry): void {
    const levelColor = getLevelColor(entry.level, this.config.config.colors);
    const chevron = levelColor(`▶ ${entry.level.toUpperCase()} `);
    const message = entry.message || "(no message)";
    const timestamp = formatTimestamp(entry.timestamp, this.config.config.logIdColor, this.timestampFormat);

    switch (this.viewMode) {
      case "message-only": {
        // Message-only view shows timestamp, level and message
        const condensedLine = `${timestamp} ${chevron}${message}`;
        this.writeFn(wrap(condensedLine, this.termWidth, { hard: true }));
        break;
      }

      case "inline": {
        // Inline view shows all details with complete data inline
        const logId = this.showLogId ? this.config.config.logIdColor(`[${entry.id}]`) : "";
        const fullData = entry.data
          ? formatInlineData(
              JSON.parse(entry.data),
              this.config.config,
              this.maxInlineDepth,
              !this.flattenNestedObjects,
              this.collapseArrays,
            )
          : "";
        const expandedLine = `${timestamp} ${chevron}${logId ? `${logId} ` : ""}${message}${fullData ? ` ${fullData}` : ""}`;
        // Don't wrap inline mode to preserve full content
        this.writeFn(expandedLine);
        break;
      }

      case "expanded": {
        // Expanded view shows timestamp, level, and message on first line, with data on indented separate lines
        const logId = this.showLogId ? this.config.config.logIdColor(`[${entry.id}]`) : "";
        const firstLine = `${timestamp} ${chevron}${logId ? `${logId} ` : ""}${message}`;
        this.writeFn(wrap(firstLine, this.termWidth, { hard: true }));

        if (entry.data) {
          const jsonLines = prettyjson
            .render(JSON.parse(entry.data), {
              defaultIndentation: 2,
              keysColor: this.config.config.dataKeyColor,
              dashColor: this.config.config.dataKeyColor,
              numberColor: this.config.config.dataValueColor,
              stringColor: this.config.config.dataValueColor,
              multilineStringColor: this.config.config.dataValueColor,
              positiveNumberColor: this.config.config.dataValueColor,
              negativeNumberColor: this.config.config.dataValueColor,
              booleanColor: this.config.config.dataValueColor,
              nullUndefinedColor: this.config.config.dataValueColor,
              dateColor: this.config.config.dataValueColor,
              collapseArrays: this.collapseArrays,
            })
            .split("\n");

          // Add each line with proper indentation (2 spaces at the beginning)
          for (const line of jsonLines) {
            // Skip empty lines
            if (line.trim() === "") {
              this.writeFn("  ");
            } else {
              this.writeFn(`  ${line}`);
            }
          }
        }
        break;
      }

      default: {
        // Default to full view for any unexpected view modes
        const logId = this.showLogId ? this.config.config.logIdColor(`[${entry.id}]`) : "";
        const fullData = entry.data
          ? formatInlineData(JSON.parse(entry.data), this.config.config, this.maxInlineDepth, true, this.collapseArrays)
          : "";
        const expandedLine = `${timestamp} ${chevron}${logId ? `${logId} ` : ""}${message}${fullData ? ` ${fullData}` : ""}`;
        this.writeFn(wrap(expandedLine, this.termWidth, { hard: true }));
        break;
      }
    }
  }
}
