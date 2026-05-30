import { LogLevel } from "@loglayer/shared";
import { describe, expect, it } from "vitest";
import { LogLayer } from "../LogLayer.js";
import { TestLoggingLibrary } from "../TestLoggingLibrary.js";
import { ConsoleTransport } from "../transports/ConsoleTransport.js";
import type { LogLayerConfig } from "../types/index.js";

function getLogger(config?: Partial<LogLayerConfig>) {
  const genericLogger = new TestLoggingLibrary();

  return new LogLayer({
    transport: new ConsoleTransport({
      id: "console",
      // @ts-expect-error
      logger: genericLogger,
    }),
    ...(config || {}),
  });
}

describe("log level management", () => {
  it("should enable individual log levels", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    // Disable all log levels first
    log.disableLogging();

    // Verify logging is disabled
    log.info("test info");
    expect(genericLogger.popLine()).not.toBeDefined();

    // Enable just the info level
    log.enableIndividualLevel(LogLevel.info);

    // Info should now work
    log.info("test info");
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["test info"],
      }),
    );

    // But other levels should still be disabled
    log.warn("test warn");
    expect(genericLogger.popLine()).not.toBeDefined();

    log.error("test error");
    expect(genericLogger.popLine()).not.toBeDefined();
  });

  it("should disable individual log levels", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    // Start with all levels enabled
    log.enableLogging();

    // Disable just the warn level
    log.disableIndividualLevel(LogLevel.warn);

    // Warn should be disabled
    log.warn("test warn");
    expect(genericLogger.popLine()).not.toBeDefined();

    // Other levels should still work
    log.info("test info");
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["test info"],
      }),
    );

    log.error("test error");
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.error,
        data: ["test error"],
      }),
    );
  });

  it("should set minimum log level", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    // Set minimum level to warn
    log.setLevel(LogLevel.warn);

    // Info and debug should be disabled
    log.info("test info");
    expect(genericLogger.popLine()).not.toBeDefined();

    log.debug("test debug");
    expect(genericLogger.popLine()).not.toBeDefined();

    // Warn, error and fatal should be enabled
    log.warn("test warn");
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.warn,
        data: ["test warn"],
      }),
    );

    log.error("test error");
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.error,
        data: ["test error"],
      }),
    );

    log.fatal("test fatal");
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        // console logger does not have a fatal level
        level: LogLevel.error,
        data: ["test fatal"],
      }),
    );
  });

  it("should correctly report if a level is enabled", () => {
    const log = getLogger();

    // Start with all levels enabled
    log.enableLogging();

    expect(log.isLevelEnabled(LogLevel.info)).toBe(true);
    expect(log.isLevelEnabled(LogLevel.warn)).toBe(true);
    expect(log.isLevelEnabled(LogLevel.error)).toBe(true);
    expect(log.isLevelEnabled(LogLevel.debug)).toBe(true);
    expect(log.isLevelEnabled(LogLevel.trace)).toBe(true);
    expect(log.isLevelEnabled(LogLevel.fatal)).toBe(true);

    // Disable specific levels
    log.disableIndividualLevel(LogLevel.debug);
    log.disableIndividualLevel(LogLevel.info);

    expect(log.isLevelEnabled(LogLevel.info)).toBe(false);
    expect(log.isLevelEnabled(LogLevel.warn)).toBe(true);
    expect(log.isLevelEnabled(LogLevel.error)).toBe(true);
    expect(log.isLevelEnabled(LogLevel.debug)).toBe(false);
    expect(log.isLevelEnabled(LogLevel.trace)).toBe(true);
    expect(log.isLevelEnabled(LogLevel.fatal)).toBe(true);

    // Set minimum level to error
    log.setLevel(LogLevel.error);

    expect(log.isLevelEnabled(LogLevel.info)).toBe(false);
    expect(log.isLevelEnabled(LogLevel.warn)).toBe(false);
    expect(log.isLevelEnabled(LogLevel.error)).toBe(true);
    expect(log.isLevelEnabled(LogLevel.debug)).toBe(false);
    expect(log.isLevelEnabled(LogLevel.trace)).toBe(false);
    expect(log.isLevelEnabled(LogLevel.fatal)).toBe(true);
  });

  it("should chain log level methods", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    // Chain multiple operations
    log.disableLogging().enableIndividualLevel(LogLevel.error).enableIndividualLevel(LogLevel.fatal);

    // Debug should be disabled
    log.debug("test debug");
    expect(genericLogger.popLine()).not.toBeDefined();

    // Error should be enabled
    log.error("test error");
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.error,
        data: ["test error"],
      }),
    );

    // Chain with other methods
    log.setLevel(LogLevel.warn).withMetadata({ test: "data" }).warn("test with chain");

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.warn,
        data: [{ test: "data" }, "test with chain"],
      }),
    );
  });
});

describe("errorOnly", () => {
  it("should log only an error", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const e = new Error("err");
    log.errorOnly(e);

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.error,
        data: [
          {
            err: e,
          },
        ],
      }),
    );
  });

  it("should copy the error message as the log message", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const e = new Error("error message");

    log.errorOnly(e, {
      logLevel: LogLevel.info,
      copyMsg: true,
    });

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [
          {
            err: e,
          },
          "error message",
        ],
      }),
    );
  });
});
