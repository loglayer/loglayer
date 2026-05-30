---
"loglayer": minor
"@loglayer/shared": minor
"@loglayer/context-manager": minor
"@loglayer/log-level-manager": minor
"@loglayer/plugin": minor
"@loglayer/transport": minor
"@loglayer/mixin-wide-events": minor
---

**loglayer / @loglayer/shared**: Added `rootData` field to `raw()` that spreads data directly at the root level of the log entry, bypassing `metadataFieldName` / `contextFieldName` nesting. `rootData` is spread before `onBeforeDataOut` plugin hooks so plugins can redact or modify its fields.

**loglayer**: Optimized `PluginManager.runOnBeforeDataOut` to skip redundant `Object.assign` when a plugin returns the same data reference it received. Plugins that mutate `params.data` in place (like `fast-redact`) benefit from this — the mutation is preserved without an extra merge.

**@loglayer/mixin-wide-events**: Updated `emitWideEvent()` to use `rootData` instead of `withMetadata()`, ensuring wide event fields are always emitted flat at the root level even when `metadataFieldName` is configured. Also fixed the context tracker plugin to return `params.data` instead of `params`, matching the documented plugin contract.
