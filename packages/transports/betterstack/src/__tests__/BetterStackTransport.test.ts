import { beforeEach, describe, expect, it, vi } from "vitest";
import { BetterStackTransport } from "../BetterStackTransport.js";

// Mock the HttpTransport
vi.mock("@loglayer/transport-http", () => ({
  HttpTransport: vi.fn(),
}));

describe("BetterStackTransport", () => {
  let HttpTransportMock: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { HttpTransport } = await import("@loglayer/transport-http");
    HttpTransportMock = vi.mocked(HttpTransport);
  });

  describe("constructor", () => {
    it("should create transport with required configuration", () => {
      new BetterStackTransport({
        sourceToken: "test-source-token",
        url: "https://in.logs.betterstack.com",
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "https://in.logs.betterstack.com",
          headers: {
            Authorization: "Bearer test-source-token",
            "Content-Type": "application/json",
          },
          payloadTemplate: expect.any(Function),
          batchMode: "array",
          batchContentType: "application/json",
          enableBatchSend: true,
          batchSize: 100,
          batchSendTimeout: 5000,
          compression: false,
          maxRetries: 3,
          retryDelay: 1000,
          respectRateLimit: true,
          maxLogSize: 1048576,
          maxPayloadSize: 10485760,
        }),
      );
    });

    it("should create transport with custom ingestion host", () => {
      new BetterStackTransport({
        sourceToken: "test-source-token",
        url: "https://custom.betterstack.com",
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "https://custom.betterstack.com",
        }),
      );
    });

    it("should create transport with custom configuration", () => {
      new BetterStackTransport({
        sourceToken: "test-source-token",
        url: "https://in.logs.betterstack.com",
        maxRetries: 5,
        retryDelay: 2000,
        respectRateLimit: false,
        enableBatchSend: false,
        batchSize: 50,
        batchSendTimeout: 3000,
        compression: true,
        maxLogSize: 2097152,
        maxPayloadSize: 20971520,
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "https://in.logs.betterstack.com",
          headers: {
            Authorization: "Bearer test-source-token",
            "Content-Type": "application/json",
          },
          payloadTemplate: expect.any(Function),
          batchMode: "array",
          batchContentType: "application/json",
          maxRetries: 5,
          retryDelay: 2000,
          respectRateLimit: false,
          enableBatchSend: false,
          batchSize: 50,
          batchSendTimeout: 3000,
          compression: true,
          maxLogSize: 2097152,
          maxPayloadSize: 20971520,
        }),
      );
    });

    it("should create transport with error and debug callbacks", () => {
      const onError = vi.fn();
      const onDebug = vi.fn();

      new BetterStackTransport({
        sourceToken: "test-source-token",
        url: "https://in.logs.betterstack.com",
        onError,
        onDebug,
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          onError: onError,
          onDebug: onDebug,
        }),
      );
    });

    it("should use default payload template with correct Better Stack format", () => {
      new BetterStackTransport({
        sourceToken: "test-source-token",
        url: "https://in.logs.betterstack.com",
      });

      const callArgs = HttpTransportMock.mock.calls[0][0];
      const payloadTemplate = callArgs.payloadTemplate;

      // Test the default payload template
      const result = payloadTemplate({
        logLevel: "info",
        message: "test message",
        data: { userId: "123", action: "login" },
      });

      const parsed = JSON.parse(result);
      expect(parsed).toEqual({
        message: "test message",
        level: "info",
        userId: "123",
        action: "login",
        dt: expect.any(String),
      });
    });

    it("should handle logs without data in payload template", () => {
      new BetterStackTransport({
        sourceToken: "test-source-token",
        url: "https://in.logs.betterstack.com",
      });

      const callArgs = HttpTransportMock.mock.calls[0][0];
      const payloadTemplate = callArgs.payloadTemplate;

      const result = payloadTemplate({
        logLevel: "debug",
        message: "debug message",
      });

      const parsed = JSON.parse(result);
      expect(parsed).toEqual({
        message: "debug message",
        level: "debug",
        dt: expect.any(String),
      });
    });

    it("should handle empty data in payload template", () => {
      new BetterStackTransport({
        sourceToken: "test-source-token",
        url: "https://in.logs.betterstack.com",
      });

      const callArgs = HttpTransportMock.mock.calls[0][0];
      const payloadTemplate = callArgs.payloadTemplate;

      const result = payloadTemplate({
        logLevel: "warn",
        message: "warning message",
        data: {},
      });

      const parsed = JSON.parse(result);
      expect(parsed).toEqual({
        message: "warning message",
        level: "warn",
        dt: expect.any(String),
      });
    });

    it("should disable timestamp when includeTimestamp is false", () => {
      new BetterStackTransport({
        sourceToken: "test-source-token",
        url: "https://in.logs.betterstack.com",
        includeTimestamp: false,
      });

      const callArgs = HttpTransportMock.mock.calls[0][0];
      const payloadTemplate = callArgs.payloadTemplate;

      const result = payloadTemplate({
        logLevel: "info",
        message: "test message",
        data: { userId: "123" },
      });

      const parsed = JSON.parse(result);
      expect(parsed).toEqual({
        message: "test message",
        level: "info",
        userId: "123",
      });
      expect(parsed.dt).toBeUndefined();
    });

    it("should use custom timestamp field name", () => {
      new BetterStackTransport({
        sourceToken: "test-source-token",
        url: "https://in.logs.betterstack.com",
        timestampField: "timestamp",
      });

      const callArgs = HttpTransportMock.mock.calls[0][0];
      const payloadTemplate = callArgs.payloadTemplate;

      const result = payloadTemplate({
        logLevel: "info",
        message: "test message",
      });

      const parsed = JSON.parse(result);
      expect(parsed).toEqual({
        message: "test message",
        level: "info",
        timestamp: expect.any(String),
      });
      expect(parsed.dt).toBeUndefined();
    });

    it("should pass through enabled and level configuration", () => {
      new BetterStackTransport({
        sourceToken: "test-source-token",
        url: "https://in.logs.betterstack.com",
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

    it("should handle complex metadata in payload template", () => {
      new BetterStackTransport({
        sourceToken: "test-source-token",
        url: "https://in.logs.betterstack.com",
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
            stack: "Error: Invalid input\n    at validate()",
          },
          tags: ["api", "validation"],
          duration: 150,
        },
      });

      const parsed = JSON.parse(result);
      expect(parsed).toEqual({
        message: "error message",
        level: "error",
        userId: "123",
        requestId: "req-456",
        error: {
          name: "ValidationError",
          message: "Invalid input",
          stack: "Error: Invalid input\n    at validate()",
        },
        tags: ["api", "validation"],
        duration: 150,
        dt: expect.any(String),
      });
    });

    it("should handle special characters in message and metadata", () => {
      new BetterStackTransport({
        sourceToken: "test-source-token",
        url: "https://in.logs.betterstack.com",
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
      expect(parsed.message).toBe("Message with special chars: éñ中文🚀");
      expect(parsed["field-with-dash"]).toBe("value");
      expect(parsed["field_with_underscore"]).toBe("value");
      expect(parsed["field.with.dots"]).toBe("value");
    });

    it("should validate timestamp format", () => {
      new BetterStackTransport({
        sourceToken: "test-source-token",
        url: "https://in.logs.betterstack.com",
      });

      const callArgs = HttpTransportMock.mock.calls[0][0];
      const payloadTemplate = callArgs.payloadTemplate;

      const result = payloadTemplate({
        logLevel: "info",
        message: "test message",
      });

      const parsed = JSON.parse(result);
      const timestamp = parsed.dt;

      // Should be a valid ISO 8601 timestamp
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });

    it("should use default values when not specified", () => {
      new BetterStackTransport({
        sourceToken: "test-source-token",
        url: "https://in.logs.betterstack.com",
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "https://in.logs.betterstack.com",
          headers: {
            Authorization: "Bearer test-source-token",
            "Content-Type": "application/json",
          },
          payloadTemplate: expect.any(Function),
          batchMode: "array",
          batchContentType: "application/json",
          enableBatchSend: true,
          batchSize: 100,
          batchSendTimeout: 5000,
          compression: false,
          maxRetries: 3,
          retryDelay: 1000,
          respectRateLimit: true,
          maxLogSize: 1048576,
          maxPayloadSize: 10485760,
        }),
      );
    });
  });
});
