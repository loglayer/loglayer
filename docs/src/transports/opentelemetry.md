---
title: OpenTelemetry Transport
description: Send logs to OpenTelemetry with the LogLayer logging library
---

# OpenTelemetry Transport

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-opentelemetry)](https://www.npmjs.com/package/@loglayer/transport-opentelemetry)

[Transport Source](https://github.com/loglayer/loglayer/tree/master/packages/transports/opentelemetry)

The OpenTelemetry transport sends logs using the [OpenTelemetry Logs SDK](https://www.npmjs.com/package/@opentelemetry/sdk-logs). This allows you to integrate logs with OpenTelemetry's observability ecosystem.

Compatible with OpenTelemetry JS API and SDK `1.0+`.

::: info
In most cases, you should use the [OpenTelemetry Plugin](/plugins/opentelemetry) instead as it stamps logs with trace context.
Use this transport if you are using OpenTelemetry log processors, where the log processors do the actual shipping of logs.
:::

### Acknowledgements

A lot of the code is based on the [@opentelemetry/winston-transport](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/winston-transport) code,
which is licensed under Apache 2.0.

## Installation

::: code-group

```bash [npm]
npm install loglayer @loglayer/transport-opentelemetry serialize-error
```

```bash [yarn]
yarn add loglayer @loglayer/transport-opentelemetry serialize-error
```

```bash [pnpm]
pnpm add loglayer @loglayer/transport-opentelemetry serialize-error
```

:::

## Usage

Follow the [OpenTelemetry Getting Started Guide](https://opentelemetry.io/docs/languages/js/getting-started/nodejs/) to set up OpenTelemetry in your application.

```typescript
import { LogLayer } from 'loglayer'
import { OpenTelemetryTransport } from '@loglayer/transport-opentelemetry'
import { serializeError } from 'serialize-error'

const logger = new LogLayer({
  errorSerializer: serializeError,
  // This will send logs to the OpenTelemetry SDK
  // Where it sends to depends on the configured logRecordProcessors in the SDK
  transport: [
    new OpenTelemetryTransport({
      // Optional: provide a custom error handler
      onError: (error) => console.error('OpenTelemetry logging error:', error),
        
      // Optional: disable the transport
      enabled: process.env.NODE_ENV !== 'test',
        
      // Optional: enable console debugging
      consoleDebug: process.env.DEBUG === 'true'
    }),
  ],
});
```

## Configuration Options

### `level`

Minimum log level to process. Logs below this level will be filtered out.
- Type: `'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'`
- Default: `'trace'` (allows all logs)

Example:
```typescript
// Only process info logs and above (info, warn, error, fatal)
new OpenTelemetryTransport({ level: 'info' })

// Process all logs (default behavior)
new OpenTelemetryTransport()
```

### `onError`

Callback to handle errors that occur when logging.
- Type: `(error: any) => void`
- Default: `undefined`

### `enabled`

Enable or disable the transport.
- Type: `boolean`
- Default: `true`

### `consoleDebug`

Enable console debugging for the transport.
- Type: `boolean`
- Default: `false`

## Example with Express

This example has been tested to work with the `OpenTelemetryTransport`. 

- It uses the OpenTelemetry SDK to send logs to the console (via `logRecordProcessors`)
- It sets up `express`-based instrumentation using OpenTelemetry
- Going to the root endpoint will log a message with the request context

### Installation

::: info
This setup assumes you have Typescript configured and have `tsx` installed as a dev dependency.
:::

::: code-group

```bash [npm]
npm install express loglayer @loglayer/transport-opentelemetry serialize-error \
  @opentelemetry/instrumentation-express @opentelemetry/instrumentation-http \
  @opentelemetry/resources @opentelemetry/sdk-logs @opentelemetry/sdk-node \
  @opentelemetry/sdk-trace-node @opentelemetry/semantic-conventions
```

```bash [yarn]
yarn add express loglayer @loglayer/transport-opentelemetry serialize-error \
  @opentelemetry/instrumentation-express @opentelemetry/instrumentation-http \
  @opentelemetry/resources @opentelemetry/sdk-logs @opentelemetry/sdk-node \
  @opentelemetry/sdk-trace-node @opentelemetry/semantic-conventions
```

```bash [pnpm]
pnpm add express loglayer @loglayer/transport-opentelemetry serialize-error \
  @opentelemetry/instrumentation-express @opentelemetry/instrumentation-http \
  @opentelemetry/resources @opentelemetry/sdk-logs @opentelemetry/sdk-node \
  @opentelemetry/sdk-trace-node @opentelemetry/semantic-conventions
```

:::

### Files

#### instrumentation.ts

```typescript
// instrumentation.ts
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { Resource } from "@opentelemetry/resources";
import { ConsoleLogRecordExporter, SimpleLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";

const sdk = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: "yourServiceName",
    [ATTR_SERVICE_VERSION]: "1.0",
  }),
  traceExporter: new ConsoleSpanExporter(),
  logRecordProcessors: [new SimpleLogRecordProcessor(new ConsoleLogRecordExporter())],
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
    transport: [new OpenTelemetryTransport({
      // Optional: provide a custom error handler
      onError: (error) => console.error('OpenTelemetry logging error:', error),
      
      // Optional: provide a custom ID
      id: 'otel-transport',
      
      // Optional: disable the transport
      enabled: process.env.NODE_ENV !== 'test',
      
      // Optional: enable console debugging
      consoleDebug: process.env.DEBUG === 'true'
    })],
    errorSerializer: serializeError,
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

```json
{
  "resource": {
    "attributes": {
      "service.name": "yourServiceName",
      "telemetry.sdk.language": "nodejs",
      "telemetry.sdk.name": "opentelemetry",
      "telemetry.sdk.version": "1.30.0",
      "service.version": "1.0"
    }
  },
  "instrumentationScope": {
    "name": "loglayer",
    "version": "5.1.1",
    "schemaUrl": "undefined"
  },
  "timestamp": 1736730221608000,
  "traceId": "c738a5f750b89f988d679235405e1b3b",
  "spanId": "676f11075b9785d9",
  "traceFlags": 1,
  "severityText": "info",
  "severityNumber": 9,
  "body": "Printing hello world",
  "attributes": {
    "reqId": "3164c21c-d195-49be-b757-3e056881f3d6",
    "method": "GET",
    "path": "/"
  }
}
``` 