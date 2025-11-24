## Using Mixins with ILogLayer

When using TypeScript interfaces (as recommended in the [TypeScript tips page](/logging-api/typescript)), mixin methods are **automatically available** on `ILogLayer` when the mixin augments the `@loglayer/shared` module. This is possible because `ILogLayer` is now a generic interface (`ILogLayer<This>`) that preserves mixin types through method chaining.

### Automatic Type Inference (Recommended)

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

### Explicit Combined Types (Optional)

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