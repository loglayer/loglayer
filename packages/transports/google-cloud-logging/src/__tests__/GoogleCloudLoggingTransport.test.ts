import { type Log, Logging } from "@google-cloud/logging";
import { LogLayer } from "loglayer";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GoogleCloudLoggingTransport } from "../GoogleCloudLoggingTransport.js";

// Mock the write method
const mockWrite = vi.fn();
vi.mock("@google-cloud/logging", async () => {
  const actual = await vi.importActual("@google-cloud/logging");
  return {
    ...actual,
    Logging: class extends (actual as any).Logging {
      log() {
        const actualLog = new (actual as any).Log(this, "test-log");
        return {
          entry: actualLog.entry.bind(actualLog),
          write: mockWrite,
        };
      }
    },
  };
});

describe("GoogleCloudLoggingTransport", () => {
  let logger: LogLayer;
  let mockLog: Log;

  beforeEach(() => {
    vi.clearAllMocks();
    const logging = new Logging({ projectId: "test-project" });
    mockLog = logging.log("test-log");
    logger = new LogLayer({
      transport: new GoogleCloudLoggingTransport({
        logger: mockLog,
      }),
    });
  });

  it("should initialize successfully with the transport", () => {
    expect(logger).toBeInstanceOf(LogLayer);
  });

  describe("log level mapping", () => {
    it.each([
      { method: "fatal", message: "critical error", expectedSeverity: "CRITICAL" },
      { method: "error", message: "error message", expectedSeverity: "ERROR" },
      { method: "warn", message: "warning message", expectedSeverity: "WARNING" },
      { method: "info", message: "info message", expectedSeverity: "INFO" },
      { method: "debug", message: "debug message", expectedSeverity: "DEBUG" },
      { method: "trace", message: "trace message", expectedSeverity: "DEBUG" },
    ])("should map $method to $expectedSeverity", ({ method, message, expectedSeverity }) => {
      logger[method](message);

      expect(mockWrite).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            severity: expectedSeverity,
            timestamp: expect.any(Date),
          }),
          data: {
            message: message,
          },
        }),
      );
    });
  });

  describe("metadata handling", () => {
    it("should include metadata in log entries", () => {
      const metadata = {
        service: "test-service",
        environment: "test",
      };

      logger.withMetadata(metadata).info("test message");

      expect(mockWrite).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            severity: "INFO",
            timestamp: expect.any(Date),
          }),
          data: {
            ...metadata,
            message: "test message",
          },
        }),
      );
    });
  });

  describe("message handling", () => {
    it("should join multiple message with spaces", () => {
      logger.info("message 1", "message 2", "message 3");

      expect(mockWrite).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            severity: "INFO",
            timestamp: expect.any(Date),
          }),
          data: {
            message: "message 1 message 2 message 3",
          },
        }),
      );
    });

    it("should handle numbers in message", () => {
      logger.info("Count:", 42, "items");

      expect(mockWrite).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            severity: "INFO",
            timestamp: expect.any(Date),
          }),
          data: {
            message: "Count: 42 items",
          },
        }),
      );
    });
  });

  describe("root level data", () => {
    it("should include rootLevelData in all logs", () => {
      const rootLevelData = {
        resource: {
          type: "global",
          labels: {
            project_id: "test-project",
          },
        },
        labels: {
          environment: "test",
        },
      };

      const loggerWithRoot = new LogLayer({
        transport: new GoogleCloudLoggingTransport({
          logger: mockLog,
          rootLevelData,
        }),
      });

      loggerWithRoot.info("test message");

      expect(mockWrite).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            ...rootLevelData,
            severity: "INFO",
            timestamp: expect.any(Date),
          }),
          data: {
            message: "test message",
          },
        }),
      );
    });
  });

  describe("rootLevelMetadataFields", () => {
    it("should include all log entry fields under data when 'rootLevelMetadataFields' is empty", () => {
      const metadata = {
        customField: "customValue",
        logName: "test-log",
        resource: {
          type: "global",
          labels: {
            project_id: "test-project",
          },
        },
        insertId: "insert-123",
        httpRequest: {
          requestMethod: "GET",
        },
        labels: {
          environment: "test",
        },
        operation: {
          id: "operation-123",
        },
        trace: "trace-123",
        spanId: "span-123",
        traceSampled: true,
        sourceLocation: {
          file: "GoogleCloudLoggingTransport.test.ts",
        },
        split: {
          totalSplits: 3,
        },
      };

      const loggerWithRootLevelMetadataFields = new LogLayer({
        transport: new GoogleCloudLoggingTransport({
          logger: mockLog,
          rootLevelMetadataFields: [],
        }),
      });

      loggerWithRootLevelMetadataFields.withMetadata(metadata).info("test message");

      expect(mockWrite).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            severity: "INFO",
            timestamp: expect.any(Date),
          }),
          data: {
            message: "test message",
            ...metadata,
          },
        }),
      );
    });

    it("should include all log entry fields under metadata when specified by 'rootLevelMetadataFields'", () => {
      const metadata = {
        customField: "customValue",
        logName: "test-log",
        resource: {
          type: "global",
          labels: {
            project_id: "test-project",
          },
        },
        insertId: "insert-123",
        httpRequest: {
          requestMethod: "GET",
        },
        labels: {
          environment: "test",
        },
        operation: {
          id: "operation-123",
        },
        trace: "trace-123",
        spanId: "span-123",
        traceSampled: true,
        sourceLocation: {
          file: "GoogleCloudLoggingTransport.test.ts",
        },
        split: {
          totalSplits: 3,
        },
      };

      const loggerWithRootLevelMetadataFields = new LogLayer({
        transport: new GoogleCloudLoggingTransport({
          logger: mockLog,
          rootLevelMetadataFields: [
            "logName",
            "resource",
            "insertId",
            "httpRequest",
            "labels",
            "operation",
            "trace",
            "spanId",
            "traceSampled",
            "sourceLocation",
            "split",
          ],
        }),
      });

      loggerWithRootLevelMetadataFields.withMetadata(metadata).info("test message");

      const { customField, ...restMetadata } = metadata;

      expect(mockWrite).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            severity: "INFO",
            timestamp: expect.any(Date),
            ...restMetadata,
          }),
          data: {
            message: "test message",
            customField,
          },
        }),
      );
    });
  });

  describe("error handling", () => {
    it("should call onError when write() rejects", async () => {
      const onError = vi.fn();
      const loggerWithErrorHandler = new LogLayer({
        transport: new GoogleCloudLoggingTransport({
          logger: mockLog,
          onError,
        }),
      });

      mockWrite.mockRejectedValueOnce(new Error("write failed"));

      loggerWithErrorHandler.info("test message");

      await vi.waitFor(() => {
        expect(onError).toHaveBeenCalledTimes(1);
      });

      const error = onError.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("write failed");
    });

    it("should call onError when write() throws synchronously", () => {
      const onError = vi.fn();
      const loggerWithErrorHandler = new LogLayer({
        transport: new GoogleCloudLoggingTransport({
          logger: mockLog,
          onError,
        }),
      });

      mockWrite.mockImplementationOnce(() => {
        throw new Error("sync write failed");
      });

      expect(() => loggerWithErrorHandler.info("test message")).not.toThrow();

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
      expect((onError.mock.calls[0][0] as Error).message).toBe("sync write failed");
    });

    it("should call onError when entry() throws and skip the write", () => {
      const onError = vi.fn();
      const brokenLog = {
        entry: () => {
          throw new Error("entry failed");
        },
        write: mockWrite,
      } as unknown as Log;

      const loggerWithBrokenEntry = new LogLayer({
        transport: new GoogleCloudLoggingTransport({
          logger: brokenLog,
          onError,
        }),
      });

      expect(() => loggerWithBrokenEntry.info("test message")).not.toThrow();

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
      expect((onError.mock.calls[0][0] as Error).message).toBe("entry failed");
      expect(mockWrite).not.toHaveBeenCalled();
    });

    it("should not produce an unhandled rejection when write() rejects without an onError configured", async () => {
      const unhandledHandler = vi.fn();
      process.on("unhandledRejection", unhandledHandler);

      try {
        mockWrite.mockRejectedValueOnce(new Error("write failed without a handler"));

        expect(() => logger.info("test message")).not.toThrow();

        // Give the rejected promise time to surface as an unhandled rejection if unhandled
        await new Promise((resolve) => setTimeout(resolve, 50));
      } finally {
        process.off("unhandledRejection", unhandledHandler);
      }

      expect(unhandledHandler).not.toHaveBeenCalled();
    });

    it("should not produce an unhandled rejection when onError itself throws (async rejection)", async () => {
      const unhandledHandler = vi.fn();
      process.on("unhandledRejection", unhandledHandler);

      try {
        const loggerWithThrowingHandler = new LogLayer({
          transport: new GoogleCloudLoggingTransport({
            logger: mockLog,
            onError: () => {
              throw new Error("callback exploded");
            },
          }),
        });

        mockWrite.mockRejectedValueOnce(new Error("write failed"));

        expect(() => loggerWithThrowingHandler.info("test message")).not.toThrow();

        await new Promise((resolve) => setTimeout(resolve, 50));
      } finally {
        process.off("unhandledRejection", unhandledHandler);
      }

      expect(unhandledHandler).not.toHaveBeenCalled();
    });

    it("should not propagate an exception when onError itself throws (synchronous error)", () => {
      const loggerWithThrowingHandler = new LogLayer({
        transport: new GoogleCloudLoggingTransport({
          logger: mockLog,
          onError: () => {
            throw new Error("callback exploded");
          },
        }),
      });

      mockWrite.mockImplementationOnce(() => {
        throw new Error("sync write failed");
      });

      expect(() => loggerWithThrowingHandler.info("test message")).not.toThrow();
    });

    it("should normalize non-Error rejections to Error instances", async () => {
      const onError = vi.fn();
      const loggerWithErrorHandler = new LogLayer({
        transport: new GoogleCloudLoggingTransport({
          logger: mockLog,
          onError,
        }),
      });

      mockWrite.mockRejectedValueOnce("string failure");

      loggerWithErrorHandler.info("test message");

      await vi.waitFor(() => {
        expect(onError).toHaveBeenCalledTimes(1);
      });

      const error = onError.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("string failure");
    });

    it("should continue writing entries after a failed write", async () => {
      const onError = vi.fn();
      const loggerWithErrorHandler = new LogLayer({
        transport: new GoogleCloudLoggingTransport({
          logger: mockLog,
          onError,
        }),
      });

      mockWrite.mockRejectedValueOnce(new Error("first write failed"));

      loggerWithErrorHandler.info("first message");

      await vi.waitFor(() => {
        expect(onError).toHaveBeenCalledTimes(1);
      });

      loggerWithErrorHandler.info("second message");

      expect(mockWrite).toHaveBeenCalledTimes(2);
      expect(onError).toHaveBeenCalledTimes(1);
    });

    it("should not call onError when write() returns void (LogSync behavior)", () => {
      const onError = vi.fn();
      const loggerWithErrorHandler = new LogLayer({
        transport: new GoogleCloudLoggingTransport({
          logger: mockLog,
          onError,
        }),
      });

      // mockWrite returns undefined by default, matching LogSync.write()'s void return
      loggerWithErrorHandler.info("test message");

      expect(mockWrite).toHaveBeenCalledTimes(1);
      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe("level filtering", () => {
    it("should only log messages at or above the specified level", () => {
      const loggerWithLevel = new LogLayer({
        transport: new GoogleCloudLoggingTransport({
          logger: mockLog,
          level: "warn",
        }),
      });

      // These should be logged
      loggerWithLevel.fatal("fatal message");
      loggerWithLevel.error("error message");
      loggerWithLevel.warn("warning message");

      // These should not be logged
      loggerWithLevel.info("info message");
      loggerWithLevel.debug("debug message");
      loggerWithLevel.trace("trace message");

      // Should be called 3 times for fatal, error, and warn
      expect(mockWrite).toHaveBeenCalledTimes(3);

      // Verify the calls were for the right levels
      expect(mockWrite).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({ severity: "CRITICAL" }),
          data: { message: "fatal message" },
        }),
      );
      expect(mockWrite).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({ severity: "ERROR" }),
          data: { message: "error message" },
        }),
      );
      expect(mockWrite).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({ severity: "WARNING" }),
          data: { message: "warning message" },
        }),
      );
    });

    it("should log all messages when level is trace", () => {
      const loggerWithLevel = new LogLayer({
        transport: new GoogleCloudLoggingTransport({
          logger: mockLog,
          level: "trace",
        }),
      });

      loggerWithLevel.fatal("fatal message");
      loggerWithLevel.error("error message");
      loggerWithLevel.warn("warning message");
      loggerWithLevel.info("info message");
      loggerWithLevel.debug("debug message");
      loggerWithLevel.trace("trace message");

      // Should be called for all 6 log levels
      expect(mockWrite).toHaveBeenCalledTimes(6);
    });
  });
});
