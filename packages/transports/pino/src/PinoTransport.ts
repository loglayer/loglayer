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
        // @ts-expect-error
        this.logger.info(...toPublish);
        break;
      case LogLevel.warn:
        // @ts-expect-error
        this.logger.warn(...toPublish);
        break;
      case LogLevel.error:
        // @ts-expect-error
        this.logger.error(...toPublish);
        break;
      case LogLevel.trace:
        // @ts-expect-error
        this.logger.trace(...toPublish);
        break;
      case LogLevel.debug:
        // @ts-expect-error
        this.logger.debug(...toPublish);
        break;
      case LogLevel.fatal:
        // @ts-expect-error
        this.logger.fatal(...toPublish);
        break;
    }

    return toPublish;
  }
}
