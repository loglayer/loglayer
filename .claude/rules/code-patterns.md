# Code Patterns

## Correct LogLayer Usage

```typescript
// ✅ CORRECT
log.withMetadata({ test: data }).info("hello world")
log.withError(new Error("test")).error("hello world")

// ❌ INCORRECT - LogLayer does NOT support this
log.info("hello world", { test: data })
log.error("hello world", new Error("test"))
```

## Importing LogLayer

```typescript
// ✅ CORRECT
import { LogLayer } from 'loglayer';
import { ConsoleTransport } from 'loglayer';

// ❌ INCORRECT - @loglayer/core does not exist
import { LogLayer } from '@loglayer/core';
```

## Using StructuredTransport

```typescript
// ✅ CORRECT - StructuredTransport is exported from 'loglayer' and requires a logger
import { LogLayer, StructuredTransport } from 'loglayer';

const log = new LogLayer({
  transport: new StructuredTransport({ logger: console }),
});

// ❌ INCORRECT - wrong package name, wrong class name, missing logger
import { StructuredLogger } from '@loglayer/transport-structured-logger';
new StructuredTransport();
```

## Configuration Fields

- The `id` field on plugins and transports is always optional
- Do NOT include `id` in code examples unless specifically required
