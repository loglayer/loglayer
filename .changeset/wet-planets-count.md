---
"@loglayer/transport-datadog": major
---

## Breaking Changes

We no longer provide a `createDataDogTransport` function. Instead, you should directly instantiate the `DataDogTransport` class:

```typescript
// v1
import { createDataDogTransport } from "@loglayer/transport-datadog";

const log = new LogLayer({
  transport: createDataDogTransport({
    id: "datadog", // id was required in v1
    options: {
      // ... options
    },
  }),
});

// v2
import { DataDogTransport } from "@loglayer/transport-datadog";

const log = new LogLayer({
  transport: new DataDogTransport({
    options: {
      // ... options
    },
  }),
});
```
