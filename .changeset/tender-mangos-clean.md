---
"loglayer": minor
---

- Added the following new methods to control log levels in `loglayer`:
  - `setLogLevel()`
  - `enableIndividualLevel()`
  - `disableIndividualLevel()`
  - `isLogLevelEnabled()`
- Fixes a bug in `metadataOnly()` where it was sometimes returning
the LogLayer instance instead of nothing. It should now return nothing.