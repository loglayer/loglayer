---
title: DataDog Transport for LogLayer
description: Send logs to DataDog with the LogLayer logging library
---

# DataDog Transport

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-datadog)](https://www.npmjs.com/package/@loglayer/transport-datadog)

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
npm i loglayer @loglayer/transport-datadog serialize-error
```

```sh [pnpm]
pnpm add loglayer @loglayer/transport-datadog serialize-error
```

```sh [yarn]
yarn add loglayer @loglayer/transport-datadog serialize-error
```

:::

## Usage Example

```typescript
import { LogLayer } from 'loglayer'
import { DataDogTransport } from "@loglayer/transport-datadog"
import { serializeError } from "serialize-error";

const log = new LogLayer({
  errorSerializer: serializeError,
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

### Required Parameters

| Name | Type                                                                                                                                        | Description |
|------|---------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| `options` | [`DDTransportOptions`](https://github.com/theogravity/datadog-transports/tree/main/packages/datadog-transport-common#configuration-options) | The options for the transport |

### Optional Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Whether the transport is enabled |
| `messageField` | `string` | `"message"` | The field name to use for the message |
| `levelField` | `string` | `"level"` | The field name to use for the log level |
| `timestampField` | `string` | `"time"` | The field name to use for the timestamp |
| `timestampFunction` | `() => any` | - | A custom function to stamp the timestamp. The default timestamp uses the ISO 8601 format |
| `level` | `"trace" \| "debug" \| "info" \| "warn" \| "error" \| "fatal"` | `"trace"` | Minimum log level to process. Logs below this level will be filtered out |

## Changelog

View the changelog [here](./changelogs/datadog-changelog.md).