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
        // @ts-ignore
        this.logger.info(...messages);
        break;
      case LogLevel.warn:
        // @ts-ignore
        this.logger.warn(...messages);
        break;
      case LogLevel.error:
        // @ts-ignore
        this.logger.error(...messages);
        break;
      case LogLevel.trace:
        // @ts-ignore
        this.logger.trace(...messages);
        break;
      case LogLevel.debug:
        // @ts-ignore
        this.logger.debug(...messages);
        break;
      case LogLevel.fatal:
        // @ts-ignore
        this.logger.fatal(...messages);
        break;
    }

    return messages;
  }
}
