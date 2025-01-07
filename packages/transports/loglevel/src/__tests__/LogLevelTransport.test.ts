import { LogLayer } from "loglayer";
import log from "loglevel";
import { describe, expect, it, vitest } from "vitest";
import { LogLevelTransport } from "../LogLevelTransport.js";

function getLoggerInstance(appendObjectData?: boolean) {
  const logger = log.getLogger("test");

  // Mock all log methods
  logger.info = vitest.fn();
  logger.warn = vitest.fn();
  logger.error = vitest.fn();
  logger.debug = vitest.fn();
  logger.trace = vitest.fn();

  const loglayer = new LogLayer({
    transport: new LogLevelTransport({
      id: "loglevel",
      logger,
      appendObjectData,
    }),
  });

  return {
    loglayer,
    logLevelInstance: logger,
  };
}

describe("structured transport with loglevel", () => {
  it("should log a message", () => {
    const { loglayer, logLevelInstance } = getLoggerInstance();
    loglayer.info("this is a test message");

    expect(logLevelInstance.info).toHaveBeenCalledWith("this is a test message");
  });

  it("should log a message with prefix", () => {
    const { loglayer, logLevelInstance } = getLoggerInstance();

    loglayer.withPrefix("[testing]").info("this is a test message");

    expect(logLevelInstance.info).toHaveBeenCalledWith("[testing] this is a test message");
  });

  it("should include context with default appendObjectData (false)", () => {
    const { loglayer, logLevelInstance } = getLoggerInstance();

    loglayer
      .withContext({
        test: "context",
      })
      .info("this is a test message");

    expect(logLevelInstance.info).toHaveBeenCalledWith({ test: "context" }, "this is a test message");
  });

  it("should include context with appendObjectData=true", () => {
    const { loglayer, logLevelInstance } = getLoggerInstance(true);

    loglayer
      .withContext({
        test: "context",
      })
      .info("this is a test message");

    expect(logLevelInstance.info).toHaveBeenCalledWith("this is a test message", { test: "context" });
  });

  it("should include metadata with default appendObjectData (false)", () => {
    const { loglayer, logLevelInstance } = getLoggerInstance();

    loglayer
      .withMetadata({
        meta: "data",
      })
      .info("this is a test message");

    expect(logLevelInstance.info).toHaveBeenCalledWith({ meta: "data" }, "this is a test message");
  });

  it("should include metadata with appendObjectData=true", () => {
    const { loglayer, logLevelInstance } = getLoggerInstance(true);

    loglayer
      .withMetadata({
        meta: "data",
      })
      .info("this is a test message");

    expect(logLevelInstance.info).toHaveBeenCalledWith("this is a test message", { meta: "data" });
  });

  it("should include an error with default appendObjectData (false)", () => {
    const { loglayer, logLevelInstance } = getLoggerInstance();
    const error = new Error("err");

    loglayer.withError(error).info("this is a test message");

    expect(logLevelInstance.info).toHaveBeenCalledWith({ err: error }, "this is a test message");
  });

  it("should include an error with appendObjectData=true", () => {
    const { loglayer, logLevelInstance } = getLoggerInstance(true);
    const error = new Error("err");

    loglayer.withError(error).info("this is a test message");

    expect(logLevelInstance.info).toHaveBeenCalledWith("this is a test message", { err: error });
  });

  it("should handle fatal level by using error", () => {
    const { loglayer, logLevelInstance } = getLoggerInstance();
    loglayer.fatal("this is a fatal message");

    expect(logLevelInstance.error).toHaveBeenCalledWith("this is a fatal message");
  });
});
