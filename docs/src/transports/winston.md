# Winston Transport

[Winston](https://github.com/winstonjs/winston) is a multi-transport async logging library for Node.js.

## Installation

Install the required packages:

::: code-group

```sh [npm]
npm i loglayer @loglayer/transport-winston winston
```

```sh [pnpm]
pnpm add loglayer @loglayer/transport-winston winston
```

```sh [yarn]
yarn add loglayer @loglayer/transport-winston winston
```

:::

## Setup

```typescript
import winston from 'winston'
import { LogLayer } from 'loglayer'
import { WinstonTransport } from "@loglayer/transport-winston"

const w = winston.createLogger({})

const log = new LogLayer({
  transport: new WinstonTransport({
    logger: w
  })
})
```

## Log Level Mapping

| LogLayer | Winston |
|----------|---------|
| trace    | silly   |
| debug    | debug   |
| info     | info    |
| warn     | warn    |
| error    | error   |
| fatal    | error   |
