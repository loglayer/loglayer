import type { LogLayer, LogLayerMixin } from "loglayer";
import { LogLayerMixinAugmentType } from "loglayer";
import "./types.js"; // Import types to ensure declarations are processed
import { getMetricsClient, isNoOpClient } from "./client.js";
import { MetricsAPI } from "./MetricsAPI.js";
import { MockMetricsAPI } from "./MockMetricsAPI.js";

/**
 * LogLayer mixin that adds a `ddStats` property to LogLayer instances.
 * Provides access to the MetricsAPI for sending metrics to Datadog via HTTP.
 */
export const logLayerDatadogMetricsMixin: LogLayerMixin = {
  augmentationType: LogLayerMixinAugmentType.LogLayer,
  augment: (prototype) => {
    Object.defineProperty(prototype, "ddStats", {
      get(this: LogLayer) {
        // Create metrics API lazily and cache it
        if (!(this as any)._ddMetricsAPI) {
          const client = getMetricsClient();
          (this as any)._ddMetricsAPI = isNoOpClient() || !client ? new MockMetricsAPI() : new MetricsAPI(client);
        }
        return (this as any)._ddMetricsAPI;
      },
      enumerable: true,
      configurable: true,
    });
  },
  augmentMock: (prototype) => {
    Object.defineProperty(prototype, "ddStats", {
      get() {
        if (!(this as any)._ddMetricsAPI) {
          const client = getMetricsClient();
          (this as any)._ddMetricsAPI = isNoOpClient() || !client ? new MockMetricsAPI() : new MetricsAPI(client);
        }
        return (this as any)._ddMetricsAPI;
      },
      enumerable: true,
      configurable: true,
    });
  },
};
