# Log4js Transport

[Log4js-node](https://log4js-node.github.io/log4js-node/) is a conversion of the Log4j framework to Node.js.

## Important Notes

- Log4js only works in Node.js environments (not in browsers)
- By default, logging is disabled and must be configured via `level` or advanced configuration
- Consider using Winston as an alternative if Log4js configuration is too complex

## Installation

Install the required packages:

::: code-group

```sh [npm]
npm i loglayer @loglayer/transport-log4js log4js
```

```sh [pnpm]
pnpm add loglayer @loglayer/transport-log4js log4js
```

```sh [yarn]
yarn add loglayer @loglayer/transport-log4js log4js
```

:::

## Setup

```typescript
import log4js from 'log4js'
import { LogLayer } from 'loglayer'
import { Log4JsTransport } from "@loglayer/transport-log4js"

const logger = log4js.getLogger()

// Enable logging output
logger.level = "trace"

const log = new LogLayer({
  transport: new Log4JsTransport({
    logger
  })
})
```

## Log Level Mapping

| LogLayer | Log4js  |
|----------|---------|
| trace    | trace   |
| debug    | debug   |
| info     | info    |
| warn     | warn    |
| error    | error   |
| fatal    | fatal   |
