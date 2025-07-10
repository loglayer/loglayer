import { LogLevel } from "@loglayer/shared";
import type { LogLayerTransportParams } from "@loglayer/transport";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BlankTransport } from "../transports/BlankTransport.js";

describe("BlankTransport", () => {
  let mockShipToLogger: ReturnType<typeof vi.fn>;
  let transport: BlankTransport;
  let consoleSpy: any;

  beforeEach(() => {
    mockShipToLogger = vi.fn().mockReturnValue(["test message"]);
    transport = new BlankTransport({
      shipToLogger: mockShipToLogger,
    });
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
    const customTransport = new BlankTransport({
      shipToLogger: mockShipToLogger,
      enabled: false,
      level: "error",
      consoleDebug: true,
    });

    expect(customTransport.enabled).toBe(false);
    expect(customTransport.level).toBe("error");
  });

  it("should call the provided shipToLogger function", () => {
    const params: LogLayerTransportParams = {
      logLevel: LogLevel.info,
      messages: ["test message"],
      data: { test: "data" },
      hasData: true,
    };

    transport._sendToLogger(params);

    expect(mockShipToLogger).toHaveBeenCalledWith(params);
  });

  it("should return the result from shipToLogger function", () => {
    const customMessages = ["custom", "messages"];
    mockShipToLogger.mockReturnValue(customMessages);

    const params: LogLayerTransportParams = {
      logLevel: LogLevel.info,
      messages: ["test message"],
      data: {},
      hasData: false,
    };

    const result = transport.shipToLogger(params);

    expect(result).toEqual(customMessages);
  });

  it("should not process logs when disabled", () => {
    transport.enabled = false;
    const params: LogLayerTransportParams = {
      logLevel: LogLevel.info,
      messages: ["test message"],
      data: {},
      hasData: false,
    };

    transport._sendToLogger(params);

    expect(mockShipToLogger).not.toHaveBeenCalled();
  });

  it("should respect log level filtering", () => {
    const transport = new BlankTransport({
      shipToLogger: mockShipToLogger,
      level: "warn",
    });

    const testCases = [
      { level: LogLevel.trace, shouldCall: false },
      { level: LogLevel.debug, shouldCall: false },
      { level: LogLevel.info, shouldCall: false },
      { level: LogLevel.warn, shouldCall: true },
      { level: LogLevel.error, shouldCall: true },
      { level: LogLevel.fatal, shouldCall: true },
    ];

    for (const { level, shouldCall } of testCases) {
      const params: LogLayerTransportParams = {
        logLevel: level,
        messages: ["test message"],
        data: {},
        hasData: false,
      };

      transport._sendToLogger(params);

      if (shouldCall) {
        expect(mockShipToLogger).toHaveBeenCalledWith(params);
      } else {
        expect(mockShipToLogger).not.toHaveBeenCalledWith(params);
      }

      mockShipToLogger.mockClear();
    }
  });

  it("should log to console when consoleDebug is enabled", () => {
    const debugTransport = new BlankTransport({
      shipToLogger: mockShipToLogger,
      consoleDebug: true,
    });

    const params: LogLayerTransportParams = {
      logLevel: LogLevel.info,
      messages: ["info message"],
      data: {},
      hasData: false,
    };

    debugTransport._sendToLogger(params);

    expect(consoleSpy.info).toHaveBeenCalledWith("test message");
  });

  it("should use appropriate console methods for different log levels when consoleDebug is enabled", () => {
    const debugTransport = new BlankTransport({
      shipToLogger: mockShipToLogger,
      consoleDebug: true,
    });

    const testCases = [
      { level: LogLevel.trace, method: "debug" },
      { level: LogLevel.debug, method: "debug" },
      { level: LogLevel.info, method: "info" },
      { level: LogLevel.warn, method: "warn" },
      { level: LogLevel.error, method: "error" },
      { level: LogLevel.fatal, method: "debug" },
    ];

    for (const { level, method } of testCases) {
      const params: LogLayerTransportParams = {
        logLevel: level,
        messages: [`${level} message`],
        data: {},
        hasData: false,
      };

      debugTransport._sendToLogger(params);

      expect(consoleSpy[method]).toHaveBeenCalledWith("test message");
      mockShipToLogger.mockClear();
    }
  });

  it("should throw error when trying to get logger instance", () => {
    expect(() => transport.getLoggerInstance()).toThrow("This transport does not have a logger instance");
  });

  it("should work with complex shipToLogger implementations", () => {
    const complexShipToLogger = vi.fn().mockImplementation((params: LogLayerTransportParams) => {
      const { logLevel, messages, data, hasData } = params;
      const formattedMessage = `[${logLevel.toUpperCase()}] ${messages.join(" ")}`;
      const result = [formattedMessage];

      if (data && hasData) {
        result.push(JSON.stringify(data));
      }

      return result;
    });

    const complexTransport = new BlankTransport({
      shipToLogger: complexShipToLogger,
    });

    const params: LogLayerTransportParams = {
      logLevel: LogLevel.warn,
      messages: ["warning", "message"],
      data: { severity: "high", user: "test" },
      hasData: true,
    };

    const result = complexTransport.shipToLogger(params);

    expect(complexShipToLogger).toHaveBeenCalledWith(params);
    expect(result).toEqual(["[WARN] warning message", '{"severity":"high","user":"test"}']);
  });

  it("should handle async-like shipToLogger functions", () => {
    const asyncShipToLogger = vi.fn().mockImplementation((params: LogLayerTransportParams) => {
      // Simulate some async processing
      const { logLevel, messages } = params;
      return [`Processed: ${logLevel}`, ...messages];
    });

    const asyncTransport = new BlankTransport({
      shipToLogger: asyncShipToLogger,
    });

    const params: LogLayerTransportParams = {
      logLevel: LogLevel.error,
      messages: ["error occurred"],
      data: {},
      hasData: false,
    };

    const result = asyncTransport.shipToLogger(params);

    expect(asyncShipToLogger).toHaveBeenCalledWith(params);
    expect(result).toEqual(["Processed: error", "error occurred"]);
  });
});
