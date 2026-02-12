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

## Notes

- `lazy()` can only be used at the **root level** of context and metadata objects.
- The callback must be **synchronous**. Async support may come in the future.
- `getContext()` returns raw lazy wrappers by default. Use `getContext({ evalLazy: true })` to get resolved values.
