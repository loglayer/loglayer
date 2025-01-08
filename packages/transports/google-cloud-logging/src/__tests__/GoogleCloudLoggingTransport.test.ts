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
});
