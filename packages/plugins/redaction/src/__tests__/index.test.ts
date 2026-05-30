import { LogLayer, LogLevel, TestLoggingLibrary, TestTransport } from "loglayer";
import { describe, expect, it } from "vitest";
import { redactionPlugin } from "../index.js";

describe("redaction plugin", () => {
  it("should redact sensitive fields from metadata", () => {
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

  it("should redact sensitive fields from rootData", () => {
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

    log.raw({
      logLevel: LogLevel.info,
      messages: ["test"],
      rootData: { password: "123456", username: "alice" },
    });

    const line = logger.popLine();

    expect(line.data[0].password).toBe("[REDACTED]");
    expect(line.data[0].username).toBe("alice");
  });

  it("should redact sensitive fields from context", () => {
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

    log.withContext({ password: "secret" }).info("test");

    const line = logger.popLine();

    expect(line.data[0].password).toBe("[REDACTED]");
  });

  it("should not corrupt data when there is no data to redact", () => {
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

    log.info("plain message");

    const line = logger.popLine();
    // data[0] should not contain plugin params properties
    expect(line.data[0]).not.toHaveProperty("logLevel");
    expect(line.data[0]).not.toHaveProperty("metadata");
    expect(line.data[0]).not.toHaveProperty("context");
    expect(line.data[0]).not.toHaveProperty("schema");
  });
});
