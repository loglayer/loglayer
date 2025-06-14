When creating child loggers, the Default Context Manager will:
1. Copy the parent's context to the child logger at creation time
2. Maintain independent context after creation

```typescript
parentLogger.withContext({ requestId: "123" });

const childLogger = parentLogger.child();
// Child inherits parent's context at creation via shallow-copy
childLogger.info("Initial log"); // Includes requestId: "123"

// Child can modify its context independently
childLogger.withContext({ userId: "456" });
childLogger.info("User action"); // Includes requestId: "123" and userId: "456"

// Parent's context remains unchanged
parentLogger.info("Parent log"); // Only includes requestId: "123"
```
