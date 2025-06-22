---
title: Using LogLayer with Hono
description: Learn how to implement LogLayer with Hono
---

# LogLayer with Hono

LogLayer can be easily integrated with [Hono](https://hono.dev/) using its context system to provide request-scoped logging with full type safety. This guide will show you how to set it up.

This guide assumes you already have Hono installed with a project created.

## Installation

First, install the required packages. You can use any transport you prefer - we'll use Pino in this example:

::: code-group

```sh [npm]
npm i loglayer @loglayer/transport-pino pino serialize-error
```

```sh [pnpm]
pnpm add loglayer @loglayer/transport-pino pino serialize-error
```

```sh [yarn]
yarn add loglayer @loglayer/transport-pino pino serialize-error
```

:::

## Example

Create a `logger.ts` file:

```typescript
// logger.ts
import { LogLayer } from 'loglayer'
import { PinoTransport } from '@loglayer/transport-pino'
import { serializeError } from 'serialize-error'
import { pino } from 'pino'

// Create a Pino instance (only needs to be done once)
const pinoLogger = pino({
  level: 'trace' // Set to desired log level
})

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: [
    new PinoTransport({
      logger: pinoLogger
    })
  ]
})

export function getLogger() {
  return log;
}
```

Then in your application:

```typescript
// index.ts
import { Hono } from 'hono'
import { serve } from "@hono/node-server";
import { createMiddleware } from 'hono/factory'
import { type ILogLayer } from 'loglayer'
import { getLogger } from "./logger.js";

// Define the context variables for type safety
type Variables = {
  log: ILogLayer
}

const app = new Hono<{ Variables: Variables }>()

const loggerMiddleware = createMiddleware(async (c, next) => {
  // Create a new LogLayer instance for each request
  const log = getLogger().child().withContext({
    reqId: crypto.randomUUID(), // Add unique request ID
    method: c.req.method,
    path: c.req.path,
  })

  // Set the logger in the context for type safety
  c.set('log', log)

  await next()
})

app.use('*', loggerMiddleware)

// Use the logger in your routes
app.get('/', (c) => {
  const log = c.get('log') // Fully typed!

  log.info('Processing request to root endpoint')

  // Add additional context for specific logs
  log
    .withContext({ query: c.req.query() })
    .info('Request includes query parameters')

  return c.text('Hello World!')
})

// Example with error handling
app.get('/api/users/:id', async (c) => {
  const log = c.get('log')
  const userId = c.req.param('id')

  try {
    log.withContext({ userId }).info('Fetching user data')

    // Simulate some async operation
    const user = await fetchUser(userId)

    log.withContext({ userId }).info('User data retrieved successfully')
    return c.json(user)
  } catch (error) {
    log.withError(error).withMetadata({ userId }).error('Failed to fetch user data')
    return c.json({ error: 'User not found' }, 404)
  }
})

// Error handling middleware
app.onError((err, c) => {
  const log = c.get('log')
  log.withError(err).error('An error occurred while processing the request')
  return c.json({ error: 'Internal Server Error' }, 500)
})

// Helper function for demonstration
async function fetchUser(id: string) {
  // Simulate database lookup
  if (id === '123') {
    return { id: '123', name: 'John Doe' }
  }
  throw new Error('User not found')
}

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  getLogger().info(`Server is running on http://localhost:${info.port}`)
})

export default app
```

## Using Async Local Storage

You will most likely want to use async local storage to avoid passing the logger around in your code. 
See an example of how to do this [here](./async-context).
