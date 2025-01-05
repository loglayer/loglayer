# New Relic Transport

The New Relic transport allows you to send logs directly to New Relic's [Log API](https://docs.newrelic.com/docs/logs/log-api/introduction-log-api/). It provides robust features including compression, retry logic, rate limiting support, and validation of New Relic's API constraints.

[Transport Source](https://github.com/loglayer/loglayer/tree/master/packages/transports/new-relic)

## Installation

::: code-group
```bash [npm]
npm install loglayer @loglayer/transport-new-relic serialize-error
```

```bash [pnpm]
pnpm add loglayer @loglayer/transport-new-relic serialize-error
```

```bash [yarn]
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
      useCompression: true, // optional, defaults to true
      maxRetries: 3, // optional, defaults to 3
      retryDelay: 1000, // optional, base delay in ms, defaults to 1000
      respectRateLimit: true, // optional, defaults to true
      onError: (err) => {
         console.error('Failed to send logs to New Relic:', err);
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

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Whether the transport is enabled |
| `apiKey` | `string` | - | **Required.** Your New Relic API key |
| `endpoint` | `string` | `"https://log-api.newrelic.com/log/v1"` | The New Relic Log API endpoint |
| `useCompression` | `boolean` | `true` | Whether to use gzip compression |
| `maxRetries` | `number` | `3` | Maximum number of retry attempts |
| `retryDelay` | `number` | `1000` | Base delay between retries (ms) |
| `respectRateLimit` | `boolean` | `true` | Whether to respect rate limiting |
| `onError` | `(err: Error) => void` | - | Error handling callback |
| `onDebug` | `(entry: Record<string, any>) => void` | - | Debug callback for inspecting log entries |

## Features

### Compression

The transport uses gzip compression by default to reduce bandwidth usage. You can disable this if needed:

```typescript
new NewRelicTransport({
  apiKey: "YOUR_API_KEY",
  useCompression: false
})
```

### Retry Logic

The transport includes a sophisticated retry mechanism with exponential backoff and jitter:

```typescript
new NewRelicTransport({
  apiKey: "YOUR_API_KEY",
  maxRetries: 5, // Increase max retries
  retryDelay: 2000 // Increase base delay to 2 seconds
})
```

The actual delay between retries is calculated using:
```
delay = baseDelay * (2 ^ attemptNumber) + random(0-200)ms
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
   - Uses 60 seconds as default wait time if no header is present

2. **Ignore Rate Limits**
   ```typescript
   new NewRelicTransport({
     apiKey: "YOUR_API_KEY",
     respectRateLimit: false,
     onError: (err) => {
       if (err.name === "RateLimitError") {
         // Handle rate limit error
       }
     }
   })
   ```
   - Fails immediately when rate limited
   - Calls `onError` with a `RateLimitError`

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
- Maximum payload size of 1MB (before and after compression)
- Maximum of 255 attributes per log entry
- Maximum attribute name length of 255 characters
- Automatic truncation of attribute values longer than 4094 characters

### Error Handling

The transport provides detailed error information through the `onError` callback:

```typescript
new NewRelicTransport({
  apiKey: "YOUR_API_KEY",
  onError: (err) => {
    switch (err.name) {
      case "ValidationError":
        // Handle validation errors (payload size, attribute limits)
        break;
      case "RateLimitError":
        // Handle rate limiting errors
        const rateLimitErr = err as RateLimitError;
        console.log(`Rate limited. Retry after: ${rateLimitErr.retryAfter}s`);
        break;
      default:
        // Handle other errors (network, API errors)
        console.error("Failed to send logs:", err.message);
    }
  }
})
```

### Debug Callback

The transport includes a debug callback that allows you to inspect log entries before they are sent to New Relic:

```typescript
new NewRelicTransport({
  apiKey: "YOUR_API_KEY",
  onDebug: (entry) => {
    // Log the entry being sent
    console.log('Sending log entry:', JSON.stringify(entry, null, 2));
    
    // Or collect metrics
    collectMetrics(entry);
    
    // Or verify log structure
    validateCustomRules(entry);
  }
})
```

The debug callback is useful for:
- Development and testing
- Monitoring log structure and content
- Verifying validation and transformations
- Custom metrics collection
- Debugging integration issues

The callback receives the validated entry object after all transformations (like attribute truncation) have been applied, but before compression and sending.

## Best Practices

1. **Error Handling**: Always provide an `onError` callback to handle failures gracefully.

2. **Compression**: Keep compression enabled unless you have a specific reason to disable it.

3. **Rate Limiting**: Use the default rate limit handling unless you have a custom rate limiting strategy.

4. **Retry Configuration**: Adjust `maxRetries` and `retryDelay` based on your application's needs:
   - Increase for critical logs that must be delivered
   - Decrease for high-volume, less critical logs

5. **Validation**: Be aware of the attribute limits when adding metadata to avoid validation errors.

## TypeScript Support

The transport is written in TypeScript and provides full type definitions:

```typescript
import type { NewRelicTransportConfig } from "@loglayer/transport-new-relic"

const config: NewRelicTransportConfig = {
  apiKey: "YOUR_API_KEY",
  // TypeScript will enforce correct options
}
``` 