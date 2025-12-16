---
"loglayer": minor
"@loglayer/shared": minor
---

- Added `addTransport()` method to dynamically add one or more transports to an existing logger. If a transport with the same ID already exists, it will be replaced.
- Added `removeTransport()` method to remove a transport by its ID. Returns `true` if the transport was found and removed, `false` otherwise.
