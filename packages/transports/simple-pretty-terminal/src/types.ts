import type { LoggerlessTransportConfig } from "@loglayer/transport";
import type { ChalkInstance } from "chalk";

/**
 * Represents a single log entry in the transport system.
 * Each entry contains metadata and the actual log content.
 */
export interface LogEntry {
  /** Unique identifier for the log entry */
  id: string;
  /** Unix timestamp in milliseconds when the log was created */
  timestamp: number;
  /** Log level (trace, debug, info, warn, error, fatal) */
  level: string;
  /** Main log message content */
  message: string;
  /** Optional structured data associated with the log, stored as JSON string */
  data: string | null;
}

/**
 * Configuration for log level colors.
 * Each log level can have its own chalk styling.
 */
export interface ColorConfig {
  /** Style for trace level logs - lowest severity */
  trace?: ChalkInstance;
  /** Style for debug level logs */
  debug?: ChalkInstance;
  /** Style for info level logs - normal operation */
  info?: ChalkInstance;
  /** Style for warning level logs */
  warn?: ChalkInstance;
  /** Style for error level logs */
  error?: ChalkInstance;
  /** Style for fatal level logs - highest severity */
  fatal?: ChalkInstance;
}

/**
 * Configuration for log view styling.
 * Defines colors and styles for different log elements.
 */
export interface ViewConfig {
  /** Color configuration for different log levels */
  colors?: ColorConfig;
  /** Style for log entry IDs */
  logIdColor?: ChalkInstance;
  /** Style for data values in structured data */
  dataValueColor?: ChalkInstance;
  /** Style for data keys in structured data */
  dataKeyColor?: ChalkInstance;
}

/**
 * Runtime environment for the transport.
 * Determines how logs are output.
 */
export type Runtime = "node" | "browser";

/**
 * Configuration for the SimpleView renderer.
 */
export interface SimpleViewConfig {
  /** Current view mode for log display */
  viewMode: PrettyTerminalViewMode;
  /** Maximum depth for inline data display before collapsing */
  maxInlineDepth: number;
  /** Configuration for colors and styling */
  config: Required<ViewConfig>;
  /** Whether to show log IDs in the output */
  showLogId: boolean;
  /** Custom timestamp format. Can be a date-fns format string or a custom function */
  timestampFormat: string | ((timestamp: number) => string);
  /** Whether to collapse arrays in expanded mode for cleaner output */
  collapseArrays: boolean;
  /** Whether to flatten nested objects with dot notation in inline mode */
  flattenNestedObjects: boolean;
  /** Runtime environment for output */
  runtime: Runtime;
  /** Whether to include data object as second parameter in browser console calls for better debugging */
  includeDataInBrowserConsole?: boolean;
}

/**
 * Theme configuration for the simple pretty terminal transport.
 * Defines styling for log output.
 */
export interface SimplePrettyTerminalTheme extends ViewConfig {
  // All properties from ViewConfig are now directly available
}

/**
 * View modes for log display.
 * - inline: Shows all information with complete data structures inline (no truncation)
 * - message-only: Shows only the timestamp, log level and message for a cleaner output (no data shown)
 * - expanded: Shows timestamp, level, and message on first line, with data on indented separate lines
 */
export type PrettyTerminalViewMode = "inline" | "message-only" | "expanded";

/**
 * Main configuration interface for SimplePrettyTerminalTransport.
 * Extends the base transport configuration with simple pretty terminal specific options.
 */
export interface SimplePrettyTerminalConfig extends LoggerlessTransportConfig {
  /** Maximum depth for inline data display before collapsing. Default is 4. */
  maxInlineDepth?: number;
  /** Custom theme configuration for log display */
  theme?: SimplePrettyTerminalTheme;
  /** Whether the transport is enabled. If false, all operations will no-op. Defaults to true */
  enabled?: boolean;
  /** View mode for log display. Defaults to "inline" */
  viewMode?: PrettyTerminalViewMode;
  /** Whether to show log IDs in the output. Defaults to false */
  showLogId?: boolean;
  /** Custom timestamp format. Can be a date-fns format string or a custom function. Defaults to "HH:mm:ss.SSS" */
  timestampFormat?: string | ((timestamp: number) => string);
  /** Whether to collapse arrays in expanded mode. Defaults to true */
  collapseArrays?: boolean;
  /** Whether to flatten nested objects with dot notation in inline mode. Defaults to true */
  flattenNestedObjects?: boolean;
  /** Runtime environment for output */
  runtime: Runtime;
  /** Whether to include data object as second parameter in browser console calls for better debugging. Defaults to false */
  includeDataInBrowserConsole?: boolean;
  /** Whether to enable sprintf-style message formatting. When true, messages with format specifiers like %s, %d will be parsed. Defaults to false */
  enableSprintf?: boolean;
}
