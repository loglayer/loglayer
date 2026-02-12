---
title: ElysiaJS Integration
description: Integrate LogLayer with ElysiaJS for request-scoped logging
---

# ElysiaJS Integration <Badge type="tip" text="Server" /> <Badge type="info" text="Bun" />

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Felysia)](https://www.npmjs.com/package/@loglayer/elysia)

[Source](https://github.com/loglayer/loglayer/tree/master/packages/integrations/elysia)

An [ElysiaJS](https://elysiajs.com) plugin that provides request-scoped logging with automatic request/response logging and error handling. The auto-logging format follows [pino-http](https://github.com/pinojs/pino-http) conventions.

## Installation with Pino

::: code-group

```sh [npm]
npm i @loglayer/elysia loglayer @loglayer/transport-pino pino serialize-error
```

```sh [pnpm]
pnpm add @loglayer/elysia loglayer @loglayer/transport-pino pino serialize-error
```

```sh [yarn]
yarn add @loglayer/elysia loglayer @loglayer/transport-pino pino serialize-error
```

:::

Any LogLayer-compatible transport can be used, including [LogTape](/transports/logtape), [Console](/transports/console), [Simple Pretty Terminal](/transports/simple-pretty-terminal), and [others](/transports/overview).

## Basic Usage

```typescript
import { Elysia } from "elysia";
import { LogLayer } from "loglayer";
import { PinoTransport } from "@loglayer/transport-pino";
import { serializeError } from "serialize-error";
import pino from "pino";
import { elysiaLogLayer } from "@loglayer/elysia";

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: new PinoTransport({ logger: pino() }),
});

const app = new Elysia()
  .use(elysiaLogLayer({ instance: log }))
  .get("/", ({ log }) => {
    log.info("Hello from route!");
    return "Hello World!";
  })
  .get("/api/users/:id", ({ log, params }) => {
    log.withMetadata({ userId: params.id }).info("Fetching user");
    return { id: params.id, name: "John" };
  })
  .listen(3000);
```

Each request automatically gets:
- A child logger with a unique `requestId` in its context
- Automatic request and response logging following pino-http conventions
- Error logging via the `onError` hook

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `instance` | `ILogLayer` | *required* | The LogLayer instance to use |
| `requestId` | `boolean \| (request: Request) => string` | `true` | Controls request ID generation |
| `autoLogging` | `boolean \| ElysiaAutoLoggingConfig` | `true` | Controls automatic request/response logging |
| `contextFn` | `(ctx) => Record<string, any>` | - | Extract additional context from requests |

### Auto-Logging Configuration

When `autoLogging` is an object:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `logLevel` | `string` | `"info"` | Default log level for request/response logs |
| `ignore` | `Array<string \| RegExp>` | `[]` | Paths to exclude from auto-logging |
| `request` | `boolean \| ElysiaRequestLoggingConfig` | `true` | Controls request logging (fires when request is received) |
| `response` | `boolean \| ElysiaResponseLoggingConfig` | `true` | Controls response logging (fires after handler completes) |

Both `request` and `response` accept an object with a `logLevel` property to override the default log level.

### Request Log Output

When enabled (default), request logging produces:
- **Message**: `"incoming request"`
- **Metadata**: `{ req: { method, url, remoteAddress } }`

### Response Log Output

When enabled (default), response logging produces:
- **Message**: `"request completed"`
- **Metadata**: `{ req: { method, url, remoteAddress }, res: { statusCode }, responseTime }`

The `remoteAddress` is resolved from `x-forwarded-for` or `x-real-ip` headers, or from Bun's `server.requestIP()` when available.

### Example Log Output

With the default configuration, a `GET /api/users` request produces two log entries:

```json
// incoming request
{
  "msg": "incoming request",
  "req": { "method": "GET", "url": "/api/users", "remoteAddress": "::1" },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}

// request completed
{
  "msg": "request completed",
  "req": { "method": "GET", "url": "/api/users", "remoteAddress": "::1" },
  "res": { "statusCode": 200 },
  "responseTime": 12,
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Examples

### Custom Log Levels

```typescript
elysiaLogLayer({
  instance: log,
  autoLogging: {
    request: { logLevel: "debug" },
    response: { logLevel: "info" },
  },
})
```

### Disable Request Logging (Response Only)

```typescript
elysiaLogLayer({
  instance: log,
  autoLogging: {
    request: false,
  },
})
```

### Custom Request ID

```typescript
elysiaLogLayer({
  instance: log,
  requestId: (request) =>
    request.headers.get("x-request-id") ?? crypto.randomUUID(),
})
```

### Disable Auto-Logging

```typescript
elysiaLogLayer({
  instance: log,
  autoLogging: false,
})
```

### Ignore Health Check Paths

```typescript
elysiaLogLayer({
  instance: log,
  autoLogging: {
    ignore: ["/health", "/ready", /^\/internal\//],
  },
})
```

### Additional Context from Request

```typescript
elysiaLogLayer({
  instance: log,
  contextFn: ({ request }) => ({
    userAgent: request.headers.get("user-agent"),
    host: request.headers.get("host"),
  }),
})
```

### Error Handling

Errors thrown in route handlers are automatically caught and logged:

```typescript
const app = new Elysia()
  .use(elysiaLogLayer({ instance: log }))
  .get("/fail", () => {
    throw new Error("Something went wrong");
    // Automatically logged with the error object
  });
```

### Using with Other Elysia Plugins

```typescript
const app = new Elysia()
  .use(elysiaLogLayer({ instance: log }))
  .use(cors())
  .use(swagger())
  .get("/", ({ log }) => {
    log.info("Works with other plugins!");
    return "ok";
  });
```

## Changelog

View the changelog [here](./changelogs/elysia-changelog.md).
