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
});
