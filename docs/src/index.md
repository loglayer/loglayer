---
layout: home

hero:
  name: "LogLayer"
  text: "Supercharges logging"
  tagline: "A layer on top of Javascript logging libraries to provide a consistent logging experience across all your projects."
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started

features:
  - title: Structured Logging
    details: LogLayer provides a structured logging experience for your logs, making it easier to parse and search through logs.
  - title: Fluid API
    details: LogLayer provides a fluid API for logging, making it easy to log messages, metadata, and errors with different levels and contexts.
  - title: Swap logging libraries
    details: Start off with a console logger, then later swap to another logging library like pino or bunyan without changing your code.
  - title: Plugins
    details: LogLayer provides a plugin system for modifying log messages and data before being shipped to your logging library.
  - title: Ship to Multiple Destinations
    details: Send logs to multiple logging libraries at once. Want to use pino and ship logs to datadog at the same time? You can with LogLayer.
  - title: Built for Testing
    details: LogLayer provides a mock logger for use with your unit tests, allowing you to test your code without having to write a custom mock.
  - title: Zero Dependencies
    details: LogLayer has zero 3rd party dependencies, so you can use it in any project without worrying about compatibility or supply chain issues.
  - title: MIT Licensed
    details: LogLayer is MIT licensed, so you can use it in any project, commercial or open source, without worrying about licensing issues.
---

## Before LogLayer

Defining a log entry can vary significantly between different libraries:

```javascript
// Using `winston`:
winston.info('my message', { some: 'data' })

// Using `bunyan`:
bunyan.info({ some: 'data' }, 'my message')
```

Handling errors can also be inconsistent:

```javascript
// Using `roarr` with a direct error object:
roarr.error({ err: new Error('test') })

// With serialized error data:
roarr.error({ err: serialize(new Error('test')) })
```

## With LogLayer

Focus on creating logs with clear, consistent syntax without worrying about library-specific syntax:

```javascript
logLayer
  .withPrefix("[my-app]")
  .withMetadata({ some: 'data'})
  .withError(new Error('test'))
  .info('my message')
```