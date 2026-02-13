---
title: Lazy Evaluation in LogLayer
description: Defer expensive computations and create dynamic context/metadata values using lazy evaluation
---

# Lazy Evaluation

The `lazy()` function defers evaluation of a value until log time. The callback is only invoked when the log level is enabled, and is re-evaluated on each log call. It works with both `withContext()` and `withMetadata()`.

::: tip Credit
This feature is adapted from [LogTape's lazy evaluation](https://logtape.org/manual/lazy). Thank you to the LogTape team for answering questions around its implementation!
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

When using a [context manager](/context-managers/) that copies parent context to children (such as the default or linked context managers), child loggers inherit the lazy wrapper — not the resolved value — so they always see the latest value.

### Async callbacks

`lazy()` also accepts async callbacks in **metadata** for values that require asynchronous operations like database queries, API calls, or async storage lookups. When any metadata lazy callback returns a Promise, TypeScript automatically infers that the log method returns `Promise<void>` instead of `void`, so you must `await` it.

```typescript
// TypeScript infers Promise<void> — must be awaited
await log.withMetadata({
  result: lazy(async () => await fetchResult()),
  dbStatus: lazy(async () => await db.ping()),
}).info("Processing complete");
// Output: { result: "...", dbStatus: "ok", msg: "Processing complete" }

// Sync lazy — returns void, no await needed
log.withMetadata({
  data: lazy(() => JSON.stringify(largeObject)),
}).info("Processing");
```

::: tip Automatic return type inference
TypeScript automatically determines the return type based on whether your metadata contains async lazy values:
- `lazy(() => "sync")` in metadata → log methods return `void`
- `lazy(async () => "async")` in metadata → log methods return `Promise<void>`
- No lazy values → log methods return `void`

This means `@typescript-eslint/no-floating-promises` only triggers when you actually use async lazy values — no lint noise for sync usage.
:::

::: warning Async lazy is only supported in metadata
Async lazy callbacks are **not supported in context**. Because context is evaluated on every log call, using async lazy in context would force every `log.info()`, `log.warn()`, etc. to return a Promise — requiring `await` on every log statement throughout your codebase.

If you need async data in context, resolve it before calling `withContext()`:

```typescript
const userId = await getUserId();
log.withContext({ userId });
```

If you accidentally use an async lazy callback in context, the value will be replaced with `"[LazyEvalError]"` and an error-level log will be emitted.
:::

## Error Handling

If a lazy callback throws or rejects, LogLayer:

1. **Replaces** the failed value with `"[LazyEvalError]"` in the log data
2. **Still sends** the original log entry (with the error indicator in place of the failed value)
3. **Logs a separate error-level entry** describing which key failed and why

```typescript
import { LogLayer, lazy } from "loglayer";

log.withContext({
  failing: lazy(() => { throw new Error("oops"); }),
  working: lazy(() => "ok"),
});

log.info("test");
// Error log:  [LogLayer] Lazy evaluation failed for context key "failing": oops
// Original log: { failing: "[LazyEvalError]", working: "ok", msg: "test" }
```

You can import the `LAZY_EVAL_ERROR` constant to programmatically check for failed lazy values:

```typescript
import { LAZY_EVAL_ERROR } from "loglayer";

if (someValue === LAZY_EVAL_ERROR) {
  // Handle the failed lazy evaluation
}
```

This applies to both sync and async lazy callbacks.

## Notes

- `lazy()` can only be used at the **root level** of context and metadata objects.
- Async lazy callbacks are only supported in `withMetadata()`, not `withContext()`.
- `getContext()` resolves lazy values by default. Use `getContext({ raw: true })` to get the raw lazy wrappers.
