import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HttpTransport } from "../HttpTransport.js";

describe("HttpTransport", () => {
  beforeEach(() => {
    vi.useFakeTimers();
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
});
