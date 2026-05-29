# Wide Events Mixin <Badge type="warning" text="Browser" /> <Badge type="tip" text="Server" /> <Badge type="info" text="Deno" /> <Badge type="info" text="Bun" />

[![npm version](https://img.shields.io/npm/v/@loglayer/mixin-wide-events.svg)](https://www.npmjs.com/package/@loglayer/mixin-wide-events)

[![Source](https://img.shields.io/badge/source-GitHub-blue)](https://github.com/loglayer/loglayer/tree/master/packages/mixins/wide-events)

The Wide Events Mixin adds functionality for creating comprehensive, self-contained log entries that capture an entire operation's context and data in a single emission. This pattern is sometimes called "canonical log lines" or "wide events."

For a complete Express example, see the [Wide Events Logging guide](/guides/wide-events).

## Installation

::: code-group

```bash [npm]
npm install @loglayer/mixin-wide-events
```

```bash [pnpm]
pnpm add @loglayer/mixin-wide-events
```

```bash [yarn]
yarn add @loglayer/mixin-wide-events
```

```bash [bun]
bun add @loglayer/mixin-wide-events
```

```bash [deno]
deno add npm:@loglayer/mixin-wide-events
```

:::

## TypeScript Setup

To use this mixin with TypeScript, you must register the types by adding the mixin package to your `tsconfig.json` includes:

```json
{
  "include": [
    "./node_modules/@loglayer/mixin-wide-events"
  ]
}
```

This ensures TypeScript recognizes the mixin methods on your LogLayer instances.

## Why Wide Events?

Wide events solve a common observability problem: when you have distributed systems with many log entries, it can be difficult to correlate all the data from a single operation. Wide events capture everything in one place, making it easy to:

- See the complete context of an operation at a glance
- Correlate all data without joining multiple log entries
- Simplify log analysis and debugging

For more context, see [Why Logging Sucks](https://loggingsucks.com/).

## Quick Start

### 1. Create the AsyncLocalStorage instance

```typescript
// async-local-storage.ts
import { AsyncLocalStorage } from "async_hooks";
import type { ILogLayer } from "loglayer";

export const asyncLocalStorage = new AsyncLocalStorage<{
  logger: ILogLayer;
}>();
```

### 2. Create a helper to get the logger

```typescript
// logger.ts
import { asyncLocalStorage } from "./async-local-storage";
import { LogLayer, StructuredTransport, useLogLayerMixin } from "loglayer";
import { createWideEventMixin } from "@loglayer/mixin-wide-events";

// Register the mixin once
useLogLayerMixin(createWideEventMixin({ asyncContext: asyncLocalStorage }));

// Create LogLayer
export const log = new LogLayer({
  transport: new StructuredTransport({ logger: console }),
});

// Helper to get logger from async context
export function getLogger() {
  return asyncLocalStorage.getStore()?.logger ?? log;
}
```

### 3. Use in your code

```typescript
getLogger().withWideEvents({ userId: "123" });
await doSomething();
getLogger().withWideEvents({ orderId: "456" });
getLogger().emitWideEvent({ message: "Order processed" });
```

## Configuration Options

### Required Parameters

| Name | Type | Description |
|------|------|-------------|
| `asyncContext` | `AsyncLocalStorage<Record<string, any>>` | An async context implementation for propagating wide event data across async boundaries. |

### Optional Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `includeContext` | `boolean` | `true` | Include data from `withContext()` calls in the emitted wide event. |
| `wideEventField` | `string` | `undefined` | Field name to nest all wide event data under. When undefined, data is flattened at root level. |
| `errorField` | `string` | `error`/`errors` | Field name for error data. `error` in single mode, `errors` in array mode. |
| `errorsAsArray` | `boolean` | `false` | When true, errors are collected as an array. Each call to `withWideEventError()` appends. |
| `sampling` | `WideEventSamplingConfig` | `undefined` | Sampling configuration to drop wide events at the configured `rate`. See [Sampling](#sampling) below. |

## API

### `createWideEventMixin(options)`

Creates a wide event mixin that can be registered with LogLayer.

```typescript
import { createWideEventMixin } from "@loglayer/mixin-wide-events";

const mixin = createWideEventMixin({
  asyncContext: new AsyncLocalStorage(),
});
```

### `withWideEvents(data)`

`(data: Record<string, any>) => this`

Accumulates data into the wide event. Call multiple times to build up the event.
Nested objects are **deep merged** - later calls merge into existing nested objects
rather than replacing them entirely.
Returns the logger for chaining.

```typescript
// Simple accumulation
logger.withWideEvents({ userId: "123" });
await doSomething();
logger.withWideEvents({ orderId: "456" });

// Nested objects are merged:
logger.withWideEvents({ user: { id: "123" } });
logger.withWideEvents({ user: { name: "Alice" } });
// Result: { user: { id: "123", name: "Alice" } }

// Or chain with other methods
log.child()
  .withContext({ requestId: "123" })
  .withWideEvents({ userId: "456" })
  .info("Processing");
```

### `getWideEvents(key?)`

`(key?: string) => Record<string, any> | any`

Retrieves the currently accumulated wide event data. Returns undefined if called
outside async context or if the key doesn't exist.

```typescript
logger.withWideEvents({ userId: "123" });
logger.withWideEvents({ orderId: "456" });

// Get all accumulated data
const data = logger.getWideEvents();
// { userId: "123", orderId: "456" }

// Get specific key
const userId = logger.getWideEvents("userId");
// "123"
```

### `clearWideEvents(key?)`

`(key?: string) => this`

Clears the accumulated wide event data. Optionally clear only a specific key.
Returns the logger for chaining.

```typescript
// Clear all data
logger.withWideEvents({ first: "data" });
logger.emitWideEvent({ message: "First" });
logger.clearWideEvents();
logger.withWideEvents({ second: "data" });
logger.emitWideEvent({ message: "Second" });

// Clear specific key
logger.withWideEvents({ user: { id: "123", name: "Alice" } });
logger.clearWideEvents("user");
// Result: user object is removed
```

### `withWideEventError(error)`

`(error: any) => this`

Captures an error for inclusion in the wide event. Serializes the error using LogLayer's [`errorSerializer`](/configuration#error-handling-configuration) (or built-in default).

By default:
- **Single error mode** (`errorsAsArray: false`): Each call replaces the previous error
- **Array mode** (`errorsAsArray: true`): Each call appends to an `errors` array

The error field defaults to `error` for single mode and `errors` for array mode.

```typescript
// Single error (replaces on subsequent calls)
try {
  await doSomething();
} catch (err) {
  logger.withWideEventError(err);
}

// Multiple errors (accumulates when errorsAsArray: true)
try {
  await step1();
} catch (err) {
  logger.withWideEventError(err);
}

try {
  await step2();
} catch (err) {
  logger.withWideEventError(err);
}

// With array mode for multiple errors
const mixin = createWideEventMixin({
  asyncContext,
  errorsAsArray: true,
});
```

### `emitWideEvent(config)`

`(config: EmitWideEventConfig) => void`

Emits the accumulated wide event as a single log entry. Use `withWideEvents()`
before calling this to add any additional data.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `message` | `string` | - | The log message for the wide event. |
| `level` | `LogLevelType` | `"info"` | The log level for the emission. |

```typescript
logger.emitWideEvent({ message: "Order processed" });

// Add final data before emitting
logger.withWideEvents({ statusCode: 200 });
logger.emitWideEvent({ message: "Request completed", level: "error" });
```

### Data Priority

When multiple sources provide the same key, the following priority order applies:

1. **`withContext()`** data (lowest priority)
2. **`withWideEvents()`** data (highest priority)

Top-level keys are overwritten by later calls. Nested objects are **deep merged**.

```typescript
// Top-level keys: later calls win
logger.withWideEvents({ key: "first" });
logger.withWideEvents({ key: "second" });
// Result: key = "second"

// Nested objects: merged together
logger.withWideEvents({ user: { id: "123" } });
logger.withWideEvents({ user: { name: "Alice" } });
// Result: { user: { id: "123", name: "Alice" } }

// Priority example
logger.withContext({ key: "from-context" });
logger.withWideEvents({ key: "from-wideEvents" });
logger.emitWideEvent({ message: "test" });
// Result: key = "from-wideEvents" (wideEvents overrides context)
```

### Interaction with `withMetadata()`

`withMetadata()` and `withWideEvents()` serve different purposes:

- **`withMetadata()`** - Adds `metadata` to an immediate log entry (not accumulated into wide events)
- **`withWideEvents()`** - Accumulates data for the final wide event emission

```typescript
// withMetadata() logs immediately with the data
logger.withMetadata({ userId: "123" }).info("User action");
// Output: { msg: "User action", userId: "123" }

// withWideEvents() accumulates for emitWideEvent()
logger.withWideEvents({ orderId: "456" });
logger.emitWideEvent({ message: "Wide event" });
// Output: { msg: "Wide event", orderId: "456" }

// They work independently and can be used together
logger.withWideEvents({ businessData: "value" })
  .withMetadata({ debug: true })
  .debug("Debug info");

logger.emitWideEvent({ message: "Complete" });
// Intermediate log: { msg: "Debug info", debug: true }
// Wide event: { msg: "Complete", businessData: "value" }
```

## Capturing Errors

Wide events and `withError()` serve different purposes:

- **`withError(err).error("msg")`** - Logs an error immediately with stack trace and error details
- **`withWideEventError(err)`** - Captures error for inclusion in the wide event

The [canonical logging pattern](https://loggingsucks.com/) recommends including error details in your wide event rather than relying on `withError()`. This keeps all operation data in one self-contained entry.

```typescript
try {
  await processOrder(orderId);
} catch (err) {
  // Immediate error log with stack trace
  logger.withError(err).error("Order processing failed");
  
  // Error for wide event
  logger.withWideEventError(err);
  
  // Don't emit yet - let the response handler emit with final status
}
```

### Configuration Options

```typescript
const mixin = createWideEventMixin({
  asyncContext,
  // Default field names: "error" (single) or "errors" (array mode)
  errorField: "error",
  // Set to true to collect multiple errors as an array
  errorsAsArray: false,
});
```

The error serializer uses LogLayer's configured [`errorSerializer`](/configuration#error-handling-configuration) if available.

### Emitting Error Wide Events

When emitting a wide event after an error, set the level appropriately:

```typescript
res.on("finish", () => {
  getLogger()
    .withWideEvents({
      duration: Date.now() - startTime,
      statusCode: res.statusCode,
      outcome: res.statusCode >= 400 ? "error" : "ok",
    })
    .emitWideEvent({
      message: "Request completed",
      level: res.statusCode >= 400 ? "error" : "info",
    });
});
```

## Sampling

Wide event sampling lets you randomly drop wide event emissions to control log volume and cost.
"error" and "fatal" default to a 100% keep `rate`, but can be overridden by
setting `perLevel` rates or using the `shouldEmit` callback.

### Evaluation Order

1. **`shouldEmit` callback** (if set): Inspects `wideData` + `level`. Returns `true` → kept, `false` → dropped. Throws → kept (fail-open). **Then** runs `rate` check too — **BOTH must pass.**
2. **`error`/`fatal` default to 100%**: Kept by default unless explicitly mapped in `perLevel`.
3. **`per_level` strategy**: Checks `perLevel` map → unmapped → `rate`.
4. **`default` strategy**: Uses `rate` for all non-error/fatal levels.

### Quick Start

```typescript
// Keep ~10% of wide events (errors and fatals default to 100%)
const mixin = createWideEventMixin({
  asyncContext,
  sampling: {
    strategy: "default",
    rate: 0.1,
  },
});
```

### Sampling Strategies

#### `default` — single `rate`

A single `rate` applies to all non-error/fatal levels.

```typescript
const mixin = createWideEventMixin({
  asyncContext,
  sampling: {
    strategy: "default",
    rate: 0.1,  // ~10% of info/warn/debug/trace events kept
  },
});
```

When `rate` is `1` (or `true`), all events are kept (sampling disabled).
When `rate` is `0` (or `false`), all sample-able events are dropped.

| Rate | Behaviour |
|------|-----------|
| `1` / `true` | Keep 100% (sampling off) |
| `0.1` | ~10% of sample-able events kept |
| `0` / `false` | Drop 100% of sample-able events |

#### `per_level` — per-level rates

Set independent rates per log level. Levels not in the map fall back to `rate`.

```typescript
const mixin = createWideEventMixin({
  asyncContext,
  sampling: {
    strategy: "per_level",
    perLevel: {
      trace: 0.01,  // keep 1% of trace
      debug: 0.1,   // keep 10% of debug
      info: 0.5,    // keep 50% of info
    },
  },
});
// error/fatal: kept by default (can be overridden). info/warn: unmapped → use `rate` (default: 100%)
```

The `perLevel` map is **snapshotted at construction time** — mutating the object after
calling `createWideEventMixin()` has no effect.

### Sampling Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `strategy` | `"default"` \| `"per_level"` | `"default"` | How sampling rates are applied. |
| `rate` | `boolean` \| `number` | `1` | Single `rate` for `default` strategy; with `"per_level"` acts as fallback for unmapped levels. |
| `perLevel` | `Partial<Record<LogLevelType, boolean \| number>>` | `undefined` | Per-level rates for `per_level` strategy. |
| `shouldEmit` | `(params: { wideData, level }) => boolean` | `undefined` | Custom callback that receives the accumulated wide event data and log level. Can override the default error/fatal exemption by returning `false`. |
| `emitLevel` | `LogLevelType` | `undefined` | Override the default emit level when no explicit `level` is passed to `emitWideEvent()`. |

### Custom Sampling Function

The `shouldEmit` callback lets you inspect the full wide event data before deciding whether to emit:

```typescript
const mixin = createWideEventMixin({
  asyncContext,
  sampling: {
    shouldEmit: ({ wideData, level }) => {
      // Only emit events that have a userId
      return !!wideData.userId;
    },
  },
});
```

You can compose the callback with `rate`-based sampling — both checks must pass:

```typescript
const mixin = createWideEventMixin({
  asyncContext,
  sampling: {
    strategy: "default",
    rate: 0.5, // first pass: ~50% kept randomly
    shouldEmit: ({ wideData }) => wideData.priority !== "low", // second pass: filter by content
  },
});
```

**Note:** "error" and "fatal" default to a 100% keep `rate`, but can be overridden by returning `false` from `shouldEmit` or by explicitly setting their `rate` in `perLevel`.

### What Gets Sampled

Sampling only applies to `emitWideEvent()` calls. Normal log calls (`logger.info()`, etc.)
are unaffected.

Here's a complete Express middleware example:

```typescript
// async-local-storage.ts
import { AsyncLocalStorage } from "async_hooks";

export const asyncLocalStorage = new AsyncLocalStorage<{
  logger: import("loglayer").ILogLayer;
}>();
```

```typescript
// logger.ts
import { asyncLocalStorage } from "./async-local-storage";
import { LogLayer, StructuredTransport, useLogLayerMixin } from "loglayer";
import { createWideEventMixin } from "@loglayer/mixin-wide-events";

useLogLayerMixin(createWideEventMixin({ asyncContext: asyncLocalStorage }));

export const log = new LogLayer({
  transport: new StructuredTransport({ logger: console }),
});

export function getLogger() {
  return asyncLocalStorage.getStore()?.logger ?? log;
}
```

```typescript
// app.ts
import express from "express";
import { asyncLocalStorage } from "./async-local-storage";
import { log, getLogger } from "./logger";

const app = express();

// Set up context per request
app.use((req, res, next) => {
  const logger = log.child().withContext({ requestId: req.id });
  asyncLocalStorage.run({ logger }, next);
});

// Route handler with error handling
app.post("/orders", async (req, res) => {
  const logger = getLogger();
  const startTime = Date.now();

  logger.withWideEvents({ itemCount: req.body.items?.length ?? 0 });

  try {
    const order = await createOrder(req.body);
    
    logger
      .withWideEvents({ orderId: order.id })
      .info("Order created");
    
    res.status(201).json(order);
  } catch (err) {
    // Immediate log with stack trace
    logger.withError(err).error("Order creation failed");
    
    // Capture error for wide event
    logger.withWideEventError(err);
    
    res.status(500).json({ error: "Failed to create order" });
  }

  // Emit wide event on response finish
  res.on("finish", () => {
    logger
      .withWideEvents({
        duration: Date.now() - startTime,
        statusCode: res.statusCode,
        outcome: res.statusCode >= 400 ? "error" : "ok",
      })
      .emitWideEvent({
        message: "Request completed",
        level: res.statusCode >= 400 ? "error" : "info",
      });
  });
});
```

## Browser Compatibility

The `AsyncLocalStorage` class is from Node.js and not available in browsers. For browser environments, provide your own compatible async context implementation:

```typescript
class BrowserAsyncContext<T> {
  run(data: T, callback: () => void) {
    this.store = data;
    callback();
  }

  getStore(): T | undefined {
    return this.store;
  }

  private store: T | undefined;
}

const browserContext = new BrowserAsyncContext();
const mixin = createWideEventMixin({ asyncContext: browserContext });
```

## See Also

- [Wide Events Logging Guide](/guides/wide-events) - A comprehensive guide to implementing wide event logging
- [AsyncLocalStorage](https://nodejs.org/api/async_hooks.html#asynchooksasynclocalstorage) - Node.js documentation