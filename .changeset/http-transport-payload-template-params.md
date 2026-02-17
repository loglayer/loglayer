---
"@loglayer/transport-http": minor
---

`payloadTemplate` now receives all `LogLayerTransportParams` fields plus a convenience `message` string (messages joined with a space). Previously only `logLevel`, `message`, and `data` were available.

New fields available in `payloadTemplate`:
- `messages` — raw messages array before joining
- `hasData` — whether `data` is populated
- `error` — error object attached via `withError()`
- `groups` — group names the log entry belongs to
- `metadata` — individual metadata from `withMetadata()` / `metadataOnly()`
- `context` — context data from `withContext()`

A new `HttpPayloadTemplateParams` type is exported, defined as `LogLayerTransportParams & { message: string }`.

This change is fully backwards-compatible. Existing `payloadTemplate` functions continue to work without modification.
