# @loglayer/mixin-wide-events

## 1.2.0

### Minor Changes

- [#404](https://github.com/loglayer/loglayer/pull/404) [`9cf3b79`](https://github.com/loglayer/loglayer/commit/9cf3b795a73fbf932068f2722fefdf0e874a90fc) Thanks [@theogravity](https://github.com/theogravity)! - **loglayer / @loglayer/shared**: Added `rootData` field to `raw()` that spreads data directly at the root level of the log entry, bypassing `metadataFieldName` / `contextFieldName` nesting. `rootData` is spread before `onBeforeDataOut` plugin hooks so plugins can redact or modify its fields.

  **loglayer**: Optimized `PluginManager.runOnBeforeDataOut` to skip redundant `Object.assign` when a plugin returns the same data reference it received. Plugins that mutate `params.data` in place (like `fast-redact`) benefit from this — the mutation is preserved without an extra merge.

  **@loglayer/mixin-wide-events**: Updated `emitWideEvent()` to use `rootData` instead of `withMetadata()`, ensuring wide event fields are always emitted flat at the root level even when `metadataFieldName` is configured. Also fixed the context tracker plugin to return `params.data` instead of `params`, matching the documented plugin contract.

## 1.1.1

### Patch Changes

- [#401](https://github.com/loglayer/loglayer/pull/401) [`c72f5b4`](https://github.com/loglayer/loglayer/commit/c72f5b429277aaafc0632198d419d715f94c6b35) Thanks [@theogravity](https://github.com/theogravity)! - Update documentation

## 1.1.0

### Minor Changes

- [#396](https://github.com/loglayer/loglayer/pull/396) [`2e26492`](https://github.com/loglayer/loglayer/commit/2e2649262f61f9eaaf64d306a585eb14b5e673d7) Thanks [@theogravity](https://github.com/theogravity)! - Add sampling configuration to the wide events mixin. Supports `rate`-based and `per_level` strategies (unmapped levels fall back to `rate`). A custom \`shouldEmit\` callback accepts accumulated wide event data and log level for content-aware filtering. \`error\`/\`fatal\` levels default to a 100% keep rate but can be overridden via \`perLevel\` rates or the \`shouldEmit\` callback.

## 1.0.1

### Patch Changes

- [#393](https://github.com/loglayer/loglayer/pull/393) [`703c0d4`](https://github.com/loglayer/loglayer/commit/703c0d4f26d91dd777c23d71f64c5f430b05d2d5) Thanks [@theogravity](https://github.com/theogravity)! - feat: add withWideEventError helper method

  Add `withWideEventError()` method for capturing errors in wide event log entries:

  - New `withWideEventError(error)` method for capturing errors
  - Add `errorField` config option (defaults to `error` or `errors` for array mode)
  - Add `errorsAsArray` config option for collecting multiple errors as array
  - Uses LogLayer's `errorSerializer` if configured
  - `emitWideEvent()` now returns void (not chainable)
  - Remove `metadata` option from EmitWideEventConfig

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
