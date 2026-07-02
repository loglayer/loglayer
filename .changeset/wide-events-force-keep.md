---
"@loglayer/mixin-wide-events": minor
---

Add `forceKeep` sampling override — a keep-only callback evaluated before the rate check that rescues wide events the configured rate would otherwise drop (e.g. always keep a request flagged for debugging or showing a downstream failure). Returns `true` to emit immediately, bypassing the rate check and `shouldEmit`; returns `false` to apply normal sampling; and fails safe on throw. Thrown `forceKeep`/`shouldEmit` callbacks are now logged via `console.error` when `consoleDebug` is enabled.
