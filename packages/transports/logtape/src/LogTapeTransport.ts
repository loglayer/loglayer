import { BaseTransport, type LogLayerTransportParams, LogLevel } from "@loglayer/transport";

// LogTape logger interface based on their documentation
interface LogTapeLogger {
  trace(message: string, data?: Record<string, unknown>): void;
  debug(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
  fatal(message: string, data?: Record<string, unknown>): void;
}

export class LogTapeTransport extends BaseTransport<LogTapeLogger> {
  shipToLogger({ logLevel, messages, data, hasData }: LogLayerTransportParams) {
    const message = messages.join(" ");
    const logData = data && hasData ? data : undefined;

    switch (logLevel) {
      case LogLevel.info:
        this.logger.info(message, logData);
        break;
      case LogLevel.warn:
        this.logger.warn(message, logData);
        break;
      case LogLevel.error:
        this.logger.error(message, logData);
        break;
      case LogLevel.trace:
        this.logger.trace(message, logData);
        break;
      case LogLevel.debug:
        this.logger.debug(message, logData);
        break;
      case LogLevel.fatal:
        this.logger.fatal(message, logData);
        break;
    }

    return [message, logData];
  }
}
