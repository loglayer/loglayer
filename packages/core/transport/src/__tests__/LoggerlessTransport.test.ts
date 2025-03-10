import { LogLevel } from "@loglayer/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoggerlessTransport } from "../LoggerlessTransport.js";
import type { LogLayerTransportParams } from "../types.js";

// Create a concrete implementation for testing
class TestTransport extends LoggerlessTransport {
  public logs: any[][] = [];

  shipToLogger(params: LogLayerTransportParams): any[] {
    const messages = [`[${params.logLevel}]`, ...params.messages];
    this.logs.push(messages);
    return messages;
  }
}

describe("LoggerlessTransport", () => {
  let transport: TestTransport;
  let consoleSpy: any;

  beforeEach(() => {
    transport = new TestTransport({});
    consoleSpy = {
      log: vi.spyOn(console, "log").mockImplementation(() => {}),
      info: vi.spyOn(console, "info").mockImplementation(() => {}),
      warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
      error: vi.spyOn(console, "error").mockImplementation(() => {}),
      debug: vi.spyOn(console, "debug").mockImplementation(() => {}),
    };
  });

  it("should initialize with default values", () => {
    expect(transport.enabled).toBe(true);
    expect(transport.level).toBe("trace");
    expect(transport.id).toBeDefined();
  });

  it("should respect custom configuration", () => {
    const customTransport = new TestTransport({
      enabled: false,
      level: "error",
      consoleDebug: true,
    });

    expect(customTransport.enabled).toBe(false);
    expect(customTransport.level).toBe("error");
  });

  it("should not process logs when disabled", () => {
    transport.enabled = false;
    transport._sendToLogger({
      logLevel: LogLevel.info,
      messages: ["test message"],
      data: {},
      hasData: false,
    });

    expect(transport.logs).toHaveLength(0);
  });

  describe("log level filtering", () => {
    it("should process all levels when level is trace", () => {
      const transport = new TestTransport({ level: "trace" });

      transport._sendToLogger({ logLevel: LogLevel.trace, messages: ["test"] });
      transport._sendToLogger({ logLevel: LogLevel.debug, messages: ["test"] });
      transport._sendToLogger({ logLevel: LogLevel.info, messages: ["test"] });
      transport._sendToLogger({ logLevel: LogLevel.warn, messages: ["test"] });
      transport._sendToLogger({ logLevel: LogLevel.error, messages: ["test"] });
      transport._sendToLogger({ logLevel: LogLevel.fatal, messages: ["test"] });

      expect(transport.logs).toHaveLength(6);
      expect(transport.logs.map((log) => log[0])).toEqual([
        "[trace]",
        "[debug]",
        "[info]",
        "[warn]",
        "[error]",
        "[fatal]",
      ]);
    });

    it("should only process debug and above when level is debug", () => {
      const transport = new TestTransport({ level: "debug" });

      transport._sendToLogger({ logLevel: LogLevel.trace, messages: ["test"] });
      transport._sendToLogger({ logLevel: LogLevel.debug, messages: ["test"] });
      transport._sendToLogger({ logLevel: LogLevel.info, messages: ["test"] });
      transport._sendToLogger({ logLevel: LogLevel.warn, messages: ["test"] });
      transport._sendToLogger({ logLevel: LogLevel.error, messages: ["test"] });
      transport._sendToLogger({ logLevel: LogLevel.fatal, messages: ["test"] });

      expect(transport.logs).toHaveLength(5);
      expect(transport.logs.map((log) => log[0])).toEqual(["[debug]", "[info]", "[warn]", "[error]", "[fatal]"]);
    });

    it("should only process info and above when level is info", () => {
      const transport = new TestTransport({ level: "info" });

      transport._sendToLogger({ logLevel: LogLevel.trace, messages: ["test"] });
      transport._sendToLogger({ logLevel: LogLevel.debug, messages: ["test"] });
      transport._sendToLogger({ logLevel: LogLevel.info, messages: ["test"] });
      transport._sendToLogger({ logLevel: LogLevel.warn, messages: ["test"] });
      transport._sendToLogger({ logLevel: LogLevel.error, messages: ["test"] });
      transport._sendToLogger({ logLevel: LogLevel.fatal, messages: ["test"] });

      expect(transport.logs).toHaveLength(4);
      expect(transport.logs.map((log) => log[0])).toEqual(["[info]", "[warn]", "[error]", "[fatal]"]);
    });

    it("should only process warn and above when level is warn", () => {
      const transport = new TestTransport({ level: "warn" });

      transport._sendToLogger({ logLevel: LogLevel.trace, messages: ["test"] });
      transport._sendToLogger({ logLevel: LogLevel.debug, messages: ["test"] });
      transport._sendToLogger({ logLevel: LogLevel.info, messages: ["test"] });
      transport._sendToLogger({ logLevel: LogLevel.warn, messages: ["test"] });
      transport._sendToLogger({ logLevel: LogLevel.error, messages: ["test"] });
      transport._sendToLogger({ logLevel: LogLevel.fatal, messages: ["test"] });

      expect(transport.logs).toHaveLength(3);
      expect(transport.logs.map((log) => log[0])).toEqual(["[warn]", "[error]", "[fatal]"]);
    });

    it("should only process error and above when level is error", () => {
      const transport = new TestTransport({ level: "error" });

      transport._sendToLogger({ logLevel: LogLevel.trace, messages: ["test"] });
      transport._sendToLogger({ logLevel: LogLevel.debug, messages: ["test"] });
      transport._sendToLogger({ logLevel: LogLevel.info, messages: ["test"] });
      transport._sendToLogger({ logLevel: LogLevel.warn, messages: ["test"] });
      transport._sendToLogger({ logLevel: LogLevel.error, messages: ["test"] });
      transport._sendToLogger({ logLevel: LogLevel.fatal, messages: ["test"] });

      expect(transport.logs).toHaveLength(2);
      expect(transport.logs.map((log) => log[0])).toEqual(["[error]", "[fatal]"]);
    });

    it("should only process fatal when level is fatal", () => {
      const transport = new TestTransport({ level: "fatal" });

      transport._sendToLogger({ logLevel: LogLevel.trace, messages: ["test"] });
      transport._sendToLogger({ logLevel: LogLevel.debug, messages: ["test"] });
      transport._sendToLogger({ logLevel: LogLevel.info, messages: ["test"] });
      transport._sendToLogger({ logLevel: LogLevel.warn, messages: ["test"] });
      transport._sendToLogger({ logLevel: LogLevel.error, messages: ["test"] });
      transport._sendToLogger({ logLevel: LogLevel.fatal, messages: ["test"] });

      expect(transport.logs).toHaveLength(1);
      expect(transport.logs.map((log) => log[0])).toEqual(["[fatal]"]);
    });
  });

  it("should log to console when consoleDebug is enabled", () => {
    const debugTransport = new TestTransport({ consoleDebug: true });

    debugTransport._sendToLogger({
      logLevel: LogLevel.info,
      messages: ["info message"],
      data: {},
      hasData: false,
    });

    expect(consoleSpy.info).toHaveBeenCalledWith("[info]", "info message");
  });

  it("should use appropriate console methods for different log levels", () => {
    const debugTransport = new TestTransport({ consoleDebug: true });
    const data = {};

    const testCases = [
      { level: LogLevel.trace, method: "debug" },
      { level: LogLevel.debug, method: "debug" },
      { level: LogLevel.info, method: "info" },
      { level: LogLevel.warn, method: "warn" },
      { level: LogLevel.error, method: "error" },
      { level: LogLevel.fatal, method: "debug" },
    ];

    for (const { level, method } of testCases) {
      debugTransport._sendToLogger({
        logLevel: level,
        messages: [`${level} message`],
        data,
        hasData: false,
      });

      expect(consoleSpy[method]).toHaveBeenCalledWith(`[${level}]`, `${level} message`);
    }
  });

  it("should throw error when trying to get logger instance", () => {
    expect(() => transport.getLoggerInstance()).toThrow("This transport does not have a logger instance");
  });
});
