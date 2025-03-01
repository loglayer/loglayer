import type { Logger } from "@datadog/browser-logs";
import { BaseTransport, type LogLayerTransportParams, LogLevel } from "@loglayer/transport";

export class DataDogBrowserLogsTransport extends BaseTransport<Logger> {
  shipToLogger({ logLevel, messages, data, hasData }: LogLayerTransportParams) {
    const toPublish = [];

    toPublish.push(messages.join(" "));

    if (data && hasData) {
      // library wants the data object to be the last parameter
      toPublish.push(data);
    }

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
        this.logger.debug(...toPublish);
        break;
      case LogLevel.debug:
        // @ts-ignore
        this.logger.debug(...toPublish);
        break;
      case LogLevel.fatal:
        // @ts-ignore
        this.logger.error(...toPublish);
        break;
    }

    return toPublish;
  }
}
