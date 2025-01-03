import type { DataDogTransport } from "datadog-transport-common";
import { LogLayer } from "loglayer";
import { beforeEach, describe, expect, it, vitest } from "vitest";
import { createDataDogTransport } from "../DataDogTransport.js";

let log: LogLayer;
let ddTransport: DataDogTransport;
const mockISOString = "2024-01-01T00:00:00.000Z";

describe("structured transport with datadog", () => {
  beforeEach(() => {
    // Mock Date.prototype.toISOString
    vitest.spyOn(Date.prototype, "toISOString").mockReturnValue(mockISOString);

    log = new LogLayer({
      transport: createDataDogTransport({
        id: "datadog",
        options: {
          ddClientConf: {
            authMethods: {
              apiKeyAuth: "TEST-KEY",
            },
          },
          ddServerConf: {
            site: "datadoghq.eu",
          },
        },
      }),
    });

    ddTransport = log.getLoggerInstance("datadog");
    ddTransport.processLog = vitest.fn();
  });

  it("should log a message", () => {
    log.info("this is a test message");
    // @ts-ignore
    expect(ddTransport.processLog).toBeCalledWith({
      message: "this is a test message",
      level: "info",
      time: mockISOString,
    });
  });

  it("should log a message with a prefix", () => {
    log.withPrefix("[testing]").info("this is a test message");
    // @ts-ignore
    expect(ddTransport.processLog).toBeCalledWith({
      message: "[testing] this is a test message",
      level: "info",
      time: mockISOString,
    });
  });

  it("should include context", () => {
    log.withContext({
      sample: "data",
    });

    log.info("this is a test message");
    // @ts-ignore
    expect(ddTransport.processLog).toBeCalledWith({
      message: "this is a test message",
      level: "info",
      sample: "data",
      time: mockISOString,
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

    // @ts-ignore
    expect(ddTransport.processLog).toBeCalledWith({
      message: "this is a test message",
      level: "info",
      test: "context",
      meta: "data",
      time: mockISOString,
    });
  });

  it("should include an error", () => {
    log.withContext({
      test: "context",
    });

    log.withError(new Error("err")).info("this is a test message");

    // @ts-ignore
    expect(ddTransport.processLog).toBeCalledWith({
      message: "this is a test message",
      level: "info",
      test: "context",
      err: new Error("err"),
      time: mockISOString,
    });
  });

  it("should use custom field names", () => {
    log = new LogLayer({
      transport: createDataDogTransport({
        id: "datadog",
        options: {
          ddClientConf: {
            authMethods: {
              apiKeyAuth: "TEST-KEY",
            },
          },
          ddServerConf: {
            site: "datadoghq.eu",
          },
        },
        messageField: "msg",
        levelField: "severity",
      }),
    });

    ddTransport = log.getLoggerInstance("datadog");
    ddTransport.processLog = vitest.fn();

    log.info("this is a test message");

    // @ts-ignore
    expect(ddTransport.processLog).toBeCalledWith({
      msg: "this is a test message",
      severity: "info",
      time: expect.any(String),
    });
  });

  it("should use custom timestamp field and function", () => {
    const mockTimestamp = 1234567890;
    log = new LogLayer({
      transport: createDataDogTransport({
        id: "datadog",
        options: {
          ddClientConf: {
            authMethods: {
              apiKeyAuth: "TEST-KEY",
            },
          },
          ddServerConf: {
            site: "datadoghq.eu",
          },
        },
        timestampField: "timestamp",
        timestampFunction: () => mockTimestamp,
      }),
    });

    ddTransport = log.getLoggerInstance("datadog");
    ddTransport.processLog = vitest.fn();

    log.info("this is a test message");

    // @ts-ignore
    expect(ddTransport.processLog).toBeCalledWith({
      message: "this is a test message",
      level: "info",
      timestamp: mockTimestamp,
    });
  });
});
