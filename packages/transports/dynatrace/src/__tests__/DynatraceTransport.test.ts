import { LogLayer } from "loglayer";
import { beforeEach, describe, expect, it, vitest } from "vitest";
import { DynatraceTransport } from "../DynatraceTransport.js";

// Mock fetch globally
const mockFetch = vitest.fn();
global.fetch = mockFetch;

describe("DynatraceTransport", () => {
  let log: LogLayer;
  const mockUrl = "https://test.dynatrace.com/api/v2/logs/ingest";
  const mockIngestToken = "test-token";
  const mockISOString = "2024-01-01T00:00:00.000Z";

  beforeEach(() => {
    // Reset mocks
    mockFetch.mockReset();
    mockFetch.mockResolvedValue(new Response(null, { status: 200 }));

    // Mock Date.prototype.toISOString
    vitest.spyOn(Date.prototype, "toISOString").mockReturnValue(mockISOString);

    // Create a new transport instance for each test
    const transport = new DynatraceTransport({
      url: mockUrl,
      ingestToken: mockIngestToken,
    });

    log = new LogLayer({
      transport,
    });
  });

  it("should send a basic log message", () => {
    log.info("test message");

    expect(mockFetch).toHaveBeenCalledWith(
      mockUrl,
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Api-Token ${mockIngestToken}`,
        },
        body: JSON.stringify({
          content: "test message",
          severity: "info",
          timestamp: mockISOString,
        }),
      }),
    );
  });

  it("should handle multiple message arguments", () => {
    log.info("test", "multiple", "messages");

    expect(mockFetch).toHaveBeenCalledWith(
      mockUrl,
      expect.objectContaining({
        body: JSON.stringify({
          content: "test multiple messages",
          severity: "info",
          timestamp: mockISOString,
        }),
      }),
    );
  });

  it("should include metadata in the payload", () => {
    log.withMetadata({ user: "test", id: 123 }).info("test message");

    expect(mockFetch).toHaveBeenCalledWith(
      mockUrl,
      expect.objectContaining({
        body: JSON.stringify({
          content: "test message",
          severity: "info",
          timestamp: mockISOString,
          user: "test",
          id: 123,
        }),
      }),
    );
  });

  it("should handle error objects in metadata", () => {
    const error = new Error("test error");
    log.withError(error).error("An error occurred");

    expect(mockFetch).toHaveBeenCalledWith(
      mockUrl,
      expect.objectContaining({
        body: JSON.stringify({
          content: "An error occurred",
          severity: "error",
          timestamp: mockISOString,
          err: error,
        }),
      }),
    );
  });

  it("should handle context data", () => {
    log.withContext({ environment: "test" });
    log.info("test message");

    expect(mockFetch).toHaveBeenCalledWith(
      mockUrl,
      expect.objectContaining({
        body: JSON.stringify({
          content: "test message",
          severity: "info",
          timestamp: mockISOString,
          environment: "test",
        }),
      }),
    );
  });

  it("should handle prefixed messages", () => {
    log.withPrefix("[TEST]").info("test message");

    expect(mockFetch).toHaveBeenCalledWith(
      mockUrl,
      expect.objectContaining({
        body: JSON.stringify({
          content: "[TEST] test message",
          severity: "info",
          timestamp: mockISOString,
        }),
      }),
    );
  });

  it("should call onError callback when request fails", async () => {
    const onError = vitest.fn();
    const transport = new DynatraceTransport({
      url: mockUrl,
      ingestToken: mockIngestToken,
      onError,
    });

    log = new LogLayer({ transport });

    // Mock a failed request
    mockFetch.mockResolvedValueOnce(new Response(null, { status: 400, statusText: "Bad Request" }));

    log.info("test message");

    // Wait for the async operation to complete
    await new Promise(process.nextTick);

    expect(onError).toHaveBeenCalledWith("Failed to send log to Dynatrace: Bad Request");
  });

  it("should call onError callback when fetch throws", async () => {
    const onError = vitest.fn();
    const transport = new DynatraceTransport({
      url: mockUrl,
      ingestToken: mockIngestToken,
      onError,
    });

    log = new LogLayer({ transport });

    // Mock a network error
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    log.info("test message");

    // Wait for the async operation to complete
    await new Promise(process.nextTick);

    expect(onError).toHaveBeenCalledWith(new Error("Network error"));
  });
});
