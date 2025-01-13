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

## Configuration

The plugin accepts the following configuration options:

```typescript
interface OpenTelemetryPluginParams {
  /**
   * If specified, all trace fields will be nested under this key
   */
  traceFieldName?: string;
  
  /**
   * Field name for the trace ID. Defaults to 'trace_id'
   */
  traceIdFieldName?: string;
  
  /**
   * Field name for the span ID. Defaults to 'span_id'
   */
  spanIdFieldName?: string;
  
  /**
   * Field name for the trace flags. Defaults to 'trace_flags'
   */
  traceFlagsFieldName?: string;
  
  /**
   * Unique identifier for the plugin
   */
  id?: string;
  
  /**
   * Whether the plugin is disabled
   */
  disabled?: boolean;
}
```

### Example with Custom Configuration

```typescript
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  }),
  plugins: [
    openTelemetryPlugin({
      // Nest all trace fields under 'trace'
      traceFieldName: 'trace',
      // Custom field names
      traceIdFieldName: 'traceId',
      spanIdFieldName: 'spanId',
      traceFlagsFieldName: 'flags'
    })
  ]
})
```

This would output logs with the following structure:
```json
{
  "trace": {
    "traceId": "8de71fcab951aad172f1148c74d0877e",
    "spanId": "349623465c6dfc1b",
    "flags": "01"
  }
}
```

## Documentation

For more details, visit [https://loglayer.dev/plugins/opentelemetry](https://loglayer.dev/plugins/opentelemetry)
