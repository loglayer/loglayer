# @loglayer/mixin-wide-events

## 1.0.0

### Major Changes

- [#388](https://github.com/loglayer/loglayer/pull/388) [`5406eeb`](https://github.com/loglayer/loglayer/commit/5406eeb9b85ec9a4f700368475a0e503e02ba125) Thanks [@theogravity](https://github.com/theogravity)! - Add `@loglayer/mixin-wide-events` package for wide event logging functionality.

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

  For more details, see the [wide event documentation](https://loglayer.dev/guides/event-wide-logging).
