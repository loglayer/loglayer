# Express integration for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Fexpress)](https://www.npmjs.com/package/@loglayer/express)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Fexpress)](https://www.npmjs.com/package/@loglayer/express)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

An [Express](https://expressjs.com) middleware for [LogLayer](https://loglayer.dev) that provides request-scoped logging with automatic request/response logging and error handling.

## Installation

```bash
npm install @loglayer/express
```

## Usage

```typescript
import express from "express";
import { LogLayer, StructuredTransport } from "loglayer";
import { expressLogLayer, expressLogLayerErrorHandler } from "@loglayer/express";

const log = new LogLayer({
  transport: new StructuredTransport({ logger: console }),
});

const app = express();
app.use(expressLogLayer({ instance: log }));

app.get("/", (req, res) => {
  req.log.info("Hello!");
  res.send("Hello World!");
});

// Error handler (must be registered after routes)
app.use(expressLogLayerErrorHandler());

export default app;
```

## Documentation

For more details, visit [https://loglayer.dev/integrations/express](https://loglayer.dev/integrations/express)
