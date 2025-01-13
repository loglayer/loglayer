---
"@loglayer/transport-opentelemetry": patch
"loglayer": patch
---

- `loglayer`: Fix an issue where if you use a plugin that creates metadata, and no metadata was present prior, it does not save
- `@loglayer/transport-opentelemetry`: Add a note about the difference between the plugin and the transport
