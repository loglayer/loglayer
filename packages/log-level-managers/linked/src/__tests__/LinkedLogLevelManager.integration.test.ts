import { LogLevel } from "@loglayer/log-level-manager";
import { LogLayer, TestLoggingLibrary, TestTransport } from "loglayer";
import { describe, expect, it } from "vitest";
import { LinkedLogLevelManager } from "../LinkedLogLevelManager.js";

function getLogger() {
  const genericLogger = new TestLoggingLibrary();

  return new LogLayer({
    transport: new TestTransport({
      id: "test",
      logger: genericLogger,
    }),
  });
}

describe("LinkedLogLevelManager integration with LogLayer", () => {
  it("should propagate parent changes to child", () => {
    const parentLog = getLogger();
    const _parentGenericLogger = parentLog.getLoggerInstance("test") as TestLoggingLibrary;

    parentLog.withLogLevelManager(new LinkedLogLevelManager());
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

  it("should propagate child changes to parent", () => {
    const parentLog = getLogger();
    const _parentGenericLogger = parentLog.getLoggerInstance("test") as TestLoggingLibrary;

    parentLog.withLogLevelManager(new LinkedLogLevelManager());
    parentLog.setLevel(LogLevel.warn);

    const childLog = parentLog.child();
    const _childGenericLogger = childLog.getLoggerInstance("test") as TestLoggingLibrary;

    // Child change should affect parent (bidirectional)
    childLog.setLevel(LogLevel.debug);

    expect(parentLog.isLevelEnabled(LogLevel.debug)).toBe(true);
    expect(childLog.isLevelEnabled(LogLevel.debug)).toBe(true);
  });

  it("should respect log level when logging messages", () => {
    const parentLog = getLogger();
    const parentGenericLogger = parentLog.getLoggerInstance("test") as TestLoggingLibrary;

    parentLog.withLogLevelManager(new LinkedLogLevelManager());
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

    // Child change should affect parent (bidirectional)
    childLog.setLevel(LogLevel.debug);

    // Now info should be logged in both (child change propagated to parent)
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

    // Parent change should also affect child
    parentLog.setLevel(LogLevel.error);

    // Both should only log error and above
    parentLog.warn("parent warn after error");
    expect(parentGenericLogger.popLine()).toBeUndefined();

    childLog.warn("child warn after error");
    expect(childGenericLogger.popLine()).toBeUndefined();

    parentLog.error("parent error");
    expect(parentGenericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.error,
        data: ["parent error"],
      }),
    );

    childLog.error("child error");
    expect(childGenericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.error,
        data: ["child error"],
      }),
    );
  });

  it("should propagate changes through nested children bidirectionally", () => {
    const parentLog = getLogger();
    parentLog.withLogLevelManager(new LinkedLogLevelManager());
    parentLog.setLevel(LogLevel.error);

    const childLog = parentLog.child();
    const grandchildLog = childLog.child();

    // All should have the same log level initially
    expect(parentLog.isLevelEnabled(LogLevel.error)).toBe(true);
    expect(childLog.isLevelEnabled(LogLevel.error)).toBe(true);
    expect(grandchildLog.isLevelEnabled(LogLevel.error)).toBe(true);

    // Grandchild change should affect all ancestors
    grandchildLog.setLevel(LogLevel.debug);

    expect(parentLog.isLevelEnabled(LogLevel.debug)).toBe(true);
    expect(childLog.isLevelEnabled(LogLevel.debug)).toBe(true);
    expect(grandchildLog.isLevelEnabled(LogLevel.debug)).toBe(true);

    // Parent change should affect all descendants
    parentLog.setLevel(LogLevel.warn);

    expect(parentLog.isLevelEnabled(LogLevel.warn)).toBe(true);
    expect(childLog.isLevelEnabled(LogLevel.warn)).toBe(true);
    expect(grandchildLog.isLevelEnabled(LogLevel.warn)).toBe(true);
  });
});
