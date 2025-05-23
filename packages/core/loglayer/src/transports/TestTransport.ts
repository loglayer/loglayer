import { LogLevel } from "@loglayer/shared";
import { BaseTransport, type LogLayerTransportParams } from "@loglayer/transport";
import type { TestLoggingLibrary } from "../TestLoggingLibrary.js";

/**
 * Transport used for testing purposes.
 */
export class TestTransport extends BaseTransport<TestLoggingLibrary> {
  shipToLogger({ logLevel, messages, data, hasData }: LogLayerTransportParams) {
    if (data && hasData) {
      // put object data as the first parameter
      messages.unshift(data);
    }

    switch (logLevel) {
      case LogLevel.info:
        this.logger.info(...messages);
        break;
      case LogLevel.warn:
        this.logger.warn(...messages);
        break;
      case LogLevel.error:
        this.logger.error(...messages);
        break;
      case LogLevel.trace:
        this.logger.trace(...messages);
        break;
      case LogLevel.debug:
        this.logger.debug(...messages);
        break;
      case LogLevel.fatal:
        this.logger.fatal(...messages);
        break;
    }

    return messages;
  }
}
