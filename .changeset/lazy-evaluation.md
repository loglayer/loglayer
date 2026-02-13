---
"loglayer": major
"@loglayer/shared": major
---

- Add lazy evaluation for dynamic context and metadata using the `lazy()` function. Lazy values are only evaluated when the log level is enabled, avoiding unnecessary computation for disabled log levels. This feature comes from [LogTape's lazy evaluation](https://logtape.org/manual/lazy). Thank you to the LogTape team for answering questions around its implementation!
- `lazy()` supports async callbacks in metadata for values that require asynchronous operations (database queries, API calls, async storage). When async lazy values are present in metadata, log methods return `Promise<void>` so you can `await` the log call to ensure values are resolved before dispatch. Async lazy is not supported in context.
- `getContext()` now accepts an optional `{ evalLazy: true }` parameter to resolve any `lazy()` values in the returned context.
- Failed lazy callbacks now replace the value with `"[LazyEvalError]"`, still send the original log, and emit a separate error-level entry describing the failure. The `LAZY_EVAL_ERROR` constant is exported for programmatic detection.
- Added `LogLevelPriority` and `LogLevelPriorityToNames` exports for mapping between log levels and their numeric priority values.

There are no breaking changes. No migration steps are necessary aside from upgrading any external loglayer dependencies to their next major version.
