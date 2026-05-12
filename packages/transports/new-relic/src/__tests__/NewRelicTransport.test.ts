import { beforeEach, describe, expect, it, vi } from "vitest";
import { NewRelicTransport, ValidationError } from "../NewRelicTransport.js";

// Mock the HttpTransport module
vi.mock("@loglayer/transport-http", () => ({
  HttpTransport: vi.fn(),
  RateLimitError: class RateLimitError extends Error {
    constructor(
      message: string,
      public retryAfter: number,
    ) {
      super(message);
      this.name = "RateLimitError";
    }
  },
}));

describe("NewRelicTransport", () => {
  let HttpTransportMock: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { HttpTransport } = await import("@loglayer/transport-http");
    HttpTransportMock = vi.mocked(HttpTransport);
  });

  it("should export ValidationError", () => {
    expect(ValidationError).toBeDefined();
    const error = new ValidationError("test error");
    expect(error.name).toBe("ValidationError");
    expect(error.message).toBe("test error");
  });

  it("should re-export RateLimitError from http transport", async () => {
    const index = await import("../index.js");
    expect(index.RateLimitError).toBeDefined();
    const error = new index.RateLimitError("rate limited", 30);
    expect(error.name).toBe("RateLimitError");
    expect(error.message).toBe("rate limited");
    expect(error.retryAfter).toBe(30);
  });

  describe("constructor", () => {
    it("should create transport with required configuration", () => {
      new NewRelicTransport({
        apiKey: "test-api-key",
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "https://log-api.newrelic.com/log/v1",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Api-Key": "test-api-key",
          },
          payloadTemplate: expect.any(Function),
          compression: true,
          maxRetries: 3,
          retryDelay: 1000,
          respectRateLimit: true,
          maxLogSize: 1_048_576,
          maxPayloadSize: 1_048_576,
        }),
      );
    });

    it("should create transport with custom endpoint", () => {
      const customEndpoint = "https://custom.newrelic.com/logs";
      new NewRelicTransport({
        apiKey: "test-api-key",
        endpoint: customEndpoint,
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          url: customEndpoint,
        }),
      );
    });

    it("should create transport with custom configuration", () => {
      new NewRelicTransport({
        apiKey: "test-api-key",
        endpoint: "https://custom.newrelic.com/logs",
        compression: false,
        maxRetries: 5,
        retryDelay: 2000,
        respectRateLimit: false,
        enableBatchSend: false,
        batchSize: 50,
        batchSendTimeout: 3000,
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "https://custom.newrelic.com/logs",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Api-Key": "test-api-key",
          },
          compression: false,
          maxRetries: 5,
          retryDelay: 2000,
          respectRateLimit: false,
          enableBatchSend: false,
          batchSize: 50,
          batchSendTimeout: 3000,
        }),
      );
    });

    it("should create transport with error and debug callbacks", () => {
      const onError = vi.fn();
      const onDebug = vi.fn();
      const onDebugReqRes = vi.fn();

      new NewRelicTransport({
        apiKey: "test-api-key",
        onError,
        onDebug,
        onDebugReqRes,
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          onError,
          onDebug,
          onDebugReqRes,
        }),
      );
    });

    it("should use default payload template with correct New Relic format", () => {
      new NewRelicTransport({
        apiKey: "test-api-key",
      });

      const callArgs = HttpTransportMock.mock.calls[0][0];
      const payloadTemplate = callArgs.payloadTemplate;

      const result = payloadTemplate({
        logLevel: "info",
        message: "test message",
        data: { userId: "123", action: "login" },
      });

      const parsed = JSON.parse(result);
      expect(parsed.level).toBe("info");
      expect(parsed.log).toBe("test message");
      expect(parsed.timestamp).toBeDefined();
      expect(typeof parsed.timestamp).toBe("number");
      expect(parsed.attributes).toEqual({ userId: "123", action: "login" });
    });

    it("should handle logs without data in payload template", () => {
      new NewRelicTransport({
        apiKey: "test-api-key",
      });

      const callArgs = HttpTransportMock.mock.calls[0][0];
      const payloadTemplate = callArgs.payloadTemplate;

      const result = payloadTemplate({
        logLevel: "debug",
        message: "debug message",
      });

      const parsed = JSON.parse(result);
      expect(parsed.level).toBe("debug");
      expect(parsed.log).toBe("debug message");
      expect(parsed.attributes).toBeUndefined();
    });

    it("should handle empty data in payload template", () => {
      new NewRelicTransport({
        apiKey: "test-api-key",
      });

      const callArgs = HttpTransportMock.mock.calls[0][0];
      const payloadTemplate = callArgs.payloadTemplate;

      const result = payloadTemplate({
        logLevel: "warn",
        message: "warning message",
        data: {},
      });

      const parsed = JSON.parse(result);
      expect(parsed.level).toBe("warn");
      expect(parsed.log).toBe("warning message");
      expect(parsed.attributes).toEqual({});
    });

    it("should pass through enabled and level configuration", () => {
      new NewRelicTransport({
        apiKey: "test-api-key",
        enabled: false,
        level: "warn",
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
          level: "warn",
        }),
      );
    });
  });

  describe("attribute validation", () => {
    it("should throw ValidationError for too many attributes", () => {
      new NewRelicTransport({
        apiKey: "test-api-key",
      });

      const callArgs = HttpTransportMock.mock.calls[0][0];
      const payloadTemplate = callArgs.payloadTemplate;

      const metadata: Record<string, string> = {};
      for (let i = 0; i < 256; i++) {
        metadata[`key${i}`] = `value${i}`;
      }

      expect(() =>
        payloadTemplate({
          logLevel: "info",
          message: "test",
          data: metadata,
        }),
      ).toThrow(ValidationError);
    });

    it("should throw ValidationError for attribute name too long", () => {
      new NewRelicTransport({
        apiKey: "test-api-key",
      });

      const callArgs = HttpTransportMock.mock.calls[0][0];
      const payloadTemplate = callArgs.payloadTemplate;

      const longKey = "x".repeat(256);

      expect(() =>
        payloadTemplate({
          logLevel: "info",
          message: "test",
          data: { [longKey]: "value" },
        }),
      ).toThrow(ValidationError);
    });

    it("should truncate attribute values longer than 4094 characters", () => {
      new NewRelicTransport({
        apiKey: "test-api-key",
      });

      const callArgs = HttpTransportMock.mock.calls[0][0];
      const payloadTemplate = callArgs.payloadTemplate;

      const longValue = "x".repeat(5000);

      const result = payloadTemplate({
        logLevel: "info",
        message: "test message",
        data: { test: longValue },
      });

      const parsed = JSON.parse(result);
      expect(parsed.attributes.test).toBe("x".repeat(4094));
    });

    it("should handle complex metadata correctly", () => {
      new NewRelicTransport({
        apiKey: "test-api-key",
      });

      const callArgs = HttpTransportMock.mock.calls[0][0];
      const payloadTemplate = callArgs.payloadTemplate;

      const result = payloadTemplate({
        logLevel: "error",
        message: "error message",
        data: {
          userId: "123",
          requestId: "req-456",
          error: {
            name: "ValidationError",
            message: "Invalid input",
          },
          tags: ["api", "validation"],
          duration: 150,
        },
      });

      const parsed = JSON.parse(result);
      expect(parsed.level).toBe("error");
      expect(parsed.log).toBe("error message");
      expect(parsed.attributes.userId).toBe("123");
      expect(parsed.attributes.requestId).toBe("req-456");
      expect(parsed.attributes.error).toEqual({
        name: "ValidationError",
        message: "Invalid input",
      });
      expect(parsed.attributes.tags).toEqual(["api", "validation"]);
      expect(parsed.attributes.duration).toBe(150);
    });

    it("should handle special characters in message and metadata", () => {
      new NewRelicTransport({
        apiKey: "test-api-key",
      });

      const callArgs = HttpTransportMock.mock.calls[0][0];
      const payloadTemplate = callArgs.payloadTemplate;

      const result = payloadTemplate({
        logLevel: "info",
        message: "Message with special chars: éñ中文🚀",
        data: {
          "field-with-dash": "value",
          field_with_underscore: "value",
          "field.with.dots": "value",
        },
      });

      const parsed = JSON.parse(result);
      expect(parsed.log).toBe("Message with special chars: éñ中文🚀");
      expect(parsed.level).toBe("info");
      expect(parsed.attributes["field-with-dash"]).toBe("value");
      expect(parsed.attributes.field_with_underscore).toBe("value");
      expect(parsed.attributes["field.with.dots"]).toBe("value");
    });

    it("should allow exactly 255 attributes (the max)", () => {
      new NewRelicTransport({
        apiKey: "test-api-key",
      });

      const callArgs = HttpTransportMock.mock.calls[0][0];
      const payloadTemplate = callArgs.payloadTemplate;

      const metadata: Record<string, string> = {};
      for (let i = 0; i < 255; i++) {
        metadata[`key${i}`] = `value${i}`;
      }

      expect(() =>
        payloadTemplate({
          logLevel: "info",
          message: "test",
          data: metadata,
        }),
      ).not.toThrow();
    });

    it("should allow attribute names of exactly 255 characters (the max)", () => {
      new NewRelicTransport({
        apiKey: "test-api-key",
      });

      const callArgs = HttpTransportMock.mock.calls[0][0];
      const payloadTemplate = callArgs.payloadTemplate;

      const exactLengthKey = "x".repeat(255);

      expect(() =>
        payloadTemplate({
          logLevel: "info",
          message: "test",
          data: { [exactLengthKey]: "value" },
        }),
      ).not.toThrow();
    });
  });

  describe("custom payloadTemplate", () => {
    it("should accept a custom payloadTemplate", () => {
      const customTemplate = vi.fn(() => JSON.stringify({ custom: "format" }));

      new NewRelicTransport({
        apiKey: "test-api-key",
        payloadTemplate: customTemplate,
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          payloadTemplate: customTemplate,
        }),
      );
    });
  });
});
