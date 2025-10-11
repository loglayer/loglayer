import { LogLayer } from "loglayer";
import { describe, expect, it, vi } from "vitest";
import { LogTapeTransport } from "../LogTapeTransport.js";

function getLoggerInstance() {
  const mockLogger = {
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  };

  const log = new LogLayer({
    transport: new LogTapeTransport({
      id: "logtape",
      logger: mockLogger,
    }),
  });

  return {
    log,
    mockLogger,
  };
}

describe("LogTape transport", () => {
  it("should log a message", () => {
    const { log, mockLogger } = getLoggerInstance();

    log.info("this is a test message");

    expect(mockLogger.info).toHaveBeenCalledWith("this is a test message", undefined);
  });

  it("should log a message with a prefix", () => {
    const { log, mockLogger } = getLoggerInstance();

    log.withPrefix("[testing]").info("this is a test message");

    expect(mockLogger.info).toHaveBeenCalledWith("[testing] this is a test message", undefined);
  });

  it("should include context", () => {
    const { log, mockLogger } = getLoggerInstance();
    log.withContext({
      test: "context",
    });

    log.info("this is a test message");

    expect(mockLogger.info).toHaveBeenCalledWith("this is a test message", {
      test: "context",
    });
  });

  it("should include metadata", () => {
    const { log, mockLogger } = getLoggerInstance();
    log.withContext({
      test: "context",
    });

    log
      .withMetadata({
        meta: "data",
      })
      .info("this is a test message");

    expect(mockLogger.info).toHaveBeenCalledWith("this is a test message", {
      test: "context",
      meta: "data",
    });
  });

  it("should include an error", () => {
    const { log, mockLogger } = getLoggerInstance();
    log.withContext({
      test: "context",
    });

    const error = new Error("err");
    log.withError(error).info("this is a test message");

    expect(mockLogger.info).toHaveBeenCalledWith("this is a test message", {
      test: "context",
      err: error,
    });
  });

  it("should handle all log levels", () => {
    const { log, mockLogger } = getLoggerInstance();

    log.trace("trace message");
    log.debug("debug message");
    log.info("info message");
    log.warn("warn message");
    log.error("error message");
    log.fatal("fatal message");

    expect(mockLogger.trace).toHaveBeenCalledWith("trace message", undefined);
    expect(mockLogger.debug).toHaveBeenCalledWith("debug message", undefined);
    expect(mockLogger.info).toHaveBeenCalledWith("info message", undefined);
    expect(mockLogger.warn).toHaveBeenCalledWith("warn message", undefined);
    expect(mockLogger.error).toHaveBeenCalledWith("error message", undefined);
    expect(mockLogger.fatal).toHaveBeenCalledWith("fatal message", undefined);
  });

  it("should handle multiple messages", () => {
    const { log, mockLogger } = getLoggerInstance();

    log.info("message", "part", "two");

    expect(mockLogger.info).toHaveBeenCalledWith("message part two", undefined);
  });
});
