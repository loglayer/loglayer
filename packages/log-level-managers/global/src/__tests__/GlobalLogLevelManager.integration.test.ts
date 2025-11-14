import { LogLevel } from "@loglayer/log-level-manager";
import { LogLayer, TestLoggingLibrary, TestTransport } from "loglayer";
import { describe, expect, it } from "vitest";
import { GlobalLogLevelManager } from "../GlobalLogLevelManager.js";

function getLogger() {
  const genericLogger = new TestLoggingLibrary();

  return new LogLayer({
    transport: new TestTransport({
      id: "test",
      logger: genericLogger,
    }),
  });
}

describe("GlobalLogLevelManager integration with LogLayer", () => {
  it("should share log level state across all loggers", () => {
    const parentLog = getLogger();
    const _parentGenericLogger = parentLog.getLoggerInstance("test") as TestLoggingLibrary;

    parentLog.withLogLevelManager(new GlobalLogLevelManager());
    parentLog.setLevel(LogLevel.warn);

    const childLog = parentLog.child();
    const _childGenericLogger = childLog.getLoggerInstance("test") as TestLoggingLibrary;

    // Both should have the same log level (global state)
    expect(parentLog.isLevelEnabled(LogLevel.warn)).toBe(true);
    expect(childLog.isLevelEnabled(LogLevel.warn)).toBe(true);
    expect(parentLog.isLevelEnabled(LogLevel.info)).toBe(false);
    expect(childLog.isLevelEnabled(LogLevel.info)).toBe(false);

    // Child change should affect parent (global state)
    childLog.setLevel(LogLevel.debug);

    expect(parentLog.isLevelEnabled(LogLevel.debug)).toBe(true);
    expect(childLog.isLevelEnabled(LogLevel.debug)).toBe(true);
  });

  it("should apply log level changes globally affecting all loggers", () => {
    const log1 = getLogger();
    const _log1GenericLogger = log1.getLoggerInstance("test") as TestLoggingLibrary;

    log1.withLogLevelManager(new GlobalLogLevelManager());
    log1.setLevel(LogLevel.warn);

    const log2 = getLogger();
    const _log2GenericLogger = log2.getLoggerInstance("test") as TestLoggingLibrary;

    log2.withLogLevelManager(new GlobalLogLevelManager());

    // Both should have the same log level (global state)
    expect(log1.isLevelEnabled(LogLevel.warn)).toBe(true);
    expect(log2.isLevelEnabled(LogLevel.warn)).toBe(true);

    // Change from log2 should affect log1
    log2.setLevel(LogLevel.error);

    expect(log1.isLevelEnabled(LogLevel.error)).toBe(true);
    expect(log2.isLevelEnabled(LogLevel.error)).toBe(true);
    expect(log1.isLevelEnabled(LogLevel.warn)).toBe(false);
    expect(log2.isLevelEnabled(LogLevel.warn)).toBe(false);
  });

  it("should respect log level when logging messages", () => {
    const parentLog = getLogger();
    const parentGenericLogger = parentLog.getLoggerInstance("test") as TestLoggingLibrary;

    parentLog.withLogLevelManager(new GlobalLogLevelManager());
    parentLog.setLevel(LogLevel.warn);

    const childLog = parentLog.child();
    const childGenericLogger = childLog.getLoggerInstance("test") as TestLoggingLibrary;

    // Info should not be logged (below warn)
    parentLog.info("parent info");
    expect(parentGenericLogger.popLine()).toBeUndefined();

    childLog.info("child info");
    expect(childGenericLogger.popLine()).toBeUndefined();

    // Warn should be logged
    parentLog.warn("parent warn");
    expect(parentGenericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.warn,
        data: ["parent warn"],
      }),
    );

    childLog.warn("child warn");
    expect(childGenericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.warn,
        data: ["child warn"],
      }),
    );

    // Change log level globally from child
    childLog.setLevel(LogLevel.debug);

    // Now info should be logged (global change affected parent)
    parentLog.info("parent info after change");
    expect(parentGenericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["parent info after change"],
      }),
    );
  });

  it("should propagate changes through nested children", () => {
    const parentLog = getLogger();
    parentLog.withLogLevelManager(new GlobalLogLevelManager());
    parentLog.setLevel(LogLevel.error);

    const childLog = parentLog.child();
    const grandchildLog = childLog.child();

    // All should have the same log level
    expect(parentLog.isLevelEnabled(LogLevel.error)).toBe(true);
    expect(childLog.isLevelEnabled(LogLevel.error)).toBe(true);
    expect(grandchildLog.isLevelEnabled(LogLevel.error)).toBe(true);

    // Grandchild change should affect all
    grandchildLog.setLevel(LogLevel.debug);

    expect(parentLog.isLevelEnabled(LogLevel.debug)).toBe(true);
    expect(childLog.isLevelEnabled(LogLevel.debug)).toBe(true);
    expect(grandchildLog.isLevelEnabled(LogLevel.debug)).toBe(true);
  });
});
