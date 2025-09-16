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

      const loggerWithMetadataBehavior = new LogLayer({
        transport: new GoogleCloudLoggingTransport({
          logger: mockLog,
          rootLevelMetadataFields: [],
        }),
      });

      loggerWithMetadataBehavior.withMetadata(metadata).info("test message");

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

      const loggerWithMetadataBehavior = new LogLayer({
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

      loggerWithMetadataBehavior.withMetadata(metadata).info("test message");

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
