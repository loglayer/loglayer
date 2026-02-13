/**
 * Tests that mixins work correctly with LogLayer and that
 * log methods still return void after mixin registration.
 */
import {
  ConsoleTransport,
  LogLayer,
  LogLayerMixinAugmentType,
  MockLogLayer,
  useLogLayerMixin,
  type LogBuilderMixin,
  type LogLayerMixin,
  type LogLayerMixinRegistration,
  type LogLayerPlugin,
} from "loglayer";

// =============================================================================
// LogLayer mixin — augments LogLayer prototype
// =============================================================================

function testLogLayerMixin() {
  const mixin: LogLayerMixin = {
    augmentationType: LogLayerMixinAugmentType.LogLayer,
    augment: (prototype) => {
      (prototype as unknown as Record<string, unknown>).customMethod = function () {
        return "custom-value";
      };
    },
    augmentMock: (prototype) => {
      (prototype as unknown as Record<string, unknown>).customMethod = function () {
        return "mock-value";
      };
    },
  };

  const registration: LogLayerMixinRegistration = {
    mixinsToAdd: [mixin],
  };

  useLogLayerMixin(registration);

  // Log methods still return void after mixin registration
  const log = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
  });
  log.info("after mixin registration");
  log.warn("after mixin registration");
  log.error("after mixin registration");
  log.withMetadata({ key: "value" }).info("mixin with metadata");
  log.withError(new Error("test")).error("mixin with error");
  log.errorOnly(new Error("test"));
  log.metadataOnly({ key: "value" });

  // MockLogLayer also works after mixin
  const mock = new MockLogLayer();
  mock.info("mock after mixin");
  mock.withMetadata({ key: "value" }).info("mock mixin with metadata");
}

testLogLayerMixin();

// =============================================================================
// LogLayer mixin with onConstruct
// =============================================================================

function testLogLayerMixinOnConstruct() {
  const mixin: LogLayerMixin = {
    augmentationType: LogLayerMixinAugmentType.LogLayer,
    onConstruct: () => {
      // Instance setup during construction
    },
    augment: () => {
      // Augment prototype
    },
    augmentMock: () => {
      // Augment mock prototype
    },
  };

  useLogLayerMixin({ mixinsToAdd: [mixin] });

  const log = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
  });
  log.info("after onConstruct mixin");
  log.withMetadata({ key: "value" }).info("onConstruct mixin with metadata");
}

testLogLayerMixinOnConstruct();

// =============================================================================
// LogBuilder mixin — augments LogBuilder prototype
// =============================================================================

function testLogBuilderMixin() {
  const mixin: LogBuilderMixin = {
    augmentationType: LogLayerMixinAugmentType.LogBuilder,
    augment: () => {
      // Add methods to LogBuilder
    },
    augmentMock: () => {
      // Add methods to MockLogBuilder
    },
  };

  useLogLayerMixin({ mixinsToAdd: [mixin] });

  const log = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
  });

  // Builder chain still returns void
  log.withMetadata({ key: "value" }).info("builder mixin");
  log.withError(new Error("test")).error("builder mixin error");
  log.withMetadata({ a: 1 }).withError(new Error("test")).warn("builder mixin chained");
}

testLogBuilderMixin();

// =============================================================================
// LogBuilder mixin with onConstruct
// =============================================================================

function testLogBuilderMixinOnConstruct() {
  const mixin: LogBuilderMixin = {
    augmentationType: LogLayerMixinAugmentType.LogBuilder,
    onConstruct: () => {
      // Instance setup on each LogBuilder creation
    },
    augment: () => {
      // Augment prototype
    },
    augmentMock: () => {
      // Augment mock prototype
    },
  };

  useLogLayerMixin({ mixinsToAdd: [mixin] });

  const log = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
  });

  // Each withMetadata/withError creates a LogBuilder, triggering onConstruct
  log.withMetadata({ key: "value" }).info("builder onConstruct");
  log.withError(new Error("test")).error("builder onConstruct error");
}

testLogBuilderMixinOnConstruct();

// =============================================================================
// Multiple mixins in a single registration
// =============================================================================

function testMultipleMixins() {
  const logLayerMixin: LogLayerMixin = {
    augmentationType: LogLayerMixinAugmentType.LogLayer,
    augment: () => {},
    augmentMock: () => {},
  };

  const logBuilderMixin: LogBuilderMixin = {
    augmentationType: LogLayerMixinAugmentType.LogBuilder,
    augment: () => {},
    augmentMock: () => {},
  };

  // Both in one registration
  useLogLayerMixin({
    mixinsToAdd: [logLayerMixin, logBuilderMixin],
  });

  const log = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
  });
  log.info("multiple mixins");
  log.withMetadata({ key: "value" }).info("multiple mixins with metadata");
  log.withError(new Error("test")).error("multiple mixins with error");
}

testMultipleMixins();

// =============================================================================
// Mixin with plugins
// =============================================================================

function testMixinWithPlugins() {
  const plugin: LogLayerPlugin = {
    id: "mixin-plugin",
    shouldSendToLogger: () => true,
  };

  const mixin: LogLayerMixin = {
    augmentationType: LogLayerMixinAugmentType.LogLayer,
    augment: () => {},
    augmentMock: () => {},
  };

  // Registration with both mixins and plugins
  useLogLayerMixin({
    mixinsToAdd: [mixin],
    pluginsToAdd: [plugin],
  });

  const log = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
  });
  log.info("mixin with plugin");
  log.withMetadata({ key: "value" }).info("mixin with plugin and metadata");
}

testMixinWithPlugins();

// =============================================================================
// Multiple registrations (array form)
// =============================================================================

function testArrayRegistration() {
  const reg1: LogLayerMixinRegistration = {
    mixinsToAdd: [
      {
        augmentationType: LogLayerMixinAugmentType.LogLayer,
        augment: () => {},
        augmentMock: () => {},
      },
    ],
  };

  const reg2: LogLayerMixinRegistration = {
    mixinsToAdd: [
      {
        augmentationType: LogLayerMixinAugmentType.LogBuilder,
        augment: () => {},
        augmentMock: () => {},
      },
    ],
    pluginsToAdd: [
      { id: "array-reg-plugin", onBeforeDataOut: () => ({ fromPlugin: true }) },
    ],
  };

  // Register multiple registrations via array
  useLogLayerMixin([reg1, reg2]);

  const log = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
  });
  log.info("array registration");
  log.withMetadata({ key: "value" }).info("array registration with metadata");
}

testArrayRegistration();

// =============================================================================
// Mixin with child loggers
// =============================================================================

function testMixinWithChild() {
  const mixin: LogLayerMixin = {
    augmentationType: LogLayerMixinAugmentType.LogLayer,
    augment: () => {},
    augmentMock: () => {},
  };

  useLogLayerMixin({ mixinsToAdd: [mixin] });

  const log = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
  });

  // Child loggers inherit the augmented prototype
  const child = log.child();
  child.info("child after mixin");
  child.withMetadata({ key: "value" }).info("child mixin with metadata");
  child.withError(new Error("test")).error("child mixin with error");
  child.errorOnly(new Error("test"));
  child.metadataOnly({ key: "value" });

  // Grandchild
  const grandchild = child.child();
  grandchild.info("grandchild after mixin");
}

testMixinWithChild();

// =============================================================================
// Mixin augmentation type enum
// =============================================================================

function testMixinAugmentType() {
  void LogLayerMixinAugmentType.LogBuilder;
  void LogLayerMixinAugmentType.LogLayer;
}

testMixinAugmentType();
