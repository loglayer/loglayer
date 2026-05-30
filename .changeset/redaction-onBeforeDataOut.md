---
"@loglayer/plugin-redaction": major
---

**@loglayer/plugin-redaction**: Switched from `onMetadataCalled` to `onBeforeDataOut` hook. The plugin now redacts all assembled data (metadata, context, error fields, and `rootData`) instead of only metadata from `withMetadata()` calls. This ensures sensitive fields are redacted regardless of how they enter the logging pipeline.
