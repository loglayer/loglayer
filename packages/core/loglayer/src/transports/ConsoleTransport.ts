import type { LogLayerTransportParams } from "@loglayer/transport";
import { BaseTransport, LogLevel } from "@loglayer/transport";

type ConsoleType = typeof console;

/**
 * Transport for use with a console logger.
 */
export class ConsoleTransport extends BaseTransport<ConsoleType> {
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
        this.logger.error(...messages);
        break;
    }

    return messages;
  }
}
