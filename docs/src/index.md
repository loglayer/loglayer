---
title: LogLayer - Supercharge your Javascript logging
description: Supercharges logging by providing a consistent logging experience on top of Javascript logging libraries.

layout: home

hero:
  name: "LogLayer"
  text: "Supercharges logging"
  tagline: "A layer on top of Javascript logging libraries to provide a consistent logging experience."
  image:
    src: /images/loglayer.jpg
    alt: LogLayer
  actions:
    - theme: brand
      text: What is LogLayer?
      link: /introduction
    - theme: alt
      text: Quickstart
      link: /getting-started
    - theme: alt
      text: GitHub (MIT Licensed)
      link: https://github.com/loglayer/loglayer

features:
  - title: Chainable API
    details: Write logs with a chainable API that makes adding tags, metadata and errors simple.
  - title: Bring Your Own Logger
    details: Use console logging when starting out, then switch to pino, winston, etc later without changing your application code.
  - title: Extensible Plugin System
    details: Transform, enrich, and filter logs with plugins that lets you customize every aspect of your logging pipeline.
---

---

```javascript
// Example using the Pino logging library with LogLayer
// You can also start out with a console logger and swap to another later!
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