import { BaseTransport, type LogLayerTransportParams, LogLevel } from "@loglayer/transport";
import type { Logger } from "pino";

export class PinoTransport extends BaseTransport<Logger> {
  shipToLogger({ logLevel, messages, data, hasData }: LogLayerTransportParams) {
    const toPublish = [];

    if (data && hasData) {
      // put object data as the first parameter
      toPublish.push(data);
    }

    toPublish.push(messages.join(" "));

    switch (logLevel) {
      case LogLevel.info:
        // @ts-ignore
        this.logger.info(...toPublish);
        break;
      case LogLevel.warn:
        // @ts-ignore
        this.logger.warn(...toPublish);
        break;
      case LogLevel.error:
        // @ts-ignore
        this.logger.error(...toPublish);
        break;
      case LogLevel.trace:
        // @ts-ignore
        this.logger.trace(...toPublish);
        break;
      case LogLevel.debug:
        // @ts-ignore
        this.logger.debug(...toPublish);
        break;
      case LogLevel.fatal:
        // @ts-ignore
        this.logger.fatal(...toPublish);
        break;
    }

    return toPublish;
  }
}
