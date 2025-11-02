import type { LogLayerPlugin } from "@loglayer/plugin";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LogBuilder } from "../LogBuilder.js";
import { LogLayer } from "../LogLayer.js";
import { mixinRegistry, useLogLayerMixin } from "../mixins.js";
import { TestLoggingLibrary } from "../TestLoggingLibrary.js";
import { ConsoleTransport } from "../transports/ConsoleTransport.js";
import type { LogLayerConfig } from "../types/index.js";
import {
  type LogBuilderMixin,
  type LogLayerMixin,
  LogLayerMixinAugmentType,
  type LogLayerMixinRegistration,
} from "../types/index.js";

describe("useLogLayerMixin", () => {
  // Reset mixinRegistry before each test
  beforeEach(() => {
    mixinRegistry.logLayerHandlers.length = 0;
    mixinRegistry.logBuilderHandlers.length = 0;
    mixinRegistry.pluginsToInit.length = 0;
  });

  afterEach(() => {
    // Clean up prototype augmentations by removing test methods
    // Note: This is a best-effort cleanup since we can't reliably track what was added
    delete (LogLayer.prototype as any).testMethod;
    delete (LogLayer.prototype as any).anotherTestMethod;
    delete (LogBuilder.prototype as any).testBuilderMethod;
    delete (LogBuilder.prototype as any).anotherTestBuilderMethod;
  });

  describe("single mixin registration", () => {
    it("should register a LogLayer mixin", () => {
      const augmentSpy = vi.fn();
      const mixin: LogLayerMixin = {
        augmentationType: LogLayerMixinAugmentType.LogLayer,
        augment: augmentSpy,
        augmentMock: vi.fn(),
      };

      const registration: LogLayerMixinRegistration = {
        mixinsToAdd: [mixin],
      };

      useLogLayerMixin(registration);

      expect(augmentSpy).toHaveBeenCalledOnce();
      expect(augmentSpy).toHaveBeenCalledWith(LogLayer.prototype);
      expect(mixinRegistry.logLayerHandlers).toHaveLength(0); // No onConstruct
    });

    it("should register a LogBuilder mixin", () => {
      const augmentSpy = vi.fn();
      const mixin: LogBuilderMixin = {
        augmentationType: LogLayerMixinAugmentType.LogBuilder,
        augment: augmentSpy,
        augmentMock: vi.fn(),
      };

      const registration: LogLayerMixinRegistration = {
        mixinsToAdd: [mixin],
      };

      useLogLayerMixin(registration);

      expect(augmentSpy).toHaveBeenCalledOnce();
      expect(augmentSpy).toHaveBeenCalledWith(LogBuilder.prototype);
      expect(mixinRegistry.logBuilderHandlers).toHaveLength(0); // No onConstruct
    });

    it("should register a LogLayer mixin with onConstruct handler", () => {
      const augmentSpy = vi.fn();
      const onConstructSpy = vi.fn();
      const mixin: LogLayerMixin = {
        augmentationType: LogLayerMixinAugmentType.LogLayer,
        onConstruct: onConstructSpy,
        augment: augmentSpy,
        augmentMock: vi.fn(),
      };

      const registration: LogLayerMixinRegistration = {
        mixinsToAdd: [mixin],
      };

      useLogLayerMixin(registration);

      expect(augmentSpy).toHaveBeenCalledOnce();
      expect(mixinRegistry.logLayerHandlers).toHaveLength(1);
      expect(mixinRegistry.logLayerHandlers[0].onConstruct).toBe(onConstructSpy);
    });

    it("should register a LogBuilder mixin with onConstruct handler", () => {
      const augmentSpy = vi.fn();
      const onConstructSpy = vi.fn();
      const mixin: LogBuilderMixin = {
        augmentationType: LogLayerMixinAugmentType.LogBuilder,
        onConstruct: onConstructSpy,
        augment: augmentSpy,
        augmentMock: vi.fn(),
      };

      const registration: LogLayerMixinRegistration = {
        mixinsToAdd: [mixin],
      };

      useLogLayerMixin(registration);

      expect(augmentSpy).toHaveBeenCalledOnce();
      expect(mixinRegistry.logBuilderHandlers).toHaveLength(1);
      expect(mixinRegistry.logBuilderHandlers[0].onConstruct).toBe(onConstructSpy);
    });

    it("should register plugins from mixin registration", () => {
      const plugin1: LogLayerPlugin = {
        id: "plugin1",
        onBeforeDataOut: vi.fn(),
      };
      const plugin2: LogLayerPlugin = {
        id: "plugin2",
        onBeforeDataOut: vi.fn(),
      };

      const augmentSpy = vi.fn();
      const mixin: LogLayerMixin = {
        augmentationType: LogLayerMixinAugmentType.LogLayer,
        augment: augmentSpy,
        augmentMock: vi.fn(),
      };

      const registration: LogLayerMixinRegistration = {
        mixinsToAdd: [mixin],
        pluginsToAdd: [plugin1, plugin2],
      };

      useLogLayerMixin(registration);

      expect(mixinRegistry.pluginsToInit).toHaveLength(2);
      expect(mixinRegistry.pluginsToInit[0]).toBe(plugin1);
      expect(mixinRegistry.pluginsToInit[1]).toBe(plugin2);
    });

    it("should use plugins from mixin registration when creating LogLayer", () => {
      const plugin1: LogLayerPlugin = {
        id: "plugin1",
        onBeforeDataOut: vi.fn(),
      };
      const plugin2: LogLayerPlugin = {
        id: "plugin2",
        onBeforeDataOut: vi.fn(),
      };

      const augmentSpy = vi.fn();
      const mixin: LogLayerMixin = {
        augmentationType: LogLayerMixinAugmentType.LogLayer,
        augment: augmentSpy,
        augmentMock: vi.fn(),
      };

      const registration: LogLayerMixinRegistration = {
        mixinsToAdd: [mixin],
        pluginsToAdd: [plugin1, plugin2],
      };

      useLogLayerMixin(registration);

      const logger = new TestLoggingLibrary();
      const log = new LogLayer({
        transport: new ConsoleTransport({
          // @ts-expect-error
          logger,
        }),
      });

      // Verify plugins from mixins are actually used
      expect(log["pluginManager"].countPlugins()).toBe(2);

      // Verify plugins are actually functional by checking they can intercept logs
      const onBeforeDataOutSpy1 = plugin1.onBeforeDataOut as ReturnType<typeof vi.fn>;
      const onBeforeDataOutSpy2 = plugin2.onBeforeDataOut as ReturnType<typeof vi.fn>;

      log.info("test message");

      expect(onBeforeDataOutSpy1).toHaveBeenCalled();
      expect(onBeforeDataOutSpy2).toHaveBeenCalled();
    });

    it("should merge plugins from config and mixin registration", () => {
      const configPlugin: LogLayerPlugin = {
        id: "config-plugin",
        onBeforeDataOut: vi.fn(),
      };
      const mixinPlugin: LogLayerPlugin = {
        id: "mixin-plugin",
        onBeforeDataOut: vi.fn(),
      };

      const augmentSpy = vi.fn();
      const mixin: LogLayerMixin = {
        augmentationType: LogLayerMixinAugmentType.LogLayer,
        augment: augmentSpy,
        augmentMock: vi.fn(),
      };

      const registration: LogLayerMixinRegistration = {
        mixinsToAdd: [mixin],
        pluginsToAdd: [mixinPlugin],
      };

      useLogLayerMixin(registration);

      const logger = new TestLoggingLibrary();
      const log = new LogLayer({
        transport: new ConsoleTransport({
          // @ts-expect-error
          logger,
        }),
        plugins: [configPlugin],
      });

      // Verify both plugins are present
      expect(log["pluginManager"].countPlugins()).toBe(2);

      // Verify both plugins are functional
      const configPluginSpy = configPlugin.onBeforeDataOut as ReturnType<typeof vi.fn>;
      const mixinPluginSpy = mixinPlugin.onBeforeDataOut as ReturnType<typeof vi.fn>;

      log.info("test message");

      expect(configPluginSpy).toHaveBeenCalled();
      expect(mixinPluginSpy).toHaveBeenCalled();
    });

    it("should register multiple mixins in a single registration", () => {
      const augmentSpy1 = vi.fn();
      const augmentSpy2 = vi.fn();
      const mixin1: LogLayerMixin = {
        augmentationType: LogLayerMixinAugmentType.LogLayer,
        augment: augmentSpy1,
        augmentMock: vi.fn(),
      };
      const mixin2: LogBuilderMixin = {
        augmentationType: LogLayerMixinAugmentType.LogBuilder,
        augment: augmentSpy2,
        augmentMock: vi.fn(),
      };

      const registration: LogLayerMixinRegistration = {
        mixinsToAdd: [mixin1, mixin2],
      };

      useLogLayerMixin(registration);

      expect(augmentSpy1).toHaveBeenCalledOnce();
      expect(augmentSpy2).toHaveBeenCalledOnce();
      expect(augmentSpy1).toHaveBeenCalledWith(LogLayer.prototype);
      expect(augmentSpy2).toHaveBeenCalledWith(LogBuilder.prototype);
    });

    it("should actually augment prototypes when mixin is registered", () => {
      const mixin: LogLayerMixin = {
        augmentationType: LogLayerMixinAugmentType.LogLayer,
        augment: (prototype) => {
          (prototype as any).testMethod = function (this: LogLayer) {
            return "test-value";
          };
        },
        augmentMock: vi.fn(),
      };

      const registration: LogLayerMixinRegistration = {
        mixinsToAdd: [mixin],
      };

      useLogLayerMixin(registration);

      const logger = new TestLoggingLibrary();
      const log = new LogLayer({
        transport: new ConsoleTransport({
          // @ts-expect-error
          logger,
        }),
      });

      expect((log as any).testMethod).toBeDefined();
      expect(typeof (log as any).testMethod).toBe("function");
      expect((log as any).testMethod()).toBe("test-value");
    });
  });

  describe("array of mixin registrations", () => {
    it("should register multiple mixin registrations", () => {
      const augmentSpy1 = vi.fn();
      const augmentSpy2 = vi.fn();
      const mixin1: LogLayerMixin = {
        augmentationType: LogLayerMixinAugmentType.LogLayer,
        augment: augmentSpy1,
        augmentMock: vi.fn(),
      };
      const mixin2: LogLayerMixin = {
        augmentationType: LogLayerMixinAugmentType.LogLayer,
        augment: augmentSpy2,
        augmentMock: vi.fn(),
      };

      const registration1: LogLayerMixinRegistration = {
        mixinsToAdd: [mixin1],
      };
      const registration2: LogLayerMixinRegistration = {
        mixinsToAdd: [mixin2],
      };

      useLogLayerMixin([registration1, registration2]);

      expect(augmentSpy1).toHaveBeenCalledOnce();
      expect(augmentSpy2).toHaveBeenCalledOnce();
      expect(augmentSpy1).toHaveBeenCalledWith(LogLayer.prototype);
      expect(augmentSpy2).toHaveBeenCalledWith(LogLayer.prototype);
    });

    it("should register plugins from multiple registrations", () => {
      const plugin1: LogLayerPlugin = {
        id: "plugin1",
        onBeforeDataOut: vi.fn(),
      };
      const plugin2: LogLayerPlugin = {
        id: "plugin2",
        onBeforeDataOut: vi.fn(),
      };

      const augmentSpy = vi.fn();
      const mixin: LogLayerMixin = {
        augmentationType: LogLayerMixinAugmentType.LogLayer,
        augment: augmentSpy,
        augmentMock: vi.fn(),
      };

      const registration1: LogLayerMixinRegistration = {
        mixinsToAdd: [mixin],
        pluginsToAdd: [plugin1],
      };
      const registration2: LogLayerMixinRegistration = {
        mixinsToAdd: [mixin],
        pluginsToAdd: [plugin2],
      };

      useLogLayerMixin([registration1, registration2]);

      expect(mixinRegistry.pluginsToInit).toHaveLength(2);
      expect(mixinRegistry.pluginsToInit[0]).toBe(plugin1);
      expect(mixinRegistry.pluginsToInit[1]).toBe(plugin2);
    });

    it("should register mixins of different types from multiple registrations", () => {
      const augmentSpy1 = vi.fn();
      const augmentSpy2 = vi.fn();
      const mixin1: LogLayerMixin = {
        augmentationType: LogLayerMixinAugmentType.LogLayer,
        augment: augmentSpy1,
        augmentMock: vi.fn(),
      };
      const mixin2: LogBuilderMixin = {
        augmentationType: LogLayerMixinAugmentType.LogBuilder,
        augment: augmentSpy2,
        augmentMock: vi.fn(),
      };

      const registration1: LogLayerMixinRegistration = {
        mixinsToAdd: [mixin1],
      };
      const registration2: LogLayerMixinRegistration = {
        mixinsToAdd: [mixin2],
      };

      useLogLayerMixin([registration1, registration2]);

      expect(augmentSpy1).toHaveBeenCalledOnce();
      expect(augmentSpy2).toHaveBeenCalledOnce();
      expect(augmentSpy1).toHaveBeenCalledWith(LogLayer.prototype);
      expect(augmentSpy2).toHaveBeenCalledWith(LogBuilder.prototype);
    });

    it("should actually augment prototypes when multiple mixins are registered", () => {
      const mixin1: LogLayerMixin = {
        augmentationType: LogLayerMixinAugmentType.LogLayer,
        augment: (prototype) => {
          (prototype as any).testMethod = function (this: LogLayer) {
            return "test-value-1";
          };
        },
        augmentMock: vi.fn(),
      };
      const mixin2: LogLayerMixin = {
        augmentationType: LogLayerMixinAugmentType.LogLayer,
        augment: (prototype) => {
          (prototype as any).anotherTestMethod = function (this: LogLayer) {
            return "test-value-2";
          };
        },
        augmentMock: vi.fn(),
      };

      const registration1: LogLayerMixinRegistration = {
        mixinsToAdd: [mixin1],
      };
      const registration2: LogLayerMixinRegistration = {
        mixinsToAdd: [mixin2],
      };

      useLogLayerMixin([registration1, registration2]);

      const logger = new TestLoggingLibrary();
      const log = new LogLayer({
        transport: new ConsoleTransport({
          // @ts-expect-error
          logger,
        }),
      });

      expect((log as any).testMethod).toBeDefined();
      expect((log as any).anotherTestMethod).toBeDefined();
      expect((log as any).testMethod()).toBe("test-value-1");
      expect((log as any).anotherTestMethod()).toBe("test-value-2");
    });
  });

  describe("onConstruct handlers", () => {
    it("should call onConstruct handler when LogLayer instance is created", () => {
      const onConstructSpy = vi.fn();
      const mixin: LogLayerMixin = {
        augmentationType: LogLayerMixinAugmentType.LogLayer,
        onConstruct: onConstructSpy,
        augment: vi.fn(),
        augmentMock: vi.fn(),
      };

      const registration: LogLayerMixinRegistration = {
        mixinsToAdd: [mixin],
      };

      useLogLayerMixin(registration);

      const logger = new TestLoggingLibrary();
      const config: LogLayerConfig = {
        transport: new ConsoleTransport({
          // @ts-expect-error
          logger,
        }),
      };

      const log = new LogLayer(config);

      expect(mixinRegistry.logLayerHandlers).toHaveLength(1);
      expect(onConstructSpy).toHaveBeenCalledOnce();
      expect(onConstructSpy).toHaveBeenCalledWith(log, config);
    });

    it("should call onConstruct handler when LogBuilder instance is created", () => {
      const onConstructSpy = vi.fn();
      const mixin: LogBuilderMixin = {
        augmentationType: LogLayerMixinAugmentType.LogBuilder,
        onConstruct: onConstructSpy,
        augment: vi.fn(),
        augmentMock: vi.fn(),
      };

      const registration: LogLayerMixinRegistration = {
        mixinsToAdd: [mixin],
      };

      useLogLayerMixin(registration);

      const logger = new TestLoggingLibrary();
      const log = new LogLayer({
        transport: new ConsoleTransport({
          // @ts-expect-error
          logger,
        }),
      });

      // Create a LogBuilder which should trigger onConstruct
      const builder = log.withMetadata({});

      expect(mixinRegistry.logBuilderHandlers).toHaveLength(1);
      expect(onConstructSpy).toHaveBeenCalledOnce();
      expect(onConstructSpy).toHaveBeenCalledWith(builder, log);
    });

    it("should register multiple onConstruct handlers for LogLayer", () => {
      const onConstructSpy1 = vi.fn();
      const onConstructSpy2 = vi.fn();
      const mixin1: LogLayerMixin = {
        augmentationType: LogLayerMixinAugmentType.LogLayer,
        onConstruct: onConstructSpy1,
        augment: vi.fn(),
        augmentMock: vi.fn(),
      };
      const mixin2: LogLayerMixin = {
        augmentationType: LogLayerMixinAugmentType.LogLayer,
        onConstruct: onConstructSpy2,
        augment: vi.fn(),
        augmentMock: vi.fn(),
      };

      const registration: LogLayerMixinRegistration = {
        mixinsToAdd: [mixin1, mixin2],
      };

      useLogLayerMixin(registration);

      expect(mixinRegistry.logLayerHandlers).toHaveLength(2);
      expect(mixinRegistry.logLayerHandlers[0].onConstruct).toBe(onConstructSpy1);
      expect(mixinRegistry.logLayerHandlers[1].onConstruct).toBe(onConstructSpy2);
    });

    it("should register multiple onConstruct handlers for LogBuilder", () => {
      const onConstructSpy1 = vi.fn();
      const onConstructSpy2 = vi.fn();
      const mixin1: LogBuilderMixin = {
        augmentationType: LogLayerMixinAugmentType.LogBuilder,
        onConstruct: onConstructSpy1,
        augment: vi.fn(),
        augmentMock: vi.fn(),
      };
      const mixin2: LogBuilderMixin = {
        augmentationType: LogLayerMixinAugmentType.LogBuilder,
        onConstruct: onConstructSpy2,
        augment: vi.fn(),
        augmentMock: vi.fn(),
      };

      const registration: LogLayerMixinRegistration = {
        mixinsToAdd: [mixin1, mixin2],
      };

      useLogLayerMixin(registration);

      expect(mixinRegistry.logBuilderHandlers).toHaveLength(2);
      expect(mixinRegistry.logBuilderHandlers[0].onConstruct).toBe(onConstructSpy1);
      expect(mixinRegistry.logBuilderHandlers[1].onConstruct).toBe(onConstructSpy2);
    });
  });

  describe("edge cases", () => {
    it("should handle empty mixins array in registration", () => {
      const registration: LogLayerMixinRegistration = {
        mixinsToAdd: [],
      };

      useLogLayerMixin(registration);

      expect(mixinRegistry.logLayerHandlers).toHaveLength(0);
      expect(mixinRegistry.logBuilderHandlers).toHaveLength(0);
      expect(mixinRegistry.pluginsToInit).toHaveLength(0);
    });

    it("should handle registration without plugins", () => {
      const augmentSpy = vi.fn();
      const mixin: LogLayerMixin = {
        augmentationType: LogLayerMixinAugmentType.LogLayer,
        augment: augmentSpy,
        augmentMock: vi.fn(),
      };

      const registration: LogLayerMixinRegistration = {
        mixinsToAdd: [mixin],
        // pluginsToAdd is optional, not provided
      };

      useLogLayerMixin(registration);

      expect(augmentSpy).toHaveBeenCalledOnce();
      expect(mixinRegistry.pluginsToInit).toHaveLength(0);
    });

    it("should handle empty array of registrations", () => {
      useLogLayerMixin([]);

      expect(mixinRegistry.logLayerHandlers).toHaveLength(0);
      expect(mixinRegistry.logBuilderHandlers).toHaveLength(0);
      expect(mixinRegistry.pluginsToInit).toHaveLength(0);
    });

    it("should handle mixin without onConstruct", () => {
      const augmentSpy = vi.fn();
      const mixin: LogLayerMixin = {
        augmentationType: LogLayerMixinAugmentType.LogLayer,
        augment: augmentSpy,
        augmentMock: vi.fn(),
        // onConstruct is optional
      };

      const registration: LogLayerMixinRegistration = {
        mixinsToAdd: [mixin],
      };

      useLogLayerMixin(registration);

      expect(augmentSpy).toHaveBeenCalledOnce();
      expect(mixinRegistry.logLayerHandlers).toHaveLength(0);
    });
  });

  describe("mixed scenarios", () => {
    it("should handle complex scenario with multiple registrations, mixins, and plugins", () => {
      const plugin1: LogLayerPlugin = { id: "plugin1", onBeforeDataOut: vi.fn() };
      const plugin2: LogLayerPlugin = { id: "plugin2", onBeforeDataOut: vi.fn() };

      const augmentSpy1 = vi.fn();
      const augmentSpy2 = vi.fn();
      const onConstructSpy1 = vi.fn();
      const onConstructSpy2 = vi.fn();

      const mixin1: LogLayerMixin = {
        augmentationType: LogLayerMixinAugmentType.LogLayer,
        onConstruct: onConstructSpy1,
        augment: augmentSpy1,
        augmentMock: vi.fn(),
      };
      const mixin2: LogBuilderMixin = {
        augmentationType: LogLayerMixinAugmentType.LogBuilder,
        onConstruct: onConstructSpy2,
        augment: augmentSpy2,
        augmentMock: vi.fn(),
      };

      const registration1: LogLayerMixinRegistration = {
        mixinsToAdd: [mixin1],
        pluginsToAdd: [plugin1],
      };
      const registration2: LogLayerMixinRegistration = {
        mixinsToAdd: [mixin2],
        pluginsToAdd: [plugin2],
      };

      useLogLayerMixin([registration1, registration2]);

      expect(augmentSpy1).toHaveBeenCalledOnce();
      expect(augmentSpy2).toHaveBeenCalledOnce();
      expect(mixinRegistry.logLayerHandlers).toHaveLength(1);
      expect(mixinRegistry.logBuilderHandlers).toHaveLength(1);
      expect(mixinRegistry.pluginsToInit).toHaveLength(2);
      expect(mixinRegistry.pluginsToInit[0]).toBe(plugin1);
      expect(mixinRegistry.pluginsToInit[1]).toBe(plugin2);
    });
  });
});
