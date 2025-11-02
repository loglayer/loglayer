import type { LogLayerPlugin } from "@loglayer/plugin";
import type { LogBuilder } from "../LogBuilder.js";
import type { LogLayer } from "../LogLayer.js";
import type { MockLogBuilder } from "../MockLogBuilder.js";
import type { MockLogLayer } from "../MockLogLayer.js";
import type { LogLayerConfig } from "./index.js";

/**
 * The class that the mixin extends
 */
export enum LogLayerMixinAugmentType {
  /**
   * Mixin extends the LogBuilder prototype
   */
  LogBuilder = "LogBuilder",
  /**
   * Mixin extends the LogLayer prototype
   */
  LogLayer = "LogLayer",
}

/**
 * Interface for mixins to add custom functionality to the LogBuilder prototype.
 */
export interface LogBuilderMixin {
  /**
   * Specifies that this mixin augments the main LogBuilder class.
   * This type discrimination allows TypeScript to properly type-check mixin usage.
   */
  augmentationType: LogLayerMixinAugmentType.LogBuilder;

  /**
   * Called at the end of the LogBuilder construct() method.
   * The LogBuilder instance is passed as the first parameter.
   */
  onConstruct?: (instance: LogBuilder, logger: LogLayer) => void;

  /**
   * Function that performs the augmentation of the LogBuilder prototype.
   *
   * @param prototype - The LogBuilder class prototype being augmented
   */
  augment: (prototype: typeof LogBuilder.prototype) => void;

  /**
   * Function that performs the augmentation of the MockLogBuilder prototype.
   * This is called to ensure the mock class has the same functionality as the real class.
   *
   * @param prototype - The MockLogBuilder class prototype being augmented
   */
  augmentMock: (prototype: typeof MockLogBuilder.prototype) => void;
}

/**
 * Interface for mixins to add custom functionality to the LogLayer prototype.
 */
export interface LogLayerMixin {
  /**
   * Specifies that this mixin augments the main LogLayer class.
   * This type discrimination allows TypeScript to properly type-check mixin usage.
   */
  augmentationType: LogLayerMixinAugmentType.LogLayer;

  /**
   * Called at the end of the LogLayer construct() method.
   * The LogLayer instance is passed as the first parameter.
   */
  onConstruct?: (instance: LogLayer, config: LogLayerConfig) => void;

  /**
   * Function that performs the augmentation of the LogLayer prototype.
   *
   * @param prototype - The LogLayer class prototype being augmented
   */
  augment: (prototype: typeof LogLayer.prototype) => void;

  /**
   * Function that performs the augmentation of the MockLogLayer prototype.
   * This is called to ensure the mock class has the same functionality as the real class.
   *
   * @param prototype - The MockLogLayer class prototype being augmented
   */
  augmentMock: (prototype: typeof MockLogLayer.prototype) => void;
}

export type LogLayerMixinType = LogBuilderMixin | LogLayerMixin;

/**
 * Interface for registering mixins to LogLayer.
 */
export interface LogLayerMixinRegistration {
  /**
   * Array of mixins to add to LogLayer.
   */
  mixinsToAdd: LogLayerMixinType[];
  /**
   * Array of plugins to add to LogLayer.
   */
  pluginsToAdd?: LogLayerPlugin[];
}
