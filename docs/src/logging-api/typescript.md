# Typescript Tips

## Use `ILogLayer` if you need to type your logger

`ILogLayer` is the interface implemented by `LogLayer`. By using this interface,
you will also be able to use the mock `MockLogLayer` class for unit testing.

```typescript
import { ILogLayer } from 'loglayer'

const logger: ILogLayer = new LogLayer()
```
