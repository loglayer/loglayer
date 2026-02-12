---
"loglayer": major
"@loglayer/shared": major
---

- Add lazy evaluation for dynamic context and metadata using the `lazy()` function. Lazy values are only evaluated when the log level is enabled, avoiding unnecessary computation for disabled log levels. This feature comes from [LogTape's lazy evaluation](https://logtape.org/manual/lazy). Thank you to the LogTape team for answering questions around its implementation!
- `getContext()` now accepts an optional `{ evalLazy: true }` parameter to resolve any `lazy()` values in the returned context.
- Added `LogLevelPriority` and `LogLevelPriorityToNames` exports for mapping between log levels and their numeric priority values.
