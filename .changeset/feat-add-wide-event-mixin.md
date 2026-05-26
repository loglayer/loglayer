---
"@loglayer/mixin-wide-events": minor
---

Add @loglayer/mixin-wide-events package for wide event logging functionality.

- Adds `withWideEvents(data)` method to accumulate data across async operations
- Adds `emitWideEvent({ message, level?, metadata? })` method to output comprehensive log entries
- Works with AsyncLocalStorage for proper async context propagation
- Supports all log levels and fluent chaining
- Added configuration options: `includeContext` (default: true), `wideEventField` (for nesting)
- Context data from `withContext()` is included in wide events by default
- Priority ordering: context < wideEvents < emit metadata

For more details, see the [wide event documentation](https://loglayer.dev/guides/event-wide-logging).