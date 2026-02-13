# Hono integration for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Fhono)](https://www.npmjs.com/package/@loglayer/hono)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Fhono)](https://www.npmjs.com/package/@loglayer/hono)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

A [Hono](https://hono.dev) middleware for [LogLayer](https://loglayer.dev) that provides request-scoped logging with automatic request/response logging and error handling.

## Installation

```bash
npm install @loglayer/hono
```

## Usage

```typescript
import { Hono } from "hono";
import { LogLayer, StructuredTransport } from "loglayer";
import { honoLogLayer, type HonoLogLayerEnv } from "@loglayer/hono";

const log = new LogLayer({
  transport: new StructuredTransport({ logger: console }),
});

const app = new Hono<HonoLogLayerEnv>();
app.use(honoLogLayer({ instance: log }));

app.get("/", (c) => {
  c.var.logger.info("Hello!");
  return c.text("Hello World!");
});

export default app;
```

## Documentation

For more details, visit [https://loglayer.dev/integrations/hono](https://loglayer.dev/integrations/hono)
