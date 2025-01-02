# LogLayer with Express

LogLayer can be easily integrated with Express as middleware to provide request-scoped logging via `req.log`. This guide will show you how to set it up.

## Installation

First, install the required packages. You can use any transport you prefer - we'll use Pino in this example:

::: code-group

```sh [npm]
npm i loglayer @loglayer/transport-pino pino express
```

```sh [pnpm]
pnpm add loglayer @loglayer/transport-pino pino express
```

```sh [yarn]
yarn add loglayer @loglayer/transport-pino pino express
```

:::

## Setup

Here's how to set up LogLayer as Express middleware:

```typescript
import express from 'express'
import pino from 'pino'
import { LogLayer } from 'loglayer'
import { PinoTransport } from '@loglayer/transport-pino'

// Create a Pino instance (only needs to be done once)
const pinoLogger = pino({
  level: 'trace' // Set to desired log level
})

const app = express()

// Add types for the req.log property
declare global {
  namespace Express {
    interface Request {
      log: LogLayer
    }
  }
}

// Define logging middleware
app.use((req, res, next) => {
  // Create a new LogLayer instance for each request
  req.log = new LogLayer({
    transport: new PinoTransport({
      logger: pinoLogger
    }),
    // Add request-specific context that will be included in all logs
    context: {
      reqId: crypto.randomUUID(), // Add unique request ID
      method: req.method,
      path: req.path,
      ip: req.ip
    }
  })
  
  next()
})

// Use the logger in your routes
app.get('/', (req, res) => {
  req.log.info('Processing request to root endpoint')
  
  // Add additional context for specific logs
  req.log
    .withContext({ query: req.query })
    .info('Request includes query parameters')
  
  res.send('Hello World!')
})

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  req.log.withError(err).error('An error occurred while processing the request')
  res.status(500).send('Internal Server Error')
})

app.listen(3000, () => {
  console.log('Server started on port 3000')
})
```

