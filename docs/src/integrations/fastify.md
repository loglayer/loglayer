---
title: Fastify Integration
description: Integrate LogLayer with Fastify for request-scoped logging
---

# Fastify Integration <Badge type="tip" text="Server" />

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ffastify)](https://www.npmjs.com/package/@loglayer/fastify)

[Source](https://github.com/loglayer/loglayer/tree/master/packages/integrations/fastify)

A [Fastify](https://fastify.dev) plugin that provides request-scoped logging with automatic request/response logging and error handling. The auto-logging format follows [pino-http](https://github.com/pinojs/pino-http) conventions.

## Installation

::: code-group

```sh [npm]
npm i @loglayer/fastify loglayer @loglayer/transport-simple-pretty-terminal serialize-error
```

```sh [pnpm]
pnpm add @loglayer/fastify loglayer @loglayer/transport-simple-pretty-terminal serialize-error
```

```sh [yarn]
yarn add @loglayer/fastify loglayer @loglayer/transport-simple-pretty-terminal serialize-error
```

:::

We're using [Simple Pretty Terminal](/transports/simple-pretty-terminal) here as an example to get nicely formatted logs. Any LogLayer-compatible transport can be used, including [Pino](/transports/pino), [LogTape](/transports/logtape), [Structured](/transports/structured-logger), [Console](/transports/console), and [others](/transports/).

## Basic Usage

```typescript
import Fastify from "fastify";
import { LogLayer } from "loglayer";
import { serializeError } from "serialize-error";
import { getSimplePrettyTerminal, moonlight } from "@loglayer/transport-simple-pretty-terminal";
import { fastifyLogLayer } from "@loglayer/fastify";

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: getSimplePrettyTerminal({
    runtime: "node",
    theme: moonlight,
  }),
});

// Do NOT set logger: true — the plugin handles all logging
const app = Fastify();
await app.register(fastifyLogLayer, { instance: log });

app.get("/", (request, reply) => {
  request.log.info("Hello from route!");
  reply.send("Hello World!");
});

app.get("/api/users/:id", (request, reply) => {
  const { id } = request.params as { id: string };
  request.log.withMetadata({ userId: id }).info("Fetching user");
  reply.send({ id, name: "John" });
});

await app.listen({ port: 3000 });
```

Each request automatically gets:
- A child logger with a unique `requestId` in its context
- Automatic request and response logging following pino-http conventions
- Error logging via the `onError` hook

The plugin overrides Fastify's `request.log` with a LogLayer child logger, so you can use `request.log` directly in your route handlers with full access to LogLayer's API.

::: warning Important
Do **not** set `logger: true` or provide a `loggerInstance` on the Fastify constructor when using this plugin — the plugin handles all logging itself. Using both would result in duplicate log entries.
:::

::: tip TypeScript Support
The plugin augments Fastify's `FastifyBaseLogger` interface with `ILogLayer`, so `request.log` has all LogLayer methods available with full type safety.
:::

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `instance` | `ILogLayer` | *required* | The LogLayer instance to use |
| `requestId` | `boolean \| (request: FastifyRequest) => string` | `true` | Controls request ID generation |
| `autoLogging` | `boolean \| FastifyAutoLoggingConfig` | `true` | Controls automatic request/response logging |
| `contextFn` | `(request: FastifyRequest) => Record<string, any>` | - | Extract additional context from requests |
| `group` | `boolean \| FastifyGroupConfig` | - | Tag auto-logged messages with [groups](/logging-api/groups) for transport routing |

### Auto-Logging Configuration

When `autoLogging` is an object:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `logLevel` | `string` | `"info"` | Default log level for request/response logs |
| `ignore` | `Array<string \| RegExp>` | `[]` | Paths to exclude from auto-logging |
| `request` | `boolean \| FastifyRequestLoggingConfig` | `true` | Controls request logging (fires when request is received) |
| `response` | `boolean \| FastifyResponseLoggingConfig` | `true` | Controls response logging (fires after response is sent) |

Both `request` and `response` accept an object with a `logLevel` property to override the default log level.

### Request Log Output

When enabled (default), request logging produces:
- **Message**: `"incoming request"`
- **Metadata**: `{ req: { method, url, remoteAddress } }`

### Response Log Output

When enabled (default), response logging produces:
- **Message**: `"request completed"`
- **Metadata**: `{ req: { method, url, remoteAddress }, res: { statusCode }, responseTime }`

The `remoteAddress` is resolved from Fastify's `request.ip`, which respects the `trustProxy` configuration.

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
await app.register(fastifyLogLayer, {
  instance: log,
  autoLogging: {
    request: { logLevel: "debug" },
    response: { logLevel: "info" },
  },
});
```

### Disable Request Logging (Response Only)

```typescript
await app.register(fastifyLogLayer, {
  instance: log,
  autoLogging: {
    request: false,
  },
});
```

### Custom Request ID

```typescript
await app.register(fastifyLogLayer, {
  instance: log,
  requestId: (request) =>
    (request.headers["x-request-id"] as string) ?? crypto.randomUUID(),
});
```

### Disable Auto-Logging

```typescript
await app.register(fastifyLogLayer, {
  instance: log,
  autoLogging: false,
});
```

### Ignore Health Check Paths

```typescript
await app.register(fastifyLogLayer, {
  instance: log,
  autoLogging: {
    ignore: ["/health", "/ready", /^\/internal\//],
  },
});
```

### Additional Context from Request

```typescript
await app.register(fastifyLogLayer, {
  instance: log,
  contextFn: (request) => ({
    userAgent: request.headers["user-agent"],
    host: request.headers.host,
  }),
});
```

### Error Handling

Errors thrown in route handlers are automatically caught and logged:

```typescript
app.get("/fail", () => {
  throw new Error("Something went wrong");
  // Automatically logged with the error object
});
```

### Setting `fastify.log` with `loggerInstance`

By default, the plugin only sets `request.log` (per-request). If you also want `fastify.log` (the app-level logger) to use LogLayer, use the `createLogLayerFastifyLogger` adapter:

```typescript
import Fastify from "fastify";
import { LogLayer } from "loglayer";
import { createLogLayerFastifyLogger, fastifyLogLayer } from "@loglayer/fastify";

const log = new LogLayer({ transport: /* ... */ });

const app = Fastify({
  loggerInstance: createLogLayerFastifyLogger(log),
  disableRequestLogging: true, // Disable Fastify's native logging — the plugin handles it
});

// Register the plugin for request-scoped logging, auto-logging, etc.
await app.register(fastifyLogLayer, { instance: log });
```

::: tip
Setting `disableRequestLogging: true` prevents Fastify's built-in request/response logging from conflicting with the plugin's auto-logging.
:::

### Group Routing

Tag auto-logged messages (request, response, errors) with [groups](/logging-api/groups) so you can route or filter them. User logs from route handlers are **not** tagged.

```typescript
const log = new LogLayer({
  transport: [
    new ConsoleTransport({ id: 'console', logger: console }),
    new DatadogTransport({ id: 'datadog', logger: datadog }),
  ],
  groups: {
    fastify: { transports: ['datadog'] },
    'fastify.request': { transports: ['datadog'] },
    'fastify.response': { transports: ['console', 'datadog'] },
  },
})

// Use default group names: name="fastify", request="fastify.request", response="fastify.response"
await app.register(fastifyLogLayer, { instance: log, group: true })

// Or use custom group names
await app.register(fastifyLogLayer, {
  instance: log,
  group: {
    name: 'api',             // error logs
    request: 'api.request',  // auto-logged requests
    response: 'api.response', // auto-logged responses
  },
})
```

When `group` is `true` or an object:
| Group | Default | Applied to |
|-------|---------|------------|
| `name` | `"fastify"` | Error logs (via `onError` hook) |
| `request` | `"fastify.request"` | Auto-logged incoming request messages |
| `response` | `"fastify.response"` | Auto-logged response messages |

### Using with Other Fastify Plugins

```typescript
import cors from "@fastify/cors";

const app = Fastify();
await app.register(fastifyLogLayer, { instance: log });
await app.register(cors);

app.get("/", (request, reply) => {
  request.log.info("Works with other plugins!");
  reply.send("ok");
});
```
