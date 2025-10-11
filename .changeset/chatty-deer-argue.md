---
"@loglayer/transport-http": minor
---

Batching and debugging enhancements:

- New `onDebugReqRes` callback: Debug HTTP requests and responses with complete request/response details including headers and body content
- Improved batch handling with new `batchMode` option supporting three modes:
    - `"delimiter"` (default) - Join entries with a delimiter
    - `"field"` - Wrap entries in an object with a field name (e.g., `{"batch": [...]}`)
    - `"array"` - Send entries as a plain JSON array
