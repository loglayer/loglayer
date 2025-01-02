import { PassThrough } from "node:stream";
import bunyan from "bunyan";
import { LogLayer } from "loglayer";
import { describe, expect, it } from "vitest";
import { BunyanTransport } from "../BunyanTransport.js";

function getLoggerInstance() {
  const mockedStream = new PassThrough();
  const b = bunyan.createLogger({
    name: "test-transport",
    level: "trace",
    stream: mockedStream,
    serializers: { err: bunyan.stdSerializers.err },
  });

  const log = new LogLayer({
    transport: [
      new BunyanTransport({
        id: "bunyan",
        logger: b,
      }),
    ],
  });

  return {
    log,
    mockedStream,
  };
}

describe("structured transport with bunyan", () => {
  it("should log a message", () => {
    expect.assertions(1);
    const { log, mockedStream } = getLoggerInstance();

    mockedStream.on("data", (data: Buffer) => {
      const entry = JSON.parse(data.toString()) as unknown as Record<string, any>;
      expect(entry.msg).toBe("this is a test message");
      mockedStream.destroy();
    });

    log.info("this is a test message");
  });

  it("should log a message with a prefix", () => {
    expect.assertions(1);
    const { log, mockedStream } = getLoggerInstance();

    mockedStream.on("data", (data: Buffer) => {
      const entry = JSON.parse(data.toString()) as unknown as Record<string, any>;
      expect(entry.msg).toBe("[testing] this is a test message");
      mockedStream.destroy();
    });

    log.withPrefix("[testing]").info("this is a test message");
  });

  it("should include context", () => {
    expect.assertions(2);
    const { log, mockedStream } = getLoggerInstance();
    log.withContext({
      test: "context",
    });

    mockedStream.on("data", (data: Buffer) => {
      const entry = JSON.parse(data.toString()) as unknown as Record<string, any>;
      expect(entry.test).toBe("context");
      expect(entry.msg).toBe("this is a test message");
      mockedStream.destroy();
    });

    log.warn("this is a test message");
  });

  it("should include metadata", () => {
    expect.assertions(2);
    const { log, mockedStream } = getLoggerInstance();
    log.withContext({
      test: "context",
    });

    mockedStream.on("data", (data: Buffer) => {
      const entry = JSON.parse(data.toString()) as unknown as Record<string, any>;
      expect(entry.meta).toBe("data");
      expect(entry.msg).toBe("this is a test message");
      mockedStream.destroy();
    });

    log
      .withMetadata({
        meta: "data",
      })
      .error("this is a test message");
  });

  it("should include an error", () => {
    expect.assertions(2);
    const { log, mockedStream } = getLoggerInstance();
    log.withContext({
      test: "context",
    });

    mockedStream.on("data", (data: Buffer) => {
      const entry = JSON.parse(data.toString()) as unknown as Record<string, any>;
      expect(entry.err.message).toBe("err");
      expect(entry.msg).toBe("this is a test message");
      mockedStream.destroy();
    });

    log.withError(new Error("err")).error("this is a test message");
  });

  it("should get the underlying transport", () => {
    expect.assertions(1);
    const { log, mockedStream } = getLoggerInstance();

    const bunyanInstance = log.getLoggerInstance("bunyan") as bunyan;

    mockedStream.on("data", (data: Buffer) => {
      const entry = JSON.parse(data.toString()) as unknown as Record<string, any>;
      expect(entry.msg).toBe("this is a test message");
      mockedStream.destroy();
    });

    bunyanInstance.info("this is a test message");
  });

  it("should log only an error", () => {
    expect.assertions(1);
    const { log, mockedStream } = getLoggerInstance();

    mockedStream.on("data", (data: Buffer) => {
      const entry = JSON.parse(data.toString()) as unknown as Record<string, any>;
      expect(entry.err.message).toBe("test error");
      mockedStream.destroy();
    });

    log.errorOnly(new Error("test error"));
  });

  it("should log only metadata", () => {
    expect.assertions(2);
    const { log, mockedStream } = getLoggerInstance();

    mockedStream.on("data", (data: Buffer) => {
      const entry = JSON.parse(data.toString()) as unknown as Record<string, any>;
      expect(entry.test).toBe("data");
      expect(entry.msg).toBe("");
      mockedStream.destroy();
    });

    log.metadataOnly({ test: "data" });
  });
});
