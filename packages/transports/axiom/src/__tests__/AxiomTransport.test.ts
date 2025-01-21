import type { Axiom } from "@axiomhq/js";
import { LogLayer } from "loglayer";
import { LogLevel } from "loglayer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type AxiomLevelMap, AxiomTransport } from "../AxiomTransport.js";

// Mock Axiom client
const mockIngest = vi.fn();
const mockFlush = vi.fn().mockResolvedValue(undefined);
const mockClient = {
  ingest: mockIngest,
  flush: mockFlush,
} as unknown as Axiom;

// Keep track of active transport instances
const activeTransports: AxiomTransport[] = [];

function getLoggerInstance(
  config: {
    fieldNames?: {
      level?: string;
      message?: string;
      timestamp?: string;
    };
    timestampFn?: () => string | number;
    onError?: (error: Error) => void;
    level?: "trace" | "debug" | "info" | "warn" | "error" | "fatal";
    levelMap?: AxiomLevelMap;
  } = {},
) {
  const transport = new AxiomTransport({
    logger: mockClient,
    dataset: "test-dataset",
    ...config,
  });
  activeTransports.push(transport);

  return {
    log: new LogLayer({ transport }),
    transport,
  };
}

describe("Axiom Transport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up all active transport instances
    await Promise.all(activeTransports.map((transport) => transport[Symbol.dispose]()));
    activeTransports.length = 0;
  });

  it("should initialize with default field names", () => {
    const { transport } = getLoggerInstance();
    expect(transport).toBeInstanceOf(AxiomTransport);
  });

  it("should initialize with custom field names", () => {
    const { transport } = getLoggerInstance({
      fieldNames: {
        message: "msg",
        level: "severity",
        timestamp: "time",
      },
    });

    expect(transport).toBeInstanceOf(AxiomTransport);
  });

  it("should send log message with default fields", () => {
    const { log } = getLoggerInstance();

    log.info("test message");

    expect(mockIngest).toHaveBeenCalledWith("test-dataset", [
      expect.objectContaining({
        message: "test message",
        level: "info",
        timestamp: expect.any(String),
      }),
    ]);
  });

  it("should send log message with custom fields", () => {
    const { log } = getLoggerInstance({
      fieldNames: {
        message: "msg",
        level: "severity",
        timestamp: "time",
      },
    });

    log.info("test message");

    expect(mockIngest).toHaveBeenCalledWith("test-dataset", [
      expect.objectContaining({
        msg: "test message",
        severity: "info",
        time: expect.any(String),
      }),
    ]);
  });

  it("should use custom timestamp function", () => {
    const timestamp = 1234567890;
    const { log } = getLoggerInstance({
      timestampFn: () => timestamp,
    });

    log.info("test message");

    expect(mockIngest).toHaveBeenCalledWith("test-dataset", [
      expect.objectContaining({
        message: "test message",
        level: "info",
        timestamp: timestamp,
      }),
    ]);
  });

  it("should handle multiple string messages", () => {
    const { log } = getLoggerInstance();

    log.info("message 1", "message 2");

    expect(mockIngest).toHaveBeenCalledWith("test-dataset", [
      expect.objectContaining({
        message: "message 1 message 2",
      }),
    ]);
  });

  it("should include metadata in log entry", () => {
    const { log } = getLoggerInstance();

    const metadata = { userId: "123", requestId: "abc" };
    log.withMetadata(metadata).info("test message");

    expect(mockIngest).toHaveBeenCalledWith("test-dataset", [
      expect.objectContaining({
        message: "test message",
        userId: "123",
        requestId: "abc",
      }),
    ]);
  });

  it("should handle errors in ingest", () => {
    const onError = vi.fn();
    const { log } = getLoggerInstance({ onError });
    const error = new Error("Ingest failed");

    mockIngest.mockImplementationOnce(() => {
      throw error;
    });

    log.info("test message");

    expect(onError).toHaveBeenCalledWith(error);
  });

  it("should handle different log levels", () => {
    const { log } = getLoggerInstance();

    log.info("info message");
    log.warn("warn message");
    log.error("error message");
    log.debug("debug message");
    log.trace("trace message");

    expect(mockIngest).toHaveBeenCalledWith("test-dataset", [
      expect.objectContaining({
        message: "info message",
        level: "info",
      }),
    ]);

    expect(mockIngest).toHaveBeenCalledWith("test-dataset", [
      expect.objectContaining({
        message: "warn message",
        level: "warn",
      }),
    ]);

    expect(mockIngest).toHaveBeenCalledWith("test-dataset", [
      expect.objectContaining({
        message: "error message",
        level: "error",
      }),
    ]);

    expect(mockIngest).toHaveBeenCalledWith("test-dataset", [
      expect.objectContaining({
        message: "debug message",
        level: "debug",
      }),
    ]);

    expect(mockIngest).toHaveBeenCalledWith("test-dataset", [
      expect.objectContaining({
        message: "trace message",
        level: "trace",
      }),
    ]);
  });

  it("should filter logs based on minimum level", () => {
    const { log } = getLoggerInstance({ level: "warn" });

    log.trace("trace message");
    log.debug("debug message");
    log.info("info message");
    log.warn("warn message");
    log.error("error message");

    // These should be filtered out
    expect(mockIngest).not.toHaveBeenCalledWith("test-dataset", [
      expect.objectContaining({
        message: "trace message",
      }),
    ]);
    expect(mockIngest).not.toHaveBeenCalledWith("test-dataset", [
      expect.objectContaining({
        message: "debug message",
      }),
    ]);
    expect(mockIngest).not.toHaveBeenCalledWith("test-dataset", [
      expect.objectContaining({
        message: "info message",
      }),
    ]);

    // These should be included
    expect(mockIngest).toHaveBeenCalledWith("test-dataset", [
      expect.objectContaining({
        message: "warn message",
        level: "warn",
      }),
    ]);
    expect(mockIngest).toHaveBeenCalledWith("test-dataset", [
      expect.objectContaining({
        message: "error message",
        level: "error",
      }),
    ]);
  });

  it("should map log levels using levelMap with strings", () => {
    const { log } = getLoggerInstance({
      levelMap: {
        trace: "TRACE",
        debug: "DEBUG",
        info: "INFO",
        warn: "WARNING",
        error: "ERROR",
        fatal: "FATAL",
      },
    });

    log.info("info message");
    log.warn("warn message");
    log.error("error message");

    expect(mockIngest).toHaveBeenCalledWith("test-dataset", [
      expect.objectContaining({
        message: "info message",
        level: "INFO",
      }),
    ]);

    expect(mockIngest).toHaveBeenCalledWith("test-dataset", [
      expect.objectContaining({
        message: "warn message",
        level: "WARNING",
      }),
    ]);

    expect(mockIngest).toHaveBeenCalledWith("test-dataset", [
      expect.objectContaining({
        message: "error message",
        level: "ERROR",
      }),
    ]);
  });

  it("should map log levels using levelMap with numbers", () => {
    const { log } = getLoggerInstance({
      levelMap: {
        trace: 10,
        debug: 20,
        info: 30,
        warn: 40,
        error: 50,
        fatal: 60,
      },
    });

    log.info("info message");
    log.warn("warn message");
    log.error("error message");

    expect(mockIngest).toHaveBeenCalledWith("test-dataset", [
      expect.objectContaining({
        message: "info message",
        level: 30,
      }),
    ]);

    expect(mockIngest).toHaveBeenCalledWith("test-dataset", [
      expect.objectContaining({
        message: "warn message",
        level: 40,
      }),
    ]);

    expect(mockIngest).toHaveBeenCalledWith("test-dataset", [
      expect.objectContaining({
        message: "error message",
        level: 50,
      }),
    ]);
  });

  it("should use original level if not mapped", () => {
    const { log } = getLoggerInstance({
      levelMap: {
        error: "ERROR",
        warn: "WARNING",
      },
    });

    log.info("info message");
    log.warn("warn message");
    log.error("error message");

    expect(mockIngest).toHaveBeenCalledWith("test-dataset", [
      expect.objectContaining({
        message: "info message",
        level: "info", // Original level
      }),
    ]);

    expect(mockIngest).toHaveBeenCalledWith("test-dataset", [
      expect.objectContaining({
        message: "warn message",
        level: "WARNING", // Mapped level
      }),
    ]);

    expect(mockIngest).toHaveBeenCalledWith("test-dataset", [
      expect.objectContaining({
        message: "error message",
        level: "ERROR", // Mapped level
      }),
    ]);
  });

  it("should handle SIGINT signal", async () => {
    // Mock process.exit before creating transport
    const mockExit = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);

    const { transport } = getLoggerInstance();

    // Write a message
    transport.shipToLogger({
      logLevel: LogLevel.info,
      messages: ["Message before interrupt"],
      data: {},
      hasData: false,
    });

    // Simulate SIGINT signal (Ctrl+C)
    process.emit("SIGINT");

    // Verify flush was called
    expect(mockFlush).toHaveBeenCalled();
    expect(mockExit).toHaveBeenCalledWith(130); // SIGINT exit code

    mockExit.mockRestore();
  });
});
