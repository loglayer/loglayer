---
title: DataDog Logs Transport for LogLayer
description: Learn how to ship logs to DataDog using LogLayer
---

# DataDog Transport

Ships logs server-side to Datadog using the [datadog-transport-common](https://www.npmjs.com/package/datadog-transport-common) library.

[Transport Source](https://github.com/loglayer/loglayer/tree/master/packages/transports/datadog)

## Important Notes

- Only works server-side (not in browsers)
    * For browser-side logging, use the [`@loglayer/transport-datadog-browser-logs`](/transports/datadog-browser-logs) package
- You will not get any console output since this sends directly to DataDog. Use the `onDebug` option to log out messages.

## Installation

Install the required packages (`datadog-transport-common` is installed as part of `@loglayer/transport-datadog`):

::: code-group

```sh [npm]
npm i loglayer @loglayer/transport-datadog
```

```sh [pnpm]
pnpm add loglayer @loglayer/transport-datadog
```

```sh [yarn]
yarn add loglayer @loglayer/transport-datadog
```

:::

## Usage Example

```typescript
import { LogLayer } from 'loglayer'
import { DataDogTransport } from "@loglayer/transport-datadog"

const log = new LogLayer({
  transport: new DataDogTransport({
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

## Transport Configuration

```typescript
interface DatadogTransportConfig {
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

## DataDog Transport Options

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

## Migration Guide

### Migrating from v1 to v2

We no longer provide a `createDataDogTransport` function. Instead, you should directly instantiate the `DataDogTransport` class:

```typescript
// v1
import { createDataDogTransport } from "@loglayer/transport-datadog"

const log = new LogLayer({
  transport: createDataDogTransport({
    id: "datadog",  // id was required in v1
    options: {
      // ... options
    }
  })
})

// v2
import { DataDogTransport } from "@loglayer/transport-datadog"

const log = new LogLayer({
  transport: new DataDogTransport({
    options: {
      // ... options
    }
  })
})
```
