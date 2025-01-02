import { BaseTransport, type LogLayerTransportParams, LogLevel } from "@loglayer/transport";
import type { Signale } from "signale";

export class SignaleTransport extends BaseTransport<Signale> {
  shipToLogger({ logLevel, messages, data, hasData }: LogLayerTransportParams) {
    if (data && hasData) {
      // library wants the data object to be the last parameter
      messages.push(data);
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
        this.logger.debug(...messages);
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
