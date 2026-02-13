---
"loglayer": major
"@loglayer/shared": major
---

- Add lazy evaluation for dynamic context and metadata using the `lazy()` function. Lazy values are only evaluated when the log level is enabled, avoiding unnecessary computation for disabled log levels. This feature comes from [LogTape's lazy evaluation](https://logtape.org/manual/lazy). Thank you to the LogTape team for answering questions around its implementation!
- `lazy()` now supports async callbacks for values that require asynchronous operations (database queries, API calls, async storage). When async lazy values are present, log methods return `Promise<void>` so you can `await log.info(...)` to ensure values are resolved before dispatch. When all lazy values are synchronous, there is zero overhead.
- `getContext()` now accepts an optional `{ evalLazy: true }` parameter to resolve any `lazy()` values in the returned context. Returns a `Promise` when async lazy values are present.
- Added `LogLevelPriority` and `LogLevelPriorityToNames` exports for mapping between log levels and their numeric priority values.

There are no breaking changes. No migration steps are necessary aside from upgrading any external loglayer dependencies to their next major version.
