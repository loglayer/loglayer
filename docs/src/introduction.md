---
title: About LogLayer
description: Learn more about LogLayer and how it supercharges your logging experience
---

# Introduction

`loglayer` is a TypeScript library that standardizes logging across your application, regardless of which logging library you use under the hood.

It offers a chainable, fluent API for specifying metadata and errors, along with a plugin system that allows
you to modify log data before it's shipped to your logging library.

```javascript
// Example using the Pino logging library with LogLayer
import { LogLayer } from 'loglayer';
import { pino } from 'pino';
import { PinoTransport } from '@loglayer/transport-pino';
import { redactionPlugin } from '@loglayer/plugin-redaction';

const log = new LogLayer({
  // Multiple loggers can also be used at the same time. 
  // Need to also ship to a cloud provider like DataDog at the same time? You can!
  transport: new PinoTransport({
    logger: pino()
  }),
  // Plugins can be created to modify log data before it's shipped to your logging library.
  plugins: [
    redactionPlugin({
      paths: ['password'],
      censor: '[REDACTED]',
    }),
  ],
})

log.withPrefix("[my-app]")
  .withMetadata({ some: 'data', password: 'my-pass' })
  .withError(new Error('test'))
  .info('my message')
```

```json5
{
  "level":30,
  "time":1735857465669,
  "pid":30863,
  "msg":"[my-app] my message",
  // The placement of these fields are also configurable!
  "password":"[REDACTED]",
  "some":"data",
  "err":{
    "type":"Error",
    "message":"test",
    "stack":"Error: test\n ..."
  }
}
```

## Why LogLayer?

When working with logging libraries, you often face several challenges:

- Different logging libraries have inconsistent APIs for creating log entries
- Error handling varies between libraries
- Switching logging libraries requires rewriting logging code throughout your application
- Testing code with logging is cumbersome without proper mocks

`loglayer` solves these problems by providing:

- A consistent, fluent API for creating log entries
- Standardized error handling and serialization
- Easy switching between logging libraries without changing your application code
- Built-in mocks for testing

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

## Standardized Error Handling

`loglayer` provides consistent error handling across all logging libraries:

```typescript
// Error handling works the same way regardless of logging library
log.withError(new Error('test')).error('Operation failed')
```

See more about [error handling](/logging-api/error-handling).

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

## Easy Testing

Built-in mocks make testing a breeze:

```typescript
import { MockLogLayer } from 'loglayer'

// Use MockLogLayer in your tests - no real logging will occur
const log = new MockLogLayer()
```

See more about [testing](/logging-api/unit-testing).