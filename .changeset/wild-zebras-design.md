---
"@loglayer/log-level-manager-one-way": patch
"@loglayer/log-level-manager-linked": patch
---

Fixed a memory leak issue where circular references between parent and child log level managers prevented proper garbage collection. The manager now uses `WeakRef` for parent and child references, allowing objects to be garbage collected when no longer referenced.
