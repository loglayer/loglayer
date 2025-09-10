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
        this.logger.info(...messages);
        break;
      case LogLevel.warn:
        this.logger.warn(...messages);
        break;
      case LogLevel.error:
        this.logger.error(...messages);
        break;
      case LogLevel.trace:
        this.logger.debug(...messages);
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
