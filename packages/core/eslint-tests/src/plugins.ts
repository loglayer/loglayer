/**
 * Tests that all plugin callbacks work correctly and log methods
 * still return void when plugins are active.
 */
import {
  ConsoleTransport,
  LogLayer,
  LogLevel,
  PluginCallbackType,
  StructuredTransport,
  TestLoggingLibrary,
  TestTransport,
  type LogLayerPlugin,
  type PluginBeforeDataOutFn,
  type PluginBeforeMessageOutFn,
  type PluginOnContextCalledFn,
  type PluginOnMetadataCalledFn,
  type PluginShouldSendToLoggerFn,
  type PluginTransformLogLevelFn,
} from "loglayer";

// =============================================================================
// onMetadataCalled
// =============================================================================

function testPluginOnMetadataCalled() {
  // Inline plugin definition
  const log = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [
      {
        id: "metadata-plugin",
        onMetadataCalled: () => ({ transformed: true }),
      },
    ],
  });
  log.withMetadata({ key: "value" }).info("metadata through plugin");
  log.metadataOnly({ key: "value" });

  // Plugin that returns null to drop metadata
  const dropPlugin: LogLayerPlugin = {
    id: "drop-metadata",
    onMetadataCalled: () => null,
  };
  const logDrop = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [dropPlugin],
  });
  logDrop.withMetadata({ key: "value" }).info("metadata dropped");
  logDrop.metadataOnly({ key: "value" });

  // Plugin that returns undefined to drop metadata
  const undefinedPlugin: LogLayerPlugin = {
    onMetadataCalled: () => undefined,
  };
  const logUndefined = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [undefinedPlugin],
  });
  logUndefined.withMetadata({ key: "value" }).info("metadata dropped");

  // Using the typed function signature
  const onMetadataCalled: PluginOnMetadataCalledFn = () => {
    return { replaced: true };
  };
  const typedPlugin: LogLayerPlugin = { onMetadataCalled };
  const logTyped = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [typedPlugin],
  });
  logTyped.withMetadata({ key: "value" }).info("typed plugin");
}

testPluginOnMetadataCalled();

// =============================================================================
// onContextCalled
// =============================================================================

function testPluginOnContextCalled() {
  const log = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [
      {
        id: "context-plugin",
        onContextCalled: () => ({ enriched: true }),
      },
    ],
  });
  log.withContext({ userId: "123" });
  log.info("context through plugin");

  // Plugin that drops context by returning null
  const dropContext: LogLayerPlugin = {
    onContextCalled: () => null,
  };
  const logDrop = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [dropContext],
  });
  logDrop.withContext({ userId: "123" });
  logDrop.info("context dropped");

  // Using the typed function signature
  const onContextCalled: PluginOnContextCalledFn = () => {
    return { injected: true };
  };
  const typedPlugin: LogLayerPlugin = { onContextCalled };
  const logTyped = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [typedPlugin],
  });
  logTyped.withContext({ key: "value" });
  logTyped.info("typed context plugin");
}

testPluginOnContextCalled();

// =============================================================================
// onBeforeDataOut
// =============================================================================

function testPluginOnBeforeDataOut() {
  // Plugin that modifies the assembled data
  const log = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [
      {
        id: "data-out-plugin",
        onBeforeDataOut: ({ data }) => {
          return { ...data, extra: "field" } as Record<string, unknown>;
        },
      },
    ],
  });
  log.info("data out plugin");
  log.withMetadata({ key: "value" }).info("data out with metadata");
  log.withError(new Error("test")).error("data out with error");
  log.withContext({ ctx: true });
  log.withMetadata({ key: "value" }).info("data out with context + metadata");

  // Plugin that returns null to drop data
  const dropData: LogLayerPlugin = {
    onBeforeDataOut: () => null,
  };
  const logDrop = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [dropData],
  });
  logDrop.withMetadata({ key: "value" }).info("data dropped");

  // Plugin that inspects logLevel in params
  const levelAware: LogLayerPlugin = {
    onBeforeDataOut: ({ logLevel, data }) => {
      return { ...data, processedLevel: logLevel } as Record<string, unknown>;
    },
  };
  const logLevel = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [levelAware],
  });
  logLevel.withMetadata({ key: "value" }).warn("level aware plugin");

  // Using the typed function signature
  const onBeforeDataOut: PluginBeforeDataOutFn = ({ data }) => {
    return data ?? {};
  };
  const typedPlugin: LogLayerPlugin = { onBeforeDataOut };
  const logTyped = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [typedPlugin],
  });
  logTyped.withMetadata({ key: "value" }).info("typed data out plugin");
}

testPluginOnBeforeDataOut();

// =============================================================================
// onBeforeMessageOut
// =============================================================================

