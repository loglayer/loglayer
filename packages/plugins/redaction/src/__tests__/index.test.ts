import { LogLayer, TestLoggingLibrary, TestTransport } from "loglayer";
import { describe, expect, it } from "vitest";
import { redactionPlugin } from "../index.js";

describe("redaction plugin", () => {
  it("should redact metadata", () => {
    const logger = new TestLoggingLibrary();

    const log = new LogLayer({
      transport: new TestTransport({
        logger,
      }),
      plugins: [
        redactionPlugin({
          id: "redaction",
          paths: ["password"],
        }),
      ],
    });

    log.metadataOnly({
      password: "123456",
    });

    const line = logger.popLine();

    expect(line.data[0].password).toBe("[REDACTED]");
  });
});
