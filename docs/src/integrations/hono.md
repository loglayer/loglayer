---
title: Hono Integration
description: Integrate LogLayer with Hono for request-scoped logging
---

# Hono Integration <Badge type="tip" text="Server" />

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Fhono)](https://www.npmjs.com/package/@loglayer/hono)

[Source](https://github.com/loglayer/loglayer/tree/master/packages/integrations/hono)

A [Hono](https://hono.dev) middleware that provides request-scoped logging with automatic request/response logging and error handling. The auto-logging format follows [pino-http](https://github.com/pinojs/pino-http) conventions.

## Installation

::: code-group

```sh [npm]
npm i @loglayer/hono loglayer @loglayer/transport-simple-pretty-terminal serialize-error
```

```sh [pnpm]
pnpm add @loglayer/hono loglayer @loglayer/transport-simple-pretty-terminal serialize-error
```

```sh [yarn]
yarn add @loglayer/hono loglayer @loglayer/transport-simple-pretty-terminal serialize-error
```

:::

We're using [Simple Pretty Terminal](/transports/simple-pretty-terminal) here as an example to get nicely formatted logs. Any LogLayer-compatible transport can be used, including [Pino](/transports/pino), [LogTape](/transports/logtape), [Structured](/transports/structured-logger), [Console](/transports/console), and [others](/transports/).

## Basic Usage

```typescript
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { LogLayer } from "loglayer";
import { serializeError } from "serialize-error";
import { getSimplePrettyTerminal, moonlight } from "@loglayer/transport-simple-pretty-terminal";
import { honoLogLayer, type HonoLogLayerEnv } from "@loglayer/hono";

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: getSimplePrettyTerminal({
    runtime: "node",
    theme: moonlight,
  }),
});

const app = new Hono<HonoLogLayerEnv>();
app.use(honoLogLayer({ instance: log }));

app.get("/", (c) => {
  c.var.logger.info("Hello from route!");
  return c.text("Hello World!");
});

app.get("/api/users/:id", (c) => {
  const id = c.req.param("id");
  c.var.logger.withMetadata({ userId: id }).info("Fetching user");
  return c.json({ id, name: "John" });
});

serve({ fetch: app.fetch, port: 3000 });
```

Each request automatically gets:
- A child logger with a unique `requestId` in its context
- Automatic request and response logging following pino-http conventions

The middleware sets a LogLayer child logger on `c.var.logger`, so you can use it directly in your route handlers with full access to LogLayer's API.

::: tip TypeScript Support
The package exports a `HonoLogLayerEnv` type. Pass it as a generic to `new Hono<HonoLogLayerEnv>()` for full type safety with `c.var.logger`. This follows the idiomatic Hono Env generic pattern.
:::

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `instance` | `ILogLayer` | *required* | The LogLayer instance to use |
| `requestId` | `boolean \| (request: Request) => string` | `true` | Controls request ID generation |
| `autoLogging` | `boolean \| HonoAutoLoggingConfig` | `true` | Controls automatic request/response logging |
| `contextFn` | `(context: { request: Request, path: string }) => Record<string, any>` | - | Extract additional context from requests |

### Auto-Logging Configuration

When `autoLogging` is an object:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `logLevel` | `string` | `"info"` | Default log level for request/response logs |
| `ignore` | `Array<string \| RegExp>` | `[]` | Paths to exclude from auto-logging |
| `request` | `boolean \| HonoRequestLoggingConfig` | `true` | Controls request logging (fires when request is received) |
| `response` | `boolean \| HonoResponseLoggingConfig` | `true` | Controls response logging (fires after response is sent) |

Both `request` and `response` accept an object with a `logLevel` property to override the default log level.

### Request Log Output

When enabled (default), request logging produces:
- **Message**: `"incoming request"`
- **Metadata**: `{ req: { method, url, remoteAddress } }`

### Response Log Output

When enabled (default), response logging produces:
- **Message**: `"request completed"`
- **Metadata**: `{ req: { method, url, remoteAddress }, res: { statusCode }, responseTime }`

The `remoteAddress` is resolved from `x-forwarded-for` or `x-real-ip` headers.

### Example Log Output

With the default configuration using [Structured Transport](/transports/structured-logger), a `GET /api/users` request produces two log entries:

```json
// incoming request
{
  "level": "info",
  "time": "2026-02-12T10:30:45.123Z",
  "msg": "incoming request",
  "req": { "method": "GET", "url": "/api/users", "remoteAddress": "127.0.0.1" },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}

// request completed
{
  "level": "info",
  "time": "2026-02-12T10:30:45.135Z",
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
app.use(honoLogLayer({
  instance: log,
  autoLogging: {
    request: { logLevel: "debug" },
    response: { logLevel: "info" },
  },
}));
```

### Disable Request Logging (Response Only)

```typescript
app.use(honoLogLayer({
  instance: log,
  autoLogging: {
    request: false,
  },
}));
```

### Custom Request ID

```typescript
app.use(honoLogLayer({
  instance: log,
  requestId: (request) =>
    request.headers.get("x-request-id") ?? crypto.randomUUID(),
}));
```

### Disable Auto-Logging

```typescript
app.use(honoLogLayer({
  instance: log,
  autoLogging: false,
}));
```

### Ignore Health Check Paths

```typescript
app.use(honoLogLayer({
  instance: log,
  autoLogging: {
    ignore: ["/health", "/ready", /^\/internal\//],
  },
}));
```

### Additional Context from Request

```typescript
app.use(honoLogLayer({
  instance: log,
  contextFn: ({ request }) => ({
    userAgent: request.headers.get("user-agent"),
    host: request.headers.get("host"),
  }),
}));
```

### Error Handling

Use Hono's `app.onError` handler to log errors with the request-scoped logger:

```typescript
app.onError((err, c) => {
  c.var.logger.withError(err).error("Request error");
  return c.text("Internal Server Error", 500);
});

app.get("/fail", () => {
  throw new Error("Something went wrong");
  // Automatically logged via app.onError
});
```

::: tip
Hono's error handler runs after the middleware chain, so `c.var.logger` is available with the full request context (requestId, custom context, etc.).
:::

### Using with Other Hono Middleware

```typescript
import { cors } from "hono/cors";

const app = new Hono();
app.use(honoLogLayer({ instance: log }));
app.use(cors());

app.get("/", (c) => {
  c.var.logger.info("Works with other middleware!");
  return c.text("ok");
});
```
