---
"loglayer": minor
---

`ConsoleTransport`: Fixes an issue where `levelField` and `dateField` should not affect the output in the same way that `messageField` would. 
This change brings the behavior to what is described in the documentation for the `ConsoleTransport`.
