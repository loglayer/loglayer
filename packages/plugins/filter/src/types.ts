import type { LogLayerPluginParams } from "@loglayer/plugin";

/**
 * Configuration parameters for the filter plugin.
 *
 * @example
 * ```typescript
 * const filter = filterPlugin({
 *   id: 'error-filter',
 *   messages: ['error'],
 *   queries: ['.level == "error"'],
 *   debug: true,
 * });
 * ```
 */
export interface filterPluginParams extends LogLayerPluginParams {
  /**
   * Array of string patterns or regular expressions to match against log messages.
   * If any pattern matches, the log will be allowed.
   *
   * @example
   * ```typescript
   * messages: ['error', /warning\d+/]
   * ```
   */
  messages?: Array<string | RegExp>;

  /**
   * Array of JSON queries to filter logs.
   * If any query matches, the log will be allowed.
   * Uses @jsonquerylang/jsonquery syntax.
   *
   * @example
   * ```typescript
   * queries: ['.level == "error"', '.data.userId == "123"']
   * ```
   */
  queries?: Array<string>;

  /**
   * Enable debug mode to see detailed information about the filtering process.
   * When enabled, the plugin will log:
   * - Message content
   * - Pattern matching results
   * - Query execution details
   * - Final filtering decision
   *
   * @default false
   */
  debug?: boolean;
}
