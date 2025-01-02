# Fastify Integration

This guide demonstrates how to integrate LogLayer with Fastify to handle logging in your application.

## Installation

::: code-group

```bash [npm]
npm install loglayer @loglayer/transport-pino pino fastify
```

```bash [yarn]
yarn add loglayer @loglayer/transport-pino pino fastify
```

```bash [pnpm]
pnpm add loglayer @loglayer/transport-pino pino fastify
```

:::

## Integration

Here's a basic example of how to integrate LogLayer with Fastify:

```typescript
import fastify from 'fastify'
import { LogLayer } from 'loglayer'
import { PinoTransport } from '@loglayer/transport-pino'
import { pino } from 'pino'
import { randomUUID } from 'crypto'

declare module "fastify" {
  interface FastifyBaseLogger extends LogLayer {}
}

// Initialize LogLayer with Pino transport
const logger = new LogLayer({
  service: 'fastify-service',
  environment: process.env.NODE_ENV || 'development',
  transport: new PinoTransport({
    logger: pino()
  })
})

// Create Fastify instance with custom logger
const app = fastify({
  // @ts-ignore
  loggerInstance: logger.child({ component: 'fastify' })
})

// Add request ID hook
app.addHook('onRequest', async (request, reply) => {
  const requestId = request.headers['x-request-id'] || randomUUID()
  reply.header('x-request-id', requestId)
  
  // Create a child logger with request context
  request.log = request.log.withContext({
    requestId,
    path: request.url,
    method: request.method
  })
})

// Add a route
app.get('/', async (request, reply) => {
  request.log.info('Processing root request')
  return { hello: 'world' }
})

// Error handling route
app.get('/error', async (request, reply) => {
  const error = new Error('Something went wrong')
  request.log
    .withError(error)
    .error('Error in request processing')
  throw error
})

// Add error handler
app.setErrorHandler((error, request, reply) => {
  request.log
    .withContext({ statusCode: 500 })
    .withError(error)
    .withMetadata({
      headers: request.headers,
      params: request.params,
      query: request.query
    })
    .error('Error occurred while processing request')
  
  reply.status(500).send({ error: 'Internal Server Error' })
})

// Start the server
const start = async () => {
  try {
    await app.listen({ port: 3000 })
    app.log
      .withContext({ port: 3000 })
      .withMetadata({ environment: process.env.NODE_ENV })
      .info('Server is running on http://localhost:3000')
  } catch (err) {
    app.log
      .withError(err)
      .withContext({ port: 3000 })
      .error('Failed to start server')
    process.exit(1)
  }
}

start()
```
