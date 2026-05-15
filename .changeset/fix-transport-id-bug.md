---
"@loglayer/transport": patch
"loglayer": patch
---

Fix transport `id` property not being set from config

When creating a transport with `id: "file"`, the `id` property was always set to a generated value instead of the configured value. This caused group-based routing to fail because `_shouldTransportReceiveLog` couldn't match the transport's ID against the group's transports list.

**Before:** `this.id = Date.now().toString() + Math.random().toString()`
**After:** `this.id = config.id ?? (Date.now().toString() + Math.random().toString())`
