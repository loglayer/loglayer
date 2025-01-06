---
title: Using LogLayer with Fastify
description: Learn how to implement LogLayer with Fastify
---

# LogLayer with Fastify

## Installation

First, install the required packages. Pino is the default logger for Fastify, so we'll use it in this example:

::: code-group

```sh [npm]
npm i loglayer @loglayer/transport-pino pino fastify serialize-error
```

```sh [pnpm]
pnpm add loglayer @loglayer/transport-pino pino fastify serialize-error
```

```sh [yarn]
yarn add loglayer @loglayer/transport-pino pino fastify serialize-error
```

## Example

```typescript
import Fastify from 'fastify'
import { type P, pino } from "pino";
import { ILogLayer, LogLayer } from 'loglayer'
import { PinoTransport } from '@loglayer/transport-pino'
import { serializeError } from 'serialize-error';

declare module 'fastify' {
  interface FastifyBaseLogger extends ILogLayer {}
}

let p: P.Logger = pino();

const logger = new LogLayer({
  transport: new PinoTransport({
    logger: p,
  }),
  errorSerializer: serializeError,
});

const fastify = Fastify({
  // @ts-ignore LogLayer doesn't implement some of Fastify's logger interface
  // but we've found this hasn't been an issue in production usage
  loggerInstance: logger,
  // This makes logs extremely verbose, so only disable for debugging
  disableRequestLogging: true,
})

// Add request path to logs
fastify.addHook('onRequest', async (request, reply) => {
  // @ts-ignore LogLayer doesn't implement some of Fastify's logger interface
  request.log = request.log.withContext({ path: request.url });
});

// Declare a route
fastify.get('/', function (request, reply) {
  request.log.info('hello world')
  reply.send({ hello: 'world' })
})

// Run the server!
fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.withError(err).error("error starting server")
    process.exit(1)
  }
  // Server is now listening on ${address}
})
```
