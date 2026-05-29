---
"@loglayer/plugin-sampling": major
---

Add the Sampling plugin (`@loglayer/plugin-sampling`) for randomly dropping log entries to control volume. Supports `rate`-based, `per_level` (unmapped → fallback to `rate`), and callback strategies. `error`/`fatal` default to 100% (can be overridden via `perLevel` or callback). Includes docs, 19 tests, and plugin-list sidebar.
