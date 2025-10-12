import { beforeEach, describe, expect, it, vi } from "vitest";
import { LogflareTransport } from "../LogflareTransport.js";

// Mock the HttpTransport
vi.mock("@loglayer/transport-http", () => ({
  HttpTransport: vi.fn(),
}));

describe("LogflareTransport", () => {
  let HttpTransportMock: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { HttpTransport } = await import("@loglayer/transport-http");
    HttpTransportMock = vi.mocked(HttpTransport);
  });

  describe("constructor", () => {
    it("should create transport with required configuration", () => {
      new LogflareTransport({
        sourceId: "test-source-id",
        apiKey: "test-api-key",
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "https://api.logflare.app/logs/json?source=test-source-id",
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "X-API-KEY": "test-api-key",
          },
          payloadTemplate: expect.any(Function),
          batchMode: "field",
          batchFieldName: "batch",
        }),
      );
    });

    it("should create transport with custom API endpoint", () => {
      new LogflareTransport({
        sourceId: "test-source-id",
        apiKey: "test-api-key",
        url: "https://custom.logflare.app",
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "https://custom.logflare.app/logs/json?source=test-source-id",
        }),
      );
    });

    it("should create transport with custom configuration", () => {
      new LogflareTransport({
        sourceId: "test-source-id",
        apiKey: "test-api-key",
        maxRetries: 5,
        retryDelay: 2000,
        respectRateLimit: false,
        enableBatchSend: false,
        batchSize: 50,
        batchSendTimeout: 3000,
        url: "https://custom.logflare.app",
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "https://custom.logflare.app/logs/json?source=test-source-id",
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "X-API-KEY": "test-api-key",
          },
          payloadTemplate: expect.any(Function),
          maxRetries: 5,
          retryDelay: 2000,
          respectRateLimit: false,
          enableBatchSend: false,
          batchSize: 50,
          batchSendTimeout: 3000,
          batchMode: "field",
          batchFieldName: "batch",
        }),
      );
    });

    it("should create transport with error and debug callbacks", () => {
      const onError = vi.fn();
      const onDebug = vi.fn();

      new LogflareTransport({
        sourceId: "test-source-id",
        apiKey: "test-api-key",
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

    it("should use default payload template with correct Logflare format", () => {
      new LogflareTransport({
        sourceId: "test-source-id",
        apiKey: "test-api-key",
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
        metadata: {
          userId: "123",
          action: "login",
        },
      });
    });

    it("should handle logs without data in payload template", () => {
      new LogflareTransport({
        sourceId: "test-source-id",
        apiKey: "test-api-key",
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
      });
    });

    it("should handle empty data in payload template", () => {
      new LogflareTransport({
        sourceId: "test-source-id",
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
      expect(parsed).toEqual({
        message: "warning message",
        metadata: {},
      });
    });

    it("should pass through enabled and level configuration", () => {
      new LogflareTransport({
        sourceId: "test-source-id",
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

    it("should use default values when not specified", () => {
      new LogflareTransport({
        sourceId: "test-source-id",
        apiKey: "test-api-key",
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "https://api.logflare.app/logs/json?source=test-source-id",
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "X-API-KEY": "test-api-key",
          },
          payloadTemplate: expect.any(Function),
          batchMode: "field",
          batchFieldName: "batch",
        }),
      );
    });

    it("should handle complex metadata in payload template", () => {
      new LogflareTransport({
        sourceId: "test-source-id",
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
            stack: "Error: Invalid input\n    at validate()",
          },
          tags: ["api", "validation"],
          duration: 150,
        },
      });

      const parsed = JSON.parse(result);
      expect(parsed).toEqual({
        message: "error message",
        metadata: {
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
    });

    it("should handle special characters in message and metadata", () => {
      new LogflareTransport({
        sourceId: "test-source-id",
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
      expect(parsed.message).toBe("Message with special chars: éñ中文🚀");
      expect(parsed.metadata["field-with-dash"]).toBe("value");
      expect(parsed.metadata["field_with_underscore"]).toBe("value");
      expect(parsed.metadata["field.with.dots"]).toBe("value");
    });
  });
});
