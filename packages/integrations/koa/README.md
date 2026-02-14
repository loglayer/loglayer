# Koa integration for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Fkoa)](https://www.npmjs.com/package/@loglayer/koa)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Fkoa)](https://www.npmjs.com/package/@loglayer/koa)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

A [Koa](https://koajs.com) middleware for [LogLayer](https://loglayer.dev) that provides request-scoped logging with automatic request/response logging and error handling.

## Installation

```bash
npm install @loglayer/koa
```

## Usage

```typescript
import Koa from "koa";
import { LogLayer, StructuredTransport } from "loglayer";
import { koaLogLayer } from "@loglayer/koa";

const log = new LogLayer({
  transport: new StructuredTransport({ logger: console }),
});

const app = new Koa();
app.use(koaLogLayer({ instance: log }));

app.use((ctx) => {
  ctx.log.info("Hello!");
  ctx.body = "Hello World!";
});

app.listen(3000);
```

## Documentation

For more details, visit [https://loglayer.dev/integrations/koa](https://loglayer.dev/integrations/koa)
