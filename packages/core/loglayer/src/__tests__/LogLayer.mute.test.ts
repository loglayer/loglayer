import { LogLevel } from "@loglayer/shared";
import { describe, expect, it } from "vitest";
import { LogLayer } from "../LogLayer.js";
import { TestLoggingLibrary } from "../TestLoggingLibrary.js";
import { ConsoleTransport } from "../transports/ConsoleTransport.js";
import type { LogLayerConfig } from "../types/index.js";

function getLogger(config?: Partial<LogLayerConfig>) {
  const genericLogger = new TestLoggingLibrary();

  return new LogLayer({
    transport: new ConsoleTransport({
      id: "console",
      // @ts-expect-error
      logger: genericLogger,
    }),
    ...(config || {}),
  });
}

describe("LogLayer mute/unmute functionality", () => {
  it("should mute and unmute context", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const context = { ctx: "data" };

    log.muteContext();
    log.withContext(context).info("test");

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["test"],
      }),
    );

    log.unMuteContext().info("test");

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [context, "test"],
      }),
    );
  });

  it("should mute context but still add metadata", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const metadata = { test: "abcd" };

    log.muteContext();
    log.withContext({ ctx: "data" }).withMetadata(metadata).info("test");

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [metadata, "test"],
      }),
    );
  });

  it("should mute and unmute metadata", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    const metadata = { test: "abcd" };
    log.muteMetadata();
    log.withMetadata(metadata).info("test");

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["test"],
      }),
    );

    log.unMuteMetadata();
    log.withMetadata(metadata).info("test");

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [metadata, "test"],
      }),
    );
  });

  it("should mute both context and metadata", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const metadata = { test: "abcd" };
    const context = { ctx: "data" };

    log.muteMetadata();
    log.muteContext();

    log.withContext(context).withMetadata(metadata).info("test");

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["test"],
      }),
    );
  });
});
