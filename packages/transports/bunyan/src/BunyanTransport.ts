import { BaseTransport, type LogLayerTransportParams, LogLevel } from "@loglayer/transport";
import type Logger from "bunyan";

export class BunyanTransport extends BaseTransport<Logger> {
  shipToLogger({ logLevel, messages, data, hasData }: LogLayerTransportParams) {
    if (data && hasData) {
      // put object data as the first parameter
      messages.unshift(data);
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
        this.logger.trace(...messages);
        break;
      case LogLevel.debug:
        // @ts-expect-error
        this.logger.debug(...messages);
        break;
      case LogLevel.fatal:
        // @ts-expect-error
        this.logger.fatal(...messages);
        break;
    }

    return messages;
  }
}
