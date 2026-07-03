---
"@loglayer/mixin-hot-shots": minor
---

Add two opt-in features:

- **Context-derived tags**: pass `contextTagKeys` to `hotshotsMixin()` to automatically promote allowlisted scalar (`string`/`number`/`boolean`) logger-context values to metric tags. The allowlist is mandatory (cardinality guard) and explicit `.withTags()` tags override derived tags on the same key.
- **`MemoryStatsClient`**: a StatsD-compatible client that records structured `{ type, name, value, tags, sampleRate }` records instead of sending, enabling metric assertions in tests without parsing StatsD wire format.
