import { LogLayer } from "loglayer";
import { type ILogObj, Logger } from "tslog";
import { describe, expect, it, vitest } from "vitest";
import { TsLogTransport } from "../TsLogTransport.js";

function getLoggerInstance() {
  const tslog: Logger<ILogObj> = new Logger();

  tslog.info = vitest.fn();

  const loglayer = new LogLayer({
    transport: new TsLogTransport({
      logger: tslog,
    }),
  });

  return {
    loglayer,
    tsLogInstance: tslog,
  };
}

describe("structured transport with tracer", () => {
  it("should log a message", () => {
    const { loglayer, tsLogInstance } = getLoggerInstance();
    loglayer.info("this is a test message");

    expect(tsLogInstance.info).toHaveBeenCalledWith("this is a test message");
  });

  it("should log a message with prefix", () => {
    const { loglayer, tsLogInstance } = getLoggerInstance();

    loglayer.withPrefix("[testing]").info("this is a test message");

    expect(tsLogInstance.info).toHaveBeenCalledWith("[testing] this is a test message");
  });

  it("should include context", () => {
    const { loglayer, tsLogInstance } = getLoggerInstance();

    loglayer
      .withContext({
        test: "context",
      })
      .info("this is a test message");

    expect(tsLogInstance.info).toHaveBeenCalledWith("this is a test message", { test: "context" });
  });

  it("should include metadata", () => {
    const { loglayer, tsLogInstance } = getLoggerInstance();

    loglayer
      .withMetadata({
        meta: "data",
      })
      .info("this is a test message");

    expect(tsLogInstance.info).toHaveBeenCalledWith("this is a test message", { meta: "data" });
  });

  it("should include an error", () => {
    const { loglayer, tsLogInstance } = getLoggerInstance();
    const error = new Error("err");

    loglayer.withError(error).info("this is a test message");

    expect(tsLogInstance.info).toHaveBeenCalledWith("this is a test message", { err: error });
  });
});
