---
title: New Relic Transport for LogLayer
description: Send logs to New Relic with the LogLayer logging library
---

# New Relic Transport <Badge type="tip" text="Server" /> <Badge type="info" text="Deno" /> <Badge type="info" text="Bun" />

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-new-relic)](https://www.npmjs.com/package/@loglayer/transport-new-relic)

The New Relic transport allows you to send logs directly to New Relic's [Log API](https://docs.newrelic.com/docs/logs/log-api/introduction-log-api/). It extends the [HTTP transport](/transports/http) to provide robust features including compression, retry logic, rate limiting support, batch sending, and validation of New Relic's API constraints. It is compatible with Node.js, Bun, and Deno.

[Transport Source](https://github.com/loglayer/loglayer/tree/master/packages/transports/new-relic)

## Installation

::: code-group
```sh [npm]
npm install loglayer @loglayer/transport-new-relic serialize-error
```

```sh [pnpm]
pnpm add loglayer @loglayer/transport-new-relic serialize-error
```

```sh [yarn]
yarn add loglayer @loglayer/transport-new-relic serialize-error
```
:::

## Basic Usage

```typescript
import { LogLayer } from 'loglayer'
import { NewRelicTransport } from "@loglayer/transport-new-relic"
import { serializeError } from "serialize-error";

const log = new LogLayer({
   errorSerializer: serializeError,
   transport: new NewRelicTransport({
      apiKey: "YOUR_NEW_RELIC_API_KEY",
      endpoint: "https://log-api.newrelic.com/log/v1", // optional, this is the default
      compression: true, // optional, defaults to true
      maxRetries: 3, // optional, defaults to 3
      retryDelay: 1000, // optional, base delay in ms, defaults to 1000
      respectRateLimit: true, // optional, defaults to true
      onError: (err) => {
         console.error('Failed to send logs:', err);
      },
      onDebug: (entry) => {
         console.log('Log entry being sent:', entry);
      },
   })
})

// Use the logger
log.info("This is a test message");
log.withMetadata({ userId: "123" }).error("User not found");
```

## Configuration Options

### Required Parameters

| Name | Type | Description |
|------|------|-------------|
| `apiKey` | `string` | Your New Relic API key |

### Optional Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `endpoint` | `string` | `"https://log-api.newrelic.com/log/v1"` | The New Relic Log API endpoint |
| `compression` | `boolean` | `true` | Whether to use gzip compression |
| `maxRetries` | `number` | `3` | Maximum number of retry attempts |
| `retryDelay` | `number` | `1000` | Base delay between retries (ms) |
| `respectRateLimit` | `boolean` | `true` | Whether to respect rate limiting |
| `onError` | `(err: Error) => void` | - | Error handling callback |
| `onDebug` | `(entry: Record<string, any>) => void` | - | Debug callback for inspecting log entries |
| `onDebugReqRes` | `(reqRes: {...}) => void` | - | Debug callback for HTTP requests and responses |

::: details Inherited HTTP Transport Options

The New Relic transport extends the [HTTP transport](/transports/http) and inherits all its configuration options (batching, content types, level filtering, Next.js Edge compat, etc.). See the [HTTP transport docs](/transports/http#configuration-options) for the full list.

:::

## Features

### Compression

The transport uses gzip compression by default to reduce bandwidth usage. You can disable this if needed:

```typescript
new NewRelicTransport({
  apiKey: "YOUR_API_KEY",
  compression: false
})
```

::: tip Next.js Edge Runtime
Set `enableNextJsEdgeCompat: true` when using this transport in the Next.js Edge runtime. This disables compression (as `CompressionStream` is unavailable) and falls back to `Buffer.byteLength` for log size checks.
:::

### Retry Logic

The transport includes a sophisticated retry mechanism with exponential backoff:

```typescript
new NewRelicTransport({
  apiKey: "YOUR_API_KEY",
  maxRetries: 5, // Increase max retries
  retryDelay: 2000 // Increase base delay to 2 seconds
})
```

### Rate Limiting

The transport handles New Relic's rate limiting in two ways:

1. **Respect Rate Limits (Default)**
   ```typescript
   new NewRelicTransport({
     apiKey: "YOUR_API_KEY",
     respectRateLimit: true // This is the default
   })
   ```
   - Waits for the duration specified in the `Retry-After` header
   - Rate limit retries don't count against `maxRetries`

2. **Ignore Rate Limits**
   ```typescript
   new NewRelicTransport({
     apiKey: "YOUR_API_KEY",
     respectRateLimit: false,
     onError: (err) => {
       // Handle rate limit errors
       console.error("Request failed:", err.message);
     }
   })
   ```
   - Fails immediately when rate limited
   - Calls `onError` with the error

### Validation

The transport automatically validates logs against New Relic's constraints:

```typescript
// This will be validated:
log.withMetadata({
  veryLongKey: "x".repeat(300), // Will throw ValidationError (name too long)
  normalKey: "x".repeat(5000)   // Will be truncated to 4094 characters
}).info("Test message")
```

Validation includes:
- Maximum of 255 attributes per log entry
- Maximum attribute name length of 255 characters
- Automatic truncation of attribute values longer than 4094 characters

### Error Handling

The transport provides detailed error information through the `onError` callback:

```typescript
new NewRelicTransport({
  apiKey: "YOUR_API_KEY",
  onError: (err) => {
    if (err.name === "ValidationError") {
      // Handle validation errors (attribute limits)
      console.error("Validation error:", err.message);
    } else {
      // Handle other errors (network, rate limiting, API errors, etc.)
      console.error("Failed to send logs:", err.message);
    }
  }
})
```

### Debug Callback

The transport includes debug callbacks that allow you to inspect log entries and HTTP traffic:

```typescript
new NewRelicTransport({
  apiKey: "YOUR_API_KEY",
  onDebug: (entry) => {
    // Log the entry being sent
    console.log('Sending log entry:', JSON.stringify(entry, null, 2));
  },
  onDebugReqRes: ({ req, res }) => {
    // Inspect HTTP request and response
    console.log('Request:', req.url, req.method);
    console.log('Response:', res.status, res.statusText);
  }
})
```

## Migration Guide

### From v3.x to v4.x

v4 rewrites the transport to extend `HttpTransport`, which enables Bun and Deno compatibility and adds batch sending support.

#### Renamed configuration option

| v3.x | v4.x |
|------|------|
| `useCompression` | `compression` |

```diff
new NewRelicTransport({
  apiKey: "YOUR_API_KEY",
- useCompression: true,
+ compression: true,
})
```

#### New features inherited from HttpTransport

- **Batch sending** — configurable via `enableBatchSend`, `batchSize`, `batchSendTimeout` (enabled by default)
- **`onDebugReqRes`** — inspect HTTP request/response details
- Full set of [HTTP transport options](/transports/http#configuration-options)

## Changelog

View the changelog [here](./changelogs/new-relic-changelog.md).
