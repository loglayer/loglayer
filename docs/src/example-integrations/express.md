---
title: Using LogLayer with Express
description: Learn how to implement LogLayer with Express
---

# LogLayer with Express

::: tip First-Party Integration Available
For a batteries-included experience with automatic request/response logging, error handling, request IDs, and group routing, use the [`@loglayer/express`](/integrations/express) package instead.
:::

LogLayer can also be manually integrated with Express as middleware to provide request-scoped logging via `req.log`. This guide shows the manual approach.

## Installation

First, install the required packages. You can use any transport you prefer - we'll use Pino in this example:

::: code-group

```sh [npm]
npm i loglayer @loglayer/transport-pino pino express
```

```sh [pnpm]
pnpm add loglayer @loglayer/transport-pino pino express serialize-error
```

```sh [yarn]
yarn add loglayer @loglayer/transport-pino pino express serialize-error
```

:::

## Example

```typescript
import express from 'express'
import { pino } from 'pino'
import { ILogLayer, LogLayer } from 'loglayer'
import { PinoTransport } from '@loglayer/transport-pino'
import { serializeError } from 'serialize-error';

// Create a Pino instance (only needs to be done once)
const pinoLogger = pino({
  level: 'trace' // Set to desired log level
})

const app = express()

// Add types for the req.log property
declare global {
  namespace Express {
    interface Request {
      log: ILogLayer
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
    errorSerializer: serializeError,
  }).withContext({
    reqId: crypto.randomUUID(), // Add unique request ID
    method: req.method,
    path: req.path,
    ip: req.ip
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

## Using Async Local Storage

You will most likely want to use async local storage to avoid passing the logger around in your code. 
See an example of how to do this [here](./async-context).
