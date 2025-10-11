---
title: Get started with LogLayer
description: Learn how to install and use LogLayer in your project
---

# Getting Started

_LogLayer is designed to work seamlessly across both server-side and browser environments. However, individual transports and plugins may have specific environment requirements, which is indicated on their respective page._

## Installation

### Node.js / npm

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

::: warning Deno Compatibility
Not all transports and plugins are compatible with Deno. Some transports that rely on Node.js-specific APIs (like file system operations or native modules) may not work in Deno. Transports that have been tested with Deno are marked with a <Badge type="info" text="Deno" /> badge.

Not all transports / plugins have been tested with Deno; a lack of a badge
does not imply a lack of support. Please let us know if you do find a
transport / plugin is supported.
:::

### Bun

For Bun, you can install LogLayer using bun's package manager:

```sh
bun add loglayer
```

```typescript
import { LogLayer } from "loglayer";
```

::: warning Bun Compatibility
Not all transports and plugins are compatible with Bun. Some transports that rely on Node.js-specific APIs (like file system operations or native modules) may not work in Bun. Transports that have been tested with Bun are marked with a <Badge type="info" text="Bun" /> badge.

Not all transports / plugins have been tested with Bun; a lack of a badge
does not imply a lack of support. Please let us know if you do find a
transport / plugin is supported.
:::

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

## Next steps

- Optionally [configure](/configuration) LogLayer to further customize logging behavior.
- See the [Console Transport](/transports/console) documentation for more configuration options.
- Start exploring the [Logging API](/logging-api/basic-logging) section for more advanced logging features.
- See the [Transports](/transports/) section for more ways to ship logs to different destinations.
