import type { Logger } from "@aws-lambda-powertools/logger";
import { BaseTransport, type LogLayerTransportParams } from "@loglayer/transport";

const LOG_LEVEL_MAP = {
  trace: "DEBUG",
  debug: "DEBUG",
  info: "INFO",
  warn: "WARN",
  error: "ERROR",
  fatal: "ERROR",
} as const;

export class PowertoolsTransport extends BaseTransport<Logger> {
  shipToLogger({ logLevel, messages, data, hasData }: LogLayerTransportParams): any[] {
    const powertoolsLevel = LOG_LEVEL_MAP[logLevel].toLowerCase();

    if (hasData && data) {
      this.logger[powertoolsLevel]?.(messages.join(""), data);
    } else {
      this.logger[powertoolsLevel]?.(messages.join(""));
    }

    return messages;
  }
}
