---
title: Express Integration
description: Integrate LogLayer with Express for request-scoped logging
---

# Express Integration <Badge type="tip" text="Server" /> <Badge type="info" text="Bun" /> <Badge type="info" text="Deno" />

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Fexpress)](https://www.npmjs.com/package/@loglayer/express)

[Source](https://github.com/loglayer/loglayer/tree/master/packages/integrations/express)

An [Express](https://expressjs.com) middleware that provides request-scoped logging with automatic request/response logging and error handling. The auto-logging format follows [pino-http](https://github.com/pinojs/pino-http) conventions.

## Installation

::: code-group

```sh [npm]
npm i @loglayer/express loglayer @loglayer/transport-simple-pretty-terminal serialize-error
```

```sh [pnpm]
pnpm add @loglayer/express loglayer @loglayer/transport-simple-pretty-terminal serialize-error
```

```sh [yarn]
yarn add @loglayer/express loglayer @loglayer/transport-simple-pretty-terminal serialize-error
```

:::

We're using [Simple Pretty Terminal](/transports/simple-pretty-terminal) here as an example to get nicely formatted logs. Any LogLayer-compatible transport can be used, including [Pino](/transports/pino), [LogTape](/transports/logtape), [Structured](/transports/structured-logger), [Console](/transports/console), and [others](/transports/).

## Basic Usage

```typescript
import express from "express";
import { LogLayer } from "loglayer";
import { serializeError } from "serialize-error";
import { getSimplePrettyTerminal, moonlight } from "@loglayer/transport-simple-pretty-terminal";
import { expressLogLayer, expressLogLayerErrorHandler } from "@loglayer/express";

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: getSimplePrettyTerminal({
    runtime: "node",
    theme: moonlight,
  }),
});

const app = express();
app.use(expressLogLayer({ instance: log }));

app.get("/", (req, res) => {
  req.log.info("Hello from route!");
  res.send("Hello World!");
});

app.get("/api/users/:id", (req, res) => {
  req.log.withMetadata({ userId: req.params.id }).info("Fetching user");
  res.json({ id: req.params.id, name: "John" });
});

// Error handler (must be registered after routes)
app.use(expressLogLayerErrorHandler());
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).send("Internal Server Error");
});

app.listen(3000);
```

Each request automatically gets:
- A child logger with a unique `requestId` in its context
- Automatic request and response logging following pino-http conventions
- Access to the logger via `req.log` with full LogLayer API

The middleware attaches a LogLayer child logger to `req.log`, so you can use it directly in your route handlers.

::: tip TypeScript Support
Importing from `@loglayer/express` automatically augments the Express `Request` interface, so `req.log` has all LogLayer methods available with full type safety.
:::

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `instance` | `ILogLayer` | *required* | The LogLayer instance to use |
| `requestId` | `boolean \| (request: Request) => string` | `true` | Controls request ID generation |
| `autoLogging` | `boolean \| ExpressAutoLoggingConfig` | `true` | Controls automatic request/response logging |
| `contextFn` | `(request: Request) => Record<string, any>` | - | Extract additional context from requests |
| `group` | `boolean \| ExpressGroupConfig` | - | Tag auto-logged messages with [groups](/logging-api/groups) for transport routing |

### Auto-Logging Configuration

When `autoLogging` is an object:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `logLevel` | `string` | `"info"` | Default log level for request/response logs |
| `ignore` | `Array<string \| RegExp>` | `[]` | Paths to exclude from auto-logging |
| `request` | `boolean \| ExpressRequestLoggingConfig` | `true` | Controls request logging (fires when request is received) |
| `response` | `boolean \| ExpressResponseLoggingConfig` | `true` | Controls response logging (fires after response is sent) |

Both `request` and `response` accept an object with a `logLevel` property to override the default log level.

### Request Log Output

When enabled (default), request logging produces:
- **Message**: `"incoming request"`
- **Metadata**: `{ req: { method, url, remoteAddress } }`

### Response Log Output

When enabled (default), response logging produces:
- **Message**: `"request completed"`
- **Metadata**: `{ req: { method, url, remoteAddress }, res: { statusCode }, responseTime }`

The `remoteAddress` is resolved from Express's `req.ip`, which respects the `trust proxy` setting.

### Example Log Output

With the default configuration using [Structured Transport](/transports/structured-logger), a `GET /api/users` request produces two log entries:

```json
// incoming request
{
  "level": "info",
  "time": "2026-02-13T10:30:45.123Z",
  "msg": "incoming request",
  "req": { "method": "GET", "url": "/api/users", "remoteAddress": "127.0.0.1" },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}

// request completed
{
  "level": "info",
  "time": "2026-02-13T10:30:45.135Z",
  "msg": "request completed",
  "req": { "method": "GET", "url": "/api/users", "remoteAddress": "127.0.0.1" },
  "res": { "statusCode": 200 },
  "responseTime": 12,
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Examples

### Custom Log Levels

```typescript
app.use(expressLogLayer({
  instance: log,
  autoLogging: {
    request: { logLevel: "debug" },
    response: { logLevel: "info" },
  },
}));
```

### Disable Request Logging (Response Only)

```typescript
app.use(expressLogLayer({
  instance: log,
  autoLogging: {
    request: false,
  },
}));
```

### Custom Request ID

```typescript
app.use(expressLogLayer({
  instance: log,
  requestId: (req) =>
    (req.headers["x-request-id"] as string) ?? crypto.randomUUID(),
}));
```

### Disable Auto-Logging

```typescript
app.use(expressLogLayer({
  instance: log,
  autoLogging: false,
}));
```

### Ignore Health Check Paths

```typescript
app.use(expressLogLayer({
  instance: log,
  autoLogging: {
    ignore: ["/health", "/ready", /^\/internal\//],
  },
}));
```

### Additional Context from Request

```typescript
app.use(expressLogLayer({
  instance: log,
  contextFn: (req) => ({
    userAgent: req.headers["user-agent"],
    host: req.headers.host,
  }),
}));
```

### Error Handling

Errors are logged via a separate error-handling middleware. Register it after your routes:

```typescript
app.get("/fail", () => {
  throw new Error("Something went wrong");
});

// Log errors automatically
app.use(expressLogLayerErrorHandler());

// Send error response to client
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).send("Internal Server Error");
});
```

### Group Routing

Tag auto-logged messages (request, response, errors) with [groups](/logging-api/groups) so you can route or filter them. User logs from route handlers are **not** tagged.

```typescript
const log = new LogLayer({
  transport: [
    new ConsoleTransport({ id: 'console', logger: console }),
    new DatadogTransport({ id: 'datadog', logger: datadog }),
  ],
  groups: {
    express: { transports: ['datadog'] },
    'express.request': { transports: ['datadog'] },
    'express.response': { transports: ['console', 'datadog'] },
  },
})

// Use default group names: name="express", request="express.request", response="express.response"
app.use(expressLogLayer({ instance: log, group: true }))
app.use(expressLogLayerErrorHandler({ group: true }))

// Or use custom group names
app.use(expressLogLayer({
  instance: log,
  group: {
    name: 'api',             // error logs
    request: 'api.request',  // auto-logged requests
    response: 'api.response', // auto-logged responses
  },
}))
app.use(expressLogLayerErrorHandler({
  group: {
    name: 'api',
  },
}))
```

When `group` is `true` or an object:
| Group | Default | Applied to |
|-------|---------|------------|
| `name` | `"express"` | Error logs (via `expressLogLayerErrorHandler`) |
| `request` | `"express.request"` | Auto-logged incoming request messages |
| `response` | `"express.response"` | Auto-logged response messages |

### Using with Other Express Middleware

```typescript
import cors from "cors";

const app = express();
app.use(expressLogLayer({ instance: log }));
app.use(cors());

app.get("/", (req, res) => {
  req.log.info("Works with other middleware!");
  res.send("ok");
});
```
