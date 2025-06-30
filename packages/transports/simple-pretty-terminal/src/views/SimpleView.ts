import type { LogEntry, PrettyTerminalViewMode, Runtime, SimpleViewConfig } from "../types.js";
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
  private config: SimpleViewConfig;
  private viewMode: PrettyTerminalViewMode;
  private maxInlineDepth: number;
  private showLogId: boolean;
  private timestampFormat: string | ((timestamp: number) => string);
  private collapseArrays: boolean;
  private flattenNestedObjects: boolean;
  private runtime: Runtime;
  private includeDataInBrowserConsole: boolean;

  constructor(config: SimpleViewConfig) {
    this.config = config;
    this.viewMode = config.viewMode;
    this.maxInlineDepth = config.maxInlineDepth;
    this.showLogId = config.showLogId;
    this.timestampFormat = config.timestampFormat;
    this.collapseArrays = config.collapseArrays !== false;
    this.flattenNestedObjects = config.flattenNestedObjects !== false;
    this.runtime = config.runtime;
    this.includeDataInBrowserConsole = config.includeDataInBrowserConsole || false;
  }

  public getConfig(): SimpleViewConfig {
    return this.config;
  }

  public getViewMode(): PrettyTerminalViewMode {
    return this.viewMode;
  }

  /**
   * Writes a message to the appropriate output based on runtime
   */
  private writeMessage(message: string, level?: string, data?: any): void {
    if (this.runtime === "node") {
      // Use process.stdout.write for Node.js
      process?.stdout?.write?.(`${message}\n`);
    } else {
      // Use appropriate console method based on log level for browser
      const shouldIncludeData = this.includeDataInBrowserConsole && data !== undefined;

      switch (level) {
        case "trace":
          if (shouldIncludeData) {
            console.debug(message, data);
          } else {
            console.debug(message);
          }
          break;
        case "debug":
          if (shouldIncludeData) {
            console.debug(message, data);
          } else {
            console.debug(message);
          }
          break;
        case "info":
          if (shouldIncludeData) {
            console.info(message, data);
          } else {
            console.info(message);
          }
          break;
        case "warn":
          if (shouldIncludeData) {
            console.warn(message, data);
          } else {
            console.warn(message);
          }
          break;
        case "error":
        case "fatal":
          if (shouldIncludeData) {
            console.error(message, data);
          } else {
            console.error(message);
          }
          break;
        default:
          if (shouldIncludeData) {
            console.log(message, data);
          } else {
            console.log(message);
          }
          break;
      }
    }
  }

  /**
   * Renders a single log entry based on the current view mode
   */
  public renderLogLine(entry: LogEntry): void {
    const levelColor = getLevelColor(entry.level, this.config.config.colors);
    const chevron = levelColor(`▶ ${entry.level.toUpperCase()} `);
    const message = entry.message || "(no message)";
    const timestamp = formatTimestamp(entry.timestamp, this.config.config.logIdColor, this.timestampFormat);

    // Parse data for browser console inclusion
    const parsedData = entry.data ? JSON.parse(entry.data) : undefined;

    switch (this.viewMode) {
      case "message-only": {
        // Message-only view shows timestamp, level and message
        const condensedLine = `${timestamp} ${chevron}${message}`;
        this.writeMessage(condensedLine, entry.level, parsedData);
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
        this.writeMessage(expandedLine, entry.level, parsedData);
        break;
      }

      case "expanded": {
        // Expanded view shows timestamp, level, and message on first line, with data on indented separate lines
        const logId = this.showLogId ? this.config.config.logIdColor(`[${entry.id}]`) : "";
        const firstLine = `${timestamp} ${chevron}${logId ? `${logId} ` : ""}${message}`;
        this.writeMessage(firstLine, entry.level, parsedData);

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
            if (line.trim() !== "") {
              this.writeMessage(`  ${line}`, entry.level);
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
        this.writeMessage(expandedLine, entry.level, parsedData);
        break;
      }
    }
  }
}
