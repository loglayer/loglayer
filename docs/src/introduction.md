---
title: About LogLayer
description: Learn more about LogLayer and how it unifies your logging experience
---

# Introduction

`loglayer` is a unified logger that can route logs to various logging libraries, cloud providers, files, 
and OpenTelemetry while providing a fluent API for specifying log messages, metadata and errors, enhancing and standardizing the developer experience 
around writing logs.

```typescript
log
  .withMetadata({ userId: '1234' }) // Add structured metadata
  .withError(new Error('Something went wrong')) // Attach an Error object
  .error('User action completed') // Log the message with an error level
```

_The library itself works on both server-side and browser environments, but the transports and plugins used may 
support only one or the other. Support is noted on their respective page._

## Why LogLayer?

Challenges with logging—choosing, using, and maintaining the right logger for various projects—are a common experience. 
While most loggers offer the usual methods like `info`, `warn`, and `error`, they vary significantly in handling 
structured metadata or `Error` objects. This can lead to ad-hoc solutions, like serializing errors or writing custom 
pipelines, just to get logs formatted correctly.

LogLayer was built to address these pain points by introducing a fluid, expressive API. With methods like 
`withMetadata` and `withError`, **LogLayer separates object injection from the log message itself, making logging code 
both cleaner and more maintainable.**

Logs are processed through a LogLayer Transport, which acts as an adapter for the preferred logging library. 
This design offers several key advantages:

- **Multi-Transport Support**: Send logs to multiple destinations (e.g., [DataDog](/transports/datadog) and 
[New Relic](/transports/new-relic)) simultaneously. This feature can be used to ship logs directly to DataDog without 
relying on their APM package or sidecars.

- **Easy Logger Swapping**: You're using `pino` with Next.js, you might find issues where it doesn’t work out of the box 
after a production build without webpack hacks. With LogLayer, a better-suited library can be swapped in without 
touching the logging code.

## Battle Tested

LogLayer has been in production use for at least four years at [Airtop.ai](https://airtop.ai) (formerly Switchboard) in
multiple backend and frontend systems.

*LogLayer is not affiliated with Airtop.*

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