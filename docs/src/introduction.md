---
title: About LogLayer
description: Learn more about LogLayer and how it unifies your logging experience
---

# Introduction

Most logging libraries offer the usual methods like `info`, `warn`, and `error`, but vary significantly in how they handle structured metadata and `Error` objects. This inconsistency leads to ad-hoc solutions and code that's tightly coupled to a specific logger.

LogLayer solves this by providing a fluent, expressive API that routes logs to any logging library, cloud provider, files, or OpenTelemetry through its transport system.

```typescript
log
  .withMetadata({ userId: '1234' })
  .withError(new Error('Something went wrong'))
  .error('User action completed')
```

```json
{
  "msg": "User action completed",
  "userId": "1234",
  "err": {
    "message": "Something went wrong",
    "stack": "Error: Something went wrong\n    at ..."
  }
}
```

## Multi-Platform Support

LogLayer works seamlessly across server-side and browser environments, and supports multiple JavaScript runtimes including Node.js, Deno, and Bun.

_Individual transports and plugins may have specific environment requirements, which is indicated on their respective page._

See the [getting started guide](/getting-started) for setup instructions.

## Bring Your Own Logger

LogLayer is designed to sit on top of your logging library(s) of choice, such as `pino`, `winston`, `bunyan`, and more.

Learn more about logging [transports](/transports/).

## Consistent API

No need to remember different parameter orders or method names between logging libraries:

```typescript
// With loglayer - consistent API regardless of logging library
log.withMetadata({ some: 'data' }).info('my message')

// Without loglayer - different APIs for different libraries
winston.info('my message', { some: 'data' })     // winston
bunyan.info({ some: 'data' }, 'my message')      // bunyan
```

Start with [basic logging](/logging-api/basic-logging).

## Separation of Errors, Context, and Metadata

LogLayer distinguishes between three types of structured data, each serving a specific purpose:

| Type | Method | Scope | Purpose |
|------|--------|-------|---------|
| **Context** | `withContext()` | Persistent across all logs | Request IDs, user info, session data |
| **Metadata** | `withMetadata()` | Single log entry only | Event-specific details like durations, counts |
| **Errors** | `withError()` | Single log entry only | Error objects with stack traces |

This separation provides several benefits:

- **Clarity**: Each piece of data has a clear purpose and appropriate scope
- **No pollution**: Per-log metadata doesn't accidentally persist to future logs
- **Flexible output**: Configure where each type appears in the final log (root level or dedicated fields)
- **Better debugging**: Errors are handled consistently with proper serialization

```typescript
log
  .withContext({ requestId: 'abc-123' })     // Persists for all future logs
  .withMetadata({ duration: 150 })            // Only for this log entry
  .withError(new Error('Timeout'))            // Only for this log entry
  .error('Request failed')
```

```json
{
  "msg": "Request failed",
  "requestId": "abc-123",
  "duration": 150,
  "err": {
    "message": "Timeout",
    "stack": "Error: Timeout\n    at ..."
  }
}
```

_Context, metadata, and errors can be placed in dedicated fields via [configuration](/configuration)._

See the dedicated pages for [context](/logging-api/context), [metadata](/logging-api/metadata), and [errors](/logging-api/error-handling).

## Battle Tested

LogLayer has been in production use for at least four years at [Airtop.ai](https://airtop.ai) (formerly Switchboard) in
multiple backend and frontend systems.

*LogLayer is not affiliated with Airtop.*

## Tiny and Tree-Shakable

- `loglayer` standalone is less than 7kB gzipped.
- Most logging-based LogLayer transports are < 1kB gzipped.
- All LogLayer packages are tree-shakable.

## Powerful Plugin System

Extend functionality with plugins:

```typescript
const log = new LogLayer({
  plugins: [{
    onBeforeDataOut: (params) => {
      // Redact sensitive information before logging
      if (params.data?.password) {
        params.data.password = '***'
      }
      return params.data
    }
  }]
})
```

See more about using and creating [plugins](/plugins/).

## Multiple Logger Support

Send your logs to multiple destinations simultaneously:

```typescript
import { LogLayer } from 'loglayer'
import { PinoTransport } from "@loglayer/transport-pino"
import { DatadogBrowserLogsTransport } from "@loglayer/transport-datadog-browser-logs"
import { datadogLogs } from '@datadog/browser-logs'
import pino from 'pino'

// Initialize Datadog
datadogLogs.init({
  clientToken: '<CLIENT_TOKEN>',
  site: '<DATADOG_SITE>',
  forwardErrorsToLogs: true,
})

const log = new LogLayer({
  transport: [
    new PinoTransport({
      logger: pino()
    }),
    new DatadogBrowserLogsTransport({
      id: "datadog",
      logger: datadogLogs
    })
  ]
})

// Logs will be sent to both Pino and Datadog
log.info('User logged in successfully')
```

See more about [multi-transport support](/transports/multiple-transports).

## HTTP Logging

Send logs directly to any HTTP endpoint without a third-party logging library. Supports batching, retries, and custom headers.

See the [HTTP transport](/transports/http) for more details.

## File Logging

Write logs directly to files with support for rotation based on time or size, optional compression, and batching.

See the [Log File Rotation transport](/transports/log-file-rotation) for more details.

## OpenTelemetry

Send logs to OpenTelemetry collectors with the [OpenTelemetry transport](/transports/opentelemetry), or enrich logs with trace context using the [OpenTelemetry plugin](/plugins/opentelemetry).

## StatsD Support

Extend LogLayer with mixins to add observability capabilities beyond logging. Use the [hot-shots mixin](/mixins/hot-shots) to send StatsD metrics alongside your logs:

```typescript
import { LogLayer, useLogLayerMixin, ConsoleTransport } from 'loglayer';
import { StatsD } from 'hot-shots';
import { hotshotsMixin } from '@loglayer/mixin-hot-shots';

// Create and configure your StatsD client
const statsd = new StatsD({
  host: 'localhost',
  port: 8125
});

// Register the mixin (must be called before creating LogLayer instances)
useLogLayerMixin(hotshotsMixin(statsd));

const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  })
});

// Send metrics and logs together
log.stats.increment('request.count').send();
log.withMetadata({ reqId: '1234' }).info('Request received');
log.stats.timing('request.duration', 150).send();
log.info('Request processed');
```

See more about [mixins](/mixins/).

## Easy Testing

Built-in mocks make testing a breeze:

```typescript
import { MockLogLayer } from 'loglayer'

// Use MockLogLayer in your tests - no real logging will occur
const log = new MockLogLayer()
```

See more about [testing](/logging-api/unit-testing).