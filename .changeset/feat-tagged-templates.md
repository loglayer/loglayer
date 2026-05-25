---
"loglayer": minor
"@loglayer/shared": minor
---

Add tagged template syntax support for log methods. You can now write:

```typescript
log.info`User ${userId} logged in`;
log.withMetadata({ requestId }).warn`Request ${requestId} timed out`;
log.withError(err).error`Failed: ${err.message}`;
```

All log methods (info, warn, error, debug, trace, fatal) support tagged template syntax on both `LogLayer` and `LogBuilder` instances.