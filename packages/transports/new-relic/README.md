# New Relic Transport for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-new-relic)](https://www.npmjs.com/package/@loglayer/transport-new-relic)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Ftransport-new-relic)](https://www.npmjs.com/package/@loglayer/transport-new-relic)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

The New Relic transport for [LogLayer](https://loglayer.dev).

Ships logs to New Relic using their [Log API](https://docs.newrelic.com/docs/logs/log-api/introduction-log-api/). Features include:
- Automatic gzip compression (configurable)
- Retry mechanism with exponential backoff
- Rate limiting support with configurable behavior
- Validation of New Relic's API constraints
- Error handling callback
- Configurable endpoints for different regions

## Installation

```bash
npm install loglayer @loglayer/transport-new-relic serialize-error
```

## Usage

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

## Configuration

```typescript
interface NewRelicTransportConfig {
  /**
   * Whether the transport is enabled. Default is true.
   */
  enabled?: boolean;
  /**
   * The New Relic API key
   */
  apiKey: string;
  /**
   * The New Relic Log API endpoint
   * @default https://log-api.newrelic.com/log/v1
   */
  endpoint?: string;
  /**
   * Optional callback for error handling
   */
  onError?: (err: Error) => void;
  /**
   * Optional callback for debugging log entries
   * Called with the validated entry before it is sent
   */
  onDebug?: (entry: Record<string, any>) => void;
  /**
   * Whether to use gzip compression
   * @default true
   */
  useCompression?: boolean;
  /**
   * Number of retry attempts before giving up
   * @default 3
   */
  maxRetries?: number;
  /**
   * Base delay between retries in milliseconds. 
   * The actual delay will use exponential backoff with jitter.
   * @default 1000
   */
  retryDelay?: number;
  /**
   * Whether to respect rate limiting by waiting when a 429 response is received
   * @default true
   */
  respectRateLimit?: boolean;
}
```

## Documentation

For more details, visit [https://loglayer.dev/transports/new-relic](https://loglayer.dev/transports/new-relic) 