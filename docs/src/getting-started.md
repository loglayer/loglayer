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

## Basic Usage with Console Transport <Badge type="warning" text="Browser" /> <Badge type="tip" text="Server" />

The simplest way to get started is to use the built-in console transport, which uses the standard `console` object for logging:

```typescript
import { LogLayer, ConsoleTransport } from 'loglayer'

const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
  }),
})

// Basic logging
log.info('Hello world!')

// Logging with metadata
log.withMetadata({ user: 'john' }).info('User logged in')

// Logging with context (persists across log calls)
log.withContext({ requestId: '123' })
log.info('Processing request') // Will include requestId

// Logging errors
log.withError(new Error('Something went wrong')).error('Failed to process request')
```

::: tip Structured logging
If you want to use the Console Transport as a structured logger (JSON output), see the [Console Transport structured logging section](/transports/console#structured-logging).
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
import { LogLayer, ConsoleTransport } from 'loglayer'
import { serializeError } from 'serialize-error'

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: new ConsoleTransport({
    logger: console,
  }),
})

// Error details will be properly serialized
log.withError(new Error('Something went wrong')).error('Failed to process request')
```

For more error handling options, see the [Error Handling documentation](/logging-api/error-handling#error-serialization).

## Next steps

- Optionally [configure](/configuration) LogLayer to further customize logging behavior.
- See the [Console Transport](/transports/console) documentation for more configuration options.
- Start exploring the [Logging API](/logging-api/basic-logging) section for more advanced logging features.
- See the [Transports](/transports/) section for more ways to ship logs to different destinations.
