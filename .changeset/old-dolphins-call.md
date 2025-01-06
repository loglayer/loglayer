---
"@loglayer/transport-datadog": patch
"loglayer": patch
---

- Fixes an issue where a transport will still be called even if the enabled flag for it is false
- Adds the `enabled?` flag to the `LogLayerTransport` interface in `@loglayer/transport`
- Updates `@loglayer/transport-datadog` to not initialize the client lib if the transport is disabled
