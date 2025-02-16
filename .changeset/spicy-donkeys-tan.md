---
"loglayer": minor
"@loglayer/shared": minor
"@loglayer/docs": minor
---

Updates around context and metadata handling.

- Added `clearContext()` to clear context data.
- `withMetadata()` / `metadataOnly()` / `withContext()` now allows an empty value. Empty values will not result in any data mutations or plugin executions.
