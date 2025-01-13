# Sumo Logic Transport

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-sumo-logic)](https://www.npmjs.com/package/@loglayer/transport-sumo-logic)

[Transport Source](https://github.com/loglayer/loglayer/tree/master/packages/transports/sumo-logic)

The Sumo Logic transport sends logs to [Sumo Logic](https://www.sumologic.com/) via their [HTTP Source](https://help.sumologic.com/docs/send-data/hosted-collectors/http-source/logs-metrics/upload-logs/).

## Installation

Using npm:
```bash
npm install @loglayer/transport-sumo-logic serialize-error
```

Using yarn:
```bash
yarn add @loglayer/transport-sumo-logic serialize-error
```

Using pnpm:
```bash
pnpm add @loglayer/transport-sumo-logic serialize-error
```

## Usage

First, you'll need to [create an HTTP Source in Sumo Logic](https://help.sumologic.com/docs/send-data/hosted-collectors/http-source/logs-metrics/#configure-an-httplogs-and-metrics-source). Once you have the URL, you can configure the transport:

```typescript
import { LogLayer } from "loglayer";
import { SumoLogicTransport } from "@loglayer/transport-sumo-logic";
import { serializeError } from "serialize-error";

const transport = new SumoLogicTransport({
  url: "YOUR_SUMO_LOGIC_HTTP_SOURCE_URL",
});

const logger = new LogLayer({
  errorSerializer: serializeError,  // Important for proper error serialization
  transport
});

logger.info("Hello from LogLayer!");
```

## Configuration Options

### Required Options

| Option | Type | Description |
|--------|------|-------------|
| `url` | `string` | The URL of your HTTP Source endpoint |

### Optional Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `useCompression` | `boolean` | `true` | Whether to use gzip compression |
| `sourceCategory` | `string` | - | Source category to assign to the logs |
| `sourceName` | `string` | - | Source name to assign to the logs |
| `sourceHost` | `string` | - | Source host to assign to the logs |
| `fields` | `Record<string, string>` | `{}` | Fields to be added as X-Sumo-Fields header |
| `headers` | `Record<string, string>` | `{}` | Custom headers to be added to the request |
| `messageField` | `string` | `"message"` | Field name to use for the log message |
| `onError` | `(error: Error \| string) => void` | - | Callback for error handling |
| `level` | `"trace" \| "debug" \| "info" \| "warn" \| "error" \| "fatal"` | `"trace"` | Minimum log level to process. Logs below this level will be filtered out |

### Retry Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `retryConfig.maxRetries` | `number` | `3` | Maximum number of retry attempts |
| `retryConfig.initialRetryMs` | `number` | `1000` | Initial retry delay in milliseconds |

## Examples

### With Source Information

```typescript
const transport = new SumoLogicTransport({
  url: "YOUR_SUMO_LOGIC_HTTP_SOURCE_URL",
  sourceCategory: "backend",
  sourceName: "api-server",
  sourceHost: "prod-api-1"
});
```

### With Custom Fields

```typescript
const transport = new SumoLogicTransport({
  url: "YOUR_SUMO_LOGIC_HTTP_SOURCE_URL",
  fields: {
    environment: "production",
    team: "platform",
    region: "us-west-2"
  }
});
```

### With Custom Message Field

```typescript
const transport = new SumoLogicTransport({
  url: "YOUR_SUMO_LOGIC_HTTP_SOURCE_URL",
  messageField: "log_message" // Messages will be sent as { log_message: "..." }
});
```

### With Retry Configuration

```typescript
const transport = new SumoLogicTransport({
  url: "YOUR_SUMO_LOGIC_HTTP_SOURCE_URL",
  retryConfig: {
    maxRetries: 5,
    initialRetryMs: 500
  }
});
```

### With Custom Headers

```typescript
const transport = new SumoLogicTransport({
  url: "YOUR_SUMO_LOGIC_HTTP_SOURCE_URL",
  headers: {
    "X-Custom-Header": "value"
  }
});
```

## Log Format

The transport sends logs to Sumo Logic in the following format:

```typescript
{
  message?: string;      // Present only if there are string messages
  severity: string;      // The log level (e.g., "INFO", "ERROR")
  timestamp: string;     // ISO 8601 timestamp
  ...metadata           // Any additional metadata passed to the logger
}
```

### Custom Fields

Custom fields specified in the `fields` option are sent as an `X-Sumo-Fields` header in the format:
```
X-Sumo-Fields: key1=value1,key2=value2
```

This allows for better indexing and searching in Sumo Logic.

## Size Limits

The transport enforces Sumo Logic's 1MB payload size limit. If a payload exceeds this limit:
1. The transport will not send the log
2. The `onError` callback will be called with an error message
3. The error will include the actual size that exceeded the limit

This applies to both raw and compressed payloads. 