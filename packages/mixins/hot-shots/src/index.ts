import type { StatsD } from "hot-shots";
import type { LogLayerMixin, LogLayerMixinRegistration } from "loglayer";
import { LogLayerMixinAugmentType } from "loglayer";
import { setStatsDClient } from "./client.js";
import { augmentLogLayer } from "./LogLayer.augment.js";
import { augmentMockLogLayer } from "./MockLogLayer.augment.js";

const logLayerMixin: LogLayerMixin = {
  augmentationType: LogLayerMixinAugmentType.LogLayer,
  augment: augmentLogLayer,
  augmentMock: augmentMockLogLayer,
};

/**
 * Use with useLogLayerMixin() in LogLayer to add the hot-shots mixin.
 */
export function hotshotsMixin(hotShotsClient: StatsD): LogLayerMixinRegistration {
  setStatsDClient(hotShotsClient);

  return {
    mixinsToAdd: [logLayerMixin],
  };
}
