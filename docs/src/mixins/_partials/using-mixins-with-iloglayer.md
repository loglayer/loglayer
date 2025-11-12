When using TypeScript interfaces (as recommended in the [TypeScript tips page](/logging-api/typescript)), mixin methods won't be recognized on the `ILogLayer` interface. Since it's difficult to extend `ILogLayer` directly (TypeScript doesn't allow extending interfaces from external modules in a way that captures mixin methods), you can create a composite type using an intersection type (`&`) that combines `ILogLayer` with the mixin interface:

```typescript
import type { ILogLayer } from 'loglayer';
import type { IHotShotsMixin } from '@loglayer/mixin-hot-shots';

export type ILogLayerWithMixins = ILogLayer & IHotShotsMixin<ILogLayer>;

// Create your instance of LogLayer
const log: ILogLayerWithMixins = new LogLayer();

// Replace your usage of ILogLayer with ILogLayerWithMixins instead
function getLogger(): ILogLayerWithMixins {
  return log;
}
```
