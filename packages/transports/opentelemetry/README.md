# OpenTelemetry Transport for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-opentelemetry)](https://www.npmjs.com/package/@loglayer/transport-opentelemetry)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Ftransport-opentelemetry)](https://www.npmjs.com/package/@loglayer/transport-opentelemetry)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

The OpenTelemetry transport for LogLayer sends logs using the [OpenTelemetry Logs SDK](https://www.npmjs.com/package/@opentelemetry/sdk-logs). This allows you to integrate logs with OpenTelemetry's observability ecosystem.

Compatible with OpenTelemetry JS API and SDK `1.0+`.

### Note

In most cases, you should use the [OpenTelemetry Plugin](https://loglayer.dev/plugins/opentelemetry) instead as it stamps logs with trace context.
Use this transport if you are using OpenTelemetry log processors, where the log processors do the actual shipping of logs.

### Acknowledgements

A lot of the code is based on the [@opentelemetry/winston-transport](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/winston-transport) code,
which is licensed under Apache 2.0.

## Installation

```bash
npm install loglayer @loglayer/transport-opentelemetry serialize-error
```

## Usage

Follow the [OpenTelemetry Getting Started Guide](https://opentelemetry.io/docs/languages/js/getting-started/nodejs/) to set up OpenTelemetry in your application.

```typescript
import { LogLayer } from 'loglayer'
import { OpenTelemetryTransport } from '@loglayer/transport-opentelemetry'
import { serializeError } from 'serialize-error'

const logger = new LogLayer({
  // This will send logs to the OpenTelemetry SDK
  // Where it sends to depends on the configured logRecordProcessors in the SDK
  transport: [new OpenTelemetryTransport({
    // Optional: provide a custom error handler
    onError: (error) => console.error('OpenTelemetry logging error:', error),
    
    // Optional: disable the transport
    enabled: process.env.NODE_ENV !== 'test',
    
    // Optional: enable console debugging
    consoleDebug: process.env.DEBUG === 'true',

    // Optional: set minimum log level to process (defaults to 'trace')
    level: 'info'
  })],
  errorSerializer: serializeError,
});
```

## Documentation

For more details and examples, visit [https://loglayer.dev/transports/opentelemetry](https://loglayer.dev/transports/opentelemetry)
