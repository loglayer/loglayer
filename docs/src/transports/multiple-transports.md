---
title: Using Multiple Transports
description: Learn how to use multiple transports with LogLayer
---

# Multiple Transports

You can use multiple logging libraries simultaneously:

```typescript
import { LogLayer } from 'loglayer'
import { PinoTransport } from "@loglayer/transport-pino"
import { WinstonTransport } from "@loglayer/transport-winston"

const log = new LogLayer({
  transport: [
    new PinoTransport({
      logger: pinoLogger
    }),
    new WinstonTransport({
      logger: winstonLogger
    })
  ]
})
```
