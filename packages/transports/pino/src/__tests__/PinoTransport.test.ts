import { PassThrough } from "node:stream";
import { LogLayer } from "loglayer";
import { pino } from "pino";
import { describe, expect, it } from "vitest";
import { PinoTransport } from "../PinoTransport.js";

function getLoggerInstance() {
  const mockedStream = new PassThrough();
  const p = pino(mockedStream);
  const log = new LogLayer({
    transport: new PinoTransport({
      id: "pino",
      logger: p,
    }),
  });

  return {
    log,
    mockedStream,
  };
}

describe("structured transport with pino", () => {
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

    log.info("this is a test message");
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
      .info("this is a test message");
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

    log.withError(new Error("err")).info("this is a test message");
  });
});
