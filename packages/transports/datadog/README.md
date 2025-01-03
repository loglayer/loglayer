# Datadog Transport for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-datadog)](https://www.npmjs.com/package/@loglayer/transport-datadog)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Ftransport-datadog)](https://www.npmjs.com/package/@loglayer/transport-datadog)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

Ships logs to Datadog using the [datadog-transport-common](https://www.npmjs.com/package/datadog-transport-common) library.

## Important Notes

- Only works server-side (not in browsers)
    * For browser-side logging, use the [`@loglayer/transport-datadog-browser-logs`](https://loglayer.dev/transports/datadog-browser-logs.html) package
- import `createDataDogTransport` from `@loglayer/transport-datadog` to create a new DataDog transport
- You will not get any console output since this sends directly to DataDog. Use the `onDebug` option to log out messages.

## Installation

```bash
npm install loglayer @loglayer/transport-datadog
```

## Usage

```typescript
import { LogLayer } from 'loglayer'
import { createDataDogTransport } from "@loglayer/transport-datadog"

const log = new LogLayer({
  transport: createDataDogTransport({
    id: "datadog",
    options: {
      ddClientConf: {
        authMethods: {
          apiKeyAuth: "YOUR_API_KEY",
        },
      },
      ddServerConf: {
        // Note: This must match the site you use for your DataDog login - See below for more info
        site: "datadoghq.eu"
      },
      onDebug: (msg) => {
        console.log(msg);
      },
      onError: (err, logs) => {
        console.error(err, logs);
      },
    },
  })
})
```

## Configuration

```typescript
interface DataDogTransportOptions {
  /**
   * The ID of the transport.
   */
  id?: string
  /**
   * Whether the transport is enabled. Default is true.
   */
  enabled?: boolean
  /**
   * The field name to use for the message. Default is "message".
   */
  messageField?: string;
  /**
   * The field name to use for the log level. Default is "level".
   */
  levelField?: string;
  /**
   * The field name to use for the timestamp. Default is "time".
   */
  timestampField?: string;
  /**
   * A custom function to stamp the timestamp. The default timestamp uses the ISO 8601 format.
   */
  timestampFunction?: () => any;
  /**
   * The options for the transport.
   */
  options: DDTransportOptions
}
```

```typescript
export interface DDTransportOptions {
  /**
   * DataDog client configuration parameters.
   * @see https://datadoghq.dev/datadog-api-client-typescript/interfaces/client.Configuration.html
   */
  ddClientConf: ConfigurationParameters
  /**
   * Datadog server config for the client. Use this to change the Datadog server region.
   * @see https://github.com/DataDog/datadog-api-client-typescript/blob/1e1097c68a437894b482701ecbe3d61522429319/packages/datadog-api-client-common/servers.ts#L90
   */
  ddServerConf?: {
    /**
     * The datadog server to use. Default is datadoghq.com.
     * Other values could be:
     * - us3.datadoghq.com
     * - us5.datadoghq.com
     * - datadoghq.eu
     * - ddog-gov.com
     */
    site?: string
    subdomain?: string
    protocol?: string
  }
  /**
   * The integration name associated with your log: the technology from which
   * the log originated. When it matches an integration name, Datadog
   * automatically installs the corresponding parsers and facets.
   * @see https://docs.datadoghq.com/logs/log_collection/?tab=host#reserved-attributes
   */
  ddsource?: string
  /**
   * Comma separated tags associated with your logs. Ex: "env:prod,org:finance"
   */
  ddtags?: string
  /**
   * The name of the application or service generating the log events.
   * Default is "Electron"
   * @see https://docs.datadoghq.com/logs/log_collection/?tab=host#reserved-attributes
   */
  service?: string
  /**
   * Called when the plugin is ready to process logs.
   */
  onInit?: () => void
  /**
   * Error handler for when the submitLog() call fails.
   */
  onError?: (err: any, logs?: Array<Record<string, any>>) => void
  /**
   * Define this callback to get debug messages from this transport
   */
  onDebug?: (msg: string) => void
  /**
   * Number of times to retry sending the log before onError() is called.
   * Default is 5.
   */
  retries?: number
  /**
   * Interval in which logs are sent to Datadog.
   * Default is 3000 milliseconds.
   */
  sendIntervalMs?: number
  /**
   * Set to true to disable batch sending and send each log as it comes in. This disables
   * the send interval.
   */
  sendImmediate?: boolean
}
```

## Documentation

For more details, visit [https://loglayer.dev/transports/datadog](https://loglayer.dev/transports/datadog)
