import { LogLayer } from "loglayer";
import { serializeError } from "serialize-error";
import { describe, expect, it } from "vitest";
import { RoarrTransport } from "../RoarrTransport.js";

process.env.ROARR_LOG = "1";

const r = require("roarr");

function getLoggerInstance(onWrite) {
  r.ROARR.write = (message) => {
    onWrite(JSON.parse(message));
  };

  return new LogLayer({
    transport: new RoarrTransport({
      id: "roarr",
      logger: r.Roarr,
    }),
    errorSerializer: serializeError,
  });
}

describe("structured transport with roarr", () => {
  it("should log a message", () => {
    expect.assertions(1);
    const log = getLoggerInstance((message) => {
      expect(message.message).toBe("this is a test message");
    });

    log.info("this is a test message");
  });

  it("should log a message", () => {
    expect.assertions(1);
    const log = getLoggerInstance((message) => {
      expect(message.message).toBe("[testing] this is a test message");
    });

    log.withPrefix("[testing]").info("this is a test message");
  });

  it("should include context", () => {
    expect.assertions(2);

    const log = getLoggerInstance((message) => {
      expect(message.context.test).toBe("context");
      expect(message.message).toBe("this is a test message");
    });

    log.withContext({
      test: "context",
    });

    log.info("this is a test message");
  });

  it("should include metadata", () => {
    expect.assertions(2);

    const log = getLoggerInstance((message) => {
      expect(message.context.meta).toBe("data");
      expect(message.message).toBe("this is a test message");
    });

    log
      .withMetadata({
        meta: "data",
      })
      .info("this is a test message");
  });

  it("should include an error", () => {
    expect.assertions(2);

    const log = getLoggerInstance((message) => {
      expect(message.context.err.message).toBe("err");
      expect(message.message).toBe("this is a test message");
    });

    log.withError(new Error("err")).info("this is a test message");
  });
});
