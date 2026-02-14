---
title: Koa Integration
description: Integrate LogLayer with Koa for request-scoped logging
---

# Koa Integration <Badge type="tip" text="Server" />

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Fkoa)](https://www.npmjs.com/package/@loglayer/koa)

[Source](https://github.com/loglayer/loglayer/tree/master/packages/integrations/koa)

A [Koa](https://koajs.com) middleware that provides request-scoped logging with automatic request/response logging and error handling. The auto-logging format follows [pino-http](https://github.com/pinojs/pino-http) conventions.

## Installation

::: code-group

```sh [npm]
npm i @loglayer/koa loglayer @loglayer/transport-simple-pretty-terminal serialize-error
```

```sh [pnpm]
pnpm add @loglayer/koa loglayer @loglayer/transport-simple-pretty-terminal serialize-error
```

```sh [yarn]
yarn add @loglayer/koa loglayer @loglayer/transport-simple-pretty-terminal serialize-error
```

:::

We're using [Simple Pretty Terminal](/transports/simple-pretty-terminal) here as an example to get nicely formatted logs. Any LogLayer-compatible transport can be used, including [Pino](/transports/pino), [LogTape](/transports/logtape), [Structured](/transports/structured-logger), [Console](/transports/console), and [others](/transports/).

## Basic Usage

```typescript
import Koa from "koa";
import { LogLayer } from "loglayer";
import { serializeError } from "serialize-error";
import { getSimplePrettyTerminal, moonlight } from "@loglayer/transport-simple-pretty-terminal";
import { koaLogLayer } from "@loglayer/koa";

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: getSimplePrettyTerminal({
    runtime: "node",
    theme: moonlight,
  }),
});

const app = new Koa();
app.use(koaLogLayer({ instance: log }));

app.use((ctx) => {
  ctx.log.info("Hello from route!");
  ctx.body = "Hello World!";
});

app.listen(3000);
```

Each request automatically gets:
- A child logger with a unique `requestId` in its context
- Automatic request and response logging following pino-http conventions
- Automatic error logging via try/catch (errors are re-thrown after logging)
- Access to the logger via `ctx.log` with full LogLayer API

The middleware attaches a LogLayer child logger to `ctx.log`, following the convention established by [koa-pino-logger](https://github.com/pinojs/koa-pino-logger).

::: tip TypeScript Support
Importing from `@loglayer/koa` automatically augments Koa's `ExtendableContext` interface, so `ctx.log` has all LogLayer methods available with full type safety.
:::

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `instance` | `ILogLayer` | *required* | The LogLayer instance to use |
| `requestId` | `boolean \| (ctx: Koa.Context) => string` | `true` | Controls request ID generation |
| `autoLogging` | `boolean \| KoaAutoLoggingConfig` | `true` | Controls automatic request/response logging |
| `contextFn` | `(ctx: Koa.Context) => Record<string, any>` | - | Extract additional context from the Koa context |
| `group` | `boolean \| KoaGroupConfig` | - | Tag auto-logged messages with [groups](/logging-api/groups) for transport routing |

### Auto-Logging Configuration

When `autoLogging` is an object:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `logLevel` | `string` | `"info"` | Default log level for request/response logs |
| `ignore` | `Array<string \| RegExp>` | `[]` | Paths to exclude from auto-logging |
| `request` | `boolean \| KoaRequestLoggingConfig` | `true` | Controls request logging (fires when request is received) |
| `response` | `boolean \| KoaResponseLoggingConfig` | `true` | Controls response logging (fires after response is sent) |

Both `request` and `response` accept an object with a `logLevel` property to override the default log level.

### Request Log Output

When enabled (default), request logging produces:
- **Message**: `"incoming request"`
- **Metadata**: `{ req: { method, url, remoteAddress } }`

### Response Log Output

When enabled (default), response logging produces:
- **Message**: `"request completed"`
- **Metadata**: `{ req: { method, url, remoteAddress }, res: { statusCode }, responseTime }`

The `remoteAddress` is resolved from Koa's `ctx.ip`, which respects the `proxy` setting.

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
app.use(koaLogLayer({
  instance: log,
  autoLogging: {
    request: { logLevel: "debug" },
    response: { logLevel: "info" },
  },
}));
```

### Disable Request Logging (Response Only)

```typescript
app.use(koaLogLayer({
  instance: log,
  autoLogging: {
    request: false,
  },
}));
```

### Custom Request ID

```typescript
app.use(koaLogLayer({
  instance: log,
  requestId: (ctx) =>
    ctx.get("x-request-id") || crypto.randomUUID(),
}));
```

### Disable Auto-Logging

```typescript
app.use(koaLogLayer({
  instance: log,
  autoLogging: false,
}));
```

### Ignore Health Check Paths

```typescript
app.use(koaLogLayer({
  instance: log,
  autoLogging: {
    ignore: ["/health", "/ready", /^\/internal\//],
  },
}));
```

### Additional Context from Request

```typescript
app.use(koaLogLayer({
  instance: log,
  contextFn: (ctx) => ({
    userAgent: ctx.get("user-agent"),
    host: ctx.get("host"),
  }),
}));
```

### Error Handling

Errors thrown in downstream middleware are automatically caught, logged, and re-thrown:

```typescript
app.use(koaLogLayer({ instance: log }));

app.use((ctx) => {
  if (ctx.path === "/fail") {
    throw new Error("Something went wrong");
    // Automatically logged with the error object, then re-thrown for Koa's error handling
  }
  ctx.body = "ok";
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
    koa: { transports: ['datadog'] },
    'koa.request': { transports: ['datadog'] },
    'koa.response': { transports: ['console', 'datadog'] },
  },
})

// Use default group names: name="koa", request="koa.request", response="koa.response"
app.use(koaLogLayer({ instance: log, group: true }))

// Or use custom group names
app.use(koaLogLayer({
  instance: log,
  group: {
    name: 'api',             // error logs
    request: 'api.request',  // auto-logged requests
    response: 'api.response', // auto-logged responses
  },
}))
```

When `group` is `true` or an object:
| Group | Default | Applied to |
|-------|---------|------------|
| `name` | `"koa"` | Error logs (via try/catch) |
| `request` | `"koa.request"` | Auto-logged incoming request messages |
| `response` | `"koa.response"` | Auto-logged response messages |

### Using with Koa Router

```typescript
import Koa from "koa";
import Router from "@koa/router";
import { koaLogLayer } from "@loglayer/koa";

const app = new Koa();
const router = new Router();

app.use(koaLogLayer({ instance: log }));

router.get("/", (ctx) => {
  ctx.log.info("Works with koa-router!");
  ctx.body = "ok";
});

app.use(router.routes());
app.use(router.allowedMethods());
```
