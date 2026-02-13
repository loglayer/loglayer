/**
 * Tests that context, prefix, child, enable/disable, log levels,
 * mute metadata, transport management, config options, and managers
 * all produce void-returning log calls.
 */
import {
  BlankTransport,
  ConsoleTransport,
  lazy,
  LogLayer,
  LogLevel,
  StructuredTransport,
  TestLoggingLibrary,
  TestTransport,
} from "loglayer";
import { allLoggers } from "./setup.js";

function testContext() {
  for (const log of allLoggers) {
    log.withContext({ userId: "123" });
    log.info("with context");
    log.warn("with context warn");

    log.withContext({ sessionId: "abc" });
    log.withMetadata({ action: "click" }).info("context + metadata");

    log.clearContext();
    log.info("after clear all context");

    log.withContext({ a: 1, b: 2, c: 3 });
    log.clearContext("a");
    log.info("after clear key a");
    log.clearContext(["b", "c"]);
    log.info("after clear keys b, c");

    log.getContext();
    log.getContext({ raw: true });

    log.muteContext();
    log.info("context muted");
    log.unMuteContext();
    log.info("context unmuted");

    log.withContext({ ts: lazy(() => new Date().toISOString()) });
    log.info("lazy context");
  }
}

testContext();

function testPrefix() {
  for (const log of allLoggers) {
    const prefixed = log.withPrefix("[APP]");
    prefixed.info("prefixed info");
    prefixed.warn("prefixed warn");
    prefixed.error("prefixed error");
    prefixed.withMetadata({ key: "value" }).info("prefixed with metadata");
    prefixed.withError(new Error("test")).error("prefixed with error");
    prefixed.raw({ logLevel: LogLevel.info, messages: ["prefixed raw"] });
    prefixed.errorOnly(new Error("prefixed error"));
    prefixed.metadataOnly({ key: "value" });
  }
}

testPrefix();

function testChild() {
  for (const log of allLoggers) {
    const child = log.child();

    child.info("child info");
    child.warn("child warn");
    child.error("child error");
    child.debug("child debug");
    child.trace("child trace");
    child.fatal("child fatal");
    child.withMetadata({ key: "value" }).info("child with metadata");
    child.withError(new Error("test")).error("child with error");
    child.withContext({ childCtx: true });
    child.info("child with context");
    child.withMetadata({ key: lazy(() => "sync") }).info("child sync lazy");
    child.withPrefix("[CHILD]").info("child prefixed");
    child.errorOnly(new Error("child error"));
    child.metadataOnly({ key: "value" });
    child.raw({ logLevel: LogLevel.info, messages: ["child raw"] });

    const grandchild = child.child();
    grandchild.info("grandchild info");
    grandchild.withMetadata({ key: "value" }).info("grandchild with metadata");
  }
}

testChild();

function testEnableDisable() {
  for (const log of allLoggers) {
    log.disableLogging();
    log.info("should be dropped");
    log.enableLogging();
    log.info("should be logged");

    log.withMetadata({ key: "value" }).disableLogging().info("dropped via builder");
    log.withMetadata({ key: "value" }).enableLogging().info("enabled via builder");
    log.withError(new Error("test")).disableLogging().error("dropped via builder");
    log.withError(new Error("test")).enableLogging().error("enabled via builder");
  }
}

testEnableDisable();

function testLogLevels() {
  for (const log of allLoggers) {
    log.setLevel("warn");
    log.info("should be filtered");
    log.warn("should pass");
    log.error("should pass");

    log.setLevel("trace");
    log.enableIndividualLevel("debug");
    log.disableIndividualLevel("trace");
    log.isLevelEnabled("info");
    log.info("level test");
  }
}

testLogLevels();

function testMuteMetadata() {
  for (const log of allLoggers) {
    log.muteMetadata();
    log.withMetadata({ key: "value" }).info("metadata muted");
    log.metadataOnly({ key: "value" });
    log.unMuteMetadata();
    log.withMetadata({ key: "value" }).info("metadata unmuted");
  }
}

testMuteMetadata();

function testTransportManagement() {
  const log = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
  });

  log.addTransport(new StructuredTransport({ logger: console }));
  log.info("after addTransport");

  log.addTransport([
    new BlankTransport({ shipToLogger: ({ messages }): string[] => messages as string[] }),
    new TestTransport({ logger: new TestLoggingLibrary() }),
  ]);
  log.info("after addTransport array");

  log.withFreshTransports(new ConsoleTransport({ logger: console }));
  log.info("after withFreshTransports");

  log.withFreshTransports([
    new ConsoleTransport({ logger: console }),
    new StructuredTransport({ logger: console }),
  ]);
  log.info("after withFreshTransports array");

  const namedLog = new LogLayer({
    transport: new ConsoleTransport({ id: "my-console", logger: console }),
  });
  namedLog.removeTransport("my-console");

  log.getLoggerInstance("some-id");
}

testTransportManagement();

function testConfigOptions() {
  const prefixLog = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    prefix: "[PREFIX]",
  });
  prefixLog.info("with config prefix");

  const serializedLog = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    errorSerializer: (err: Error) => ({ message: err.message, stack: err.stack }),
  });
  serializedLog.withError(new Error("test")).error("serialized error");
  serializedLog.errorOnly(new Error("test"));

  const fieldNameLog = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    errorFieldName: "error",
  });
  fieldNameLog.withError(new Error("test")).error("custom error field");

  const fieldLog = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    contextFieldName: "ctx",
    metadataFieldName: "meta",
  });
  fieldLog.withContext({ userId: "123" });
  fieldLog.withMetadata({ key: "value" }).info("custom field names");
  fieldLog.metadataOnly({ key: "value" });

  const copyMsgLog = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    copyMsgOnOnlyError: true,
  });
  copyMsgLog.errorOnly(new Error("will copy message"));

  const errorInMetaLog = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    errorFieldInMetadata: true,
    metadataFieldName: "meta",
  });
  errorInMetaLog.withError(new Error("test")).error("error in metadata");

  const disabledLog = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    enabled: false,
  });
  disabledLog.info("should not log");
  disabledLog.enableLogging();
  disabledLog.info("now it logs");

  const mutedLog = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
    muteContext: true,
    muteMetadata: true,
  });
  mutedLog.withContext({ ctx: true });
  mutedLog.withMetadata({ meta: true }).info("all muted");

  prefixLog.getConfig();
}

testConfigOptions();

function testManagers() {
  const log = new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
  });

  log.getContextManager();
  log.getLogLevelManager();
  log.info("after manager access");
}

testManagers();
