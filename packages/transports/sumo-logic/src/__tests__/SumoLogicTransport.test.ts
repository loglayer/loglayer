import type { LogLevel } from "@loglayer/transport";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SumoLogicTransport } from "../SumoLogicTransport.js";

describe("SumoLogicTransport", () => {
  // Mock fetch
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  // Mock CompressionStream
  const mockStream = {
    readable: {
      getReader: () => ({
        read: vi
          .fn()
          .mockResolvedValueOnce({ value: new Uint8Array([1, 2, 3]), done: false })
          .mockResolvedValueOnce({ done: true }),
      }),
    },
    writable: {
      getWriter: () => ({
        write: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
      }),
    },
  };

  global.CompressionStream = vi.fn(() => mockStream) as unknown as typeof CompressionStream;

  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should send logs to SumoLogic with correct format", async () => {
    const transport = new SumoLogicTransport({
      url: "https://collectors.sumologic.com/receiver/v1/http/123",
      useCompression: false,
    });

    const messages = ["Test message"];
    const data = { foo: "bar" };

    transport.shipToLogger({
      logLevel: "INFO" as LogLevel,
      messages,
      data,
      hasData: true,
    });

    // Wait for the async operation to complete
    await new Promise(process.nextTick);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];

    expect(url).toBe("https://collectors.sumologic.com/receiver/v1/http/123");
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");

    const payload = JSON.parse(options.body);
    expect(payload).toMatchObject({
      message: "Test message",
      severity: "INFO",
      foo: "bar",
    });
    expect(payload.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it("should use custom message field when configured", async () => {
    const transport = new SumoLogicTransport({
      url: "https://collectors.sumologic.com/receiver/v1/http/123",
      useCompression: false,
      messageField: "log_message",
    });

    transport.shipToLogger({
      logLevel: "INFO" as LogLevel,
      messages: ["Test message"],
      data: {},
      hasData: false,
    });

    // Wait for the async operation to complete
    await new Promise(process.nextTick);

    const [, options] = mockFetch.mock.calls[0];
    const payload = JSON.parse(options.body);
    expect(payload).toHaveProperty("log_message", "Test message");
    expect(payload).not.toHaveProperty("message");
  });

  it("should not include message field when no string messages", async () => {
    const transport = new SumoLogicTransport({
      url: "https://collectors.sumologic.com/receiver/v1/http/123",
      useCompression: false,
    });

    transport.shipToLogger({
      logLevel: "INFO" as LogLevel,
      messages: [{ someObject: true }],
      data: { foo: "bar" },
      hasData: true,
    });

    // Wait for the async operation to complete
    await new Promise(process.nextTick);

    const [, options] = mockFetch.mock.calls[0];
    const payload = JSON.parse(options.body);
    expect(payload).not.toHaveProperty("message");
    expect(payload).toMatchObject({
      severity: "INFO",
      foo: "bar",
    });
  });

  it("should use gzip compression by default", async () => {
    const transport = new SumoLogicTransport({
      url: "https://collectors.sumologic.com/receiver/v1/http/123",
    });

    transport.shipToLogger({
      logLevel: "INFO" as LogLevel,
      messages: ["Test message"],
      data: {},
      hasData: false,
    });

    // Wait for the async operation to complete
    await new Promise(process.nextTick);

    expect(global.CompressionStream).toHaveBeenCalledWith("gzip");
    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers["Content-Encoding"]).toBe("gzip");
  });

  it("should add custom fields as X-Sumo-Fields header", async () => {
    const transport = new SumoLogicTransport({
      url: "https://collectors.sumologic.com/receiver/v1/http/123",
      useCompression: false,
      fields: {
        environment: "production",
        service: "api",
      },
    });

    transport.shipToLogger({
      logLevel: "INFO" as LogLevel,
      messages: ["Test message"],
      data: {},
      hasData: false,
    });

    // Wait for the async operation to complete
    await new Promise(process.nextTick);

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers["X-Sumo-Fields"]).toBe("environment=production,service=api");

    const payload = JSON.parse(options.body);
    expect(payload).not.toHaveProperty("environment");
    expect(payload).not.toHaveProperty("service");
  });

  it("should add SumoLogic headers when configured", async () => {
    const transport = new SumoLogicTransport({
      url: "https://collectors.sumologic.com/receiver/v1/http/123",
      useCompression: false,
      sourceCategory: "test-category",
      sourceName: "test-name",
      sourceHost: "test-host",
    });

    transport.shipToLogger({
      logLevel: "INFO" as LogLevel,
      messages: ["Test message"],
      data: {},
      hasData: false,
    });

    // Wait for the async operation to complete
    await new Promise(process.nextTick);

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers["X-Sumo-Category"]).toBe("test-category");
    expect(options.headers["X-Sumo-Name"]).toBe("test-name");
    expect(options.headers["X-Sumo-Host"]).toBe("test-host");
  });

  it("should retry on failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error")).mockResolvedValueOnce({ ok: true });

    const transport = new SumoLogicTransport({
      url: "https://collectors.sumologic.com/receiver/v1/http/123",
      useCompression: false,
      retryConfig: {
        maxRetries: 1,
        initialRetryMs: 1,
      },
    });

    transport.shipToLogger({
      logLevel: "INFO" as LogLevel,
      messages: ["Test message"],
      data: {},
      hasData: false,
    });

    // Wait for retries to complete
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("should call onError when request fails after retries", async () => {
    const onError = vi.fn();
    mockFetch.mockRejectedValue(new Error("Network error"));

    const transport = new SumoLogicTransport({
      url: "https://collectors.sumologic.com/receiver/v1/http/123",
      useCompression: false,
      retryConfig: {
        maxRetries: 1,
        initialRetryMs: 1,
      },
      onError,
    });

    transport.shipToLogger({
      logLevel: "INFO" as LogLevel,
      messages: ["Test message"],
      data: {},
      hasData: false,
    });

    // Wait for retries to complete
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    expect(onError.mock.calls[0][0].message).toBe("Network error");
  });

  it("should call onError when payload size exceeds limit", async () => {
    const onError = vi.fn();
    const transport = new SumoLogicTransport({
      url: "https://collectors.sumologic.com/receiver/v1/http/123",
      useCompression: false,
      onError,
    });

    // Create a large message that exceeds 1MB
    const largeMessage = "x".repeat(1000001);

    transport.shipToLogger({
      logLevel: "INFO" as LogLevel,
      messages: [largeMessage],
      data: {},
      hasData: false,
    });

    // Wait for the async operation to complete
    await new Promise(process.nextTick);

    expect(mockFetch).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(expect.stringContaining("Payload size exceeds maximum"));
  });

  it("should call onError when compressed payload size exceeds limit", async () => {
    const onError = vi.fn();
    // Mock compression to always return a large payload
    global.CompressionStream = vi.fn(() => ({
      readable: {
        getReader: () => ({
          read: vi
            .fn()
            .mockResolvedValueOnce({ value: new Uint8Array(1000001), done: false })
            .mockResolvedValueOnce({ done: true }),
        }),
      },
      writable: {
        getWriter: () => ({
          write: vi.fn().mockResolvedValue(undefined),
          close: vi.fn().mockResolvedValue(undefined),
        }),
      },
    })) as unknown as typeof CompressionStream;

    const transport = new SumoLogicTransport({
      url: "https://collectors.sumologic.com/receiver/v1/http/123",
      onError,
    });

    transport.shipToLogger({
      logLevel: "INFO" as LogLevel,
      messages: ["Test message"],
      data: {},
      hasData: false,
    });

    // Wait for the async operation to complete
    await new Promise(process.nextTick);

    expect(mockFetch).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(expect.stringContaining("Compressed payload size exceeds maximum"));
  });

  it("should join multiple string messages", async () => {
    const transport = new SumoLogicTransport({
      url: "https://collectors.sumologic.com/receiver/v1/http/123",
      useCompression: false,
    });

    transport.shipToLogger({
      logLevel: "INFO" as LogLevel,
      messages: ["First", "Second", "Third"],
      data: {},
      hasData: false,
    });

    // Wait for the async operation to complete
    await new Promise(process.nextTick);

    const [, options] = mockFetch.mock.calls[0];
    const payload = JSON.parse(options.body);
    expect(payload.message).toBe("First Second Third");
  });
});
