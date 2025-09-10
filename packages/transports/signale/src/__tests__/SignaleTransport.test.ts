import { PassThrough } from "node:stream";
import { LogLayer } from "loglayer";
import { Signale } from "signale";
import { describe, expect, it } from "vitest";
import { SignaleTransport } from "../SignaleTransport.js";

function getLoggerInstance() {
  const mockedStream = new PassThrough();

  const logInstance = new Signale({
    // @ts-expect-error
    stream: mockedStream,
    config: {
      displayBadge: false,
      displayLabel: false,
    },
  });

  const log = new LogLayer({
    transport: new SignaleTransport({
      id: "signale",
      logger: logInstance,
    }),
  });

  return {
    log,
    mockedStream,
  };
}

describe("structured transport with signale", () => {
  it("should log a message", () => {
    expect.assertions(1);
    const { log, mockedStream } = getLoggerInstance();

    mockedStream.on("data", (data: Buffer) => {
      expect(data.toString()).toEqual("this is a test message\n");
      mockedStream.destroy();
    });

    log.info("this is a test message");
  });

  it("should log a message with a prefix", () => {
    expect.assertions(1);
    const { log, mockedStream } = getLoggerInstance();

    mockedStream.on("data", (data: Buffer) => {
      expect(data.toString()).toBe("[testing] this is a test message\n");
      mockedStream.destroy();
    });

    log.withPrefix("[testing]").info("this is a test message");
  });

  it("should include context", () => {
    expect.assertions(1);
    const { log, mockedStream } = getLoggerInstance();
    log.withContext({
      test: "context",
    });

    mockedStream.on("data", (data: Buffer) => {
      expect(data.toString()).toBe(`this is a test message { test: 'context' }\n`);
      mockedStream.destroy();
    });

    log.info("this is a test message");
  });

  it("should include metadata", () => {
    expect.assertions(1);
    const { log, mockedStream } = getLoggerInstance();
    log.withContext({
      test: "context",
    });

    mockedStream.on("data", (data: Buffer) => {
      expect(data.toString()).toBe(`this is a test message { test: 'context', meta: 'data' }\n`);
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
      const msg = data.toString();
      expect(msg).toContain("this is a test message");
      expect(msg).toContain("err: Error: err");
      mockedStream.destroy();
    });

    log.withError(new Error("err")).info("this is a test message");
  });
});
