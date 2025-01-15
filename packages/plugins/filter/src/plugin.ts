import type { LogLayerPlugin, PluginShouldSendToLoggerParams } from "@loglayer/plugin";
import { FilterExecutor } from "./FilterExecutor.js";
import type { filterPluginParams } from "./types.js";

/**
 * Creates a new filter plugin instance.
 *
 * The filter plugin allows filtering log messages based on:
 * - String patterns
 * - Regular expressions
 * - JSON queries
 *
 * @example
 * ```typescript
 * // Filter error messages
 * const filter = filterPlugin({
 *   messages: ['error'],
 * });
 *
 * // Filter by log level
 * const levelFilter = filterPlugin({
 *   queries: ['.level == "error" or .level == "warn"'],
 * });
 * ```
 *
 * @param config - The filter plugin configuration
 * @returns A LogLayer plugin instance
 */
export function filterPlugin(config: filterPluginParams): LogLayerPlugin {
  const executor = new FilterExecutor(config);

  return {
    id: config.id,
    disabled: config.disabled,
    shouldSendToLogger: (params: PluginShouldSendToLoggerParams) => {
      return executor.check(params);
    },
  };
}
