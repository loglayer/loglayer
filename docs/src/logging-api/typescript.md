---
title: LogLayer Tips for Typescript
description: Notes on using LogLayer with Typescript
---

# Typescript Tips

## Use `ILogLayer` if you need to type your logger

`ILogLayer` is the interface implemented by `LogLayer`. By using this interface,
you will also be able to use the mock `MockLogLayer` class for unit testing.

```typescript
import type { ILogLayer } from 'loglayer'

const logger: ILogLayer = new LogLayer()
```

### Using Mixins with `ILogLayer`

When using TypeScript interfaces (as recommended in the [TypeScript tips page](/logging-api/typescript)), mixin methods are **automatically available** on `ILogLayer` when the mixin augments the `@loglayer/shared` module. This is possible because `ILogLayer` is now a generic interface (`ILogLayer<This>`) that preserves mixin types through method chaining.

#### Automatic Type Inference (Recommended)

Mixins that properly augment the `@loglayer/shared` module work seamlessly with `ILogLayer`:

```typescript
import type { ILogLayer } from 'loglayer';
import { LogLayer, useLogLayerMixin } from 'loglayer';
import { hotShotsMixin } from '@loglayer/mixin-hot-shots';

// Register the mixin
useLogLayerMixin(hotShotsMixin({ client }));

// ILogLayer automatically includes mixin methods through the generic parameter
const log: ILogLayer = new LogLayer({ transport: ... });

// Mixin methods are available directly
log.stats.increment('counter').send();

// Mixin methods are preserved through method chaining
log.withContext({ foo: 'bar' }).stats.increment('counter').send();

// Works in factory functions
function getLogger(): ILogLayer {
  return log; // Mixin methods are included automatically
}
```

#### Explicit Combined Types (Optional)

If you prefer explicit types for documentation or clarity, you can still create intersection types:

```typescript
import type { ILogLayer } from 'loglayer';
import type { IHotShotsMixin } from '@loglayer/mixin-hot-shots';

export type ILogLayerWithMixins = ILogLayer & IHotShotsMixin<ILogLayer>;

// Create your instance of LogLayer
const log: ILogLayerWithMixins = new LogLayer({ transport: ... });

// Use in factory functions for explicit documentation
function getLogger(): ILogLayerWithMixins {
  return log;
}
```

See the [Mixins documentation](/mixins/) for more details.

## Use `ILogBuilder` for the builder pattern

`ILogBuilder` is the interface returned when you call `withMetadata()` or `withError()` on an `ILogLayer` instance. It represents the builder phase where you construct a log message with metadata and errors before sending it.

### When do you get an ILogBuilder?

You transition from `ILogLayer` to `ILogBuilder` when calling these methods:

```typescript
import type { ILogLayer, ILogBuilder } from 'loglayer';

const logger: ILogLayer = new LogLayer({ transport: ... });

// These return ILogBuilder
const builder1: ILogBuilder = logger.withMetadata({ userId: 123 });
const builder2: ILogBuilder = logger.withError(new Error('Failed'));
```

### Generic Type Parameter

`ILogBuilder` is a generic interface: `ILogBuilder<This = ILogBuilder<any>>`. The generic parameter preserves the concrete type through method chaining, which is particularly important for mixins:

```typescript
// Without mixins - returns ILogBuilder<any>
logger
  .withMetadata({ foo: 'bar' })     // ILogBuilder<any>
  .withError(error)                 // ILogBuilder<any>
  .info('Message');

// With mixins - mixin methods are preserved
logger
  .withMetadata({ foo: 'bar' })     // ILogBuilder<any>
  .customMixinMethod()              // Mixin method available
  .info('Message');
```

### Methods Available on ILogBuilder

`ILogBuilder` provides logging methods and builder methods:

**Logging Methods:**
- `info(...messages)` - Send log at info level
- `warn(...messages)` - Send log at warn level
- `error(...messages)` - Send log at error level
- `debug(...messages)` - Send log at debug level
- `trace(...messages)` - Send log at trace level
- `fatal(...messages)` - Send log at fatal level

