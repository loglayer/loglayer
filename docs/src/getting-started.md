---
title: Get started with LogLayer
description: Learn how to install and use LogLayer in your project
---

# Getting Started

_LogLayer is designed to work seamlessly across both server-side and browser environments. However, individual transports and plugins may have specific environment requirements, which is indicated on their respective page._

## Installation

### Node.js

::: code-group

```sh [npm]
npm install loglayer
```

```sh [pnpm]
pnpm add loglayer
```

```sh [yarn]
yarn add loglayer
```

:::

### Deno

For Deno, you can use npm: specifiers or import maps:

**Using npm: specifiers:**
```typescript
import { LogLayer } from "npm:loglayer@latest";
```

**Using import maps (recommended):**
```json
// deno.json
{
  "imports": {
    "loglayer": "npm:loglayer@latest"
  }
}
```

```typescript
// main.ts
import { LogLayer } from "loglayer";
```

For detailed Deno setup and examples, see the [Deno integration guide](/example-integrations/deno).

### Bun

For Bun, you can install LogLayer using bun's package manager:

```sh
bun add loglayer
```

For detailed Bun setup and examples, see the [Bun integration guide](/example-integrations/bun).

## Basic Usage with Structured Transport

The simplest way to get started is to use the built-in [Structured Transport](/transports/structured-logger), which outputs structured log objects with `level`, `time`, and `msg` fields using the standard `console` object:

```typescript
import { LogLayer, StructuredTransport } from 'loglayer'

const log = new LogLayer({
  transport: new StructuredTransport({
    logger: console,
  }),
  contextFieldName: 'context',
  metadataFieldName: 'metadata',
})

// Basic logging
log.info('Hello world!')
// { level: 'info', time: '2025-01-01T00:00:00.000Z', msg: 'Hello world!' }

// Logging with metadata
log.withMetadata({ user: 'john' }).info('User logged in')
// { level: 'info', time: '...', msg: 'User logged in', metadata: { user: 'john' } }

// Logging with context (persists across log calls)
log.withContext({ requestId: '123' })
log.info('Processing request')
// { level: 'info', time: '...', msg: 'Processing request', context: { requestId: '123' } }

// Logging errors
log.withError(new Error('Something went wrong')).error('Failed to process request')
```

::: tip Simple console logging
If you prefer unstructured console output, use the [Console Transport](/transports/console) instead.
:::

## Using an Error Serializer

When logging errors, JavaScript `Error` objects don't serialize to JSON well by default. We recommend using an error serializer like `serialize-error` to ensure error details are properly captured:

::: code-group

```sh [npm]
npm install serialize-error
```

```sh [pnpm]
pnpm add serialize-error
```

```sh [yarn]
yarn add serialize-error
```

:::

```typescript
import { LogLayer, StructuredTransport } from 'loglayer'
import { serializeError } from 'serialize-error'

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: new StructuredTransport({
    logger: console,
  }),
})

// Error details will be properly serialized
log.withError(new Error('Something went wrong')).error('Failed to process request')
```

For more error handling options, see the [Error Handling documentation](/logging-api/error-handling#error-serialization).

## Next steps

- Check out the [Cheat Sheet](/cheatsheet) for a quick reference of the most common APIs.
- Optionally [configure](/configuration) LogLayer to further customize logging behavior.
- See the [Structured Transport](/transports/structured-logger) or [Console Transport](/transports/console) documentation for more configuration options.
- See the [Transports](/transports/) section for more ways to ship logs to different destinations.
