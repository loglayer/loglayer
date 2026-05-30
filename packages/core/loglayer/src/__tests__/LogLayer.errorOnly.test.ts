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

describe("errorOnly", () => {
  it("should log only an error", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const e = new Error("err");
    log.errorOnly(e);

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.error,
        data: [
          {
            err: e,
          },
        ],
      }),
    );
  });

  it("should copy the error message as the log message", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const e = new Error("error message");

    log.errorOnly(e, {
      logLevel: LogLevel.info,
      copyMsg: true,
    });

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [
          {
            err: e,
          },
          "error message",
        ],
      }),
    );
  });
});
