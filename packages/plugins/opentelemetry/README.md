# OpenTelemetry Plugin for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Fplugin-opentelemetry)](https://www.npmjs.com/package/@loglayer/plugin-opentelemetry)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Fplugin-opentelemetry)](https://www.npmjs.com/package/@loglayer/plugin-opentelemetry)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

The OpenTelemetry plugin for [LogLayer](https://loglayer.dev) uses the [`@opentelemetry/api`](https://www.npmjs.com/package/@opentelemetry/api)
to store the following in the log context:

- `trace_id`
- `span_id`
- `trace_flags`

This allows you to cross-reference your logs with generated traces.

### Note

If you are using OpenTelemetry with log processors, use the [OpenTelemetry Transport](https://loglayer.dev/transports/opentelemetry).
If you don't know what that is, then you'll want to use this plugin instead of the transport.

## Installation

```bash
npm install @loglayer/plugin-opentelemetry loglayer
```

## Usage

```typescript
import { LogLayer, ConsoleTransport } from 'loglayer'
import { openTelemetryPlugin } from '@loglayer/plugin-opentelemetry'

const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  }),
  plugins: [
    openTelemetryPlugin()
  ]
})

// Example usage
log.info("Hello world")
// Output: Hello world!

```

## Documentation

For more details, visit [https://loglayer.dev/plugins/opentelemetry](https://loglayer.dev/plugins/opentelemetry)
