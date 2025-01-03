import { LogLayer } from "loglayer";
import tracer from "tracer";
import { describe, expect, it, vitest } from "vitest";
import { TracerTransport } from "../TracerTransport.js";

function getLoggerInstance() {
  const t = tracer.console();

  t.info = vitest.fn();

  const loglayer = new LogLayer({
    transport: new TracerTransport({
      id: "tracer",
      logger: t,
    }),
  });

  return {
    loglayer,
    tracerInstance: t,
  };
}

describe("structured transport with tracer", () => {
  it("should log a message", () => {
    const { loglayer, tracerInstance } = getLoggerInstance();
    loglayer.info("this is a test message");

    expect(tracerInstance.info).toHaveBeenCalledWith("this is a test message");
  });

  it("should log a message with prefix", () => {
    const { loglayer, tracerInstance } = getLoggerInstance();

    loglayer.withPrefix("[testing]").info("this is a test message");

    expect(tracerInstance.info).toHaveBeenCalledWith("[testing] this is a test message");
  });

  it("should include context", () => {
    const { loglayer, tracerInstance } = getLoggerInstance();

    loglayer
      .withContext({
        test: "context",
      })
      .info("this is a test message");

    expect(tracerInstance.info).toHaveBeenCalledWith("this is a test message", { test: "context" });
  });

  it("should include metadata", () => {
    const { loglayer, tracerInstance } = getLoggerInstance();

    loglayer
      .withMetadata({
        meta: "data",
      })
      .info("this is a test message");

    expect(tracerInstance.info).toHaveBeenCalledWith("this is a test message", { meta: "data" });
  });

  it("should include an error", () => {
    const { loglayer, tracerInstance } = getLoggerInstance();
    const error = new Error("err");

    loglayer.withError(error).info("this is a test message");

    expect(tracerInstance.info).toHaveBeenCalledWith("this is a test message", { err: error });
  });
});
