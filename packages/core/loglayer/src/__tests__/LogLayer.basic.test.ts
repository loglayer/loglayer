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

  it("should clear specific context keys with a single string", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    log.withContext({
      sample: "data",
      other: "value",
      keep: "this",
    });

    log.clearContext("sample");

    log.info("test message");
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: "info",
        data: [{ other: "value", keep: "this" }, "test message"],
      }),
    );
  });

  it("should clear specific context keys with an array", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    log.withContext({
      sample: "data",
      other: "value",
      keep: "this",
    });

    log.clearContext(["sample", "other"]);

    log.info("test message");
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: "info",
        data: [{ keep: "this" }, "test message"],
      }),
    );
  });

  it("should return this for method chaining when clearing context", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    log
      .withContext({
        sample: "data",
        other: "value",
      })
      .clearContext("sample")
      .info("test message");

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: "info",
        data: [{ other: "value" }, "test message"],
      }),
    );
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
});
