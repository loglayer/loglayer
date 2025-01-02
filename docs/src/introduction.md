# Introduction

`loglayer` is a TypeScript library that standardizes logging across your application, regardless of which logging library you use under the hood.

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

## Example

Here's a simple example using `loglayer` with `pino`:

```typescript
import pino from 'pino'
import { LogLayer } from 'loglayer'
import { PinoTransport } from "@loglayer/transport-pino"

const log = new LogLayer({
  transport: new PinoTransport({
    logger: pino()
  })
})

// Create logs with a fluent API
log
  .withContext({ requestId: '123' })
  .withMetadata({ user: 'admin' })
  .withError(new Error('Permission denied'))
  .error('Failed to access resource')
```

## Key Features

### Consistent API

No need to remember different parameter orders or method names between logging libraries:

```typescript
// With loglayer - consistent API regardless of logging library
log.withMetadata({ some: 'data' }).info('my message')

// Without loglayer - different APIs for different libraries
winston.info('my message', { some: 'data' })     // winston
bunyan.info({ some: 'data' }, 'my message')      // bunyan
```

### Standardized Error Handling

`loglayer` provides consistent error handling across all logging libraries:

```typescript
// Error handling works the same way regardless of logging library
log.withError(new Error('test')).error('Operation failed')
```

### Easy Testing

Built-in mocks make testing a breeze:

```typescript
import { MockLogLayer } from 'loglayer'

// Use MockLogLayer in your tests - no real logging will occur
const log = new MockLogLayer()
```

### Powerful Plugin System

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

### Multiple Logger Support

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
