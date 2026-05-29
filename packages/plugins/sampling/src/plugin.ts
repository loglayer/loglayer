import type { LogLayerPlugin, PluginShouldSendToLoggerParams } from "@loglayer/plugin";
import type { LogLevelType } from "@loglayer/shared";
import type { SamplingConfig, SamplingParams, SamplingStrategy } from "./types.js";

const EXEMPT_LEVELS = new Set<LogLevelType>(["error", "fatal"]);

function toRate(value: boolean | number | undefined): number {
  if (value === undefined) return 1;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function shouldKeepEmission(
  level: LogLevelType,
  strategy: SamplingStrategy,
  rate: boolean | number | undefined,
  perLevel: undefined | Partial<Record<LogLevelType, boolean | number>>,
): boolean {
  if (strategy === "per_level" && perLevel) {
    const perRate = toRate(perLevel[level]);
    // If level is not in perLevel map, fall back to rate for unmapped levels in per_level
    if (perLevel[level] === undefined) {
      const r = toRate(rate);
      if (r === 1) return true;
      if (r === 0) return false;
      return Math.random() < r;
    }
    if (perRate === 1) return true;
    if (perRate === 0) return false;
    return Math.random() < perRate;
  }

  const r = toRate(rate);
  if (r === 1) return true;
  if (r === 0) return false;
  return Math.random() < r;
}

/**
 * Creates a sampling plugin that randomly drops log entries to control volume.
 *
 * "error" and "fatal" default to rate=1 (can be overridden via `perLevel` or callback unless explicitly
 * set in `perLevel`. Custom `shouldSample` callbacks can override this behavior.
 *
 * @example
 * ```typescript
 * // Keep ~10% of logs (errors/fatals still kept by default)
 * const config = samplingPlugin({ rate: 0.1 });
 *
 * // Per-level: sample debug at 1%, keep the rest
 * const perLevelSamplingPlugin = samplingPlugin({
 *   strategy: "per_level",
 *   perLevel: { trace: 0.01, debug: 0.1 },
 * });
 *
 * // Drop errors too by explicitly setting error rate to 0
 * const dropErrors = samplingPlugin({
 *   strategy: "per_level",
 *   perLevel: { error: 0, fatal: 0 },
 * });
 *
 * // Custom: only keep logs that have a userId
 * const custom = samplingPlugin({
 *   shouldSample: ({ metadata }) => !!metadata?.userId,
 * });
 * ```
 */
export function samplingPlugin(config: SamplingConfig): LogLayerPlugin {
  const snapshotPerLevel = config.perLevel ? { ...config.perLevel } : undefined;
  const strategy = config.strategy ?? "default";
  const rate = config.rate;
  const perLevel = snapshotPerLevel;

  return {
    id: config.id,
    disabled: config.disabled,
    shouldSendToLogger: (params: PluginShouldSendToLoggerParams): boolean => {
      // Custom callback takes priority — can override error/fatal default exemption
      if (config.shouldSample) {
        const samplingParams: SamplingParams = {
          level: params.logLevel,
          messages: params.messages,
          metadata: params.metadata,
          context: params.context,
          error: params.error,
        };
        try {
          return config.shouldSample(samplingParams);
        } catch {
          // Fail-open: if callback throws, keep the event
          return true;
        }
      }

      // error/fatal default to rate=1 unless explicitly set in perLevel
      if (EXEMPT_LEVELS.has(params.logLevel) && perLevel?.[params.logLevel] === undefined) {
        return true;
      }

      return shouldKeepEmission(params.logLevel, strategy, rate, perLevel);
    },
  };
}
