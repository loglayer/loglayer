---
"@loglayer/mixin-wide-events": minor
---

Add sampling configuration to the wide events mixin. Wide events can now be randomly
dropped at a configured rate to control log volume. Supports two strategies: "default" (single rate) and "per_level" (per-level rates from a map, unmapped levels kept at 100%). A custom `shouldEmit` callback also accepts the accumulated wide event data and log level for content-aware filtering. "error" and "fatal" levels are always kept (100% sampled) regardless of rate or callback.

