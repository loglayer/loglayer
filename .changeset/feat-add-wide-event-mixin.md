---
"@loglayer/mixin-wide-events": major
---

Add `@loglayer/mixin-wide-events` package for wide event logging functionality.

**Methods:**
- `withWideEvents(data)` - Accumulate data across async operations
- `getWideEvents(key?)` - Read accumulated data
- `clearWideEvents(key?)` - Clear all or specific key
- `emitWideEvent({ message, level?, metadata? })` - Emit comprehensive log entry

**Configuration Options:**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `asyncContext` | `AsyncLocalStorage` | required | Async context for propagation |
| `includeContext` | `boolean` | `true` | Include `withContext()` data |
| `wideEventField` | `string` | undefined | Nest data under field |

**Safety Features:**
- Prototype pollution protection (`__proto__`, `constructor`, `prototype` blocked)
- Circular reference detection via `WeakSet`
- Deep merge for nested objects

For more details, see the [wide event documentation](https://loglayer.dev/guides/event-wide-logging).