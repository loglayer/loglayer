import { BaseTransport, type LogLayerTransportParams, LogLevel } from "@loglayer/transport";
import type { Logger } from "winston";

export class WinstonTransport extends BaseTransport<Logger> {
  shipToLogger({ logLevel, messages, data, hasData }: LogLayerTransportParams) {
    if (data && hasData) {
      // library wants the data object to be the last parameter
      messages.push(data);
    }

    switch (logLevel) {
      case LogLevel.info:
        // @ts-expect-error
        this.logger.info(...messages);
        break;
      case LogLevel.warn:
        // @ts-expect-error
        this.logger.warn(...messages);
        break;
      case LogLevel.error:
        // @ts-expect-error
        this.logger.error(...messages);
        break;
      case LogLevel.trace:
        // @ts-expect-error
        this.logger.debug(...messages);
        break;
      case LogLevel.debug:
        // @ts-expect-error
        this.logger.debug(...messages);
        break;
      case LogLevel.fatal:
        // @ts-expect-error
        this.logger.error(...messages);
        break;
    }

    return messages;
  }
}
