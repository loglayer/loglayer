import { BaseTransport, type LogLayerTransportParams, LogLevel } from "@loglayer/transport";
import type { Logger } from "roarr";

export class RoarrTransport extends BaseTransport<Logger> {
  shipToLogger({ logLevel, messages, data, hasData }: LogLayerTransportParams) {
    const finalMessage = [];

    if (data && hasData) {
      // put object data as the first parameter
      finalMessage.push(data);
    }

    if (messages.length === 0) {
      // Roarr needs a message defined
      finalMessage.push("");
    } else {
      finalMessage.push(messages.join(" "));
    }

    switch (logLevel) {
      case LogLevel.info:
        // @ts-expect-error
        this.logger.info(...finalMessage);
        break;
      case LogLevel.warn:
        // @ts-expect-error
        this.logger.warn(...finalMessage);
        break;
      case LogLevel.error:
        // @ts-expect-error
        this.logger.error(...finalMessage);
        break;
      case LogLevel.trace:
        // @ts-expect-error
        this.logger.trace(...finalMessage);
        break;
      case LogLevel.debug:
        // @ts-expect-error
        this.logger.debug(...finalMessage);
        break;
      case LogLevel.fatal:
        // @ts-expect-error
        this.logger.fatal(...finalMessage);
        break;
    }

    return messages;
  }
}
