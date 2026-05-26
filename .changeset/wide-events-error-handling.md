---
"@loglayer/mixin-wide-events": patch
---

feat: add withWideEventError helper method

Add `withWideEventError()` method for capturing errors in wide event log entries:

- New `withWideEventError(error)` method for capturing errors
- Add `errorField` config option (defaults to `error` or `errors` for array mode)
- Add `errorsAsArray` config option for collecting multiple errors as array
- Uses LogLayer's `errorSerializer` if configured
- `emitWideEvent()` now returns void (not chainable)
- Remove `metadata` option from EmitWideEventConfig
