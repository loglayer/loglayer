import { LoggerlessTransport, type LoggerlessTransportConfig, type LogLayerTransportParams } from "@loglayer/transport";

/**
 * Configuration options for the BlankTransport.
 */
interface BlankTransportConfig extends LoggerlessTransportConfig {
  /**
   * The function that will be called to handle log shipping.
   * This is the only required parameter for creating a custom transport.
   */
  shipToLogger: (params: LogLayerTransportParams) => any[];
}

/**
 * A transport that allows users to quickly create custom transports by providing their own `shipToLogger` function.
 *
 * This is useful for creating simple custom transports without having to create a completely new transport class from scratch.
 *
 * @example
 * ```typescript
 * import { LogLayer, BlankTransport } from 'loglayer';
 *
 * const log = new LogLayer({
 *   transport: new BlankTransport({
 *     shipToLogger: ({ logLevel, messages, data, hasData }) => {
 *       // Your custom logging logic here
 *       console.log(`[${logLevel}]`, ...messages, data && hasData ? data : '');
 *       return messages;
 *     }
 *   })
 * });
 * ```
 */
export class BlankTransport extends LoggerlessTransport {
  private shipToLoggerFn: (params: LogLayerTransportParams) => any[];

  constructor(config: BlankTransportConfig) {
    super(config);
    this.shipToLoggerFn = config.shipToLogger;
  }

  shipToLogger(params: LogLayerTransportParams): any[] {
    return this.shipToLoggerFn(params);
  }
}