function testPluginOnBeforeMessageOut() {
  // Plugin that modifies messages
  const log = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [
      {
        id: "message-out-plugin",
        onBeforeMessageOut: ({ messages }) => {
          return [String(messages[0]) + " (modified)"];
        },
      },
    ],
  });
  log.info("message out plugin");
  log.warn("multiple", "messages");
  log.withMetadata({ key: "value" }).info("message out with metadata");

  // Plugin that replaces messages entirely
  const replaceMessages: LogLayerPlugin = {
    onBeforeMessageOut: () => ["replaced message"],
  };
  const logReplace = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [replaceMessages],
  });
  logReplace.info("original message");

  // Plugin that inspects logLevel
  const levelAware: LogLayerPlugin = {
    onBeforeMessageOut: ({ logLevel }) => {
      return [`[${logLevel}] message`];
    },
  };
  const logLevel = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [levelAware],
  });
  logLevel.error("level aware message plugin");

  // Using the typed function signature
  const onBeforeMessageOut: PluginBeforeMessageOutFn = ({ messages }) => {
    return [String(messages[0])];
  };
  const typedPlugin: LogLayerPlugin = { onBeforeMessageOut };
  const logTyped = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [typedPlugin],
  });
  logTyped.info("typed message out plugin");
}

testPluginOnBeforeMessageOut();

// =============================================================================
// shouldSendToLogger
// =============================================================================

function testPluginShouldSendToLogger() {
  // Plugin that always allows
  const log = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [
      {
        id: "filter-plugin",
        shouldSendToLogger: () => true,
      },
    ],
  });
  log.info("should send");
  log.withMetadata({ key: "value" }).info("should send with metadata");

  // Plugin that blocks all logs
  const blockAll: LogLayerPlugin = {
    shouldSendToLogger: () => false,
  };
  const logBlocked = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [blockAll],
  });
  logBlocked.info("blocked");

  // Plugin that filters by transport ID
  const filterByTransport: LogLayerPlugin = {
    shouldSendToLogger: ({ transportId }) => transportId !== "noisy-transport",
  };
  const logFiltered = new LogLayer({
    transport: [
      new ConsoleTransport({ id: "noisy-transport", logger: console }),
      new ConsoleTransport({ id: "quiet-transport", logger: console }),
    ],
    plugins: [filterByTransport],
  });
  logFiltered.info("filtered by transport");

  // Plugin that filters by log level
  const errorOnlyPlugin: LogLayerPlugin = {
    shouldSendToLogger: ({ logLevel }) => logLevel === "error" || logLevel === "fatal",
  };
  const logErrorOnly = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [errorOnlyPlugin],
  });
  logErrorOnly.info("filtered out");
  logErrorOnly.error("passes filter");

  // Plugin that inspects all params
  const inspectAll: LogLayerPlugin = {
    shouldSendToLogger: ({ logLevel, messages, data, metadata, error, context }) => {
      void logLevel;
      void messages;
      void data;
      void metadata;
      void error;
      void context;
      return true;
    },
  };
  const logInspect = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [inspectAll],
  });
  logInspect.withContext({ ctx: true });
  logInspect.withMetadata({ meta: true }).withError(new Error("test")).error("inspect all");

  // Using the typed function signature
  const shouldSendToLogger: PluginShouldSendToLoggerFn = () => {
    return true;
  };
  const typedPlugin: LogLayerPlugin = { shouldSendToLogger };
  const logTyped = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [typedPlugin],
  });
  logTyped.info("typed shouldSendToLogger plugin");
}

testPluginShouldSendToLogger();

// =============================================================================
// transformLogLevel
// =============================================================================

function testPluginTransformLogLevel() {
  // Plugin that upgrades info to warn
  const log = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [
      {
        id: "level-transform",
        transformLogLevel: ({ logLevel }) => {
          if (logLevel === "info") return "warn";
          return null;
        },
      },
    ],
  });
  log.info("upgraded to warn");
  log.error("stays error");

  // Plugin that returns false to keep original level
  const noChange: LogLayerPlugin = {
    transformLogLevel: () => false,
  };
  const logNoChange = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [noChange],
  });
  logNoChange.info("original level");

  // Plugin that returns null to keep original level
  const nullReturn: LogLayerPlugin = {
    transformLogLevel: () => null,
  };
  const logNull = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [nullReturn],
  });
  logNull.info("original level null");

  // Plugin that returns undefined to keep original level
  const undefinedReturn: LogLayerPlugin = {
    transformLogLevel: () => undefined,
  };
  const logUndefined = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [undefinedReturn],
  });
  logUndefined.info("original level undefined");

  // Plugin that uses enum values
  const useEnum: LogLayerPlugin = {
    transformLogLevel: () => LogLevel.fatal,
  };
  const logEnum = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [useEnum],
  });
  logEnum.info("upgraded to fatal");

  // Plugin that inspects all params
  const inspectAll: LogLayerPlugin = {
    transformLogLevel: ({ logLevel, messages, data, metadata, error, context }) => {
      void logLevel;
      void messages;
      void data;
      void metadata;
      void error;
      void context;
      return null;
    },
  };
  const logInspect = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [inspectAll],
  });
  logInspect.withMetadata({ key: "value" }).info("inspect all transform");

  // Using the typed function signature
  const transformLogLevel: PluginTransformLogLevelFn = () => {
    return null;
  };
  const typedPlugin: LogLayerPlugin = { transformLogLevel };
  const logTyped = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [typedPlugin],
  });
  logTyped.info("typed transformLogLevel plugin");
}

