# Migrating from v1 to v2

This guide will help you migrate from v1 to v2 of the DataDog transport.

## Breaking Changes

We no longer provide a `createDataDogTransport` function. Instead, you should directly instantiate the `DataDogTransport` class:

```typescript
// v1
import { createDataDogTransport } from "@loglayer/transport-datadog"

const log = new LogLayer({
  transport: createDataDogTransport({
    id: "datadog",  // id was required in v1
    options: {
      // ... options
    }
  })
})

// v2
import { DataDogTransport } from "@loglayer/transport-datadog"

const log = new LogLayer({
  transport: new DataDogTransport({
    options: {
      // ... options
    }
  })
})
```
