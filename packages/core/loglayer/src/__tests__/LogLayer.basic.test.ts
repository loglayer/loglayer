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
      // @ts-ignore
      logger: genericLogger,
    }),
    ...(config || {}),
  });
}

describe("LogLayer basic functionality", () => {
  it("should assign a prefix to messages", () => {
    const log = getLogger().withPrefix("[testing]");
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const levels = ["info", "warn", "error", "debug", "trace"];

    levels.forEach((level, idx) => {
      log[level](`${level} message`, idx);

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level,
          data: [`[testing] ${level} message`, idx],
        }),
      );
    });
  });

  it("should create a child transport with only the original configuration and context", () => {
    const origLog = getLogger().withContext({
      test: "context",
    });

    const parentGenericLogger = origLog.getLoggerInstance("console") as TestLoggingLibrary;

    // Add additional context to the child transport
    const childLog = origLog.child().withContext({
      child: "childData",
    });

    childLog.info("test");

    const childGenericLogger = childLog.getLoggerInstance("console") as TestLoggingLibrary;

    expect(childGenericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [
          {
            test: "context",
            child: "childData",
          },
          "test",
        ],
      }),
    );

    // make sure the parent transport doesn't have the additional context of the child
    origLog
      .withContext({
        parentContext: "test-2",
      })
      .info("parent-test");

    expect(parentGenericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [
          {
            test: "context",
            parentContext: "test-2",
          },
          "parent-test",
        ],
      }),
    );
  });

  it("should write messages", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const levels = ["info", "warn", "error", "debug", "trace"];

    levels.forEach((level, idx) => {
      log[level](`${level} message`, idx);

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level,
          data: [`${level} message`, idx],
        }),
      );
    });
  });

  it("should toggle log output", () => {
    const log = getLogger({ enabled: false });
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    log.info("test");
    expect(genericLogger.popLine()).not.toBeDefined();

    log.enableLogging();
    log.info("test");
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: "info",
        data: ["test"],
      }),
    );

    log.disableLogging();
    log.info("test");
    expect(genericLogger.popLine()).not.toBeDefined();

    // Test LogBuilder
    log.enableLogging();
    log.withMetadata({}).disableLogging().info("test");
    expect(genericLogger.popLine()).not.toBeDefined();

    // This doesn't immediately enable log output
    log.withMetadata({}).enableLogging().info("test");

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: "info",
        data: [{}, "test"],
      }),
    );
  });

  it("should include context", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const levels = ["info", "warn", "error", "debug", "trace"];

    log.withContext({
      sample: "data",
    });

    levels.forEach((level, idx) => {
      log[level](`${level} message`, idx);

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level,
          data: [{ sample: "data" }, `${level} message`, idx],
        }),
      );
    });
  });

  it("should clear context", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const levels = ["info", "warn", "error", "debug", "trace"];

    log.withContext({
      sample: "data",
    });

    log.clearContext();

    levels.forEach((level, idx) => {
      log[level](`${level} message`, idx);

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level,
          data: [`${level} message`, idx],
        }),
      );
    });
  });

  it("should ignore empty context", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    log.withContext().info("test");
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: "info",
        data: ["test"],
      }),
    );
  });

  it("should include metadata with a message", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const levels = ["info", "warn", "error", "debug", "trace"];

    levels.forEach((level, idx) => {
      log
        .withMetadata({
          index: idx,
        })
        [level](`${level} message`, idx);

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level,
          data: [{ index: idx }, `${level} message`, idx],
        }),
      );
    });
  });

  it("should ignore empty metadata", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    log.withMetadata().info("test");
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: "info",
        data: ["test"],
      }),
    );

    log.metadataOnly();
    expect(genericLogger.popLine()).not.toBeDefined();
  });

  it("should include an error with a message", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const levels = ["info", "warn", "error", "debug", "trace"];

    levels.forEach((level, idx) => {
      const e = new Error("test");

      log.withError(e)[level](`${level} message`, idx);

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level,
          data: [{ err: e }, `${level} message`, idx],
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

  it("should log only metadata", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    log.metadataOnly({
      only: "metadata",
    });

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [
          {
            only: "metadata",
          },
        ],
      }),
    );

    log.metadataOnly(
      {
        only: "trace metadata",
      },
      LogLevel.trace,
    );

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.trace,
        data: [
          {
            only: "trace metadata",
          },
        ],
      }),
    );
  });

  it("should combine an error, metadata, and context", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const e = new Error("err");

    log.withContext({
      contextual: "data",
    });

    log
      .withError(e)
      .withMetadata({
        situational: 1234,
      })
      .info("combined data");

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [
          {
            err: e,
            contextual: "data",
            situational: 1234,
          },
          "combined data",
        ],
      }),
    );
  });

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
});
