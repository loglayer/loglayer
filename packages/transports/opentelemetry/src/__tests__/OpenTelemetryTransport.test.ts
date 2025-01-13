// This code is adapted from:
// https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/packages/winston-transport/test/openTelemetryTransport.test.ts
// Which is Copyright The OpenTelemetry Authors and licensed under the Apache License, Version 2.0.

import assert from "node:assert";
import { LogLevel } from "@loglayer/transport";
import { logs } from "@opentelemetry/api-logs";
import { InMemoryLogRecordExporter, LoggerProvider, SimpleLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { beforeEach, describe, expect, it } from "vitest";
import { OpenTelemetryTransport } from "../OpenTelemetryTransport.js";

const loggerProvider = new LoggerProvider();
const memoryLogExporter = new InMemoryLogRecordExporter();
loggerProvider.addLogRecordProcessor(new SimpleLogRecordProcessor(memoryLogExporter));
logs.setGlobalLoggerProvider(loggerProvider);

const kMessage = "log-message";

describe("OpenTelemetryTransport", () => {
  beforeEach(() => {
    memoryLogExporter.getFinishedLogRecords().length = 0;
  });

  it("emit LogRecord", () => {
    const transport = new OpenTelemetryTransport();
    transport.shipToLogger({ messages: [kMessage], logLevel: LogLevel.info });
    const logRecords = memoryLogExporter.getFinishedLogRecords();
    assert.strictEqual(logRecords.length, 1);
    assert.strictEqual(kMessage, logRecords[0].body, kMessage);
  });

  it("should emit LogRecord with extra attributes", () => {
    const transport = new OpenTelemetryTransport();
    const extraAttributes = {
      extraAttribute1: "attributeValue1",
      extraAttribute2: "attributeValue2",
    };
    const parameters = { messages: [kMessage], data: extraAttributes, hasData: true, logLevel: LogLevel.info };

    transport.shipToLogger(parameters);

    const logRecords = memoryLogExporter.getFinishedLogRecords();
    expect(logRecords).toHaveLength(1);
    expect(logRecords[0].body).toBe(kMessage);
    expect(logRecords[0].attributes["extraAttribute1"]).toBe("attributeValue1");
    expect(logRecords[0].attributes["extraAttribute2"]).toBe("attributeValue2");
  });

  it("should handle log levels", () => {
    const transport = new OpenTelemetryTransport();
    const levels = [LogLevel.debug, LogLevel.info, LogLevel.warn, LogLevel.error];

    for (const level of levels) {
      transport.shipToLogger({ messages: [kMessage], logLevel: level });
    }

    const logRecords = memoryLogExporter.getFinishedLogRecords();
    expect(logRecords).toHaveLength(4);
  });

  it("should filter logs based on minimum level", () => {
    const transport = new OpenTelemetryTransport({ level: LogLevel.warn });

    // These should be filtered out
    transport.shipToLogger({ messages: ["trace"], logLevel: LogLevel.trace });
    transport.shipToLogger({ messages: ["debug"], logLevel: LogLevel.debug });
    transport.shipToLogger({ messages: ["info"], logLevel: LogLevel.info });

    // These should pass through
    transport.shipToLogger({ messages: ["warn"], logLevel: LogLevel.warn });
    transport.shipToLogger({ messages: ["error"], logLevel: LogLevel.error });
    transport.shipToLogger({ messages: ["fatal"], logLevel: LogLevel.fatal });

    const logRecords = memoryLogExporter.getFinishedLogRecords();
    expect(logRecords).toHaveLength(3);
    expect(logRecords[0].body).toBe("warn");
    expect(logRecords[1].body).toBe("error");
    expect(logRecords[2].body).toBe("fatal");
  });

  it("should allow all logs when no level is specified", () => {
    const transport = new OpenTelemetryTransport();

    // All levels should pass through
    transport.shipToLogger({ messages: ["trace"], logLevel: LogLevel.trace });
    transport.shipToLogger({ messages: ["debug"], logLevel: LogLevel.debug });
    transport.shipToLogger({ messages: ["info"], logLevel: LogLevel.info });
    transport.shipToLogger({ messages: ["warn"], logLevel: LogLevel.warn });
    transport.shipToLogger({ messages: ["error"], logLevel: LogLevel.error });
    transport.shipToLogger({ messages: ["fatal"], logLevel: LogLevel.fatal });

    const logRecords = memoryLogExporter.getFinishedLogRecords();
    console.log(
      "Log records:",
      logRecords.map((r) => ({ body: r.body, severity: r.severityNumber })),
    );
    expect(logRecords).toHaveLength(6);
  });

  it("should filter logs correctly with info level", () => {
    const transport = new OpenTelemetryTransport({ level: LogLevel.info });

    // These should be filtered out
    transport.shipToLogger({ messages: ["trace"], logLevel: LogLevel.trace });
    transport.shipToLogger({ messages: ["debug"], logLevel: LogLevel.debug });

    // These should pass through
    transport.shipToLogger({ messages: ["info"], logLevel: LogLevel.info });
    transport.shipToLogger({ messages: ["warn"], logLevel: LogLevel.warn });
    transport.shipToLogger({ messages: ["error"], logLevel: LogLevel.error });
    transport.shipToLogger({ messages: ["fatal"], logLevel: LogLevel.fatal });

    const logRecords = memoryLogExporter.getFinishedLogRecords();
    expect(logRecords).toHaveLength(4);
  });
});
