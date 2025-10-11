---
title: Deno Integration
description: Using LogLayer with Deno runtime
---

# Deno Integration

LogLayer has support for the [Deno](https://deno.land/) runtime.

::: warning Deno Compatibility
Not all transports and plugins are compatible with Deno. Some items that rely on Node.js-specific APIs (like file system operations or native modules) may not work in Deno. Items that have been tested with Deno are marked with a <Badge type="info" text="Deno" /> badge.

Not all items have been tested with Deno; a lack of a badge
does not imply a lack of support. Please let us know if you do find a transport / plugin is supported.
:::

## Installation

### Using npm: Specifier

The recommended way to use LogLayer with Deno is through npm: specifiers:

```typescript
import { LogLayer, ConsoleTransport } from "npm:loglayer@latest";
import { getSimplePrettyTerminal } from "npm:@loglayer/transport-simple-pretty-terminal@latest";
```

### Using Import Maps

For better dependency management, use an import map:

**deno.json**
```json
{
  "imports": {
    "loglayer": "npm:loglayer@latest",
    "@loglayer/transport-simple-pretty-terminal": "npm:@loglayer/transport-simple-pretty-terminal@latest"
  }
}
```

**main.ts**
```typescript
import { LogLayer, ConsoleTransport } from "loglayer";
import { getSimplePrettyTerminal } from "@loglayer/transport-simple-pretty-terminal";
```

## Basic Setup with Console Transport

The [Console Transport](/transports/console) is built into LogLayer and works perfectly in Deno:

```typescript
import { LogLayer, ConsoleTransport } from "npm:loglayer@latest";

const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  })
});

log.info("Hello from Deno with LogLayer!");
```

## Enhanced Setup with Simple Pretty Terminal

For more visually appealing output, use the [Simple Pretty Terminal Transport](/transports/simple-pretty-terminal):

```typescript
import { LogLayer } from "npm:loglayer@latest";
import { getSimplePrettyTerminal } from "npm:@loglayer/transport-simple-pretty-terminal@latest";

const log = new LogLayer({
  transport: getSimplePrettyTerminal({
    runtime: "node", // Use "node" for Deno
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
