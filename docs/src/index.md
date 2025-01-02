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
  - title: Type-Safe & Structured
    details: First-class TypeScript support with structured logging that makes log aggregation and analysis a breeze.
  - title: Chainable API
    details: Write expressive, self-documenting logs with a chainable API that makes complex logging patterns simple and maintainable.
  - title: Swap Logging Libraries Freely
    details: Use console logging in development, then switch to pino, winston, or bunyan in production without changing your application code.
  - title: Extensible Plugin System
    details: Transform, enrich, and filter logs with a powerful plugin system that lets you customize every aspect of your logging pipeline.
  - title: Multi-Transport Support
    details: Fan out logs to multiple destinations simultaneously - perfect for scenarios requiring both local logging and cloud aggregation.
  - title: Mock Logs
    details: Mock logging provided for use with testing libraries like mocha / jest / vitest. No more log prints during tests!
  - title: Zero External Dependencies
    details: LogLayer does not depend on any external libraries, ensuring a minimal footprint and maximum compatibility with your existing projects.
  - title: Developer-First License
    details: MIT licensed for maximum flexibility in both commercial and open-source projects.
---

## Before LogLayer

Different logging libraries force you to remember their unique APIs:

```javascript
// Using `winston`:
winston.info('my message', { some: 'data' })

// Using `bunyan`:
bunyan.info({ some: 'data' }, 'my message')
```

Error handling is equally inconsistent:

```javascript
// Using `roarr` with a direct error object:
roarr.error({ err: new Error('test') })

// With serialized error data:
roarr.error({ err: serialize(new Error('test')) })
```

## With LogLayer

Write clean, consistent, and type-safe logs that work everywhere:

```javascript
logLayer
  .withPrefix("[my-app]")
  .withMetadata({ some: 'data'})
  .withError(new Error('test'))
  .info('my message')
```