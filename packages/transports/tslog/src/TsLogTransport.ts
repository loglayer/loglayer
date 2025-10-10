import type { LogLayerTransportConfig } from "@loglayer/transport";
import { BaseTransport, type LogLayerTransportParams, LogLevel } from "@loglayer/transport";
import type { Logger } from "tslog";

interface TsLogTransportConfig extends LogLayerTransportConfig<Logger<any>> {
  /**
   * The stack depth level to use for logging.
   * This is useful for getting accurate file and line number information in the logs.
   * If not provided, the default stack depth level "9" will be used.
   * Note: You may need to adjust this value based on how many layers of abstraction are between your logging calls and the transport.
   */
  stackDepthLevel?: number;
}

export class TsLogTransport extends BaseTransport<Logger<any>> {
  constructor(config: TsLogTransportConfig) {
    super(config);

    if (config.stackDepthLevel !== undefined) {
      this.logger["stackDepthLevel"] = config.stackDepthLevel;
    } else {
      this.logger["stackDepthLevel"] = 9;
    }
  }

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
        this.logger.trace(...messages);
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
