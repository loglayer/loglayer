---
"loglayer": minor
"@loglayer/docs": minor
---

- Add `linkParentContext` config option to keep context reference between child and parent
- The plugin method `runOnContextCalled` is no longer called during `child()` if context data exists as it'd be a redundant
call.
