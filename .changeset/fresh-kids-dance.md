---
"@loglayer/mixin-hot-shots": patch
---

Updated to use the named `StatsD` type import from `hot-shots` instead of the default export and removed the `StatsDClient` type alias. All type references now use `StatsD` directly from `hot-shots`, providing better type consistency and eliminating the need for type aliases.
