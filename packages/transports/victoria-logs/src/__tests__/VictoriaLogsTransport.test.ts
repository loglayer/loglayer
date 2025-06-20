import { beforeEach, describe, expect, it, vi } from "vitest";
import { VictoriaLogsTransport } from "../VictoriaLogsTransport.js";

// Mock the HttpTransport
vi.mock("@loglayer/transport-http", () => ({
  HttpTransport: vi.fn(),
}));

describe("VictoriaLogsTransport", () => {
  let HttpTransportMock: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { HttpTransport } = await import("@loglayer/transport-http");
    HttpTransportMock = vi.mocked(HttpTransport);
  });

  describe("constructor", () => {
    it("should create transport with default configuration", () => {
      new VictoriaLogsTransport();

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "http://localhost:9428/insert/jsonline",
          method: "POST",
          headers: {
            "Content-Type": "application/stream+json",
          },
          contentType: "application/stream+json",
          batchContentType: "application/stream+json",
          compression: false,
          maxRetries: 3,
          retryDelay: 1000,
          respectRateLimit: true,
          enableBatchSend: true,
          batchSize: 100,
          batchSendTimeout: 5000,
          batchSendDelimiter: "\n",
          maxLogSize: 1048576,
          maxPayloadSize: 5242880,
          enableNextJsEdgeCompat: false,
        }),
      );
    });

    it("should create transport with custom URL", () => {
      new VictoriaLogsTransport({
        url: "http://my-victoria-logs:9428",
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "http://my-victoria-logs:9428/insert/jsonline",
        }),
      );
    });

    it("should create transport with custom URL that already has trailing slash", () => {
      new VictoriaLogsTransport({
        url: "http://my-victoria-logs:9428/",
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "http://my-victoria-logs:9428/insert/jsonline",
        }),
      );
    });

    it("should create transport with custom HTTP parameters", () => {
      new VictoriaLogsTransport({
        httpParameters: {
          _time_field: "timestamp",
          _msg_field: "message",
          _default_msg_value: "no message",
        },
      });

      const callArgs = HttpTransportMock.mock.calls[0][0];
      expect(callArgs.url).toContain("_time_field=timestamp");
      expect(callArgs.url).toContain("_msg_field=message");
      expect(callArgs.url).toContain("_default_msg_value=no+message");
    });

    it("should automatically add _stream_fields from streamFields keys", () => {
      new VictoriaLogsTransport({
        streamFields: () => ({
          service: "my-app",
          environment: "prod",
          instance: "host-123",
        }),
        httpParameters: {
          _time_field: "_time",
        },
      });

      const callArgs = HttpTransportMock.mock.calls[0][0];
      expect(callArgs.url).toContain("_stream_fields=service%2Cenvironment%2Cinstance");
      expect(callArgs.url).toContain("_time_field=_time");
    });

    it("should not add _stream_fields when streamFields returns empty object", () => {
      new VictoriaLogsTransport({
        streamFields: () => ({}),
        httpParameters: {
          _time_field: "_time",
        },
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "http://localhost:9428/insert/jsonline?_time_field=_time",
        }),
      );
    });

    it("should merge _stream_fields with existing httpParameters", () => {
      new VictoriaLogsTransport({
        streamFields: () => ({
          service: "my-app",
          environment: "prod",
        }),
        httpParameters: {
          _stream_fields: "existing_field",
          _time_field: "_time",
        },
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "http://localhost:9428/insert/jsonline?_stream_fields=service%2Cenvironment&_time_field=_time",
        }),
      );
    });

    it("should use custom payload template", () => {
      const customPayloadTemplate = vi.fn();

      new VictoriaLogsTransport({
        payloadTemplate: customPayloadTemplate,
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          payloadTemplate: customPayloadTemplate,
        }),
      );
    });

    it("should use default payload template with correct field names", () => {
      new VictoriaLogsTransport({
        httpParameters: {
          _msg_field: "message",
          _time_field: "timestamp",
        },
      });

      const callArgs = HttpTransportMock.mock.calls[0][0];
      const payloadTemplate = callArgs.payloadTemplate;

      // Test the default payload template
      const result = payloadTemplate({
        logLevel: "info",
        message: "test message",
        data: { userId: "123" },
      });

      const parsed = JSON.parse(result);
      expect(parsed.message).toBe("test message");
      expect(parsed.timestamp).toBeDefined();
      expect(parsed.level).toBe("info");
      expect(parsed.userId).toBe("123");
    });

    it("should use default payload template with default field names", () => {
      new VictoriaLogsTransport();

      const callArgs = HttpTransportMock.mock.calls[0][0];
      const payloadTemplate = callArgs.payloadTemplate;

      // Test the default payload template
      const result = payloadTemplate({
        logLevel: "error",
        message: "error message",
        data: { error: "test error" },
      });

      const parsed = JSON.parse(result);
      expect(parsed._msg).toBe("error message");
      expect(parsed._time).toBeDefined();
      expect(parsed.level).toBe("error");
      expect(parsed.error).toBe("test error");
    });

    it("should handle empty message in payload template", () => {
      new VictoriaLogsTransport();

      const callArgs = HttpTransportMock.mock.calls[0][0];
      const payloadTemplate = callArgs.payloadTemplate;

      const result = payloadTemplate({
        logLevel: "info",
        message: "",
        data: {},
      });

      const parsed = JSON.parse(result);
      expect(parsed._msg).toBe("(no message)");
    });

    it("should include stream fields in payload template", () => {
      new VictoriaLogsTransport({
        streamFields: () => ({
          service: "my-app",
          environment: "prod",
        }),
      });

      const callArgs = HttpTransportMock.mock.calls[0][0];
      const payloadTemplate = callArgs.payloadTemplate;

      const result = payloadTemplate({
        logLevel: "info",
        message: "test message",
        data: { userId: "123" },
      });

      const parsed = JSON.parse(result);
      expect(parsed.service).toBe("my-app");
      expect(parsed.environment).toBe("prod");
      expect(parsed.userId).toBe("123");
    });

    it("should use custom timestamp function", () => {
      const customTimestamp = vi.fn(() => "2023-01-01T00:00:00.000Z");

      new VictoriaLogsTransport({
        timestamp: customTimestamp,
      });

      const callArgs = HttpTransportMock.mock.calls[0][0];
      const payloadTemplate = callArgs.payloadTemplate;

      const result = payloadTemplate({
        logLevel: "info",
        message: "test message",
        data: {},
      });

      const parsed = JSON.parse(result);
      expect(parsed._time).toBe("2023-01-01T00:00:00.000Z");
    });

    it("should pass through all HttpTransport options", () => {
      new VictoriaLogsTransport({
        compression: true,
        maxRetries: 5,
        retryDelay: 2000,
        respectRateLimit: false,
        enableBatchSend: false,
        batchSize: 50,
        batchSendTimeout: 3000,
        maxLogSize: 2048576,
        maxPayloadSize: 10485760,
        enableNextJsEdgeCompat: true,
        onError: vi.fn(),
        onDebug: vi.fn(),
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          compression: true,
          maxRetries: 5,
          retryDelay: 2000,
          respectRateLimit: false,
          enableBatchSend: false,
          batchSize: 50,
          batchSendTimeout: 3000,
          maxLogSize: 2048576,
          maxPayloadSize: 10485760,
          enableNextJsEdgeCompat: true,
          onError: expect.any(Function),
          onDebug: expect.any(Function),
        }),
      );
    });

    it("should handle complex stream fields with special characters", () => {
      new VictoriaLogsTransport({
        streamFields: () => ({
          "service-name": "my-app",
          env: "prod",
          instance_id: "host-123",
        }),
        httpParameters: {
          _time_field: "_time",
        },
      });

      const callArgs = HttpTransportMock.mock.calls[0][0];
      expect(callArgs.url).toContain("_stream_fields=service-name%2Cenv%2Cinstance_id");
      expect(callArgs.url).toContain("_time_field=_time");
    });

    it("should handle empty httpParameters", () => {
      new VictoriaLogsTransport({
        httpParameters: {},
      });

      expect(HttpTransportMock).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "http://localhost:9428/insert/jsonline",
        }),
      );
    });
  });
});
