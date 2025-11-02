import type { LogLayerPlugin } from "@loglayer/shared";
import { LogBuilder } from "./LogBuilder.js";
import { LogLayer } from "./LogLayer.js";
import { MockLogBuilder } from "./MockLogBuilder.js";
import { MockLogLayer } from "./MockLogLayer.js";
import {
  type LogBuilderMixin,
  type LogLayerMixin,
  LogLayerMixinAugmentType,
  type LogLayerMixinRegistration,
} from "./types/index.js";

/**
 * Type for LogLayer mixin handlers that only have the onConstruct method.
 */
type LogLayerMixinHandlers = Pick<LogLayerMixin, "onConstruct">[];

/**
 * Type for LogBuilder mixin handlers that only have the onConstruct method.
 */
type LogBuilderMixinHandlers = Pick<LogBuilderMixin, "onConstruct">[];

export const mixinRegistry = {
  logLayerHandlers: [] as LogLayerMixinHandlers,
  pluginsToInit: [] as LogLayerPlugin[],
  logBuilderHandlers: [] as LogBuilderMixinHandlers,
};

/**
 * Adds one or more mixins to LogLayer.
 * @param mixin - The mixin(s) to register. Can be a single mixin registration or an array of mixin registrations.
 */
export function useLogLayerMixin(mixin: LogLayerMixinRegistration | LogLayerMixinRegistration[]): void {
  const mixins = Array.isArray(mixin) ? mixin : [mixin];

  for (const mixinRegistration of mixins) {
    if (mixinRegistration.pluginsToAdd) {
      for (const plugin of mixinRegistration.pluginsToAdd) {
        mixinRegistry.pluginsToInit.push(plugin);
      }
    }

    for (const mixinToAdd of mixinRegistration.mixinsToAdd) {
      switch (mixinToAdd.augmentationType) {
        case LogLayerMixinAugmentType.LogLayer:
          if (mixinToAdd.onConstruct) {
            mixinRegistry.logLayerHandlers.push({
              onConstruct: mixinToAdd.onConstruct,
            });
          }

          mixinToAdd.augment(LogLayer.prototype);
          mixinToAdd.augmentMock(MockLogLayer.prototype);
          break;
        case LogLayerMixinAugmentType.LogBuilder:
          if (mixinToAdd.onConstruct) {
            mixinRegistry.logBuilderHandlers.push({
              onConstruct: mixinToAdd.onConstruct,
            });
          }

          mixinToAdd.augment(LogBuilder.prototype);
          mixinToAdd.augmentMock(MockLogBuilder.prototype);
          break;
      }
    }
  }
}
