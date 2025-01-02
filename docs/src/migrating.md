# Migrating from 4.x to 5.x

## Breaking Changes

### 1. Transport System

The most significant change in 5.x is the introduction of a new transport system. Instead of specifying a logger type and instance directly, you now need to use transport-specific packages:

```typescript
// 4.x
const log = new LogLayer({
  logger: {
    instance: console,
    type: LoggerType.CONSOLE
  }
})

// 5.x
import { ConsoleTransport } from 'loglayer'

const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  })
})
```

You can find the full list of transports in the [Transport](https://loglayer.dev/docs/transports) documentation.

### 2. Configuration Changes

Several configuration options have been renamed or restructured:

```typescript
// 4.x
const log = new LogLayer({
  error: {
    serializer: mySerializer,
    fieldName: 'err'
  },
  context: {
    fieldName: 'context'
  },
  metadata: {
    fieldName: 'metadata'
  }
})

// 5.x
const log = new LogLayer({
  errorSerializer: mySerializer,
  errorFieldName: 'err',
  contextFieldName: 'context',
  metadataFieldName: 'metadata',
  errorFieldInMetadata: false // New option - defaults to false to match 4.x behavior
})
```

Here's a complete mapping of configuration options from 4.x to 5.x:

| 4.x Config | 5.x Config | Notes |
|------------|------------|-------|
| `logger.instance` | `transport` | Now uses transport classes instead of direct logger instances |
| `logger.type` | `transport` | Logger type is determined by the transport class used |
| `error.serializer` | `errorSerializer` | Moved to root level |
| `error.fieldName` | `errorFieldName` | Moved to root level |
| `error.copyMsgOnOnlyError` | `copyMsgOnOnlyError` | Moved to root level |
| `context.fieldName` | `contextFieldName` | Moved to root level |
| `metadata.fieldName` | `metadataFieldName` | Moved to root level |
| `enabled` | `enabled` | Unchanged |
| `prefix` | `prefix` | Unchanged |
| `consoleDebug` | `consoleDebug` | Unchanged |
| `muteContext` | `muteContext` | Unchanged |
| `muteMetadata` | `muteMetadata` | Unchanged |
| `plugins` | `plugins` | Unchanged |
| N/A | `errorFieldInMetadata` | New in 5.x - controls error object placement |

### 3. getLoggerInstance Changes

The `getLoggerInstance()` method has been updated to support multiple transports. Each transport must now have a unique ID that is used to retrieve its logger instance:

```typescript
// 4.x
const log = new LogLayer({
  logger: {
    instance: console,
    type: LoggerType.CONSOLE
  }
});
const logger = log.getLoggerInstance(); // Returns the logger instance directly

// 5.x
const log = new LogLayer({
  transport: new ConsoleTransport({
    id: 'console', // ID is required and must be unique
    logger: console
  })
});
const logger = log.getLoggerInstance('console'); // Must specify the transport ID

// 5.x with multiple transports
const log = new LogLayer({
  transport: [
    new ConsoleTransport({
      id: 'console',
      logger: console
    }),
    new WinstonTransport({
      id: 'winston',
      logger: winstonLogger
    })
  ]
});
const consoleLogger = log.getLoggerInstance('console');
const winstonLogger = log.getLoggerInstance('winston');
```

If the transport ID doesn't exist, `undefined` is returned.

### 4. TypeScript Changes

#### Generic Type Parameters

The most significant change is the removal of generic type parameters from both the `ILogLayer` interface and `LogLayer` class:

```typescript
// 4.x
class LogLayer<ExternalLogger extends LoggerLibrary = LoggerLibrary, ErrorType = ErrorDataType> 
  implements ILogLayer<ExternalLogger, ErrorType> {
  // ...
}

interface ILogLayer<ExternalLogger extends LoggerLibrary = LoggerLibrary, ErrorType = ErrorDataType> {
  getLoggerInstance(): ExternalLogger;
  withError(error: ErrorType): ILogBuilder<ErrorType>;
  // ...
}

// 5.x
class LogLayer implements ILogLayer {
  getLoggerInstance<Library>(id: string): Library | undefined;
  withError(error: any): ILogBuilder;
  // ...
}

interface ILogLayer {
  getLoggerInstance<Library>(id: string): Library | undefined;
  withError(error: any): ILogBuilder;
  // ...
}
```

This change moves type safety from the class/interface level to the method level, particularly for `getLoggerInstance`. The `ErrorType` generic has been removed entirely in favor of `any` as errors are now handled by transports.

#### Package Organization

Types have been moved to more specific packages:
- `LoggerLibrary` interface → `@loglayer/transport`
- Plugin types → `@loglayer/plugin`

Example of importing from new packages:
```typescript
// 4.x
import { LogLayerPlugin, PluginBeforeDataOutFn } from 'loglayer';

// 5.x
import { LogLayerPlugin, PluginBeforeDataOutFn } from '@loglayer/plugin';
```

#### Error Handling

Error-related types have been simplified:

```typescript
// 4.x - Generic error types
interface ILogBuilder<ErrorType = ErrorDataType> {
  withError(error: ErrorType): ILogBuilder<ErrorType>;
}
type ErrorSerializerType<ErrorType> = (err: ErrorType) => Record<string, any>;

// 5.x - Simplified to use 'any'
interface ILogBuilder {
  withError(error: any): ILogBuilder;
}
type ErrorSerializerType = (err: any) => Record<string, any>;
```

#### Method Return Types

Method return types no longer include generics:

```typescript
// 4.x
interface ILogLayer<ExternalLogger, ErrorType> {
  muteContext(): ILogLayer<ExternalLogger, ErrorType>;
  withContext(context: Record<string, any>): ILogLayer<ExternalLogger, ErrorType>;
}

// 5.x
interface ILogLayer {
  muteContext(): ILogLayer;
  withContext(context: Record<string, any>): ILogLayer;
}
```
