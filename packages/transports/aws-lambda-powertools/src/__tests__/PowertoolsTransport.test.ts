import { Logger } from "@aws-lambda-powertools/logger";
import { LogLayer } from "loglayer";
import { describe, expect, it, vi } from "vitest";
import { PowertoolsTransport } from "../PowertoolsTransport.js";

describe("PowertoolsTransport with LogLayer", () => {
  function getLoggerInstance() {
    const powertoolsLogger = new Logger({ serviceName: "test" });
    const log = new LogLayer({
      transport: [
        new PowertoolsTransport({
          logger: powertoolsLogger,
        }) as any,
      ],
    });

    return {
      log,
      powertoolsLogger,
    };
  }

  it("should log a message", () => {
    const { log, powertoolsLogger } = getLoggerInstance();
    const spyInfo = vi.spyOn(powertoolsLogger, "info");

    log.info("test message");
    expect(spyInfo).toHaveBeenCalledWith("test message");
  });

  it("should log a message with context", () => {
    const { log, powertoolsLogger } = getLoggerInstance();
    const spyInfo = vi.spyOn(powertoolsLogger, "info");

    log.withContext({ test: "context" }).info("test message");
    expect(spyInfo).toHaveBeenCalledWith("test message", { test: "context" });
  });

  it("should log a message with metadata", () => {
    const { log, powertoolsLogger } = getLoggerInstance();
    const spyInfo = vi.spyOn(powertoolsLogger, "info");

    log.withMetadata({ meta: "data" }).info("test message");
    expect(spyInfo).toHaveBeenCalledWith("test message", { meta: "data" });
  });

  it("should log an error", () => {
    const { log, powertoolsLogger } = getLoggerInstance();
    const spyError = vi.spyOn(powertoolsLogger, "error");
    const error = new Error("test error");

    log.withError(error).error("test message");
    expect(spyError).toHaveBeenCalledWith("test message", { err: error });
  });

  it("should log with different levels", () => {
    const { log, powertoolsLogger } = getLoggerInstance();
    const spyDebug = vi.spyOn(powertoolsLogger, "debug");
    const spyInfo = vi.spyOn(powertoolsLogger, "info");
    const spyWarn = vi.spyOn(powertoolsLogger, "warn");
    const spyError = vi.spyOn(powertoolsLogger, "error");

    log.debug("debug message");
    log.info("info message");
    log.warn("warn message");
    log.error("error message");

    expect(spyDebug).toHaveBeenCalledWith("debug message");
    expect(spyInfo).toHaveBeenCalledWith("info message");
    expect(spyWarn).toHaveBeenCalledWith("warn message");
    expect(spyError).toHaveBeenCalledWith("error message");
  });

  it("should get the underlying logger instance", () => {
    const powertoolsLogger = new Logger({ serviceName: "test" });
    const transport = new PowertoolsTransport({ logger: powertoolsLogger }) as any;
    transport.id = "powertools";

    const log = new LogLayer({
      transport: [transport],
    });

    const spyInfo = vi.spyOn(powertoolsLogger, "info");
    const logger = log.getLoggerInstance("powertools") as Logger;
    logger.info("direct message");

    expect(spyInfo).toHaveBeenCalledWith("direct message");
  });
});
