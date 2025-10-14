import { beforeEach, describe, expect, it, vi } from "vitest";
import { SentryTransport } from "../SentryTransport.js";

// Mock Sentry logger
const mockSentryLogger = {
  trace: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  fatal: vi.fn(),
};

describe("SentryTransport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create transport with Sentry logger", () => {
      const transport = new SentryTransport({ logger: mockSentryLogger });
      expect(transport).toBeInstanceOf(SentryTransport);
    });

    it("should create transport with custom logger", () => {
      const customLogger = {
        trace: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        fatal: vi.fn(),
      };

      const transport = new SentryTransport({ logger: customLogger });
      expect(transport).toBeInstanceOf(SentryTransport);
    });

    it("should create transport with all configuration options", () => {
      const transport = new SentryTransport({
        logger: mockSentryLogger,
        id: "custom-id",
        enabled: true,
        level: "info",
        consoleDebug: true,
      });
      expect(transport).toBeInstanceOf(SentryTransport);
    });
  });

  describe("shipToLogger", () => {
    let transport: SentryTransport;

    beforeEach(() => {
      transport = new SentryTransport({ logger: mockSentryLogger });
    });

    it("should send trace logs", () => {
      const params = {
        logLevel: "trace" as const,
        messages: ["test message"],
        data: undefined,
        hasData: false,
      };

      transport.shipToLogger(params);

      expect(mockSentryLogger.trace).toHaveBeenCalledWith("test message");
    });

    it("should send debug logs", () => {
      const params = {
        logLevel: "debug" as const,
        messages: ["debug message"],
        data: undefined,
        hasData: false,
      };

      transport.shipToLogger(params);

      expect(mockSentryLogger.debug).toHaveBeenCalledWith("debug message");
    });

    it("should send info logs", () => {
      const params = {
        logLevel: "info" as const,
        messages: ["info message"],
        data: undefined,
        hasData: false,
      };

      transport.shipToLogger(params);

      expect(mockSentryLogger.info).toHaveBeenCalledWith("info message");
    });

    it("should send warn logs", () => {
      const params = {
        logLevel: "warn" as const,
        messages: ["warn message"],
        data: undefined,
        hasData: false,
      };

      transport.shipToLogger(params);

      expect(mockSentryLogger.warn).toHaveBeenCalledWith("warn message");
    });

    it("should send error logs", () => {
      const params = {
        logLevel: "error" as const,
        messages: ["error message"],
        data: undefined,
        hasData: false,
      };

      transport.shipToLogger(params);

      expect(mockSentryLogger.error).toHaveBeenCalledWith("error message");
    });

    it("should send fatal logs", () => {
      const params = {
        logLevel: "fatal" as const,
        messages: ["fatal message"],
        data: undefined,
        hasData: false,
      };

      transport.shipToLogger(params);

      expect(mockSentryLogger.fatal).toHaveBeenCalledWith("fatal message");
    });

    it("should send logs with data", () => {
      const data = { userId: 123, action: "login" };
      const params = {
        logLevel: "info" as const,
        messages: ["user action"],
        data,
        hasData: true,
      };

      transport.shipToLogger(params);

      expect(mockSentryLogger.info).toHaveBeenCalledWith("user action", data);
    });

    it("should handle multiple messages", () => {
      const params = {
        logLevel: "info" as const,
        messages: ["multiple", "messages", "here"],
        data: undefined,
        hasData: false,
      };

      transport.shipToLogger(params);

      expect(mockSentryLogger.info).toHaveBeenCalledWith("multiple messages here");
    });

    it("should handle multiple messages with data", () => {
      const data = { userId: 456, action: "logout" };
      const params = {
        logLevel: "warn" as const,
        messages: ["user", "logged", "out"],
        data,
        hasData: true,
      };

      transport.shipToLogger(params);

      expect(mockSentryLogger.warn).toHaveBeenCalledWith("user logged out", data);
    });

    it("should throw error when logger throws", () => {
      const transport = new SentryTransport({ logger: mockSentryLogger });

      // Mock logger to throw an error
      mockSentryLogger.info.mockImplementation(() => {
        throw new Error("Sentry logger error");
      });

      const params = {
        logLevel: "info" as const,
        messages: ["test message"],
        data: undefined,
        hasData: false,
      };

      expect(() => transport.shipToLogger(params)).toThrow("Sentry logger error");
    });

    it("should handle unknown log levels by falling back to info", () => {
      // Reset the mock to not throw
      mockSentryLogger.info.mockReset();

      const params = {
        logLevel: "unknown" as any,
        messages: ["unknown level message"],
        data: undefined,
        hasData: false,
      };

      transport.shipToLogger(params);

      expect(mockSentryLogger.info).toHaveBeenCalledWith("unknown level message");
    });

    it("should return the original messages array", () => {
      // Reset the mock to not throw
      mockSentryLogger.info.mockReset();

      const messages = ["test", "message"];
      const params = {
        logLevel: "info" as const,
        messages,
        data: undefined,
        hasData: false,
      };

      const result = transport.shipToLogger(params);

      expect(result).toBe(messages);
    });
  });

  describe("transport configuration", () => {
    it("should respect enabled flag", () => {
      const transport = new SentryTransport({ logger: mockSentryLogger, enabled: false });

      const params = {
        logLevel: "info" as const,
        messages: ["test message"],
        data: undefined,
        hasData: false,
      };

      transport._sendToLogger(params);

      expect(mockSentryLogger.info).not.toHaveBeenCalled();
    });

    it("should respect level filtering", () => {
      const transport = new SentryTransport({ logger: mockSentryLogger, level: "warn" });

      const infoParams = {
        logLevel: "info" as const,
        messages: ["info message"],
        data: undefined,
        hasData: false,
      };

      const warnParams = {
        logLevel: "warn" as const,
        messages: ["warn message"],
        data: undefined,
        hasData: false,
      };

      transport._sendToLogger(infoParams);
      transport._sendToLogger(warnParams);

      expect(mockSentryLogger.info).not.toHaveBeenCalled();
      expect(mockSentryLogger.warn).toHaveBeenCalledWith("warn message");
    });
  });
});
