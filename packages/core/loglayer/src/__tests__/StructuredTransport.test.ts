import { LogLevel } from "@loglayer/shared";
import { describe, expect, it } from "vitest";
import { LogLayer } from "../LogLayer.js";
import { TestLoggingLibrary } from "../TestLoggingLibrary.js";
import { StructuredTransport } from "../transports/StructuredTransport.js";

function getLogger(transportConfig?: Record<string, any>) {
  const genericLogger = new TestLoggingLibrary();

  return {
    log: new LogLayer({
      transport: new StructuredTransport({
        id: "structured",
        // @ts-expect-error
        logger: genericLogger,
        ...transportConfig,
      }),
    }),
    genericLogger,
  };
}

describe("StructuredTransport", () => {
  it("should output structured log objects with default fields (msg, level, time)", () => {
    const { log, genericLogger } = getLogger();
    log.info("hello world");

    const line = genericLogger.popLine();
    expect(line).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
      }),
    );
    const obj = line!.data[0];
    expect(obj.msg).toBe("hello world");
    expect(obj.level).toBe("info");
    expect(obj.time).toBeDefined();
  });

  it("should join multiple message parameters with a space", () => {
    const { log, genericLogger } = getLogger();
    log.info("hello", "world");

    const obj = genericLogger.popLine()!.data[0];
    expect(obj.msg).toBe("hello world");
  });

  it("should include metadata in the structured output", () => {
    const { log, genericLogger } = getLogger();
    log.withMetadata({ requestId: "abc123" }).info("request received");

    const obj = genericLogger.popLine()!.data[0];
    expect(obj.msg).toBe("request received");
    expect(obj.requestId).toBe("abc123");
    expect(obj.level).toBe("info");
  });

  it("should include context in the structured output", () => {
    const { log, genericLogger } = getLogger();
    log.withContext({ service: "api" });
    log.info("started");

    const obj = genericLogger.popLine()!.data[0];
    expect(obj.msg).toBe("started");
    expect(obj.service).toBe("api");
  });

  it("should allow custom field names", () => {
    const { log, genericLogger } = getLogger({
      messageField: "message",
      levelField: "severity",
      dateField: "timestamp",
    });
    log.info("test");

    const obj = genericLogger.popLine()!.data[0];
    expect(obj.message).toBe("test");
    expect(obj.severity).toBe("info");
    expect(obj.timestamp).toBeDefined();
    // Default fields should not be present
    expect(obj.msg).toBeUndefined();
    expect(obj.time).toBeUndefined();
  });

  it("should support custom dateFn", () => {
    const { log, genericLogger } = getLogger({
      dateFn: () => 1234567890,
    });
    log.info("test");

    const obj = genericLogger.popLine()!.data[0];
    expect(obj.time).toBe(1234567890);
  });

  it("should support custom levelFn", () => {
    const { log, genericLogger } = getLogger({
      levelFn: (level: string) => level.toUpperCase(),
    });
    log.info("test");

    const obj = genericLogger.popLine()!.data[0];
    expect(obj.level).toBe("INFO");
  });

  it("should stringify output when stringify is true", () => {
    const { log, genericLogger } = getLogger({
      stringify: true,
      dateFn: () => "fixed-time",
    });
    log.info("test");

    const line = genericLogger.popLine()!.data[0];
    expect(typeof line).toBe("string");
    const parsed = JSON.parse(line);
    expect(parsed.msg).toBe("test");
    expect(parsed.level).toBe("info");
    expect(parsed.time).toBe("fixed-time");
  });

  it("should respect log level filtering", () => {
    const { log, genericLogger } = getLogger({ level: "warn" });
    log.info("should be filtered");
    expect(genericLogger.popLine()).toBeUndefined();

    log.warn("should pass");
    const obj = genericLogger.popLine()!.data[0];
    expect(obj.msg).toBe("should pass");
  });

  it("should route to correct console methods", () => {
    const { log, genericLogger } = getLogger();
    const levels = ["info", "warn", "error", "debug", "trace"] as const;

    for (const level of levels) {
      log[level](`${level} message`);
      const line = genericLogger.popLine();
      expect(line!.level).toBe(level);
      expect(line!.data[0].msg).toBe(`${level} message`);
    }
  });

  it("should route fatal to error method", () => {
    const { log, genericLogger } = getLogger();
    log.fatal("fatal message");

    const line = genericLogger.popLine();
    // fatal routes to console.error, so TestLoggingLibrary records it as "error"
    expect(line!.level).toBe("error");
    expect(line!.data[0].msg).toBe("fatal message");
    expect(line!.data[0].level).toBe("fatal");
  });

  it("should support messageFn for custom message formatting", () => {
    const { log, genericLogger } = getLogger({
      messageFn: (params: any) => `[custom] ${params.messages.join(" ")}`,
    });
    log.info("hello", "world");

    const obj = genericLogger.popLine()!.data[0];
    expect(obj.msg).toBe("[custom] hello world");
  });
});
