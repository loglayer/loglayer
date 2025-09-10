import { consola } from "consola";
import { LogLayer } from "loglayer";
import { beforeAll, beforeEach, describe, expect, it, vitest } from "vitest";
import { ConsolaTransport } from "../ConsolaTransport.js";

let log: LogLayer;

describe("structured transport with consola", () => {
  beforeAll(() => {
    // consola.wrapAll();

    log = new LogLayer({
      transport: [
        new ConsolaTransport({
          id: "consola",
          logger: consola,
        }),
      ],
    });
  });

  beforeEach(() => {
    // Re-mock consola before each test call to remove
    // calls from before
    consola.mockTypes(() => vitest.fn());
  });

  it("should log a message", () => {
    log.info("this is a test message");
    // @ts-expect-error
    const consolaMessages = consola.info.mock.calls.map((c) => c[0]);
    expect(consolaMessages).toContain("this is a test message");
  });

  it("should log a message with a prefix", () => {
    log.withPrefix("[testing]").info("this is a test message");
    // @ts-expect-error
    const consolaMessages = consola.info.mock.calls.map((c) => c[0]);
    expect(consolaMessages).toContain("[testing] this is a test message");
  });

  it("should include context", () => {
    log.withContext({
      sample: "data",
    });

    log.info("this is a test message");
    // @ts-expect-error
    const msg = consola.info.mock.calls[0][0];
    expect(msg).toContain("this is a test message");
    // @ts-expect-error
    const data = consola.info.mock.calls[0][1];
    expect(data).toMatchObject({
      sample: "data",
    });
  });

  it("should include metadata", () => {
    log.withContext({
      test: "context",
    });

    log
      .withMetadata({
        meta: "data",
      })
      .info("this is a test message");

    // @ts-expect-error
    const msg = consola.info.mock.calls[0][0];
    expect(msg).toContain("this is a test message");
    // @ts-expect-error
    const data = consola.info.mock.calls[0][1];
    expect(data).toMatchObject({
      sample: "data",
      test: "context",
    });
  });

  it("should include an error", () => {
    log.withContext({
      test: "context",
    });

    log.withError(new Error("err")).info("this is a test message");
    // @ts-expect-error
    const msg = consola.info.mock.calls[0][0];
    expect(msg).toContain("this is a test message");
    // @ts-expect-error
    const data = consola.info.mock.calls[0][1];
    expect(data).toMatchObject({
      test: "context",
    });
    expect(data.err).toBeDefined();
  });
});
