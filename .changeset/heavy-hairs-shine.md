---
"loglayer": minor
"@loglayer/shared": minor
---

- Transports now additionally receive the `error`, `metadata`, and `context` data in the `shipToLogger()` callback.
    * It is still recommended to use `data` for most use-cases as it is a merged object of all data with the user's configured fields.
- Plugin callbacks `onBeforeDataOut()` and `shouldSendToLogger()` now additionally receive the `error`, `metadata`, and `context` data.

This change should allow a plugin or transport developer to inspect data without needing to know how the user has configured their `data` object.
