/**
 * A transport for LogLayer that provides a pretty terminal output with interactive features.
 * This transport implements an interactive terminal UI for viewing and filtering logs.
 *
 * Features:
 * - Real-time log display with color-coded levels
 * - Interactive selection mode for browsing logs
 * - Detailed view for inspecting individual log entries
 * - Search/filter functionality
 * - JSON data pretty printing
 * - Configurable themes and colors
 *
 * The transport uses a singleton pattern to ensure only one instance exists,
 * as it manages terminal input and output which cannot be shared.
 */

import type { LogLayerTransportParams } from "@loglayer/transport";
import { LoggerlessTransport } from "@loglayer/transport";
import chalk from "chalk";
import { LogRenderer } from "./LogRenderer.js";
import { LogStorage } from "./LogStorage.js";
import { moonlight } from "./themes.js";
import type { DetailedViewConfig, PrettyTerminalConfig, ViewConfig } from "./types.js";
import { UIManager } from "./UIManager.js";

/**
 * Main transport class that handles pretty terminal output and interactive features.
 * This class coordinates between different components:
 * - LogStorage: Handles persistence of logs in SQLite
 * - LogRenderer: Manages all rendering and formatting
 * - UIManager: Handles user interaction and view state
 *
 * The transport supports two main view modes:
 * 1. Simple View: Real-time log output with basic formatting
 * 2. Interactive View: Full-screen mode with navigation and filtering
 *
 * Usage:
 * ```typescript
 * const transport = PrettyTerminalTransport.getInstance({
 *   maxInlineDepth: 4,
 *   maxInlineLength: 120,
 *   theme: customTheme
 * });
 * ```
 */
export class PrettyTerminalTransport extends LoggerlessTransport {
  /** Singleton instance of the transport */
  private static instance: PrettyTerminalTransport | null = null;

  /** Handles all rendering and formatting of logs */
  private renderer: LogRenderer;

  /** Manages log persistence in SQLite database */
  private storage: LogStorage;

  /** Manages user interaction and view state */
  private uiManager: UIManager;

  /** Configuration options */
  private config: PrettyTerminalConfig;

  /**
   * Creates a new PrettyTerminalTransport instance.
   * This is a singleton class - only one instance can exist at a time.
   * Use getInstance() instead of constructor directly.
   *
   * @param config - Configuration options for the transport
   * @throws Error if attempting to create multiple instances
   */
  constructor(config: PrettyTerminalConfig = {}) {
    if (PrettyTerminalTransport.instance) {
      throw new Error("PrettyTerminalTransport is a singleton. Use getPrettyTerminal() instead.");
    }
    super(config);

    // Store configuration
    this.config = config;

    // If transport is disabled, don't initialize anything
    if (config.enabled === false) {
      return;
    }

    // Initialize configuration with defaults
    const maxInlineDepth = config.maxInlineDepth || 4;
    const maxInlineLength = config.maxInlineLength || 120;
    const theme = config.theme || moonlight;
    const logFile = config.logFile; // Get optional log file path from config

    // Initialize view configurations with defaults
    // Simple view is used for real-time log output
    const simpleViewConfig: Required<ViewConfig> = {
      colors: {
        trace: chalk.gray, // Lowest level, used for verbose output
        debug: chalk.blue, // Debug information
        info: chalk.green, // Normal operation
        warn: chalk.yellow, // Warning conditions
        error: chalk.red, // Error conditions
        fatal: chalk.bgRed.white, // Critical errors
        ...theme.simpleView.colors,
      },
      logIdColor: theme.simpleView.logIdColor || chalk.dim,
      dataValueColor: theme.simpleView.dataValueColor || chalk.white,
      dataKeyColor: theme.simpleView.dataKeyColor || chalk.dim,
      selectorColor: theme.simpleView.selectorColor || chalk.cyan,
    };

    // Detailed view is used in interactive mode
    const detailedViewConfig: Required<DetailedViewConfig> = {
      colors: {
        trace: chalk.gray,
        debug: chalk.blue,
        info: chalk.green,
        warn: chalk.yellow,
        error: chalk.red,
        fatal: chalk.bgRed.white,
        ...theme.detailedView?.colors,
      },
      logIdColor: theme.detailedView?.logIdColor || chalk.dim,
      dataValueColor: theme.detailedView?.dataValueColor || chalk.white,
      dataKeyColor: theme.detailedView?.dataKeyColor || chalk.dim,
      selectorColor: theme.detailedView?.selectorColor || chalk.cyan,
      headerColor: theme.detailedView?.headerColor || chalk.cyan,
      labelColor: theme.detailedView?.labelColor || chalk.cyan.bold,
      separatorColor: theme.detailedView?.separatorColor || chalk.dim,
      // JSON formatting colors for detailed data view
      jsonColors: {
        keysColor: chalk.yellow, // Object property names
        dashColor: chalk.white, // Array bullets
        numberColor: chalk.yellow, // Default number color
        stringColor: chalk.white, // Single-line strings
        multilineStringColor: chalk.white, // Multi-line strings
        positiveNumberColor: chalk.green, // Numbers > 0
        negativeNumberColor: chalk.red, // Numbers < 0
        booleanColor: chalk.cyan, // true/false values
        nullUndefinedColor: chalk.grey, // null/undefined
        dateColor: chalk.magenta, // Date objects
        ...theme.detailedView?.jsonColors,
      },
    };

    // Initialize components in dependency order
    this.storage = new LogStorage(logFile);
    this.renderer = new LogRenderer(simpleViewConfig, detailedViewConfig, maxInlineDepth, maxInlineLength);
    this.uiManager = new UIManager(this.renderer, this.storage, config.disableInteractiveMode);

    PrettyTerminalTransport.instance = this;
  }

  /**
   * Gets or creates the singleton instance of PrettyTerminalTransport.
   * This is the recommended way to obtain a transport instance.
   *
   * @param config - Configuration options for the transport
   * @returns The singleton instance of PrettyTerminalTransport
   */
  public static getInstance(config: PrettyTerminalConfig = {}): PrettyTerminalTransport {
    if (!PrettyTerminalTransport.instance) {
      PrettyTerminalTransport.instance = new PrettyTerminalTransport(config);
    }
    return PrettyTerminalTransport.instance;
  }

  /**
   * Generates a random ID for each log entry.
   * Uses base36 encoding for compact, readable IDs.
   *
   * @returns A 6-character string ID
   * @example
   * "a1b2c3" // Example generated ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 8);
  }

  /**
   * Main transport method that receives logs from LogLayer.
   * This method is called for each log event and handles:
   * - Generating a unique ID for the log
   * - Converting the log data to a storable format
   * - Storing the log in the database
   * - Rendering the log if not in selection mode
   *
   * @param logLevel - The severity level of the log
   * @param messages - Array of message strings to be joined
   * @param data - Additional structured data to be logged
   * @param hasData - Whether the log includes additional data
   * @returns The original messages array
   */
  shipToLogger({ logLevel, messages, data, hasData }: LogLayerTransportParams): any[] {
    // If transport is disabled, return messages without processing
    if (this.config.enabled === false) {
      return messages;
    }

    const entry = {
      id: this.generateId(),
      timestamp: Date.now(),
      level: logLevel,
      message: messages.join(" "),
      data: hasData ? JSON.stringify(data) : null,
    };

    this.uiManager.handleNewLog(entry);
    return messages;
  }
}
