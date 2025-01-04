# Datadog Transport for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-datadog)](https://www.npmjs.com/package/@loglayer/transport-datadog)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Ftransport-datadog)](https://www.npmjs.com/package/@loglayer/transport-datadog)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

Ships logs to Datadog using the [datadog-transport-common](https://www.npmjs.com/package/datadog-transport-common) library.

## Important Notes

- Only works server-side (not in browsers)
  * For browser-side logging, use the [`@loglayer/transport-datadog-browser-logs`](https://github.com/loglayer/loglayer/tree/master/packages/transports/datadog-browser-logs) package
- You will not get any console output since this sends directly to DataDog. Use the `onDebug` option to log out messages.

## Usage

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

See the [documentation](https://loglayer.dev/transports/datadog) for more information.