**Builder Methods:**
- `withMetadata(metadata)` - Add or replace metadata
- `withError(error)` - Add or replace error
- `enableLogging()` - Enable logging for this log entry
- `disableLogging()` - Disable logging for this log entry

### ILogLayer vs ILogBuilder

The key differences:

| Feature | ILogLayer | ILogBuilder |
|---------|-----------|-------------|
| **Purpose** | Main logger interface | Builder for constructing log messages |
| **How to get** | `new LogLayer()` or `new MockLogLayer()` | `logger.withMetadata()` or `logger.withError()` |
| **Context methods** | `withContext()`, `clearContext()`, `getContext()` | Not available |
| **Child loggers** | `child()` | Not available |
| **Configuration** | `setLevel()`, `muteContext()`, etc. | Not available |
| **Metadata/Error** | Returns `ILogBuilder` | Returns `ILogBuilder` (chainable) |
| **Logging methods** | Available | Available |

### Common Patterns

**Building complex log entries:**

```typescript
logger
  .withMetadata({
    operation: 'user_login',
    duration: 145
  })
  .withError(error)
  .error('User login failed');
```

**Chaining multiple metadata calls:**

```typescript
logger
  .withMetadata({ userId: 123 })
  .withMetadata({ sessionId: 'abc' })  // Replaces previous metadata
  .info('Message');
```

**Conditional metadata:**

```typescript
const builder = logger.withMetadata({ requestId: '123' });

if (error) {
  builder.withError(error);
}

builder.info('Request completed');
```

**Using with type annotations:**

```typescript
import type { ILogBuilder } from 'loglayer';

function buildLogEntry(logger: ILogLayer): ILogBuilder {
  return logger
    .withMetadata({ timestamp: Date.now() })
    .withError(new Error('Failed'));
}

// Later, send the log
buildLogEntry(logger).error('Operation failed');
```

## Use `LogLevelType` if you need to type your log level when creating a logger

```typescript
import type { LogLevelType } from 'loglayer'

const logger = new LogLayer({ 
  transport: new ConsoleTransport({
    level: process.env.LOG_LEVEL as LogLevelType
  })
})
```

## Use `LogLayerTransport` if you need to type an array of transports

```typescript
import type { LogLayerTransport } from 'loglayer'

const transports: LogLayerTransport[] = [
  new ConsoleTransport({
    level: process.env.LOG_LEVEL as LogLevelType
  }),
  new FileTransport({
    level: process.env.LOG_LEVEL as LogLevelType
  })
]

const logger = new LogLayer({ 
  transport: transports,
})
```

## Override types for custom IntelliSense

You can extend LogLayer's base types to provide custom IntelliSense for your specific use case. This is particularly useful when you have consistent fields across your application.

Create a `loglayer.d.ts` (or any `d.ts`) file in your project source:

```typescript
// loglayer.d.ts
declare module "loglayer" {
  /**
   * Defines the structure for context data that persists across multiple log entries 
   * within the same context scope. This is set using log.withContext().
   */
  interface LogLayerContext {
    userId?: string;
    sessionId?: string;
    requestId?: string;
    siteName?: string;
    [key: string]: any; // Allow any other properties
  }

  /**
   * Defines the structure for metadata that can be attached to individual log entries. 
   * This is set using log.withMetadata() / log.metadataOnly().
   */
  interface LogLayerMetadata {
    operation?: string;
    duration?: number;
    ipAddress?: string;
    userAgent?: string;
    [key: string]: any; 
  }

}
```

With the type overrides in place, you'll get full IntelliSense support:

```typescript
import { LogLayer } from 'loglayer';
import { ConsoleTransport } from '@loglayer/transport-console';
// Optional import if you need to define constants or types
import type { LogLayerContext, LogLayerMetadata } from 'loglayer';

const log = new LogLayer({
  transport: new ConsoleTransport()
});


// Set persistent context - IntelliSense will suggest userId, sessionId, requestId, siteName
log.withContext({
  userId: "user123",
  sessionId: "sess456", 
  requestId: "req789",
  siteName: "myapp.com"
});
```

