import { LogLayer, TestLoggingLibrary, TestTransport } from "loglayer";
import { describe, expect, it } from "vitest";
import { sprintfPlugin } from "../index.js";

describe("sprintf plugin", () => {
  it("should format messages using sprintf", () => {
    const logger = new TestLoggingLibrary();

    const log = new LogLayer({
      transport: new TestTransport({
        logger,
      }),
      plugins: [
        sprintfPlugin({
          id: "sprintf",
        }),
      ],
    });

    log.info("Hello %s!", "world");
    let line = logger.popLine();
    expect(line.data[0]).toBe("Hello world!");

    log.info("Number: %d", 42);
    line = logger.popLine();
    expect(line.data[0]).toBe("Number: 42");

    const obj = { foo: "bar" };
    log.info("Object: %s", JSON.stringify(obj));
    line = logger.popLine();
    expect(line.data[0]).toBe('Object: {"foo":"bar"}');
  });

  it("should handle non-string format parameter", () => {
    const logger = new TestLoggingLibrary();

    const log = new LogLayer({
      transport: new TestTransport({
        logger,
      }),
      plugins: [
        sprintfPlugin({
          id: "sprintf",
        }),
      ],
    });

    log.info(42, "arg");
    const line = logger.popLine();
    expect(line.data).toEqual([42, "arg"]);
  });

  it("should handle single argument", () => {
    const logger = new TestLoggingLibrary();

    const log = new LogLayer({
      transport: new TestTransport({
        logger,
      }),
      plugins: [
        sprintfPlugin({
          id: "sprintf",
        }),
      ],
    });

    log.info("single message");
    const line = logger.popLine();
    expect(line.data[0]).toBe("single message");
  });

  it("should handle missing arguments by using undefined", () => {
    const logger = new TestLoggingLibrary();

    const log = new LogLayer({
      transport: new TestTransport({
        logger,
      }),
      plugins: [
        sprintfPlugin({
          id: "sprintf",
        }),
      ],
    });

    log.info("%d%s", 42); // Missing argument for %s
    const line = logger.popLine();
    expect(line.data[0]).toBe("42undefined");
  });
});
