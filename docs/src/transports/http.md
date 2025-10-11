---
title: HTTP Transport for LogLayer
description: Send logs to any HTTP endpoint with the LogLayer logging library
---

# HTTP Transport <Badge type="warning" text="Browser" /> <Badge type="tip" text="Server" /> <Badge type="info" text="Deno" /> <Badge type="info" text="Bun" />

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-http)](https://www.npmjs.com/package/@loglayer/transport-http)

Ships logs to any HTTP endpoint with support for batching, compression, retries, and rate limiting. Features include:
 
- Configurable HTTP method and headers
- Custom payload template function
- Gzip compression support
- Retry logic with exponential backoff
- Rate limiting support
- Batch sending with configurable size and timeout
- Error and debug callbacks
- Log size validation and payload size tracking
- Support for Next.js edge deployments

[Transport Source](https://github.com/loglayer/loglayer/tree/master/packages/transports/http)

This transport was 99% vibe-coded, with manual testing against [VictoriaLogs](https://docs.victoriametrics.com/victorialogs/data-ingestion/#json-stream-api).

[Vibe Code Prompts](https://github.com/loglayer/loglayer/tree/master/packages/transports/http/PROMPTS.md)

## Installation

::: code-group
```bash [npm]
npm install loglayer @loglayer/transport-http serialize-error
```

```bash [pnpm]
pnpm add loglayer @loglayer/transport-http serialize-error
```

```bash [yarn]
yarn add loglayer @loglayer/transport-http serialize-error
```
:::

## Basic Usage

```typescript
import { LogLayer } from 'loglayer'
import { HttpTransport } from "@loglayer/transport-http"
import { serializeError } from "serialize-error";

const log = new LogLayer({
   errorSerializer: serializeError,
   transport: new HttpTransport({
      url: "https://api.example.com/logs",
      method: "POST", // optional, defaults to POST
      headers: {
         "Authorization": "Bearer YOUR_API_KEY",
         "Content-Type": "application/json"
      },
      payloadTemplate: ({ logLevel, message, data }) => 
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: logLevel,
          message,
          metadata: data,
        }),
      compression: true, // optional, defaults to false
      maxRetries: 3, // optional, defaults to 3
      retryDelay: 1000, // optional, defaults to 1000
      respectRateLimit: true, // optional, defaults to true
      enableBatchSend: true, // optional, defaults to true
      batchSize: 100, // optional, defaults to 100
      batchSendTimeout: 5000, // optional, defaults to 5000ms
      batchSendDelimiter: "\n", // optional, defaults to "\n"
      maxLogSize: 1048576, // optional, defaults to 1MB
      maxPayloadSize: 5242880, // optional, defaults to 5MB
      enableNextJsEdgeCompat: false, // optional, defaults to false
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

## Configuration

### Required Parameters

| Name | Type | Description |
|------|------|-------------|
| `url` | `string` | The URL to send logs to |
| `payloadTemplate` | `(data: { logLevel: string; message: string; data?: Record<string, any> }) => string` | Function to transform log data into the payload format |

### Optional Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `method` | `string` | `"POST"` | HTTP method to use for requests |
| `headers` | `Record<string, string> \| (() => Record<string, string>)` | `{}` | Headers to include in the request. Can be an object or a function that returns headers |
| `contentType` | `string` | `"application/json"` | Content type for single log requests. User-specified headers take precedence |
| `batchContentType` | `string` | `"application/json"` | Content type for batch log requests. User-specified headers take precedence |
| `compression` | `boolean` | `false` | Whether to use gzip compression |
| `maxRetries` | `number` | `3` | Number of retry attempts before giving up |
| `retryDelay` | `number` | `1000` | Base delay between retries in milliseconds |
| `respectRateLimit` | `boolean` | `true` | Whether to respect rate limiting by waiting when a 429 response is received |
| `enableBatchSend` | `boolean` | `true` | Whether to enable batch sending |
| `batchSize` | `number` | `100` | Number of log entries to batch before sending |
| `batchSendTimeout` | `number` | `5000` | Timeout in milliseconds for sending batches regardless of size |
| `batchSendDelimiter` | `string` | `"\n"` | Delimiter to use between log entries in batch mode |
| `maxLogSize` | `number` | `1048576` | Maximum size of a single log entry in bytes (1MB) |
| `maxPayloadSize` | `number` | `5242880` | Maximum size of the payload (uncompressed) in bytes (5MB) |
| `enableNextJsEdgeCompat` | `boolean` | `false` | Whether to enable Next.js Edge compatibility |
| `onError` | `(err: Error) => void` | - | Error handling callback |
| `onDebug` | `(entry: Record<string, any>) => void` | - | Debug callback for inspecting log entries before they are sent |
| `enabled` | `boolean` | `true` | Whether the transport is enabled |
| `level` | `"trace" \| "debug" \| "info" \| "warn" \| "error" \| "fatal"` | `"trace"` | Minimum log level to process. Logs below this level will be filtered out |

## Features

### Custom Payload Templates

The transport requires you to provide a `payloadTemplate` function that transforms your log data into a string format expected by your HTTP endpoint:

```typescript
// Simple JSON format
payloadTemplate: ({ logLevel, message, data }) => 
  JSON.stringify({
    timestamp: new Date().toISOString(),
    level: logLevel,
    message,
    ...data,
  })

// Custom format for specific APIs
payloadTemplate: ({ logLevel, message, data }) => 
  JSON.stringify({
    event_type: "log_entry",
    severity: logLevel.toUpperCase(),
    text: message,
    service_name: "my-app",
    environment: process.env.NODE_ENV,
    ...data,
  })

// Plain text format
payloadTemplate: ({ logLevel, message, data }) => 
  `[${logLevel.toUpperCase()}] ${message} ${data ? JSON.stringify(data) : ''}`

// XML format
payloadTemplate: ({ logLevel, message, data }) => 
  `<log level="${logLevel}" timestamp="${new Date().toISOString()}">
    <message>${message}</message>
    ${data ? `<metadata>${JSON.stringify(data)}</metadata>` : ''}
  </log>`
```

### Content Type Configuration

The transport provides separate content type configuration for single and batch requests:

```typescript
new HttpTransport({
  url: "https://api.example.com/logs",
  payloadTemplate: ({ logLevel, message, data }) => 
    JSON.stringify({
      level: logLevel,
      message,
      metadata: data,
    }),
  contentType: "application/json", // For single log requests
  batchContentType: "application/x-ndjson", // For batch requests
})
```

**Important**: User-specified headers take precedence over the `contentType` and `batchContentType` parameters. If you include `"content-type"` in your `headers` object or function, it will override both parameters:

```typescript
// This will use "application/xml" for both single and batch requests
new HttpTransport({
  url: "https://api.example.com/logs",
  headers: {
    "content-type": "application/xml", // Takes precedence
  },
  contentType: "application/json", // Ignored
  batchContentType: "application/x-ndjson", // Ignored
  payloadTemplate: ({ logLevel, message, data }) => 
    JSON.stringify({
      level: logLevel,
      message,
      metadata: data,
    }),
})
```

**See also**: [Content Type Configuration for Non-JSON Payloads](#content-type-configuration-for-non-json-payloads) for examples of configuring content types for different payload formats.

### Content Type Configuration for Non-JSON Payloads

When using non-JSON payload formats, make sure to configure the appropriate content types:

```typescript
// Plain text format
new HttpTransport({
  url: "https://api.example.com/logs",
  contentType: "text/plain", // For single requests
  batchContentType: "text/plain", // For batch requests
  payloadTemplate: ({ logLevel, message, data }) => 
    `[${logLevel.toUpperCase()}] ${message} ${data ? JSON.stringify(data) : ''}`,
})

// XML format
new HttpTransport({
  url: "https://api.example.com/logs",
  contentType: "application/xml", // For single requests
  batchContentType: "application/xml", // For batch requests
  payloadTemplate: ({ logLevel, message, data }) => 
    `<log level="${logLevel}" timestamp="${new Date().toISOString()}">
      <message>${message}</message>
      ${data ? `<metadata>${JSON.stringify(data)}</metadata>` : ''}
    </log>`,
})

// Newline-delimited JSON (NDJSON) for batch processing
new HttpTransport({
  url: "https://api.example.com/logs",
  contentType: "application/json", // For single requests
  batchContentType: "application/x-ndjson", // For batch requests
  payloadTemplate: ({ logLevel, message, data }) => 
    JSON.stringify({
      level: logLevel,
      message,
      metadata: data,
    }),
})
```

**Note**: If you specify `"content-type"` in your `headers` object or function, it will override both `contentType` and `batchContentType` parameters.

### Next.js Edge Runtime

When using the HTTP transport with Next.js Edge Runtime, you need to enable compatibility mode:

```typescript
// Next.js Edge Runtime configuration
new HttpTransport({
  url: "https://api.example.com/logs",
  payloadTemplate: ({ logLevel, message, data }) => 
    JSON.stringify({
      level: logLevel,
      message,
      metadata: data,
    }),
  enableNextJsEdgeCompat: true, // Required for Edge Runtime
  compression: false, // Compression is not available in Edge Runtime
})
```

**Important Edge Runtime Limitations:**
- **TextEncoder is disabled**: The transport automatically uses `Buffer.byteLength()` for size calculations
- **Compression is disabled**: Gzip compression is not available in Edge Runtime
- **Automatic detection**: Falls back to Edge-compatible methods when TextEncoder is not available

**Example for Next.js API Route:**
```typescript
// app/api/logs/route.ts
import { LogLayer } from 'loglayer'
import { HttpTransport } from "@loglayer/transport-http"
import { serializeError } from "serialize-error";

// This allows you to use compression and alternative size comparison if not running on edge
const isServer = typeof window === 'undefined'

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: new HttpTransport({
    url: "https://your-logging-service.com/logs",
    headers: {
      "Authorization": `Bearer ${process.env.LOGGING_API_KEY}`,
    },
    payloadTemplate: ({ logLevel, message, data }) => 
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: logLevel,
        message,
        metadata: data,
        service: "my-nextjs-app",
        environment: process.env.NODE_ENV,
      }),
    enableNextJsEdgeCompat: isServer, // Required for Edge Runtime
    enableBatchSend: false, // Recommended for Edge Runtime (no background processing)
    maxRetries: 2, // Lower retry count for Edge Runtime
    retryDelay: 500, // Faster retry for Edge Runtime
    onError: (err) => {
      // Log errors to console in Edge Runtime
      console.error('HTTP transport error:', err.message);
    },
  })
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    log.info("API request received", { body })
    return Response.json({ success: true })
  } catch (error) {
    log.withError(error as Error).error("API request failed")
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
```

**Edge Runtime Best Practices:**
1. **Disable batching**: Set `enableBatchSend: false` to avoid background processing
2. **Lower retry counts**: Use fewer retries since Edge Runtime has time limits
3. **Faster retries**: Use shorter retry delays
4. **Error handling**: Always provide an `onError` callback
5. **Size limits**: Be conservative with `maxLogSize` and `maxPayloadSize`

### Dynamic Headers

You can provide headers as either a static object or a function that returns headers dynamically:

```typescript
// Static headers
headers: {
  "Authorization": "Bearer YOUR_API_KEY",
  "Content-Type": "application/json",
  "X-Service-Name": "my-app"
}

// Dynamic headers
headers: () => ({
  "Authorization": `Bearer ${getApiKey()}`,
  "Content-Type": "application/json",
  "X-Request-ID": generateRequestId(),
  "X-Timestamp": new Date().toISOString()
})
```

### Batching

The transport supports batching to improve performance and reduce HTTP requests:

```typescript
new HttpTransport({
  url: "https://api.example.com/logs",
  payloadTemplate: ({ logLevel, message, data }) => 
    JSON.stringify({
      level: logLevel,
      message,
      metadata: data,
    }),
  enableBatchSend: true, // Enable batching (default)
  batchSize: 50, // Send when 50 logs are queued
  batchSendTimeout: 3000, // Or send after 3 seconds
  batchSendDelimiter: "\n", // Separate entries with newlines
})
```

When batching is enabled:
- Logs are queued until `batchSize` is reached OR `batchSendTimeout` expires
- Multiple log entries are joined with the `batchSendDelimiter`
- Each entry is already a string from the payloadTemplate
- **Payload size tracking**: The transport keeps a running tally of uncompressed payload size
- **Automatic sending**: If adding a new log entry would exceed 90% of `maxPayloadSize`, the batch is sent immediately

### Log Size Validation

The transport validates individual log entry sizes to prevent oversized payloads:

```typescript
new HttpTransport({
  url: "https://api.example.com/logs",
  payloadTemplate: ({ logLevel, message, data }) => 
    JSON.stringify({
      level: logLevel,
      message,
      metadata: data,
    }),
  maxLogSize: 2097152, // 2MB limit
  onError: (err) => {
    if (err.name === "LogSizeError") {
      console.error("Log entry too large:", err.message);
      console.log("Log entry:", err.logEntry);
      console.log("Size:", err.size, "bytes");
      console.log("Limit:", err.limit, "bytes");
    }
  }
})
```

When a log entry exceeds `maxLogSize`:
- The entry is not sent
- A `LogSizeError` is passed to the `onError` callback
- The error includes the log entry, actual size, and size limit

### Compression

Enable gzip compression to reduce bandwidth usage:

```typescript
new HttpTransport({
  url: "https://api.example.com/logs",
  payloadTemplate: ({ logLevel, message, data }) => 
    JSON.stringify({
      level: logLevel,
      message,
      metadata: data,
    }),
  compression: true, // Enable gzip compression
})
```

When compression is enabled:
- The `Content-Encoding: gzip` header is automatically added
- Payload is compressed using the CompressionStream API (browsers) or zlib (Node.js)
- Falls back to uncompressed if compression fails

### Retry Logic

The transport includes retry logic with exponential backoff:

```typescript
new HttpTransport({
  url: "https://api.example.com/logs",
  payloadTemplate: ({ logLevel, message, data }) => 
    JSON.stringify({
      level: logLevel,
      message,
      metadata: data,
    }),
  maxRetries: 5, // Retry up to 5 times
  retryDelay: 2000, // Start with 2 second delay
})
```

The actual delay between retries is calculated using:
```
delay = baseDelay * (2 ^ attemptNumber) + random(0-200)ms
```

### Rate Limiting

The transport handles rate limiting (HTTP 429 responses):

```typescript
new HttpTransport({
  url: "https://api.example.com/logs",
  payloadTemplate: ({ logLevel, message, data }) => 
    JSON.stringify({
      level: logLevel,
      message,
      metadata: data,
    }),
  respectRateLimit: true, // Wait for Retry-After header (default)
  // or
  respectRateLimit: false, // Fail immediately on rate limit
})
```

When `respectRateLimit` is enabled:
- Waits for the duration specified in the `Retry-After` header
- Uses the `retryDelay` value if no header is present
- Rate limit retries don't count against `maxRetries`

### Error Handling

The transport provides detailed error information through the `onError`

### Implementation Example

- [VictoriaLogs Transport](victoria-logs.md) wraps around this transport to add support for [VictoriaLogs](https://victoriametrics.com/products/victorialogs/) using their [JSON Stream API](https://docs.victoriametrics.com/victorialogs/data-ingestion/#json-stream-api).
