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

describe("tagged template syntax", () => {
  it("should support tagged template syntax on info", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const userId = "123";

    log.info`User ${userId} logged in`;

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["User 123 logged in"],
      }),
    );
  });

  it("should support tagged template syntax on all log levels", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const userId = "123";

    log.info`User ${userId} logged in`;
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({ level: LogLevel.info, data: ["User 123 logged in"] }),
    );

    log.warn`User ${userId} logged out`;
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({ level: LogLevel.warn, data: ["User 123 logged out"] }),
    );

    log.error`User ${userId} failed login`;
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({ level: LogLevel.error, data: ["User 123 failed login"] }),
    );

    log.debug`User ${userId} session checked`;
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({ level: LogLevel.debug, data: ["User 123 session checked"] }),
    );

    log.trace`User ${userId} entering`;
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({ level: LogLevel.trace, data: ["User 123 entering"] }),
    );

    log.fatal`User ${userId} system crash`;
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({ level: LogLevel.error, data: ["User 123 system crash"] }),
    );
  });

  it("should support multiple interpolations in tagged template", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    log.info`User ${"alice"} performed ${"login"} at ${new Date(0).toISOString()}`;

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["User alice performed login at 1970-01-01T00:00:00.000Z"],
      }),
    );
  });

  it("should support tagged template with context", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const requestId = "req-123";

    log.withContext({ requestId }).info`Processing request ${requestId}`;

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [{ requestId: "req-123" }, "Processing request req-123"],
      }),
    );
  });

  it("should support tagged template with metadata", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    log.withMetadata({ duration: 150 }).warn`Request took ${150}ms`;

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.warn,
        data: [{ duration: 150 }, "Request took 150ms"],
      }),
    );
  });

  it("should support tagged template with error", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const err = new Error("timeout");

    log.withError(err).error`Request failed: ${err.message}`;

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.error,
        data: [{ err }, "Request failed: timeout"],
      }),
    );
  });

  it("should handle null values in tagged template", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const nullValue = null;

    log.info`User ${nullValue} logged in`;

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["User null logged in"],
      }),
    );
  });

  it("should handle undefined values in tagged template", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const undefinedValue = undefined;

    log.info`User ${undefinedValue} logged in`;

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["User undefined logged in"],
      }),
    );
  });

  it("should handle object values in tagged template", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const user = { name: "Alice" };

    log.info`User ${user} logged in`;

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["User [object Object] logged in"],
      }),
    );
  });

  it("should preserve template spaces in tagged template", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    log.info`Hello   world   with   spaces`;

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["Hello   world   with   spaces"],
      }),
    );
  });

  it("should support tagged template with prefix", () => {
    const log = getLogger().withPrefix("[APP]");
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    log.info`User ${"123"} logged in`;

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["[APP] User 123 logged in"],
      }),
    );
  });

  it("should support tagged template with groups", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    log.withMetadata({ test: "data" }).withGroup("auth").info`User ${"123"} logged in`;

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [{ test: "data" }, "User 123 logged in"],
      }),
    );
  });

  it("should still work with regular call syntax alongside tagged template", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    log.info("Regular call");
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["Regular call"],
      }),
    );

    const userId = "456";
    log.info`Tagged template ${userId}`;
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["Tagged template 456"],
      }),
    );

    log.info("Another regular call", "with multiple args");
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["Another regular call", "with multiple args"],
      }),
    );
  });
});
