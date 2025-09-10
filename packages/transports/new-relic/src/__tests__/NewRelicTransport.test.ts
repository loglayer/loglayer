import { LogLayer } from "loglayer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NewRelicTransport } from "../NewRelicTransport.js";

describe("NewRelicTransport", () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let originalFetch: typeof fetch;

  beforeEach(() => {
    vi.useFakeTimers();

    // Store original fetch
    originalFetch = global.fetch;

    // Mock fetch function
    mockFetch = vi.fn(() =>
      Promise.resolve(
        new Response(null, {
          status: 200,
          statusText: "OK",
        }),
      ),
    );
    global.fetch = mockFetch;

    // Mock CompressionStream
    const mockWriter = {
      write: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
    };

    const mockReader = {
      read: vi
        .fn()
        .mockResolvedValueOnce({ value: new Uint8Array([1, 2, 3]), done: false })
        .mockResolvedValueOnce({ done: true }),
    };

    const mockStream = {
      writable: { getWriter: () => mockWriter },
      readable: { getReader: () => mockReader },
    };

    global.CompressionStream = vi.fn().mockImplementation(() => mockStream);
    global.TextEncoder = vi.fn().mockImplementation(() => ({
      encode: (str: string) => new Uint8Array(str.length),
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
    // Restore original fetch
    global.fetch = originalFetch;
  });

  it("should send logs to New Relic", async () => {
    const log = new LogLayer({
      transport: new NewRelicTransport({
        id: "new-relic",
        apiKey: "test-api-key",
        useCompression: false,
      }),
    });

    const sendPromise = log.info("test message");
    await vi.runAllTimersAsync();
    await sendPromise;

    expect(mockFetch).toHaveBeenCalledWith(
      "https://log-api.newrelic.com/log/v1",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Key": "test-api-key",
        },
        body: expect.stringContaining("test message"),
      }),
    );
  });

  it("should handle payload size limit", async () => {
    const onError = vi.fn();
    const log = new LogLayer({
      transport: new NewRelicTransport({
        id: "new-relic",
        apiKey: "test-api-key",
        useCompression: false,
        onError,
      }),
    });

    // Create a large string that exceeds 1MB
    const largeString = "x".repeat(1_000_001);
    log.info(largeString);

    // Wait for the next tick to allow error handling to complete
    await vi.runAllTimersAsync();
    await new Promise((resolve) => process.nextTick(resolve));

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "ValidationError",
        message: expect.stringContaining("Payload size exceeds maximum"),
      }),
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should handle maximum number of attributes", async () => {
    const onError = vi.fn();
    const log = new LogLayer({
      transport: new NewRelicTransport({
        id: "new-relic",
        apiKey: "test-api-key",
        onError,
      }),
    });

    // Create an object with more than 255 attributes
    const metadata: Record<string, string> = {};
    for (let i = 0; i < 256; i++) {
      metadata[`key${i}`] = `value${i}`;
    }

    const sendPromise = log.withMetadata(metadata).info("test message");
    await vi.runAllTimersAsync();
    await sendPromise;

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "ValidationError",
        message: expect.stringContaining("exceeds maximum number of attributes"),
      }),
    );
  });

  it("should handle attribute name length limit", async () => {
    const onError = vi.fn();
    const log = new LogLayer({
      transport: new NewRelicTransport({
        id: "new-relic",
        apiKey: "test-api-key",
        onError,
      }),
    });

    // Create an attribute name longer than 255 characters
    const longKey = "x".repeat(256);
    const sendPromise = log.withMetadata({ [longKey]: "value" }).info("test message");
    await vi.runAllTimersAsync();
    await sendPromise;

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "ValidationError",
        message: expect.stringContaining("exceeds maximum length"),
      }),
    );
  });

  it("should truncate attribute values longer than 4094 characters", async () => {
    const log = new LogLayer({
      transport: new NewRelicTransport({
        id: "new-relic",
        apiKey: "test-api-key",
        useCompression: false,
      }),
    });

    // Create a string longer than 4094 characters
    const longValue = "x".repeat(5000);
    const sendPromise = log.withMetadata({ test: longValue }).info("test message");
    await vi.runAllTimersAsync();
    await sendPromise;

    const expectedTruncated = `"attributes":{"test":"${("x").repeat(4094)}"}`;
    const notExpectedLonger = `"attributes":{"test":"${("x").repeat(4095)}"}`;

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining(expectedTruncated),
      }),
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.not.objectContaining({
        body: expect.stringContaining(notExpectedLonger),
      }),
    );
  });

  it("should use gzip compression by default", async () => {
    const log = new LogLayer({
      transport: new NewRelicTransport({
        id: "new-relic",
        apiKey: "test-api-key",
      }),
    });

    const sendPromise = log.info("test message");
    await vi.runAllTimersAsync();
    await sendPromise;

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Encoding": "gzip",
        }),
        body: expect.any(Uint8Array),
      }),
    );
    expect(global.CompressionStream).toHaveBeenCalledWith("gzip");
  });

  it("should use custom endpoint", async () => {
    const customEndpoint = "https://custom.newrelic.com/logs";
    const log = new LogLayer({
      transport: new NewRelicTransport({
        id: "new-relic",
        apiKey: "test-api-key",
        endpoint: customEndpoint,
        useCompression: false,
      }),
    });

    const sendPromise = log.info("test message");
    await vi.runAllTimersAsync();
    await sendPromise;

    expect(mockFetch).toHaveBeenCalledWith(customEndpoint, expect.any(Object));
  });

  it("should retry on failure", async () => {
    mockFetch
      .mockImplementationOnce(() => Promise.reject(new Error("Network error")))
      .mockImplementationOnce(() => Promise.reject(new Error("Network error")))
      .mockImplementationOnce(() =>
        Promise.resolve(
          new Response(null, {
            status: 200,
            statusText: "OK",
          }),
        ),
      );

    const log = new LogLayer({
      transport: new NewRelicTransport({
        id: "new-relic",
        apiKey: "test-api-key",
        useCompression: false,
        retryDelay: 10,
      }),
    });

    const sendPromise = log.info("test message");

    // Run timers for each retry attempt
    for (let i = 0; i < 3; i++) {
      await vi.runAllTimersAsync();
    }
    await sendPromise;

    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("should not retry on validation errors", async () => {
    const onError = vi.fn();
    const log = new LogLayer({
      transport: new NewRelicTransport({
        id: "new-relic",
        apiKey: "test-api-key",
        useCompression: false,
        onError,
      }),
    });

    // Create a payload that exceeds size limit
    const largeString = "x".repeat(1_000_001);
    log.info(largeString);

    // Wait for the next tick to allow error handling to complete
    await vi.runAllTimersAsync();
    await new Promise((resolve) => process.nextTick(resolve));

    expect(mockFetch).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "ValidationError",
      }),
    );
  });

  it("should call onError after max retries", async () => {
    const error = new Error("Network error");
    mockFetch.mockImplementation(() => Promise.reject(error));

    const onError = vi.fn();
    const log = new LogLayer({
      transport: new NewRelicTransport({
        id: "new-relic",
        apiKey: "test-api-key",
        useCompression: false,
        retryDelay: 10,
        maxRetries: 2,
        onError,
      }),
    });

    const sendPromise = log.info("test message");

    // Run timers for each retry attempt
    for (let i = 0; i <= 2; i++) {
      await vi.runAllTimersAsync();
    }
    await sendPromise;

    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    expect(onError.mock.calls[0][0].message).toContain("Failed to send logs after 2 retries");
  });

  it("should include metadata in log entry", async () => {
    const log = new LogLayer({
      transport: new NewRelicTransport({
        id: "new-relic",
        apiKey: "test-api-key",
        useCompression: false,
      }),
    });

    const sendPromise = log.withMetadata({ test: "data" }).info("test message");
    await vi.runAllTimersAsync();
    await sendPromise;

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining('"attributes":{"test":"data"}'),
      }),
    );
  });

  it("should handle rate limiting with Retry-After header", async () => {
    const retryAfter = 30; // 30 seconds
    mockFetch
      .mockImplementationOnce(() =>
        Promise.resolve(
          new Response(null, {
            status: 429,
            statusText: "Too Many Requests",
            headers: new Headers({
              "Retry-After": retryAfter.toString(),
            }),
          }),
        ),
      )
      .mockImplementationOnce(() =>
        Promise.resolve(
          new Response(null, {
            status: 200,
            statusText: "OK",
          }),
        ),
      );

    const log = new LogLayer({
      transport: new NewRelicTransport({
        id: "new-relic",
        apiKey: "test-api-key",
        useCompression: false,
        retryDelay: 10,
      }),
    });

    const sendPromise = log.info("test message");

    // Fast-forward time by the retry-after duration
    await vi.advanceTimersByTimeAsync(retryAfter * 1000);
    await vi.runAllTimersAsync();
    await sendPromise;

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("should not retry on rate limit when respectRateLimit is false", async () => {
    const retryAfter = 30; // 30 seconds
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve(
        new Response(null, {
          status: 429,
          statusText: "Too Many Requests",
          headers: new Headers({
            "Retry-After": retryAfter.toString(),
          }),
        }),
      ),
    );

    const onError = vi.fn();
    const log = new LogLayer({
      transport: new NewRelicTransport({
        id: "new-relic",
        apiKey: "test-api-key",
        useCompression: false,
        respectRateLimit: false,
        onError,
      }),
    });

    const sendPromise = log.info("test message");
    await vi.runAllTimersAsync();
    await sendPromise;

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "RateLimitError",
        message: expect.stringContaining(`Retry after ${retryAfter} seconds`),
      }),
    );
  });

  it("should not count rate limit retries against maxRetries", async () => {
    const retryAfter = 5; // 5 seconds
    mockFetch
      .mockImplementationOnce(() =>
        Promise.resolve(
          new Response(null, {
            status: 429,
            statusText: "Too Many Requests",
            headers: new Headers({
              "Retry-After": retryAfter.toString(),
            }),
          }),
        ),
      )
      .mockImplementationOnce(() =>
        Promise.resolve(
          new Response(null, {
            status: 429,
            statusText: "Too Many Requests",
            headers: new Headers({
              "Retry-After": retryAfter.toString(),
            }),
          }),
        ),
      )
      .mockImplementationOnce(() =>
        Promise.resolve(
          new Response(null, {
            status: 500,
            statusText: "Internal Server Error",
          }),
        ),
      )
      .mockImplementationOnce(() =>
        Promise.resolve(
          new Response(null, {
            status: 200,
            statusText: "OK",
          }),
        ),
      );

    const log = new LogLayer({
      transport: new NewRelicTransport({
        id: "new-relic",
        apiKey: "test-api-key",
        useCompression: false,
        maxRetries: 1,
        retryDelay: 10,
      }),
    });

    const sendPromise = log.info("test message");

    // Fast-forward time for each retry
    await vi.advanceTimersByTimeAsync(retryAfter * 1000);
    await vi.advanceTimersByTimeAsync(retryAfter * 1000);
    await vi.advanceTimersByTimeAsync(10); // Regular retry delay
    await vi.runAllTimersAsync();
    await sendPromise;

    expect(mockFetch).toHaveBeenCalledTimes(4);
  });

  it("should use default retry-after of 60 seconds when header is missing", async () => {
    mockFetch
      .mockImplementationOnce(() =>
        Promise.resolve(
          new Response(null, {
            status: 429,
            statusText: "Too Many Requests",
          }),
        ),
      )
      .mockImplementationOnce(() =>
        Promise.resolve(
          new Response(null, {
            status: 200,
            statusText: "OK",
          }),
        ),
      );

    const log = new LogLayer({
      transport: new NewRelicTransport({
        id: "new-relic",
        apiKey: "test-api-key",
        useCompression: false,
        retryDelay: 10,
      }),
    });

    const sendPromise = log.info("test message");

    // Fast-forward time by the default retry-after duration
    await vi.advanceTimersByTimeAsync(60 * 1000);
    await vi.runAllTimersAsync();
    await sendPromise;

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
