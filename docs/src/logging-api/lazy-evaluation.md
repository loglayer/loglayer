---
title: Lazy Evaluation in LogLayer
description: Defer expensive computations and create dynamic context/metadata values using lazy evaluation
---

# Lazy Evaluation

The `lazy()` function defers evaluation of a value until log time. The callback is only invoked when the log level is enabled, and is re-evaluated on each log call. It works with both `withContext()` and `withMetadata()`.

::: tip Credit
This feature comes from [LogTape's lazy evaluation](https://logtape.org/manual/lazy). Thank you to the LogTape team for answering questions around its implementation!
:::

## Usage

```typescript
import { LogLayer, lazy } from "loglayer";

const log = new LogLayer({ ... });

let currentUser = null;

// Context: evaluated fresh on each log call
log.withContext({
  memoryUsage: lazy(() => process.memoryUsage().heapUsed),
  user: lazy(() => currentUser?.id ?? null),
});

log.info("Server status check");
// Output: { memoryUsage: 52428800, user: null, msg: "Server status check" }

currentUser = { id: "user_123" };
log.info("User action");
// Output: { memoryUsage: 52432000, user: "user_123", msg: "User action" }

// Metadata: same behavior
log.withMetadata({
  data: lazy(() => JSON.stringify(largeObject)),
}).debug("Processing result");
// Output: { memoryUsage: 52432000, user: "user_123", data: "{...}", msg: "Processing result" }

// Callbacks are NOT invoked when the log level is disabled
log.setLevel("warn");
log.debug("This won't trigger any lazy callbacks");
```

Child loggers inherit the lazy wrapper, not the resolved value, so they always see the latest value.

## Async Lazy Evaluation

`lazy()` also supports async callbacks for values that require asynchronous operations like database queries, API calls, or async storage lookups.

When any lazy callback returns a Promise, the log method returns a `Promise<void>` that you can `await` to ensure the async values are resolved before the log is dispatched.

```typescript
import { LogLayer, lazy } from "loglayer";

const log = new LogLayer({ ... });

// Async context values
log.withContext({
  userId: lazy(async () => await getUserIdFromSession()),
  dbStatus: lazy(async () => await db.ping()),
  memoryUsage: lazy(() => process.memoryUsage().heapUsed), // sync still works
});

// Await to ensure async values are resolved
await log.info("Request received");
// Output: { userId: "user_123", dbStatus: "ok", memoryUsage: 52428800, msg: "Request received" }

// Works with metadata chaining too
await log.withMetadata({
  result: lazy(async () => await fetchResult()),
}).info("Processing complete");
```

::: warning Fire-and-forget behavior
If you don't `await` the log call, async lazy values will not be resolved before the log is dispatched. The unresolved Promise objects will end up in your log data. Always `await` log calls when using async lazy values.
:::

### When no async lazy values are present

When all lazy callbacks are synchronous, log methods return `void` as before — there is zero overhead. The `Promise<void>` return only occurs when an async lazy callback is detected.

```typescript
// Sync lazy — returns void, no Promise
log.info("test");

// Async lazy — returns Promise<void>
await log.info("test");
```

### Retrieving async context

Use `getContextAsync()` to resolve async lazy values in the current context:

```typescript
log.withContext({
  userId: lazy(async () => await getUserId()),
  static: "value",
});

const ctx = await log.getContextAsync({ evalLazy: true });
// { userId: "user_123", static: "value" }
```

### Error handling

If an async lazy callback throws or rejects, the log entry is silently dropped. Enable `consoleDebug` to see error details:

```typescript
const log = new LogLayer({
  transport: new ConsoleTransport({ logger: console }),
  consoleDebug: true,
});

log.withContext({
  failing: lazy(async () => { throw new Error("oops"); }),
});

await log.info("test");
// Console: [LogLayer] Error resolving async lazy values: Error: oops
```

## Notes

- `lazy()` can only be used at the **root level** of context and metadata objects.
- `getContext()` returns raw lazy wrappers by default. Use `getContext({ evalLazy: true })` to get synchronously resolved values.
- Use `getContextAsync({ evalLazy: true })` to resolve both sync and async lazy values.
