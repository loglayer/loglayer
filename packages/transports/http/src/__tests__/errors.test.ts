import { describe, expect, it } from "vitest";
import { HttpTransportError, RateLimitError, LogSizeError } from "../errors.js";

describe("errors", () => {
  describe("HttpTransportError", () => {
    it("should create error with message only", () => {
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

    it("should create error with status only", () => {
      const error = new HttpTransportError("Bad Request", 400);
      expect(error.message).toBe("Bad Request");
      expect(error.name).toBe("HttpTransportError");
      expect(error.status).toBe(400);
      expect(error.response).toBeUndefined();
    });
  });

  describe("RateLimitError", () => {
    it("should create error with message and retryAfter", () => {
      const error = new RateLimitError("Rate limited", 5000);
      expect(error.message).toBe("Rate limited");
      expect(error.name).toBe("RateLimitError");
      expect(error.retryAfter).toBe(5000);
    });

    it("should create error with zero retryAfter", () => {
      const error = new RateLimitError("Rate limited", 0);
      expect(error.message).toBe("Rate limited");
      expect(error.name).toBe("RateLimitError");
      expect(error.retryAfter).toBe(0);
    });

    it("should create error with large retryAfter", () => {
      const error = new RateLimitError("Rate limited", 3600000); // 1 hour
      expect(error.message).toBe("Rate limited");
      expect(error.name).toBe("RateLimitError");
      expect(error.retryAfter).toBe(3600000);
    });
  });

  describe("LogSizeError", () => {
    it("should create error with all properties", () => {
      const logEntry = { level: "info", message: "test", data: { key: "value" } };
      const error = new LogSizeError(
        "Log entry too large",
        logEntry,
        2048,
        1024
      );
      
      expect(error.message).toBe("Log entry too large");
      expect(error.name).toBe("LogSizeError");
      expect(error.logEntry).toBe(logEntry);
      expect(error.size).toBe(2048);
      expect(error.limit).toBe(1024);
    });

    it("should create error with empty log entry", () => {
      const logEntry = {};
      const error = new LogSizeError(
        "Empty log entry",
        logEntry,
        0,
        1024
      );
      
      expect(error.message).toBe("Empty log entry");
      expect(error.name).toBe("LogSizeError");
      expect(error.logEntry).toBe(logEntry);
      expect(error.size).toBe(0);
      expect(error.limit).toBe(1024);
    });

    it("should create error with complex log entry", () => {
      const logEntry = {
        level: "error",
        message: "Complex error",
        data: {
          nested: {
            array: [1, 2, 3],
            object: { key: "value" }
          },
          timestamp: new Date().toISOString()
        }
      };
      const error = new LogSizeError(
        "Complex log entry too large",
        logEntry,
        5000,
        1000
      );
      
      expect(error.message).toBe("Complex log entry too large");
      expect(error.name).toBe("LogSizeError");
      expect(error.logEntry).toBe(logEntry);
      expect(error.size).toBe(5000);
      expect(error.limit).toBe(1000);
    });
  });
});
