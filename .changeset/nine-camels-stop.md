---
"@loglayer/shared": patch
"@loglayer/docs": patch
---

Remove the `LogLayerContext` and `LogLayerMetadata` extension from the `LogLayerData` interface as context and metadata fields are user-configured, which the extension wouldn't capture. It now extends the Record instead.
