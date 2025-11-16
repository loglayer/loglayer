import type { LogLayerMixinRegistration } from "loglayer";
import { setStatsClient } from "./LogBuilder.augment.js";
import { logLayerHotShotsMixin } from "./LogLayer.augment.js";
import type { StatsDClient } from "./types.js";
import "./types.js"; // Import types to ensure declarations are processed

// Export generic interface so users can create combined types
export type {
  ICheckBuilder,
  IEventBuilder,
  IHotShotsMixin,
  IIncrementDecrementBuilder,
  IStatsAPI,
  IStatsBuilder,
  StatsCallback,
  StatsDClient,
  StatsTags,
} from "./types.js";

/**
 * Register the hot-shots mixin with LogLayer.
 * This adds a `stats` property to LogLayer instances,
 * providing a fluent API for sending metrics to StatsD, DogStatsD, and Telegraf.
 *
 * @param client - The hot-shots StatsD client instance to use for sending metrics
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
export function hotshotsMixin(client: StatsDClient): LogLayerMixinRegistration {
  // Set the client for the mixin
  setStatsClient(client);

  return {
    mixinsToAdd: [logLayerHotShotsMixin],
    pluginsToAdd: [],
  };
}
