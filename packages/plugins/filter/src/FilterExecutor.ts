import { jsonquery } from "@jsonquerylang/jsonquery";
import type { PluginShouldSendToLoggerParams } from "@loglayer/plugin";
import type { filterPluginParams } from "./types.js";

/**
 * Internal context for the filter execution.
 * Contains the current log message details and debug information.
 */
interface FilterContext {
  /** The combined log message */
  message: string;
  /** The log level */
  logLevel: string;
  /** Additional log data */
  data: Record<string, any>;
  /** Debug messages for troubleshooting */
  debugItems: string[];
}

/**
 * Core filtering logic implementation.
 * Handles pattern matching and query-based filtering of log messages.
 *
 * @internal
 */
export class FilterExecutor {
  private readonly config: filterPluginParams;
  private context: FilterContext;

  /**
   * Creates a new FilterExecutor instance.
   *
   * @param config - The filter plugin configuration
   */
  constructor(config: filterPluginParams) {
    this.config = config;
    this.context = {
      message: "",
      logLevel: "",
      data: {},
      debugItems: [],
    };
  }

  /**
   * Resets the context for a new log message check.
   *
   * @param params - The log message parameters
   */
  private resetContext(params: PluginShouldSendToLoggerParams): void {
    this.context = {
      message: params.messages?.join(" ") || "",
      logLevel: params.logLevel,
      data: params.data || {},
      debugItems: ["[filter-plugin] ================================="],
    };
  }

  /**
   * Prints debug information if debug mode is enabled.
   */
  private printDebugItems(): void {
    if (this.config.debug) {
      for (const item of this.context.debugItems) {
        console.log(item);
      }
    }
  }

  /**
   * Checks if the current message matches any of the configured patterns.
   * Supports both string and RegExp patterns.
   *
   * @returns true if any pattern matches, false otherwise
   */
  private checkMessagePatterns(): boolean {
    if (!this.config.messages?.length) {
      return false;
    }

    if (this.config.debug) {
      this.context.debugItems.push(`[filter-plugin] message: ${this.context.message}`);
    }

    for (const pattern of this.config.messages) {
      if (this.config.debug) {
        this.context.debugItems.push(`[filter-plugin] pattern: ${pattern}`);
      }

      const matches =
        typeof pattern === "string" ? this.context.message.includes(pattern) : pattern.test(this.context.message);

      if (matches) {
        this.context.debugItems.push("[filter-plugin] pattern match: true");
        return true;
      }

      this.context.debugItems.push("[filter-plugin] pattern match: false");
    }

    return false;
  }

  /**
   * Checks if the current message matches any of the configured queries.
   * Uses @jsonquerylang/jsonquery for query execution.
   *
   * @returns true if any query matches, false otherwise
   */
  private checkQueries(): boolean {
    if (!this.config.queries?.length) {
      return false;
    }

    const queryContext = {
      level: this.context.logLevel,
      message: this.context.message,
      data: this.context.data,
    };

    try {
      // Process each query individually and return true if any match
      for (const q of this.config.queries) {
        // Split OR conditions and wrap each in filter()
        const conditions = q.split(" or ").map((cond) => `filter(${cond.trim().replaceAll(`'`, `"`)})`);
        const query = conditions.join(" or ");

        if (this.config.debug) {
          this.context.debugItems.push(`[filter-plugin] query: filter(${query})`);
          this.context.debugItems.push(`[filter-plugin] input: ${JSON.stringify(queryContext)}`);
        }

        // Try each condition separately
        for (const condition of conditions) {
          try {
            const output = jsonquery([queryContext], condition) as Array<any>;
            if (output.length > 0) {
              if (this.config.debug) {
                this.context.debugItems.push(`[filter-plugin] query match: ${output.length > 0}`);
              }
              return true;
            }
          } catch (e) {
            console.error(`[filter-plugin] Error: ${e}`);
            console.log(`[filter-plugin] query: ${condition}`);
            console.log(`[filter-plugin] input: ${JSON.stringify(queryContext)}`);
            // Continue trying other conditions
          }
        }

        if (this.config.debug) {
          this.context.debugItems.push("[filter-plugin] query match: false");
        }
      }

      return false;
    } catch (e) {
      console.error(`[filter-plugin] Error: ${e}`);
      console.log(`[filter-plugin] queries: ${JSON.stringify(this.config.queries)}`);
      console.log(`[filter-plugin] input: ${JSON.stringify(queryContext)}`);
      return false;
    }
  }

  /**
   * Checks if a log message should be allowed based on the configured filters.
   *
   * The filtering logic is:
   * 1. If no filters defined, allow all logs
   * 2. If message patterns match, allow the log
   * 3. If queries match, allow the log
   * 4. Otherwise, filter out the log
   *
   * @param params - The log message parameters
   * @returns true if the log should be allowed, false otherwise
   */
  check(params: PluginShouldSendToLoggerParams): boolean {
    this.resetContext(params);

    // If no filters defined at all, allow everything
    if (!this.config.messages?.length && !this.config.queries?.length) {
      this.context.debugItems.push("[filter-plugin] no filters defined, allowing message");
      this.printDebugItems();
      return true;
    }

    // Check message patterns first
    if (this.checkMessagePatterns()) {
      this.printDebugItems();
      return true;
    }

    // Then check queries if message patterns didn't match
    const queryResult = this.checkQueries();
    this.printDebugItems();
    return queryResult;
  }
}
