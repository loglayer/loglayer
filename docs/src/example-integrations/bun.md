---
title: Bun Integration
description: Using LogLayer with Bun runtime
---

# Bun Integration

LogLayer has support for the [Bun](https://bun.sh/) runtime.

::: warning Bun Compatibility
Not all transports and plugins are compatible with Bun. Some transports that rely on Node.js-specific APIs (like file system operations or native modules) may not work in Bun. Transports that have been tested with Bun are marked with a <Badge type="info" text="Bun" /> badge.

Not all transports / plugins have been tested with Bun; a lack of a badge
does not imply a lack of support. Please let us know if you do find a
transport / plugin is supported.
:::

## Installation

### Using npm packages

Bun has excellent npm compatibility, so you can install LogLayer packages using bun:

```bash
bun add loglayer
bun add @loglayer/transport-simple-pretty-terminal
```

### Import statements

```typescript
import { LogLayer, ConsoleTransport } from "loglayer";
import { getSimplePrettyTerminal } from "@loglayer/transport-simple-pretty-terminal";
```

## Basic Setup with Console Transport

The [Console Transport](/transports/console) is built into LogLayer and works perfectly in Bun:

```typescript
import { LogLayer, ConsoleTransport } from "loglayer";

const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  })
});

log.info("Hello from Bun with LogLayer!");
```

## Enhanced Setup with Simple Pretty Terminal

For more visually appealing output, use the [Simple Pretty Terminal Transport](/transports/simple-pretty-terminal):

```typescript
import { LogLayer } from "loglayer";
import { getSimplePrettyTerminal } from "@loglayer/transport-simple-pretty-terminal";

const log = new LogLayer({
  transport: getSimplePrettyTerminal({
    runtime: "bun",
    viewMode: "inline"
  })
});

// Pretty formatted logging
log.info("This is a pretty formatted log message");
log.withMetadata({ 
  userId: 12345, 
  action: "login",
  timestamp: new Date().toISOString()
}).info("User performed action");
```
