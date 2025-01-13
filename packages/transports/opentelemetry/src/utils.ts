// This code is adapted from:
// https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/packages/winston-transport/src/OpenTelemetryTransportV3.ts
// Which is Copyright The OpenTelemetry Authors and licensed under the Apache License, Version 2.0.

import { type LogAttributes, type LogRecord, type Logger, SeverityNumber } from "@opentelemetry/api-logs";

const logLayerLevels: Record<string, number> = {
  fatal: SeverityNumber.FATAL,
  error: SeverityNumber.ERROR,
  warn: SeverityNumber.WARN,
  info: SeverityNumber.INFO,
  debug: SeverityNumber.DEBUG,
  trace: SeverityNumber.TRACE,
};

function getSeverityNumber(level: string): SeverityNumber {
  return logLayerLevels[level] ?? SeverityNumber.TRACE;
}

export function emitLogRecord(record: Record<string, any>, logger: Logger): void {
  const { message, level, ...splat } = record;
  const attributes: LogAttributes = {};
  for (const key in splat) {
    if (Object.prototype.hasOwnProperty.call(splat, key)) {
      attributes[key] = splat[key];
    }
  }
  const logRecord: LogRecord = {
    severityNumber: getSeverityNumber(level),
    severityText: level,
    body: message,
    attributes: attributes,
  };
  logger.emit(logRecord);
}
