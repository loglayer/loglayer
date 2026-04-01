import { beforeEach, describe, expect, it, vi } from "vitest";
import { CriblTransport } from "../CriblTransport.js";

// Mock the HttpTransport
vi.mock("@loglayer/transport-http", () => ({
  HttpTransport: vi.fn(),
}));

describe("CriblTransport", () => {
  let HttpTransportMock: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { HttpTransport } = await import("@loglayer/transport-http");
    HttpTransportMock = vi.mocked(HttpTransport);
  });

  describe("constructor", () => {
    it("should create transport with required configuration", () => {
      new CriblTransport({
        url: "https://cribl.example.com:10080",
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "https://cribl.example.com:10080/cribl/_bulk",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          payloadTemplate: expect.any(Function),
        }),
      );
    });

    it("should include Authorization header when token is provided", () => {
      new CriblTransport({
        url: "https://cribl.example.com:10080",
        token: "myToken42",
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            "Content-Type": "application/json",
            Authorization: "myToken42",
          },
        }),
      );
    });

    it("should not include Authorization header when token is omitted", () => {
      new CriblTransport({
        url: "https://cribl.example.com:10080",
      });

      const callArgs = HttpTransportMock.mock.calls[0][0];
      expect(callArgs.headers).toEqual({
        "Content-Type": "application/json",
      });
      expect(callArgs.headers.Authorization).toBeUndefined();
    });

    it("should strip trailing slash from URL", () => {
      new CriblTransport({
        url: "https://cribl.example.com:10080/",
        token: "myToken42",
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "https://cribl.example.com:10080/cribl/_bulk",
        }),
      );
    });

    it("should create transport with optional metadata fields", () => {
      new CriblTransport({
        url: "https://cribl.example.com:10080",
        token: "myToken42",
        source: "my-app",
        host: "server-01",
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "https://cribl.example.com:10080/cribl/_bulk",
          method: "POST",
          payloadTemplate: expect.any(Function),
        }),
      );
    });

    it("should create transport with custom HTTP configuration", () => {
      new CriblTransport({
        url: "https://cribl.example.com:10080",
        token: "myToken42",
        maxRetries: 5,
        retryDelay: 2000,
        respectRateLimit: false,
        enableBatchSend: false,
        batchSize: 50,
        batchSendTimeout: 3000,
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "https://cribl.example.com:10080/cribl/_bulk",
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

      new CriblTransport({
        url: "https://cribl.example.com:10080",
        token: "myToken42",
        onError,
        onDebug,
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          onError,
          onDebug,
        }),
      );
    });

    it("should merge custom headers with default headers", () => {
      new CriblTransport({
        url: "https://cribl.example.com:10080",
        token: "myToken42",
        headers: {
          "X-Custom-Header": "custom-value",
        },
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            "Content-Type": "application/json",
            Authorization: "myToken42",
            "X-Custom-Header": "custom-value",
          },
        }),
      );
    });

    it("should use default payload template with Cribl Bulk API format", () => {
      new CriblTransport({
        url: "https://cribl.example.com:10080",
        token: "myToken42",
        source: "my-app",
        host: "server-01",
      });

      const callArgs = HttpTransportMock.mock.calls[0][0];
      const payloadTemplate = callArgs.payloadTemplate;

      const result = payloadTemplate({
        logLevel: "info",
        message: "test message",
        data: { userId: "123", action: "login" },
      });

      const parsed = JSON.parse(result);
      expect(parsed._raw).toBe("test message");
      expect(parsed.level).toBe("info");
      expect(parsed._time).toEqual(expect.any(Number));
      expect(parsed.source).toBe("my-app");
      expect(parsed.host).toBe("server-01");
      expect(parsed.userId).toBe("123");
      expect(parsed.action).toBe("login");
    });

    it("should omit optional metadata fields when not configured", () => {
      new CriblTransport({
        url: "https://cribl.example.com:10080",
      });

      const callArgs = HttpTransportMock.mock.calls[0][0];
      const payloadTemplate = callArgs.payloadTemplate;

      const result = payloadTemplate({
        logLevel: "info",
        message: "test message",
      });

      const parsed = JSON.parse(result);
      expect(parsed._raw).toBe("test message");
      expect(parsed.level).toBe("info");
      expect(parsed._time).toEqual(expect.any(Number));
      expect(parsed.source).toBeUndefined();
      expect(parsed.host).toBeUndefined();
    });

    it("should handle logs without data in payload template", () => {
      new CriblTransport({
        url: "https://cribl.example.com:10080",
      });

      const callArgs = HttpTransportMock.mock.calls[0][0];
      const payloadTemplate = callArgs.payloadTemplate;

      const result = payloadTemplate({
        logLevel: "debug",
        message: "debug message",
      });

      const parsed = JSON.parse(result);
      expect(parsed._raw).toBe("debug message");
      expect(parsed.level).toBe("debug");
      expect(parsed._time).toEqual(expect.any(Number));
    });

    it("should handle complex data in payload template", () => {
      new CriblTransport({
        url: "https://cribl.example.com:10080",
      });

      const callArgs = HttpTransportMock.mock.calls[0][0];
      const payloadTemplate = callArgs.payloadTemplate;

      const result = payloadTemplate({
        logLevel: "error",
        message: "error message",
        data: {
          userId: "123",
          error: {
            name: "ValidationError",
            message: "Invalid input",
          },
          tags: ["api", "validation"],
          duration: 150,
        },
      });

      const parsed = JSON.parse(result);
      expect(parsed._raw).toBe("error message");
      expect(parsed.level).toBe("error");
      expect(parsed.userId).toBe("123");
      expect(parsed.error).toEqual({
        name: "ValidationError",
        message: "Invalid input",
      });
      expect(parsed.tags).toEqual(["api", "validation"]);
      expect(parsed.duration).toBe(150);
    });

    it("should use custom timeField when provided", () => {
      new CriblTransport({
        url: "https://cribl.example.com:10080",
        timeField: "timestamp",
      });

      const callArgs = HttpTransportMock.mock.calls[0][0];
      const payloadTemplate = callArgs.payloadTemplate;

      const result = payloadTemplate({
        logLevel: "info",
        message: "test message",
      });

      const parsed = JSON.parse(result);
      expect(parsed.timestamp).toEqual(expect.any(Number));
      expect(parsed._time).toBeUndefined();
    });

    it("should use custom messageField when provided", () => {
      new CriblTransport({
        url: "https://cribl.example.com:10080",
        messageField: "message",
      });

      const callArgs = HttpTransportMock.mock.calls[0][0];
      const payloadTemplate = callArgs.payloadTemplate;

      const result = payloadTemplate({
        logLevel: "info",
        message: "test message",
      });

      const parsed = JSON.parse(result);
      expect(parsed.message).toBe("test message");
      expect(parsed._raw).toBeUndefined();
    });

    it("should allow custom payload template", () => {
      const customTemplate = ({ logLevel, message, data }: any) =>
        JSON.stringify({
          _raw: message,
          severity: logLevel,
          ...data,
        });

      new CriblTransport({
        url: "https://cribl.example.com:10080",
        payloadTemplate: customTemplate,
      });

      const callArgs = HttpTransportMock.mock.calls[0][0];
      expect(callArgs.payloadTemplate).toBe(customTemplate);
    });

    it("should use custom basePath when provided", () => {
      new CriblTransport({
        url: "https://cribl.example.com:10080",
        basePath: "/custom",
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "https://cribl.example.com:10080/custom/_bulk",
        }),
      );
    });

    it("should use default /cribl basePath when not specified", () => {
      new CriblTransport({
        url: "https://cribl.example.com:10080",
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "https://cribl.example.com:10080/cribl/_bulk",
        }),
      );
    });

    it("should pass through enabled and level configuration", () => {
      new CriblTransport({
        url: "https://cribl.example.com:10080",
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
});
