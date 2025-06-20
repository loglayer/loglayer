---
title: VictoriaLogs Transport for LogLayer
description: Send logs to Victoria Metrics' VictoriaLogs with the LogLayer logging library
---

# VictoriaLogs Transport

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-victoria-logs)](https://www.npmjs.com/package/@loglayer/transport-victoria-logs)

This transport adds support for [Victoria Metrics](https://victoriametrics.com/)' [VictoriaLogs](https://victoriametrics.com/products/victorialogs/) and is a wrapper around the [HTTP transport](https://loglayer.dev/transports/http) using the [VictoriaLogs JSON stream API](https://docs.victoriametrics.com/victorialogs/data-ingestion/#json-stream-api).

[Transport Source](https://github.com/loglayer/loglayer/tree/master/packages/transports/victoria-logs)

[Vibe Code Prompts](https://github.com/loglayer/loglayer/tree/master/packages/transports/victoria-logs/PROMPTS.md)

_The code has been manually tested against a local VictoriaLogs instance._

## Installation

::: code-group
```bash [npm]
npm install loglayer @loglayer/transport-victoria-logs serialize-error
```

```bash [pnpm]
pnpm add loglayer @loglayer/transport-victoria-logs serialize-error
```

```bash [yarn]
yarn add loglayer @loglayer/transport-victoria-logs serialize-error
```
:::

## Basic Usage

```typescript
import { LogLayer } from 'loglayer'
import { VictoriaLogsTransport } from "@loglayer/transport-victoria-logs"
import { serializeError } from "serialize-error";

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: new VictoriaLogsTransport({
    url: "http://localhost:9428", // optional, defaults to http://localhost:9428
    // Configure stream-level fields for better performance
    streamFields: () => ({
      service: "my-app",
      environment: process.env.NODE_ENV || "development",
      instance: process.env.HOSTNAME || "unknown",
    }),
    // Custom timestamp function (optional)
    timestamp: () => new Date().toISOString(),
    // Custom HTTP parameters for VictoriaLogs ingestion
    httpParameters: {
      _time_field: "_time",
      _msg_field: "_msg",
    },
    // All other HttpTransport options are available and optional
    compression: false, // optional, defaults to false
    maxRetries: 3, // optional, defaults to 3
    retryDelay: 1000, // optional, defaults to 1000
    respectRateLimit: true, // optional, defaults to true
    enableBatchSend: true, // optional, defaults to true
    batchSize: 100, // optional, defaults to 100
    batchSendTimeout: 5000, // optional, defaults to 5000ms
    onError: (err) => {
      console.error('Failed to send logs to VictoriaLogs:', err);
    },
    onDebug: (entry) => {
      console.log('Log entry being sent to VictoriaLogs:', entry);
    },
  })
})

// Use the logger
log.info("This is a test message");
log.withMetadata({ userId: "123" }).error("User not found");
```

## Configuration

The VictoriaLogs transport extends the [HTTP transport configuration](/transports/http#configuration) with VictoriaLogs specific defaults:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | `"http://localhost:9428"` | The VictoriaLogs host URL. The `/insert/jsonline` path is automatically appended |
| `method` | `string` | `"POST"` | HTTP method to use for requests |
| `headers` | `Record<string, string> \| (() => Record<string, string>)` | `{ "Content-Type": "application/stream+json" }` | Headers to include in the request |
| `contentType` | `string` | `"application/stream+json"` | Content type for single log requests |
| `batchContentType` | `string` | `"application/stream+json"` | Content type for batch log requests |
| `streamFields` | `() => Record<string, string>` | `() => ({})` | Function to generate stream-level fields for VictoriaLogs. The keys of the returned object are automatically used as the values for the `_stream_fields` parameter. See [stream fields documentation](https://docs.victoriametrics.com/victorialogs/keyconcepts/#stream-fields) |
| `timestamp` | `() => string` | `() => new Date().toISOString()` | Function to generate the timestamp for the `_time` field |
| `httpParameters` | `Record<string, string>` | `{}` | Custom HTTP query parameters for VictoriaLogs ingestion. See [HTTP parameters documentation](https://docs.victoriametrics.com/victorialogs/data-ingestion/#http-parameters) |
| `payloadTemplate` | `(data: { logLevel: string; message: string; data?: Record<string, any> }) => string` | VictoriaLogs format | Pre-configured payload template for VictoriaLogs |

For all other configuration options, see the [HTTP transport documentation](/transports/http#configuration).

## VictoriaLogs Specific Features

### Pre-configured Payload Template

The transport comes with a pre-configured payload template that formats logs for VictoriaLogs according to the [data model](https://docs.victoriametrics.com/victorialogs/keyconcepts/#data-model):

```typescript
payloadTemplate: ({ logLevel, message, data }) => {
  const streamFieldsData = streamFields();
  const timeValue = timestamp();
  
  // Determine field names based on HTTP parameters
  const msgField = httpParameters._msg_field || "_msg";
  const timeField = httpParameters._time_field || "_time";
  
  return JSON.stringify({
    [msgField]: message || "(no message)",
    [timeField]: timeValue,
    level: logLevel,
    ...streamFieldsData,
    ...data,
  });
}
```

**Note**: The payload template automatically adapts to your HTTP parameters. For example, if you set `_msg_field: "message"` in your HTTP parameters, the transport will use `message` as the field name instead of `_msg`.

### Stream Fields Configuration

Configure stream-level fields to optimize VictoriaLogs performance. Stream fields should contain fields that uniquely identify your application instance and remain constant during its lifetime:

```typescript
new VictoriaLogsTransport({
  url: "http://localhost:9428",
  streamFields: () => ({
    service: "my-app",
    environment: process.env.NODE_ENV || "development",
    instance: process.env.HOSTNAME || "unknown",
    // Add other constant fields that identify your application instance
    // Avoid high-cardinality fields like user_id, ip, trace_id, etc.
  }),
})
```

**Important**: 
- Never add high-cardinality fields (like `user_id`, `ip`, `trace_id`) to stream fields as this can cause performance issues. Only include fields that remain constant during your application instance's lifetime.
- The keys of the object returned by `streamFields()` are automatically used as the values for the `_stream_fields` HTTP parameter. For example, if `streamFields()` returns `{ service: "my-app", environment: "prod" }`, the transport will automatically add `_stream_fields=service,environment` to the HTTP query parameters.

For more information about stream fields and their importance for performance, see the [VictoriaLogs stream fields documentation](https://docs.victoriametrics.com/victorialogs/keyconcepts/#stream-fields).

### HTTP Parameters

Configure custom HTTP query parameters for VictoriaLogs ingestion. This allows you to specify how VictoriaLogs should process your logs:

```typescript
new VictoriaLogsTransport({
  url: "http://localhost:9428",
  httpParameters: {
    _time_field: "_time", // Specify the timestamp field name
    _msg_field: "_msg", // Specify the message field name
    // Add other VictoriaLogs HTTP parameters as needed
  },
})
```

Common HTTP parameters include:
- `_stream_fields`: Comma-separated list of fields to use for stream identification (automatically set from `streamFields()` keys)
- `_time_field`: Name of the timestamp field in your logs
- `_msg_field`: Name of the message field in your logs
- `_default_msg_value`: Default message value when the message field is empty

**Important**: The payload template automatically adapts to your HTTP parameters. For example:
- If you set `_msg_field: "message"`, the transport will use `message` as the field name instead of `_msg`
- If you set `_time_field: "timestamp"`, the transport will use `timestamp` as the field name instead of `_time`

For a complete list of available HTTP parameters, see the [VictoriaLogs HTTP parameters documentation](https://docs.victoriametrics.com/victorialogs/data-ingestion/#http-parameters).

### Automatic URL Construction

The transport automatically appends the `/insert/jsonline` path to your VictoriaLogs host URL:

```typescript
// This URL: "http://localhost:9428"
// Becomes: "http://localhost:9428/insert/jsonline"
new VictoriaLogsTransport({
  url: "http://localhost:9428"
})
```

### VictoriaLogs JSON Stream API

This transport uses the VictoriaLogs JSON stream API, which supports:

- Unlimited number of log lines in a single request
- Automatic timestamp handling when `_time` is set to `"0"`
- Stream-based processing for high throughput
- Support for custom fields and metadata

For more information about the VictoriaLogs JSON stream API, see the [official documentation](https://docs.victoriametrics.com/victorialogs/data-ingestion/#json-stream-api).

## Customization

Since this transport extends the HTTP transport, you can override any HTTP transport option:

```typescript
new VictoriaLogsTransport({
  url: "http://my-victoria-logs:9428",
  // Override the default payload template
  payloadTemplate: ({ logLevel, message, data }) => 
    JSON.stringify({
      _msg: message,
      _time: new Date().toISOString(),
      level: logLevel,
      custom_field: "custom_value",
      ...data,
    }),
  // Override other HTTP transport options
  compression: true,
  batchSize: 50,
  maxRetries: 5,
})
```

## Related

- [HTTP Transport](/transports/http) - The underlying HTTP transport
- [VictoriaLogs Documentation](https://docs.victoriametrics.com/victorialogs/) - Official VictoriaLogs documentation
- [VictoriaLogs JSON Stream API](https://docs.victoriametrics.com/victorialogs/data-ingestion/#json-stream-api) - API documentation for the JSON stream endpoint
- [VictoriaLogs HTTP Parameters](https://docs.victoriametrics.com/victorialogs/data-ingestion/#http-parameters) - HTTP query parameters documentation
- [VictoriaLogs Stream Fields](https://docs.victoriametrics.com/victorialogs/keyconcepts/#stream-fields) - Stream fields documentation 