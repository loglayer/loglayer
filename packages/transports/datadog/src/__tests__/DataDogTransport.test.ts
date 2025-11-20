import type { DataDogTransport as DatadogTransportCommon } from "datadog-transport-common";
import { LogLayer, LogLevel } from "loglayer";
import { beforeEach, describe, expect, it, vitest } from "vitest";
import { DataDogTransport } from "../DataDogTransport.js";

let log: LogLayer;
let ddTransport: DatadogTransportCommon;
const mockISOString = "2024-01-01T00:00:00.000Z";

describe("structured transport with datadog", () => {
  beforeEach(() => {
    // Mock Date.prototype.toISOString
    vitest.spyOn(Date.prototype, "toISOString").mockReturnValue(mockISOString);
    const transport = new DataDogTransport({
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
    });

    log = new LogLayer({
      transport,
    });

    ddTransport = transport["transport"];
    ddTransport.processLog = vitest.fn();
  });

  it("should log a message", () => {
    log.info("this is a test message");
    expect(ddTransport.processLog).toBeCalledWith({
      message: "this is a test message",
      level: "info",
      time: mockISOString,
    });
  });

  it("should log a message with a prefix", () => {
    log.withPrefix("[testing]").info("this is a test message");
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

    expect(ddTransport.processLog).toBeCalledWith({
      message: "this is a test message",
      level: "info",
      test: "context",
      err: new Error("err"),
      time: mockISOString,
    });
  });

  it("should use custom field names", () => {
    const transport = new DataDogTransport({
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
    });

    log = new LogLayer({ transport });

    ddTransport = transport["transport"];
    ddTransport.processLog = vitest.fn();

    log.info("this is a test message");

    expect(ddTransport.processLog).toBeCalledWith({
      msg: "this is a test message",
      severity: "info",
      time: mockISOString,
    });
  });

  it("should use custom timestamp field and function", () => {
    const mockTimestamp = 1234567890;
    const transport = new DataDogTransport({
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
    });

    log = new LogLayer({ transport });

    ddTransport = (transport as any)["transport"];
    ddTransport.processLog = vitest.fn();

    log.info("this is a test message");

    expect(ddTransport.processLog).toBeCalledWith({
      message: "this is a test message",
      level: "info",
      timestamp: mockTimestamp,
    });
  });

  describe("level filtering", () => {
    it("should filter out logs below the configured level", () => {
      const transport = new DataDogTransport({
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
        level: LogLevel.warn,
      });

      log = new LogLayer({ transport });
      ddTransport = transport["transport"];
      ddTransport.processLog = vitest.fn();

      // These should be filtered out
      log.trace("trace message");
      log.debug("debug message");
      log.info("info message");

      expect(ddTransport.processLog).not.toHaveBeenCalled();

      // These should pass through
      log.warn("warn message");
      log.error("error message");
      log.fatal("fatal message");

      expect(ddTransport.processLog).toHaveBeenCalledTimes(3);
    });

    it("should send all logs when level is set to trace", () => {
      const transport = new DataDogTransport({
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
        level: LogLevel.trace,
      });

      log = new LogLayer({ transport });
      ddTransport = transport["transport"];
      ddTransport.processLog = vitest.fn();

      log.trace("trace message");
      log.debug("debug message");
      log.info("info message");
      log.warn("warn message");
      log.error("error message");
      log.fatal("fatal message");

      expect(ddTransport.processLog).toHaveBeenCalledTimes(6);
    });

    it("should send all logs when no level is configured", () => {
      const transport = new DataDogTransport({
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
      });

      log = new LogLayer({ transport });
      ddTransport = transport["transport"];
      ddTransport.processLog = vitest.fn();

      log.trace("trace message");
      log.debug("debug message");
      log.info("info message");
      log.warn("warn message");
      log.error("error message");
      log.fatal("fatal message");

      expect(ddTransport.processLog).toHaveBeenCalledTimes(6);
    });

    it("should filter correctly at error level", () => {
      const transport = new DataDogTransport({
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
        level: LogLevel.error,
      });

      log = new LogLayer({ transport });
      ddTransport = transport["transport"];
      ddTransport.processLog = vitest.fn();

      // These should be filtered out
      log.trace("trace message");
      log.debug("debug message");
      log.info("info message");
      log.warn("warn message");

      expect(ddTransport.processLog).not.toHaveBeenCalled();

      // These should pass through
      log.error("error message");
      log.fatal("fatal message");

      expect(ddTransport.processLog).toHaveBeenCalledTimes(2);
      expect(ddTransport.processLog).toHaveBeenNthCalledWith(1, {
        message: "error message",
        level: "error",
        time: mockISOString,
      });
      expect(ddTransport.processLog).toHaveBeenNthCalledWith(2, {
        message: "fatal message",
        level: "fatal",
        time: mockISOString,
      });
    });
  });
});