testPluginTransformLogLevel();

// =============================================================================
// Plugin combinations
// =============================================================================

function testPluginCombinations() {
  // All callbacks in a single plugin
  const fullPlugin: LogLayerPlugin = {
    id: "full-plugin",
    onMetadataCalled: () => ({ from: "plugin" }),
    onContextCalled: () => ({ from: "plugin" }),
    onBeforeDataOut: ({ data }) => ({ ...data, enriched: true } as Record<string, unknown>),
    onBeforeMessageOut: () => ["(plugin) message"],
    shouldSendToLogger: () => true,
    transformLogLevel: () => null,
  };

  const log = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [fullPlugin],
  });
  log.info("full plugin");
  log.withMetadata({ key: "value" }).info("full plugin with metadata");
  log.withContext({ ctx: true });
  log.withError(new Error("test")).error("full plugin with error");
  log.metadataOnly({ key: "value" });
  log.errorOnly(new Error("test"));
  log.raw({ logLevel: LogLevel.info, messages: ["raw with full plugin"] });

  // Multiple plugins chained
  const plugin1: LogLayerPlugin = {
    id: "plugin-1",
    onMetadataCalled: () => ({ step: 1 }),
  };
  const plugin2: LogLayerPlugin = {
    id: "plugin-2",
    onBeforeDataOut: ({ data }) => ({ ...data, step: 2 } as Record<string, unknown>),
  };
  const plugin3: LogLayerPlugin = {
    id: "plugin-3",
    shouldSendToLogger: () => true,
  };
  const logMulti = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [plugin1, plugin2, plugin3],
  });
  logMulti.withMetadata({ key: "value" }).info("multiple plugins");
  logMulti.info("multiple plugins no metadata");

  // Disabled plugin
  const disabledPlugin: LogLayerPlugin = {
    id: "disabled",
    disabled: true,
    shouldSendToLogger: () => false,
  };
  const logDisabled = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [disabledPlugin],
  });
  logDisabled.info("disabled plugin skipped");

  // Plugin with multiple transports — shouldSendToLogger filtering
  const transportFilter: LogLayerPlugin = {
    shouldSendToLogger: ({ transportId }) => transportId === "primary",
  };
  const logTransport = new LogLayer({
    transport: [
      new ConsoleTransport({ id: "primary", logger: console }),
      new StructuredTransport({ id: "secondary", logger: console }),
      new TestTransport({ id: "test", logger: new TestLoggingLibrary() }),
    ],
    plugins: [transportFilter],
  });
  logTransport.info("only to primary");
  logTransport.withMetadata({ key: "value" }).warn("only to primary with metadata");
}

testPluginCombinations();

// =============================================================================
// Plugin management
// =============================================================================

function testPluginManagement() {
  const plugin: LogLayerPlugin = {
    id: "managed-plugin",
    onMetadataCalled: () => ({ managed: true }),
  };

  const log = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    plugins: [plugin],
  });

  log.info("with plugin");
  log.withMetadata({ key: "value" }).info("metadata through plugin");

  // Disable/enable
  log.disablePlugin("managed-plugin");
  log.info("plugin disabled");
  log.enablePlugin("managed-plugin");
  log.info("plugin enabled");

  // Remove
  log.removePlugin("managed-plugin");
  log.info("plugin removed");

  // Re-add
  log.addPlugins([plugin]);
  log.info("plugin re-added");

  // Add multiple
  log.addPlugins([
    { id: "extra-1", onBeforeDataOut: ({ data }) => ({ ...data, extra1: true } as Record<string, unknown>) },
    { id: "extra-2", shouldSendToLogger: () => true },
  ]);
  log.withMetadata({ key: "value" }).info("multiple plugins added");

  // withFreshPlugins replaces all
  log.withFreshPlugins([
    { onBeforeMessageOut: () => ["(fresh) message"] },
  ]);
  log.info("fresh plugins");
}

testPluginManagement();

// =============================================================================
// PluginCallbackType enum
// =============================================================================

function testPluginCallbackTypeEnum() {
  void PluginCallbackType.transformLogLevel;
  void PluginCallbackType.onBeforeDataOut;
  void PluginCallbackType.shouldSendToLogger;
  void PluginCallbackType.onMetadataCalled;
  void PluginCallbackType.onBeforeMessageOut;
  void PluginCallbackType.onContextCalled;
}

testPluginCallbackTypeEnum();
