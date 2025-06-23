/**
 * A transport for LogLayer that provides simple pretty terminal output.
 * This transport displays logs with theming and formatting but without interactive features.
 *
 * Features:
 * - Real-time log display with color-coded levels
 * - Configurable themes and colors
 * - Three view modes: inline, message-only, expanded
 * - JSON data pretty printing
 * - No interactive features (no keyboard navigation, no input)
 * - Browser and Node.js runtime support
 *
 * Usage:
 * ```typescript
 * const transport = new SimplePrettyTerminalTransport({
 *   maxInlineDepth: 4,
 *   maxInlineLength: 120,
 *   theme: customTheme,
 *   viewMode: "inline",
 *   runtime: "node" // or "browser"
 * });
 * ```
 */

import type { LogLayerTransportParams } from "@loglayer/transport";
import { LoggerlessTransport } from "@loglayer/transport";
import chalk from "chalk";
import { moonlight } from "./themes.js";
import type { PrettyTerminalViewMode, SimplePrettyTerminalConfig } from "./types.js";
import { SimpleView } from "./views/SimpleView.js";

/**
 * Main transport class that handles simple pretty terminal output.
 * This class provides the display functionality of PrettyTerminal without interactive features.
 *
 * The transport supports three view modes:
 * 1. Inline: Shows all information with complete data structures inline (no truncation)
 * 2. Message-only: Shows only the timestamp, log level and message for a cleaner output (no data shown)
 * 3. Expanded: Shows timestamp, level, and message on first line, with data on indented separate lines
 */
export class SimplePrettyTerminalTransport extends LoggerlessTransport {
  /** Handles rendering and formatting of logs */
  private renderer: SimpleView;

  /** Configuration options */
  private config: SimplePrettyTerminalConfig;

  /**
   * Creates a new SimplePrettyTerminalTransport instance.
   *
   * @param config - Configuration options for the transport
   */
  constructor(config: SimplePrettyTerminalConfig) {
    super(config);

    // Store configuration
    this.config = config;

    // If transport is disabled, don't initialize anything
    if (config.enabled === false) {
      return;
    }

    // Initialize configuration with defaults
    const maxInlineDepth = config.maxInlineDepth || 4;
    const theme = config.theme || moonlight;
    const viewMode = config.viewMode || "inline";
    const showLogId = config.showLogId || false;
    const timestampFormat = config.timestampFormat || "HH:mm:ss.SSS";
    const collapseArrays = config.collapseArrays !== false; // Default to true
    const flattenNestedObjects = config.flattenNestedObjects !== false; // Default to true
    const runtime = config.runtime;
    const includeDataInBrowserConsole = config.includeDataInBrowserConsole || false;

    // Initialize view configuration with defaults
    const viewConfig = {
      colors: {
        trace: chalk.gray, // Lowest level, used for verbose output
        debug: chalk.blue, // Debug information
        info: chalk.green, // Normal operation
        warn: chalk.yellow, // Warning conditions
        error: chalk.red, // Error conditions
        fatal: chalk.bgRed.white, // Critical errors
        ...theme.colors,
      },
      logIdColor: theme.logIdColor || chalk.dim,
      dataValueColor: theme.dataValueColor || chalk.white,
      dataKeyColor: theme.dataKeyColor || chalk.dim,
    };

    // Initialize the renderer
    this.renderer = new SimpleView({
      viewMode,
      maxInlineDepth,
      showLogId,
      timestampFormat,
      collapseArrays,
      flattenNestedObjects,
      runtime,
      includeDataInBrowserConsole,
      config: viewConfig,
    });
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
   * - Rendering the log using the SimpleView renderer
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

    this.renderer.renderLogLine(entry);
    return messages;
  }

  /**
   * Changes the view mode for log display.
   *
   * @param viewMode - The new view mode to use
   */
  setViewMode(viewMode: PrettyTerminalViewMode): void {
    if (this.config.enabled === false) {
      return;
    }

    // Rebuild the viewConfig as in the constructor
    const theme = this.config.theme || moonlight;
    const runtime = this.config.runtime;
    const viewConfig = {
      colors: {
        trace: chalk.gray,
        debug: chalk.blue,
        info: chalk.green,
        warn: chalk.yellow,
        error: chalk.red,
        fatal: chalk.bgRed.white,
        ...theme.colors,
      },
      logIdColor: theme.logIdColor || chalk.dim,
      dataValueColor: theme.dataValueColor || chalk.white,
      dataKeyColor: theme.dataKeyColor || chalk.dim,
    };

    this.renderer = new SimpleView({
      viewMode,
      maxInlineDepth: this.config.maxInlineDepth || 4,
      showLogId: this.config.showLogId || false,
      timestampFormat: this.config.timestampFormat || "HH:mm:ss.SSS",
      collapseArrays: this.config.collapseArrays !== false,
      flattenNestedObjects: this.config.flattenNestedObjects !== false,
      runtime,
      includeDataInBrowserConsole: this.config.includeDataInBrowserConsole || false,
      config: viewConfig,
    });
  }

  /**
   * Gets the current view mode.
   *
   * @returns The current view mode
   */
  getViewMode(): PrettyTerminalViewMode {
    return this.renderer.getViewMode();
  }
}
