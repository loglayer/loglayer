# Typescript Tips

## Use `ILogLayer` if you need to type your logger

`ILogLayer` is the interface implemented by `LogLayer`. By using this interface,
you will also be able to use the mock `MockLogLayer` class for unit testing.

```typescript
import { ILogLayer } from 'loglayer'

const logger: ILogLayer = new LogLayer()
```

## Use `as` when calling `getLoggerInstance`

When calling `getLoggerInstance()`, you can use the `as` keyword to cast the
logger to a specific type. This is useful if you want to use a logger that
implements a specific interface.

```typescript
const logger = log.getLoggerInstance("pino-logger") as P.Pino
```

*If you are highly skilled with Typescript, we'd love a pull request that
can automatically cast the logger to the correct type.*