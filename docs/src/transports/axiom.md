---
title: Axiom Transport for LogLayer
description: Send logs to Axiom cloud logging platform with the LogLayer logging library
---

# Axiom Transport <Badge type="tip" text="Server" />

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-axiom)](https://www.npmjs.com/package/@loglayer/transport-axiom)

[Transport Source](https://github.com/loglayer/loglayer/blob/master/packages/transports/axiom)

The Axiom transport allows you to send logs to [Axiom.co](https://axiom.co), a cloud-native logging and observability platform.
It uses the [Axiom JavaScript SDK](https://github.com/axiomhq/axiom-js).

## Installation

::: code-group

```sh [npm]
npm install @loglayer/transport-axiom @axiomhq/js serialize-error loglayer
```

```sh [pnpm]
pnpm add @loglayer/transport-axiom @axiomhq/js serialize-error loglayer
```

```sh [yarn]
yarn add @loglayer/transport-axiom @axiomhq/js serialize-error loglayer
```

:::

## Usage

```typescript
import { LogLayer } from "loglayer";
import { AxiomTransport } from "@loglayer/transport-axiom";
import { serializeError } from "serialize-error";
import { Axiom } from "@axiomhq/js";

// Create the Axiom client
const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN,
  // Optional: other Axiom client options
  // orgId: 'your-org-id',
  // url: 'https://cloud.axiom.co',
});

// Create the LogLayer instance with AxiomTransport
const logger = new LogLayer({
  errorSerializer: serializeError,
  transport: new AxiomTransport({
    logger: axiom,
    dataset: "your-dataset",
  }),
});

// Start logging
logger.info("Hello from LogLayer!");
```

## Configuration Options

### Required Parameters

| Name | Type | Description |
|------|------|-------------|
| `logger` | `Axiom` | Instance of the Axiom client |
| `dataset` | `string` | The Axiom dataset name to send logs to |

### Optional Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `fieldNames` | `AxiomFieldNames` | - | Custom field names for log entries. See [Field Names](#field-names) |
| `timestampFn` | `() => string \| number` | `() => new Date().toISOString()` | Function to generate timestamps |
| `onError` | `(error: Error) => void` | - | Callback for error handling |
| `level` | `"trace" \| "debug" \| "info" \| "warn" \| "error" \| "fatal"` | `"trace"` | Minimum log level to process |
| `levelMap` | `AxiomLevelMap` | - | Custom mapping for log levels |
| `enabled` | `boolean` | `true` | If false, the transport will not send logs to the logger |
| `consoleDebug` | `boolean` | `false` | If true, the transport will log to the console for debugging purposes |
| `id` | `string` | - | A user-defined identifier for the transport |

### Field Names

The `fieldNames` object allows you to customize the field names in the log entry JSON:

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `level` | `string` | Field name for the log level | `"level"` |
| `message` | `string` | Field name for the log message | `"message"` |
| `timestamp` | `string` | Field name for the timestamp | `"timestamp"` |

### Level Mapping

The `levelMap` object allows you to map each log level to either a string or number:

| Level | Type | Example (Numeric) | Example (String) |
|-------|------|------------------|------------------|
| `debug` | `string \| number` | 20 | `"DEBUG"` |
| `error` | `string \| number` | 50 | `"ERROR"` |
| `fatal` | `string \| number` | 60 | `"FATAL"` |
| `info` | `string \| number` | 30 | `"INFO"` |
| `trace` | `string \| number` | 10 | `"TRACE"` |
| `warn` | `string \| number` | 40 | `"WARNING"` |

## Log Format

Each log entry is written as a JSON object with the following format:

```json5
{
  "level": "info",
  "message": "Log message",
  "timestamp": "2024-01-17T12:34:56.789Z",
  // metadata / context / error data will depend on your LogLayer configuration
  "userId": "123",
  "requestId": "abc-123"
}
```

## Log Level Filtering

You can set a minimum log level to filter out less important logs:

```typescript
const logger = new LogLayer({
  transport: new AxiomTransport({
    logger: axiom,
    dataset: "your-dataset",
    level: "warn", // Only process warn, error, and fatal logs
  }),
});

logger.debug("This won't be sent"); // Filtered out
logger.info("This won't be sent");  // Filtered out
logger.warn("This will be sent");   // Included
logger.error("This will be sent");  // Included
```

## Error Handling

The transport provides error handling through the `onError` callback:

```typescript
const logger = new LogLayer({
  transport: new AxiomTransport({
    logger: axiom,
    dataset: "your-dataset",
    onError: (error) => {
      // Custom error handling
      console.error("Failed to send log to Axiom:", error);
    },
  }),
});
```

## Changelog

View the changelog [here](./changelogs/axiom-changelog.md).
