import type { StatsD } from "hot-shots";
import type { LogLayerMixinRegistration } from "loglayer";
import { setContextTagKeys, setStatsClient } from "./LogBuilder.augment.js";
import { logLayerHotShotsMixin } from "./LogLayer.augment.js";
import type { MemoryStatsClient } from "./MemoryStatsClient.js";
import type { HotShotsMixinOptions } from "./types.js";
import "./types.js"; // Import types to ensure declarations are processed

export type { StatsD } from "hot-shots";
export { MemoryStatsClient } from "./MemoryStatsClient.js";
export { MockStatsAPI } from "./MockStatsAPI.js";
export { StatsAPI } from "./StatsAPI.js";
export type {
  HotShotsMixinOptions,
  IAsyncDistTimerBuilder,
  IAsyncTimerBuilder,
  ICheckBuilder,
  IEventBuilder,
  IHotShotsMixin,
  IIncrementDecrementBuilder,
  IStatsAPI,
  IStatsBuilder,
  ITimerBuilder,
  StatsCallback,
  StatsRecord,
  StatsTags,
} from "./types.js";

/**
 * Register the hot-shots mixin with LogLayer.
 * This adds a `stats` property to LogLayer instances,
 * providing a fluent API for sending metrics to StatsD, DogStatsD, and Telegraf.
 *
 * @param client - The hot-shots StatsD client instance to use for sending metrics
 * @param options - Optional mixin options (e.g. `contextTagKeys`)
 * @returns A LogLayer mixin registration object
 *
 * @example
 * ```typescript
 * import { useLogLayerMixin } from 'loglayer';
 * import { hotshotsMixin } from '@loglayer/mixin-hot-shots';
 * import StatsD from 'hot-shots';
 *
 * const statsClient = new StatsD({ host: 'localhost', port: 8125 });
 * useLogLayerMixin(hotshotsMixin(statsClient));
 * ```
 */
export function hotshotsMixin(
  client: StatsD | MemoryStatsClient | null,
  options?: HotShotsMixinOptions,
): LogLayerMixinRegistration {
  // Set the client for the mixin (MemoryStatsClient duck-types the used StatsD surface)
  setStatsClient(client as StatsD | null);
  // Set the context-tag allowlist (empty when not provided)
  setContextTagKeys(options?.contextTagKeys);

  return {
    mixinsToAdd: [logLayerHotShotsMixin],
    pluginsToAdd: [],
  };
}
