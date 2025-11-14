import { LogLevel } from "@loglayer/log-level-manager";
import { LogLayer, TestLoggingLibrary, TestTransport } from "loglayer";
import { describe, expect, it } from "vitest";
import { OneWayLogLevelManager } from "../OneWayLogLevelManager.js";

function getLogger() {
  const genericLogger = new TestLoggingLibrary();

  return new LogLayer({
    transport: new TestTransport({
      id: "test",
      logger: genericLogger,
    }),
  });
}

describe("OneWayLogLevelManager integration with LogLayer", () => {
  it("should propagate parent changes to child", () => {
    const parentLog = getLogger();
    const _parentGenericLogger = parentLog.getLoggerInstance("test") as TestLoggingLibrary;

    parentLog.withLogLevelManager(new OneWayLogLevelManager());
    parentLog.setLevel(LogLevel.warn);

    const childLog = parentLog.child();
    const _childGenericLogger = childLog.getLoggerInstance("test") as TestLoggingLibrary;

    // Child should inherit parent's log level
    expect(childLog.isLevelEnabled(LogLevel.warn)).toBe(true);
    expect(childLog.isLevelEnabled(LogLevel.info)).toBe(false);

    // Parent change should affect child
    parentLog.setLevel(LogLevel.debug);

    expect(parentLog.isLevelEnabled(LogLevel.debug)).toBe(true);
    expect(childLog.isLevelEnabled(LogLevel.debug)).toBe(true);
  });

  it("should not propagate child changes to parent", () => {
    const parentLog = getLogger();
    const _parentGenericLogger = parentLog.getLoggerInstance("test") as TestLoggingLibrary;

    parentLog.withLogLevelManager(new OneWayLogLevelManager());
    parentLog.setLevel(LogLevel.warn);

    const childLog = parentLog.child();
    const _childGenericLogger = childLog.getLoggerInstance("test") as TestLoggingLibrary;

    // Child change should not affect parent
    childLog.setLevel(LogLevel.debug);

    expect(parentLog.isLevelEnabled(LogLevel.warn)).toBe(true);
    expect(parentLog.isLevelEnabled(LogLevel.debug)).toBe(false);
    expect(childLog.isLevelEnabled(LogLevel.debug)).toBe(true);
  });

  it("should respect log level when logging messages", () => {
    const parentLog = getLogger();
    const parentGenericLogger = parentLog.getLoggerInstance("test") as TestLoggingLibrary;

    parentLog.withLogLevelManager(new OneWayLogLevelManager());
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

    // Parent change should affect child
    parentLog.setLevel(LogLevel.debug);

    // Now info should be logged in both (parent change propagated to child)
    parentLog.info("parent info after change");
    expect(parentGenericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["parent info after change"],
      }),
    );

    childLog.info("child info after change");
    expect(childGenericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["child info after change"],
      }),
    );

    // Child change should not affect parent
    childLog.setLevel(LogLevel.error);

    // Parent should still log debug/info
    parentLog.debug("parent debug");
    expect(parentGenericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.debug,
        data: ["parent debug"],
      }),
    );

    // Child should only log error and above
    childLog.debug("child debug");
    expect(childGenericLogger.popLine()).toBeUndefined();

    childLog.error("child error");
    expect(childGenericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.error,
        data: ["child error"],
      }),
    );
  });

  it("should propagate changes through nested children", () => {
    const parentLog = getLogger();
    parentLog.withLogLevelManager(new OneWayLogLevelManager());
    parentLog.setLevel(LogLevel.error);

    const childLog = parentLog.child();
    const grandchildLog = childLog.child();

    // All should have the same log level initially
    expect(parentLog.isLevelEnabled(LogLevel.error)).toBe(true);
    expect(childLog.isLevelEnabled(LogLevel.error)).toBe(true);
    expect(grandchildLog.isLevelEnabled(LogLevel.error)).toBe(true);

    // Parent change should affect all descendants
    parentLog.setLevel(LogLevel.debug);

    expect(parentLog.isLevelEnabled(LogLevel.debug)).toBe(true);
    expect(childLog.isLevelEnabled(LogLevel.debug)).toBe(true);
    expect(grandchildLog.isLevelEnabled(LogLevel.debug)).toBe(true);

    // Child change should only affect that child and its descendants
    childLog.setLevel(LogLevel.warn);

    expect(parentLog.isLevelEnabled(LogLevel.debug)).toBe(true); // Parent not affected
    expect(childLog.isLevelEnabled(LogLevel.warn)).toBe(true);
    expect(grandchildLog.isLevelEnabled(LogLevel.warn)).toBe(true); // Grandchild affected by child
  });
});
