import type { LoggerlessTransportConfig } from "@loglayer/transport";
import type { ChalkInstance } from "chalk";

/**
 * Represents a single log entry in the storage system.
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
 * Base configuration for log view styling.
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
  /** Style for selection indicators in interactive mode */
  selectorColor?: ChalkInstance;
}

/**
 * Extended view configuration for detailed/interactive mode.
 * Includes additional styling options for the detailed view UI.
 */
export interface DetailedViewConfig extends ViewConfig {
  /** Style for section headers in detailed view */
  headerColor?: ChalkInstance;
  /** Style for field labels in detailed view */
  labelColor?: ChalkInstance;
  /** Style for visual separators between sections */
  separatorColor?: ChalkInstance;
  /** Configuration for JSON data formatting colors */
  jsonColors?: {
    /** Style for object property names */
    keysColor?: ChalkInstance;
    /** Style for array bullets */
    dashColor?: ChalkInstance;
    /** Default style for numbers */
    numberColor?: ChalkInstance;
    /** Style for single-line strings */
    stringColor?: ChalkInstance;
    /** Style for multi-line strings */
    multilineStringColor?: ChalkInstance;
    /** Style for positive numbers */
    positiveNumberColor?: ChalkInstance;
    /** Style for negative numbers */
    negativeNumberColor?: ChalkInstance;
    /** Style for boolean values */
    booleanColor?: ChalkInstance;
    /** Style for null and undefined values */
    nullUndefinedColor?: ChalkInstance;
    /** Style for date objects */
    dateColor?: ChalkInstance;
  };
}

/**
 * Theme configuration for the pretty terminal transport.
 * Defines styling for both simple and detailed view modes.
 */
export interface PrettyTerminalTheme {
  /** Styling configuration for real-time log output mode */
  simpleView: ViewConfig;
  /** Styling configuration for interactive/detailed view mode */
  detailedView: DetailedViewConfig;
}

/**
 * Main configuration interface for PrettyTerminalTransport.
 * Extends the base transport configuration with pretty terminal specific options.
 */
export interface PrettyTerminalConfig extends LoggerlessTransportConfig {
  /** Maximum depth for inline data display before collapsing */
  maxInlineDepth?: number;
  /** Maximum length for inline data display before truncating */
  maxInlineLength?: number;
  /** Custom theme configuration for log display */
  theme?: PrettyTerminalTheme;
  /** Path to SQLite file for persistent storage. If not provided, uses in-memory database */
  logFile?: string;
  /** Whether the transport is enabled. If false, all operations will no-op. Defaults to true */
  enabled?: boolean;
  /** Whether to disable interactive mode (keyboard input and navigation). Useful when multiple applications need to print to the same terminal. Defaults to false */
  disableInteractiveMode?: boolean;
}
