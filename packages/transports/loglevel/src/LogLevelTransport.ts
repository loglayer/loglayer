import {
  BaseTransport,
  type LogLayerTransportConfig,
  type LogLayerTransportParams,
  LogLevel,
} from "@loglayer/transport";
import type { Logger } from "loglevel";

export interface LogLevelTransportConfig extends LogLayerTransportConfig<Logger> {
  /**
   * If true, object data will be appended as the last parameter.
   * If false, object data will be prepended as the first parameter (default).
   */
  appendObjectData?: boolean;
}

export class LogLevelTransport extends BaseTransport<Logger> {
  private appendObjectData: boolean;

  constructor(params: LogLevelTransportConfig) {
    super(params);
    this.appendObjectData = params.appendObjectData || false;
  }

  shipToLogger({ logLevel, messages, data, hasData }: LogLayerTransportParams) {
    if (data && hasData) {
      if (this.appendObjectData) {
        messages.push(data);
      } else {
        messages.unshift(data);
      }
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
        this.logger.trace(...messages);
        break;
      case LogLevel.debug:
        this.logger.debug(...messages);
        break;
      case LogLevel.fatal:
        // loglevel doesn't have fatal, use error instead
        this.logger.error(...messages);
        break;
    }

    return messages;
  }
}
