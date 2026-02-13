/**
 * Tests that direct log methods, errorOnly, withError, withMetadata,
 * metadataOnly, and chained builders all return void.
 */
import { lazy, LogLevel } from "loglayer";
import { allLoggers } from "./setup.js";

function testDirectLogMethods() {
  for (const log of allLoggers) {
    log.info("direct info");
    log.warn("direct warn");
    log.error("direct error");
    log.debug("direct debug");
    log.trace("direct trace");
    log.fatal("direct fatal");

    // Multiple message parameters
    log.info("message", 123, true, null, undefined);
    log.warn("first", "second", "third");
  }
}

testDirectLogMethods();

function testErrorOnly() {
  for (const log of allLoggers) {
    log.errorOnly(new Error("test"));
    log.errorOnly(new Error("test"), { logLevel: "error" });
    log.errorOnly(new Error("test"), { logLevel: "warn" });
    log.errorOnly(new Error("test"), { logLevel: LogLevel.fatal });
    log.errorOnly(new Error("test"), { copyMsg: true });
    log.errorOnly(new Error("test"), { logLevel: "fatal", copyMsg: true });
  }
}

testErrorOnly();

function testWithError() {
  for (const log of allLoggers) {
    log.withError(new Error("test")).info("with error");
    log.withError(new Error("test")).warn("with error");
    log.withError(new Error("test")).error("with error");
    log.withError(new Error("test")).debug("with error");
    log.withError(new Error("test")).trace("with error");
    log.withError(new Error("test")).fatal("with error");
  }
}

testWithError();

function testWithMetadata() {
  for (const log of allLoggers) {
    log.withMetadata({ key: "value" }).info("with metadata");
    log.withMetadata({ key: 123 }).warn("with metadata");
    log.withMetadata({ nested: { deep: true } }).error("nested metadata");
    log.withMetadata({ arr: [1, 2, 3] }).debug("array metadata");
  }
}

testWithMetadata();

function testMetadataOnly() {
  for (const log of allLoggers) {
    log.metadataOnly({ key: "value" });
    log.metadataOnly({ key: "value" }, "info");
    log.metadataOnly({ key: "value" }, "warn");
    log.metadataOnly({ key: "value" }, "error");
    log.metadataOnly({ key: "value" }, "debug");
    log.metadataOnly({ key: "value" }, "trace");
    log.metadataOnly({ key: "value" }, "fatal");
  }
}

testMetadataOnly();

function testSyncLazy() {
  for (const log of allLoggers) {
    log.withMetadata({ key: lazy(() => "sync") }).info("sync lazy");
    log.withMetadata({ count: lazy(() => 42) }).warn("sync lazy number");
    log.withMetadata({ obj: lazy(() => ({ nested: true })) }).error("sync lazy object");

    log.metadataOnly({ key: lazy(() => "sync") });
    log.metadataOnly({ key: lazy(() => 42) }, "warn");
  }
}

testSyncLazy();

function testChainedBuilders() {
  for (const log of allLoggers) {
    log.withError(new Error("test")).withMetadata({ key: "value" }).info("chained");
    log.withError(new Error("test")).withMetadata({ key: "value" }).error("chained error");
    log.withError(new Error("test")).withMetadata({ key: lazy(() => "sync") }).info("chained sync lazy");
    log.withMetadata({ key: "value" }).withError(new Error("test")).warn("metadata then error");
    log.withMetadata({ a: 1 }).withMetadata({ b: 2 }).info("double metadata");
  }
}

testChainedBuilders();
