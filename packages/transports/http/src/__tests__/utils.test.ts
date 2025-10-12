import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { compressData, sendWithRetry } from "../utils.js";
import { HttpTransportError, RateLimitError } from "../errors.js";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("utils", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockFetch.mockClear();
  });

  afterEach(async () => {
    // Wait for any pending promises to settle before cleaning up
    await vi.runAllTimersAsync();
    vi.useRealTimers();
    vi.clearAllTimers();
  });

  describe("HttpTransportError", () => {
    it("should create error with message", () => {
      const error = new HttpTransportError("Test error");
      expect(error.message).toBe("Test error");
      expect(error.name).toBe("HttpTransportError");
      expect(error.status).toBeUndefined();
      expect(error.response).toBeUndefined();
    });

    it("should create error with status and response", () => {
      const mockResponse = new Response("Not Found", { status: 404 });
      const error = new HttpTransportError("Not Found", 404, mockResponse);
      expect(error.message).toBe("Not Found");
      expect(error.name).toBe("HttpTransportError");
      expect(error.status).toBe(404);
      expect(error.response).toBe(mockResponse);
    });
  });

  describe("RateLimitError", () => {
    it("should create error with message and retryAfter", () => {
      const error = new RateLimitError("Rate limited", 5000);
      expect(error.message).toBe("Rate limited");
      expect(error.name).toBe("RateLimitError");
      expect(error.retryAfter).toBe(5000);
    });
  });

  describe("compressData", () => {
    it("should throw error when CompressionStream is not available", async () => {
      // Mock environment without CompressionStream
      const originalCompressionStream = global.CompressionStream;
      delete (global as any).CompressionStream;

      await expect(compressData("test data")).rejects.toThrow(
        "Gzip compression not supported in this environment"
      );

      // Restore CompressionStream
      global.CompressionStream = originalCompressionStream;
    });

    it("should compress data when CompressionStream is available", async () => {
      // Mock CompressionStream API
      const mockWriter = {
        write: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
      };

      const mockReader = {
        read: vi.fn()
          .mockResolvedValueOnce({ done: false, value: new Uint8Array([1, 2, 3]) })
          .mockResolvedValueOnce({ done: true }),
      };

      const mockWritable = {
        getWriter: vi.fn().mockReturnValue(mockWriter),
      };

      const mockReadable = {
        getReader: vi.fn().mockReturnValue(mockReader),
      };

      const mockCompressionStream = vi.fn().mockReturnValue({
        writable: mockWritable,
        readable: mockReadable,
      });

      (global as any).CompressionStream = mockCompressionStream;

      const result = await compressData("test data");

      expect(mockCompressionStream).toHaveBeenCalledWith("gzip");
      expect(mockWriter.write).toHaveBeenCalled();
      expect(mockWriter.close).toHaveBeenCalled();
      expect(mockReader.read).toHaveBeenCalledTimes(2);
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(3);
    });
  });

  describe("sendWithRetry", () => {
    it("should return response on successful request", async () => {
      const mockResponse = new Response("Success", { status: 200 });
      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await sendWithRetry(
        "https://api.example.com/logs",
        "POST",
        { "Content-Type": "application/json" },
        '{"test": "data"}',
        3,
        1000
      );

      expect(result).toBe(mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should retry on failure and eventually succeed", async () => {
      const mockError = new Error("Network error");
      const mockResponse = new Response("Success", { status: 200 });

      mockFetch
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockResponse);

      const promise = sendWithRetry(
        "https://api.example.com/logs",
        "POST",
        { "Content-Type": "application/json" },
        '{"test": "data"}',
        2,
        100
      );

      // Use runAllTimersAsync to handle all timers and wait for completion
      await vi.runAllTimersAsync();
      const result = await promise;
      
      expect(result).toBe(mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it("should throw error after max retries", async () => {
      const mockError = new Error("Network error");
      mockFetch.mockRejectedValue(mockError);

      const promise = sendWithRetry(
        "https://api.example.com/logs",
        "POST",
        { "Content-Type": "application/json" },
        '{"test": "data"}',
        2,
        100
      );
      // attach handler immediately to avoid unhandled rejection warnings
      void promise.catch(() => {});

      await vi.runAllTimersAsync();
      await expect(promise).rejects.toThrow("Network error");
      expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it("should handle rate limiting with retry-after header", async () => {
      const mockResponse = new Response("Rate Limited", { 
        status: 429,
        headers: new Headers({ "retry-after": "2" })
      });
      mockFetch.mockResolvedValueOnce(mockResponse);

      const promise = sendWithRetry(
        "https://api.example.com/logs",
        "POST",
        { "Content-Type": "application/json" },
        '{"test": "data"}',
        0,
        1000,
        true
      );

      // attach handler immediately to avoid unhandled rejection warnings
      void promise.catch(() => {});

      await vi.runAllTimersAsync();
      await expect(promise).rejects.toThrow(RateLimitError);
    });

    it("should handle rate limiting without retry-after header", async () => {
      const mockResponse = new Response("Rate Limited", { status: 429 });
      mockFetch.mockResolvedValueOnce(mockResponse);

      const promise = sendWithRetry(
        "https://api.example.com/logs",
        "POST",
        { "Content-Type": "application/json" },
        '{"test": "data"}',
        0,
        1000,
        true
      );

      // attach handler immediately to avoid unhandled rejection warnings
      void promise.catch(() => {});

      await vi.runAllTimersAsync();
      await expect(promise).rejects.toThrow(RateLimitError);
    });

    it("should call onError for non-2xx status codes", async () => {
      const onError = vi.fn();
      const mockResponse = new Response("Not Found", { status: 404 });
      mockFetch.mockResolvedValueOnce(mockResponse);

      const promise = sendWithRetry(
        "https://api.example.com/logs",
        "POST",
        { "Content-Type": "application/json" },
        '{"test": "data"}',
        0,
        1000,
        true,
        undefined,
        onError
      );

      // attach handler immediately to avoid unhandled rejection warnings
      void promise.catch(() => {});

      // No timers to advance for this test since maxRetries is 0
      await expect(promise).rejects.toThrow(HttpTransportError);

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "HTTP request failed with status 404: ",
        })
      );
    });

    it("should not call onError for 2xx status codes", async () => {
      const onError = vi.fn();
      const mockResponse = new Response("Created", { status: 201 });
      mockFetch.mockResolvedValueOnce(mockResponse);

      const promise = sendWithRetry(
        "https://api.example.com/logs",
        "POST",
        { "Content-Type": "application/json" },
        '{"test": "data"}',
        0,
        1000,
        true,
        undefined,
        onError
      );

      // Fast-forward through all timers
      await vi.runAllTimersAsync();

      await promise;
      expect(onError).not.toHaveBeenCalled();
    });

    it("should call onDebugReqRes callback when provided", async () => {
      const onDebugReqRes = vi.fn();
      const mockResponse = new Response("Success", { status: 200 });
      mockFetch.mockResolvedValueOnce(mockResponse);

      const promise = sendWithRetry(
        "https://api.example.com/logs",
        "POST",
        { "Content-Type": "application/json" },
        '{"test": "data"}',
        0,
        1000,
        true,
        onDebugReqRes
      );

      // Fast-forward through all timers
      await vi.runAllTimersAsync();

      await promise;

      expect(onDebugReqRes).toHaveBeenCalledWith({
        req: {
          url: "https://api.example.com/logs",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: '{"test": "data"}',
        },
        res: {
          status: 200,
          statusText: "",
          headers: {
            "content-type": "text/plain;charset=UTF-8",
          },
          body: "Success",
        },
      });
    });

    it("should handle debug callback errors gracefully", async () => {
      const onDebugReqRes = vi.fn().mockImplementation(() => {
        throw new Error("Debug callback error");
      });
      const onError = vi.fn();
      const mockResponse = new Response("Success", { status: 200 });
      mockFetch.mockResolvedValueOnce(mockResponse);

      await sendWithRetry(
        "https://api.example.com/logs",
        "POST",
        { "Content-Type": "application/json" },
        '{"test": "data"}',
        0,
        1000,
        true,
        onDebugReqRes,
        onError
      );

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Debug callback error: Error: Debug callback error",
        })
      );
    });

    it("should use exponential backoff for retries", async () => {
      const mockError = new Error("Network error");
      mockFetch.mockRejectedValue(mockError);

      const promise = sendWithRetry(
        "https://api.example.com/logs",
        "POST",
        { "Content-Type": "application/json" },
        '{"test": "data"}',
        2,
        100
      );

      // attach handler immediately to avoid unhandled rejection warnings
      void promise.catch(() => {});

      await vi.runAllTimersAsync();
      await expect(promise).rejects.toThrow("Network error");
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it("should not respect rate limit when respectRateLimit is false", async () => {
      const onError = vi.fn();
      const mockResponse = new Response("Rate Limited", { status: 429 });
      mockFetch.mockResolvedValueOnce(mockResponse);

      const promise = sendWithRetry(
        "https://api.example.com/logs",
        "POST",
        { "Content-Type": "application/json" },
        '{"test": "data"}',
        0,
        1000,
        false,
        undefined,
        onError
      );

      // No timers to advance for this test since maxRetries is 0
      await expect(promise).rejects.toThrow(HttpTransportError);

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "HTTP request failed with status 429: ",
        })
      );
    });
  });
});
