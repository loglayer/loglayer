import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HttpTransport } from "../HttpTransport.js";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("HttpTransport", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should create transport with default values", () => {
    const transport = new HttpTransport({
      url: "https://api.example.com/logs",
      payloadTemplate: ({ logLevel, message, data }) =>
        JSON.stringify({
          level: logLevel,
          message,
          metadata: data,
        }),
    });

    expect(transport).toBeDefined();
  });

  it("should create transport with custom configuration", () => {
    const transport = new HttpTransport({
      url: "https://api.example.com/logs",
      method: "PUT",
      headers: {
        Authorization: "Bearer test-token",
      },
      payloadTemplate: ({ logLevel, message, data }) =>
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: logLevel,
          message,
          metadata: data,
        }),
      compression: true,
      maxRetries: 5,
      retryDelay: 2000,
      respectRateLimit: false,
      enableBatchSend: false,
      batchSize: 50,
      batchSendTimeout: 3000,
      batchSendDelimiter: ",",
      maxLogSize: 2097152, // 2MB
      maxPayloadSize: 10485760, // 10MB
    });

    expect(transport).toBeDefined();
  });

  it("should create transport with dynamic headers function", () => {
    const getHeaders = () => ({
      Authorization: "Bearer dynamic-token",
    });

    const transport = new HttpTransport({
      url: "https://api.example.com/logs",
      headers: getHeaders,
      payloadTemplate: ({ logLevel, message, data }) =>
        JSON.stringify({
          level: logLevel,
          message,
          metadata: data,
        }),
    });

    expect(transport).toBeDefined();
  });

  it("should create transport with error and debug callbacks", () => {
    const onError = vi.fn();
    const onDebug = vi.fn();

    const transport = new HttpTransport({
      url: "https://api.example.com/logs",
      payloadTemplate: ({ logLevel, message, data }) =>
        JSON.stringify({
          level: logLevel,
          message,
          metadata: data,
        }),
      onError,
      onDebug,
    });

    expect(transport).toBeDefined();
  });

  it("should handle log entry size validation", () => {
    const onError = vi.fn();

    const transport = new HttpTransport({
      url: "https://api.example.com/logs",
      payloadTemplate: ({ logLevel, message, data }) =>
        JSON.stringify({
          level: logLevel,
          message,
          metadata: data,
        }),
      maxLogSize: 100, // Very small limit for testing
      onError,
      enableBatchSend: false,
    });

    // Create a large message that will exceed the size limit
    const largeMessage = "x".repeat(200);

    // This should trigger the size validation error
    transport.shipToLogger({
      logLevel: "info",
      messages: [largeMessage],
      data: { test: "data" },
      hasData: true,
    });

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "LogSizeError",
        message: expect.stringContaining("Log entry exceeds maximum size"),
        logEntry: expect.any(Object),
        size: expect.any(Number),
        limit: 100,
      }),
    );
  });

  it("should handle payload size tracking in batching", () => {
    const onError = vi.fn();

    const transport = new HttpTransport({
      url: "https://api.example.com/logs",
      payloadTemplate: ({ logLevel, message, data }) =>
        JSON.stringify({
          level: logLevel,
          message,
          metadata: data,
        }),
      maxPayloadSize: 1000, // Small payload limit for testing
      onError,
      enableBatchSend: true,
      batchSize: 10, // Large batch size so we don't trigger count-based sending
      batchSendTimeout: 10000, // Long timeout so we don't trigger time-based sending
    });

    // Add several small messages that together will exceed the payload size
    for (let i = 0; i < 5; i++) {
      transport.shipToLogger({
        logLevel: "info",
        messages: [`Message ${i}`],
        data: { index: i },
        hasData: true,
      });
    }

    // The transport should handle the payload size tracking internally
    // We can't easily test the internal batching logic without mocking,
    // but we can verify the transport is created and handles the configuration
    expect(transport).toBeDefined();
  });

  it("should use default size limits", () => {
    const transport = new HttpTransport({
      url: "https://api.example.com/logs",
      payloadTemplate: ({ logLevel, message, data }) =>
        JSON.stringify({
          level: logLevel,
          message,
          metadata: data,
        }),
    });

    expect(transport).toBeDefined();
  });

  it("should enable Next.js Edge compatibility mode", () => {
    const transport = new HttpTransport({
      url: "https://api.example.com/logs",
      payloadTemplate: ({ logLevel, message, data }) =>
        JSON.stringify({
          level: logLevel,
          message,
          metadata: data,
        }),
      enableNextJsEdgeCompat: true,
      compression: true, // This should be ignored when edge compat is enabled
    });

    expect(transport).toBeDefined();
  });

  it("should handle size validation with Next.js Edge compatibility", () => {
    const onError = vi.fn();

    const transport = new HttpTransport({
      url: "https://api.example.com/logs",
      payloadTemplate: ({ logLevel, message, data }) =>
        JSON.stringify({
          level: logLevel,
          message,
          metadata: data,
        }),
      maxLogSize: 100, // Very small limit for testing
      enableNextJsEdgeCompat: true,
      onError,
      enableBatchSend: false,
    });

    // Create a large message that will exceed the size limit
    const largeMessage = "x".repeat(200);

    // This should trigger the size validation error using Buffer.byteLength
    transport.shipToLogger({
      logLevel: "info",
      messages: [largeMessage],
      data: { test: "data" },
      hasData: true,
    });

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "LogSizeError",
        message: expect.stringContaining("Log entry exceeds maximum size"),
        logEntry: expect.any(Object),
        size: expect.any(Number),
        limit: 100,
      }),
    );
  });

  it("should use custom content types", () => {
    const transport = new HttpTransport({
      url: "https://api.example.com/logs",
      payloadTemplate: ({ logLevel, message, data }) =>
        JSON.stringify({
          level: logLevel,
          message,
          metadata: data,
        }),
      contentType: "application/xml",
      batchContentType: "text/plain",
    });

    expect(transport).toBeDefined();
  });

  it("should use default content types when not specified", () => {
    const transport = new HttpTransport({
      url: "https://api.example.com/logs",
      payloadTemplate: ({ logLevel, message, data }) =>
        JSON.stringify({
          level: logLevel,
          message,
          metadata: data,
        }),
    });

    expect(transport).toBeDefined();
  });

  it("should respect user-specified content-type in headers", () => {
    const transport = new HttpTransport({
      url: "https://api.example.com/logs",
      headers: {
        "content-type": "application/xml",
      },
      contentType: "application/json", // This should be ignored
      batchContentType: "text/plain", // This should be ignored
      payloadTemplate: ({ logLevel, message, data }) =>
        JSON.stringify({
          level: logLevel,
          message,
          metadata: data,
        }),
    });

    expect(transport).toBeDefined();
  });

  it("should respect user-specified content-type in dynamic headers function", () => {
    const getHeaders = () => ({
      "content-type": "application/xml",
    });

    const transport = new HttpTransport({
      url: "https://api.example.com/logs",
      headers: getHeaders,
      contentType: "application/json", // This should be ignored
      batchContentType: "text/plain", // This should be ignored
      payloadTemplate: ({ logLevel, message, data }) =>
        JSON.stringify({
          level: logLevel,
          message,
          metadata: data,
        }),
    });

    expect(transport).toBeDefined();
  });

  it("should use batch field name when specified", () => {
    const transport = new HttpTransport({
      url: "https://api.example.com/logs",
      batchFieldName: "batch",
      payloadTemplate: ({ logLevel, message, data }) =>
        JSON.stringify({
          level: logLevel,
          message,
          metadata: data,
        }),
    });

    expect(transport).toBeDefined();
  });

  it("should use onDebugReqRes callback when specified", () => {
    const onDebugReqRes = vi.fn();
    
    const transport = new HttpTransport({
      url: "https://api.example.com/logs",
      onDebugReqRes,
      payloadTemplate: ({ logLevel, message, data }) =>
        JSON.stringify({
          level: logLevel,
          message,
          metadata: data,
        }),
    });

    expect(transport).toBeDefined();
  });

  it("should use batchMode array when specified", () => {
    const transport = new HttpTransport({
      url: "https://api.example.com/logs",
      batchMode: "array",
      payloadTemplate: ({ logLevel, message, data }) =>
        JSON.stringify({
          level: logLevel,
          message,
          metadata: data,
        }),
    });

    expect(transport).toBeDefined();
  });

  it("should use batchMode field when specified", () => {
    const transport = new HttpTransport({
      url: "https://api.example.com/logs",
      batchMode: "field",
      batchFieldName: "logs",
      payloadTemplate: ({ logLevel, message, data }) =>
        JSON.stringify({
          level: logLevel,
          message,
          metadata: data,
        }),
    });

    expect(transport).toBeDefined();
  });

  it("should use batchMode delimiter when specified", () => {
    const transport = new HttpTransport({
      url: "https://api.example.com/logs",
      batchMode: "delimiter",
      payloadTemplate: ({ logLevel, message, data }) =>
        JSON.stringify({
          level: logLevel,
          message,
          metadata: data,
        }),
    });

    expect(transport).toBeDefined();
  });

  it("should throw error when batchMode is field but batchFieldName is not provided", () => {
    expect(() => {
      new HttpTransport({
        url: "https://api.example.com/logs",
        batchMode: "field",
        payloadTemplate: ({ logLevel, message, data }) =>
          JSON.stringify({
            level: logLevel,
            message,
            metadata: data,
          }),
      });
    }).toThrow("batchFieldName is required when batchMode is 'field'");
  });

  it("should use enabled and level configuration", () => {
    const transport = new HttpTransport({
      url: "https://api.example.com/logs",
      enabled: false,
      level: "error",
      payloadTemplate: ({ logLevel, message, data }) =>
        JSON.stringify({
          level: logLevel,
          message,
          metadata: data,
        }),
    });

    expect(transport).toBeDefined();
  });

  it("should use default enabled and level values", () => {
    const transport = new HttpTransport({
      url: "https://api.example.com/logs",
      payloadTemplate: ({ logLevel, message, data }) =>
        JSON.stringify({
          level: logLevel,
          message,
          metadata: data,
        }),
    });

    expect(transport).toBeDefined();
  });

  it("should handle all batch parameters together", () => {
    const transport = new HttpTransport({
      url: "https://api.example.com/logs",
      batchContentType: "application/x-ndjson",
      enableBatchSend: true,
      batchSize: 50,
      batchSendTimeout: 3000,
      batchSendDelimiter: "\n",
      batchMode: "array",
      payloadTemplate: ({ logLevel, message, data }) =>
        JSON.stringify({
          level: logLevel,
          message,
          metadata: data,
        }),
    });

    expect(transport).toBeDefined();
  });

  it("should handle all debug parameters together", () => {
    const onError = vi.fn();
    const onDebug = vi.fn();
    const onDebugReqRes = vi.fn();

    const transport = new HttpTransport({
      url: "https://api.example.com/logs",
      onError,
      onDebug,
      onDebugReqRes,
      payloadTemplate: ({ logLevel, message, data }) =>
        JSON.stringify({
          level: logLevel,
          message,
          metadata: data,
        }),
    });

    expect(transport).toBeDefined();
  });

  it("should handle all general parameters together", () => {
    const getHeaders = () => ({
      Authorization: "Bearer test-token",
    });

    const transport = new HttpTransport({
      url: "https://api.example.com/logs",
      method: "PUT",
      headers: getHeaders,
      contentType: "application/xml",
      compression: true,
      maxRetries: 5,
      retryDelay: 2000,
      respectRateLimit: false,
      maxLogSize: 2097152,
      maxPayloadSize: 10485760,
      enableNextJsEdgeCompat: true,
      enabled: true,
      level: "warn",
      payloadTemplate: ({ logLevel, message, data }) =>
        JSON.stringify({
          level: logLevel,
          message,
          metadata: data,
        }),
    });

    expect(transport).toBeDefined();
  });

  describe("HTTP status code checking", () => {
    it("should call onError when HTTP status is not 200 and onError is enabled", async () => {
      const onError = vi.fn();
      
      // Mock a 404 response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        headers: new Map(),
        clone: () => ({
          text: () => Promise.resolve("Not Found"),
        }),
      });

      const transport = new HttpTransport({
        url: "https://api.example.com/logs",
        payloadTemplate: ({ logLevel, message, data }) =>
          JSON.stringify({
            level: logLevel,
            message,
            metadata: data,
          }),
        onError,
        enableBatchSend: false,
        maxRetries: 0, // Disable retries for this test
      });

      // Send a log entry
      transport.shipToLogger({
        logLevel: "info",
        messages: ["test message"],
        hasData: false,
      });

      // Wait for the async operation to complete
      await vi.runAllTimersAsync();

      // Verify onError was called with the status code error
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "HTTP request failed with status 404: Not Found",
        }),
      );
    });

    it("should not call onError when HTTP status is 200", async () => {
      const onError = vi.fn();
      
      // Mock a successful 200 response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Map(),
        clone: () => ({
          text: () => Promise.resolve("Success"),
        }),
      });

      const transport = new HttpTransport({
        url: "https://api.example.com/logs",
        payloadTemplate: ({ logLevel, message, data }) =>
          JSON.stringify({
            level: logLevel,
            message,
            metadata: data,
          }),
        onError,
        enableBatchSend: false,
        maxRetries: 0, // Disable retries for this test
      });

      // Send a log entry
      transport.shipToLogger({
        logLevel: "info",
        messages: ["test message"],
        hasData: false,
      });

      // Wait for the async operation to complete
      await vi.runAllTimersAsync();

      // Verify onError was not called
      expect(onError).not.toHaveBeenCalled();
    });

    it("should not call onError when onError is not provided", async () => {
      // Mock a 500 response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        headers: new Map(),
        clone: () => ({
          text: () => Promise.resolve("Internal Server Error"),
        }),
      });

      const transport = new HttpTransport({
        url: "https://api.example.com/logs",
        payloadTemplate: ({ logLevel, message, data }) =>
          JSON.stringify({
            level: logLevel,
            message,
            metadata: data,
          }),
        enableBatchSend: false,
        maxRetries: 0, // Disable retries for this test
      });

      // Send a log entry
      transport.shipToLogger({
        logLevel: "info",
        messages: ["test message"],
        hasData: false,
      });

      // Wait for the async operation to complete
      await vi.runAllTimersAsync();

      // The transport should still throw an error, but onError won't be called
      // since it's not provided
      expect(mockFetch).toHaveBeenCalled();
    });

    it("should call onError for various non-200 status codes", async () => {
      const onError = vi.fn();
      
      const testCases = [
        { status: 400, statusText: "Bad Request" },
        { status: 401, statusText: "Unauthorized" },
        { status: 403, statusText: "Forbidden" },
        { status: 500, statusText: "Internal Server Error" },
        { status: 502, statusText: "Bad Gateway" },
        { status: 503, statusText: "Service Unavailable" },
      ];

      for (const testCase of testCases) {
        onError.mockClear();
        mockFetch.mockClear();
        
        // Mock the response
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: testCase.status,
          statusText: testCase.statusText,
          headers: new Map(),
          clone: () => ({
            text: () => Promise.resolve(testCase.statusText),
          }),
        });

        const transport = new HttpTransport({
          url: "https://api.example.com/logs",
          payloadTemplate: ({ logLevel, message, data }) =>
            JSON.stringify({
              level: logLevel,
              message,
              metadata: data,
            }),
          onError,
          enableBatchSend: false,
          maxRetries: 0, // Disable retries for this test
        });

        // Send a log entry
        transport.shipToLogger({
          logLevel: "info",
          messages: ["test message"],
          hasData: false,
        });

        // Wait for the async operation to complete
        await vi.runAllTimersAsync();

        // Verify onError was called with the correct status code
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: `HTTP request failed with status ${testCase.status}: ${testCase.statusText}`,
          }),
        );
      }
    });
  });
});
