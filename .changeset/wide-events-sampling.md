---
"@loglayer/mixin-wide-events": minor
---

Add sampling configuration to the wide events mixin. Supports `rate`-based and `per_level` strategies (unmapped levels fall back to `rate`). A custom \`shouldEmit\` callback accepts accumulated wide event data and log level for content-aware filtering. \`error\`/\`fatal\` levels default to a 100% keep rate but can be overridden via \`perLevel\` rates or the \`shouldEmit\` callback.
