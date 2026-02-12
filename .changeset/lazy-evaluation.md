---
"loglayer": major
"@loglayer/shared": major
---

Add lazy evaluation for dynamic context and metadata using the `lazy()` function. Lazy values are only evaluated when the log level is enabled, avoiding unnecessary computation for disabled log levels. This feature was taken from [LogTape's lazy evaluation](https://logtape.org/manual/lazy).
