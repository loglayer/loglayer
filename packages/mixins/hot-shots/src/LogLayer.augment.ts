import type { LogLayer, LogLayerMixin } from "loglayer";
import { LogLayerMixinAugmentType } from "loglayer";
import "./types.js"; // Import types to ensure declarations are processed
import { deriveContextTags } from "./deriveContextTags.js";
import { getContextTagKeys, getStatsClient, isNoOpClient } from "./LogBuilder.augment.js";
import { MockStatsAPI } from "./MockStatsAPI.js";
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
          if (isNoOpClient()) {
            (this as any)._statsAPI = new MockStatsAPI();
          } else {
            const keys = getContextTagKeys();
            const deriveTags = keys.length ? () => deriveContextTags(this.getContext(), keys) : undefined;
            (this as any)._statsAPI = new StatsAPI(getStatsClient(), deriveTags);
          }
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
      get(this: any) {
        if (!(this as any)._statsAPI) {
          if (isNoOpClient()) {
            (this as any)._statsAPI = new MockStatsAPI();
          } else {
            const keys = getContextTagKeys();
            const deriveTags =
              keys.length && typeof this.getContext === "function"
                ? () => deriveContextTags(this.getContext(), keys)
                : undefined;
            (this as any)._statsAPI = new StatsAPI(getStatsClient(), deriveTags);
          }
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
