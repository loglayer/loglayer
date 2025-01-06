import type { LogLayerTransportConfig, LogLayerTransportParams } from "@loglayer/transport";
import { BaseTransport, LogLevel } from "@loglayer/transport";

type ConsoleType = typeof console;

interface ConsoleTransportConfig extends LogLayerTransportConfig<ConsoleType> {
  /**
   * If true, object data will be appended as the last parameter.
   * If false, object data will be prepended as the first parameter (default).
   */
  appendObjectData?: boolean;
}

/**
 * Transport for use with a console logger.
 */
export class ConsoleTransport extends BaseTransport<ConsoleType> {
  private appendObjectData: boolean;

  constructor(params: ConsoleTransportConfig) {
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
