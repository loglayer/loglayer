import type { LogLayer, LogLayerMixin } from "loglayer";
import { LogLayerMixinAugmentType } from "loglayer";
import "./types.js"; // Import types to ensure declarations are processed
import { getStatsClient } from "./LogBuilder.augment.js";
import { StatsAPI } from "./StatsAPI.js";

/**
 * LogLayer mixin that adds a `stats` property to LogLayer instances.
 * Provides access to the StatsAPI for sending metrics.
 */
export const logLayerHotShotsMixin: LogLayerMixin = {
  augmentationType: LogLayerMixinAugmentType.LogLayer,
  augment: (prototype) => {
    Object.defineProperty(prototype, "stats", {
      get(this: LogLayer) {
        // Create stats API lazily and cache it
        if (!(this as any)._statsAPI) {
          (this as any)._statsAPI = new StatsAPI(getStatsClient());
        }
        return (this as any)._statsAPI;
      },
      enumerable: true,
      configurable: true,
    });

    prototype.getClient = function (this: LogLayer) {
      return getStatsClient();
    };
  },
  augmentMock: (prototype) => {
    // Mock implementation - return a no-op stats API
    Object.defineProperty(prototype, "stats", {
      get() {
        if (!(this as any)._statsAPI) {
          (this as any)._statsAPI = new StatsAPI(getStatsClient());
        }
        return (this as any)._statsAPI;
      },
      enumerable: true,
      configurable: true,
    });

    prototype.getClient = function () {
      return getStatsClient();
    };
  },
};
