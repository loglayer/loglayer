# ElysiaJS integration for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Felysia)](https://www.npmjs.com/package/@loglayer/elysia)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Felysia)](https://www.npmjs.com/package/@loglayer/elysia)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

An [ElysiaJS](https://elysiajs.com) plugin for [LogLayer](https://loglayer.dev) that provides request-scoped logging with automatic request/response logging and error handling.

## Installation

```bash
npm install @loglayer/elysia
```

## Usage

```typescript
import { Elysia } from "elysia";
import { LogLayer } from "loglayer";
import { getSimplePrettyTerminal, moonlight } from "@loglayer/transport-simple-pretty-terminal";
import { elysiaLogLayer } from "@loglayer/elysia";

const log = new LogLayer({
  transport: getSimplePrettyTerminal({
    runtime: "node",
    theme: moonlight,
  }),
});

const app = new Elysia()
  .use(elysiaLogLayer({ instance: log }))
  .get("/", ({ log }) => {
    log.info("Hello!");
    return "Hello World!";
  })
  .listen(3000);
```

## Documentation

For more details, visit [https://loglayer.dev/integrations/elysia](https://loglayer.dev/integrations/elysia)
