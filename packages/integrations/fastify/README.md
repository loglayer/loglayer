# Fastify integration for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ffastify)](https://www.npmjs.com/package/@loglayer/fastify)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Ffastify)](https://www.npmjs.com/package/@loglayer/fastify)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

A [Fastify](https://fastify.dev) plugin for [LogLayer](https://loglayer.dev) that provides request-scoped logging with automatic request/response logging and error handling.

## Installation

```bash
npm install @loglayer/fastify
```

## Usage

```typescript
import Fastify from "fastify";
import { LogLayer, StructuredTransport } from "loglayer";
import { fastifyLogLayer } from "@loglayer/fastify";

const log = new LogLayer({
  transport: new StructuredTransport({ logger: console }),
});

const app = Fastify();
await app.register(fastifyLogLayer, { instance: log });

app.get("/", (request, reply) => {
  request.log.info("Hello!");
  reply.send("Hello World!");
});

await app.listen({ port: 3000 });
```

## Documentation

For more details, visit [https://loglayer.dev/integrations/fastify](https://loglayer.dev/integrations/fastify)
