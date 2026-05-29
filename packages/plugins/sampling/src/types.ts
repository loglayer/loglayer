import type { LogLayerPluginParams } from "@loglayer/plugin";
import type { LogLevelType } from "@loglayer/shared";

/**
 * Parameters passed to a custom `shouldSample` callback.
 * Provides the log level and data so the callback can make an informed keep/drop decision.
 */
export interface SamplingParams {
  /** The log level for this emission. */
  level: LogLevelType;

  /** The log message(s) for this emission. */
  messages: unknown[];

  /** The metadata for this emission. */
  metadata: Record<string, any> | null;

  /** The context for this emission. */
  context: Record<string, any> | null;

  /** The error for this emission, if any. */
  error: unknown | null;
}

/**
 * Sampling strategy for log emissions.
 *
 * - `"default"` — a single `rate` applies to all non-error levels.
 * - `"per_level"` — per-level rates keyed by LogLevelType; levels not in the
 *   map are kept unconditionally.
 */
export type SamplingStrategy = "default" | "per_level";

/**
 * Configuration for sampling log emissions.
 *
 * "error" and "fatal" levels default to a 100% keep rate, but can be
 * explicitly overridden by setting `perLevel` rates or by using a
 * `shouldSample` callback.
 */
export interface SamplingConfig extends LogLayerPluginParams {
  /** The log level to sample. Defaults to "default". */
  strategy?: SamplingStrategy;

  /**
   * A rate between 0 and 1 that determines the fraction of events to keep.
   * - `1` (or `true`) — keep 100% (sampling disabled)
   * - `0.1` — ~10% of events kept
   * - `0` (or `false`) — keep 0% (all dropped for sample-able levels)
   * With `"default"` strategy this rate applies to all levels.
   * With `"per_level"` strategy the rate applies if the level is also not present in the `perLevel` map.
   * @default 1
   */
  rate?: boolean | number;

  /**
   * Per-level sampling rates when strategy is `"per_level"`.
   * Keys are log level strings (e.g. `"trace"`, `"info"`, `"warn"`).
   * Levels not listed keep at 100%.
   *
   * "error" and "fatal" default to a 100% keep rate unless explicitly set here.
   *
   * The map is snapshotted at construction time; mutating it afterward has
   * no effect.
   */
  perLevel?: Partial<Record<LogLevelType, boolean | number>>;

  /**
   * A custom sampling callback that receives log data and allows you to make
   * an informed keep/drop decision.
   *
   * When provided, this callback is invoked and can override the default
   * error/fatal exemption. Returning `false` will drop the event even at
   * "error" or "fatal" levels. If only `shouldSample` is set (no `rate`),
   * the callback acts as the sole gate.
   *
   * **Note:** If the callback throws, the event is kept (fail-open).
   */
  shouldSample?: (params: SamplingParams) => boolean;
}
