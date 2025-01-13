---
title: OpenTelemetry Plugin
description: Add OpenTelemetry trace context to logs using LogLayer
---

# OpenTelemetry Plugin

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Fplugin-opentelemetry)](https://www.npmjs.com/package/@loglayer/plugin-opentelemetry)

[Plugin Source](https://github.com/loglayer/loglayer/tree/master/packages/plugins/opentelemetry)

The OpenTelemetry plugin for [LogLayer](https://loglayer.dev) uses the [`@opentelemetry/api`](https://www.npmjs.com/package/@opentelemetry/api)
to store the following in the log context:

- `trace_id`
- `span_id`
- `trace_flags`

::: info
If you are using OpenTelemetry with log processors, use the [OpenTelemetry Transport](/transports/opentelemetry).
If you don't know what that is, then you'll want to use this plugin instead of the transport.
:::

## Installation

::: code-group

```bash [npm]
npm install loglayer @loglayer/plugin-opentelemetry
```

```bash [yarn]
yarn add loglayer @loglayer/plugin-opentelemetry
```

```bash [pnpm]
pnpm add loglayer @loglayer/plugin-opentelemetry
```

:::

## Usage

Follow the [OpenTelemetry Getting Started Guide](https://opentelemetry.io/docs/languages/js/getting-started/nodejs/) to set up OpenTelemetry in your application.

```typescript
import { LogLayer, ConsoleTransport } from 'loglayer'
import { openTelemetryPlugin } from '@loglayer/plugin-opentelemetry'

const logger = new LogLayer({
  transport: [
    new ConsoleTransport({
      logger: console
    }),
  ],
  plugins: [
    openTelemetryPlugin()
  ]
});
```

## Example with Express

This example has been tested to work with the plugin.

- It sets up `express`-based instrumentation using OpenTelemetry
- Going to the root endpoint will log a message with the request context

### Installation

::: info
This setup assumes you have Typescript configured and have `tsx` installed as a dev dependency.
:::

::: code-group

```bash [npm]
npm install express loglayer @loglayer/plugin-opentelemetry serialize-error \
  @opentelemetry/instrumentation-express @opentelemetry/instrumentation-http \
  @opentelemetry/resources @opentelemetry/sdk-node \
  @opentelemetry/semantic-conventions
```

```bash [yarn]
yarn add express loglayer @loglayer/plugin-opentelemetry serialize-error \
  @opentelemetry/instrumentation-express @opentelemetry/instrumentation-http \
  @opentelemetry/resources @opentelemetry/sdk-node \
  @opentelemetry/semantic-conventions
```

```bash [pnpm]
pnpm add express loglayer @loglayer/plugin-opentelemetry serialize-error \
  @opentelemetry/instrumentation-express @opentelemetry/instrumentation-http \
  @opentelemetry/resources @opentelemetry/sdk-node \
  @opentelemetry/semantic-conventions
```

:::

### Files

#### instrumentation.ts

```typescript
// instrumentation.ts
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { Resource } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";

const sdk = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: "yourServiceName",
    [ATTR_SERVICE_VERSION]: "1.0",
  }),
  instrumentations: [
    // Express instrumentation expects HTTP layer to be instrumented
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
});

sdk.start();
```

#### app.ts

```typescript
// app.ts
import express from "express";
import { type ILogLayer, LogLayer } from "loglayer";
import { serializeError } from "serialize-error";
import { OpenTelemetryTransport } from "@loglayer/transport-opentelemetry";

const app = express();

// Add types for the req.log property
declare global {
  namespace Express {
    interface Request {
      log: ILogLayer;
    }
  }
}

// Define logging middleware
app.use((req, res, next) => {
  // Create a new LogLayer instance for each request
  req.log = new LogLayer({
    transport: new ConsoleTransport({
      logger: console,
    }),
    errorSerializer: serializeError,
    plugins: [openTelemetryPlugin()],
  }).withContext({
    reqId: crypto.randomUUID(), // Add unique request ID
    method: req.method,
    path: req.path,
  });

  next();
});

function sayHelloWorld(req: express.Request) {
  req.log.info("Printing hello world");

  return "Hello world!";
}

// Use the logger in your routes
app.get("/", (req, res) => {
  req.log.info("Processing request to root endpoint");

  // Add additional context for specific logs
  req.log.withContext({ query: req.query }).info("Request includes query parameters");

  res.send(sayHelloWorld(req));
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  req.log.withError(err).error("An error occurred while processing the request");
  res.status(500).send("Internal Server Error");
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
```

### Running the Example

```bash
npx tsx --import ./instrumentation.ts ./app.ts
```

Then visit `http://localhost:3000` in your browser.

### Sample Output

Output might look like this:

```text
{
  reqId: 'c34ab246-fc51-4b69-9ba6-5e0dfa150e5a',
  method: 'GET',
  path: '/',
  query: {},
  trace_id: '8de71fcab951aad172f1148c74d0877e',
  span_id: '349623465c6dfc1b',
  trace_flags: '01'
} Printing hello world
``` 
