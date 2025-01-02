# Pino Transport

[Pino](https://github.com/pinojs/pino) is a very low overhead Node.js logger, focused on performance.

## Installation

Install the required packages:

::: code-group

```sh [npm]
npm i loglayer @loglayer/transport-pino pino
```

```sh [pnpm]
pnpm add loglayer @loglayer/transport-pino pino
```

```sh [yarn]
yarn add loglayer @loglayer/transport-pino pino
```

:::

## Setup

```typescript
import pino, { P } from 'pino'
import { LogLayer } from 'loglayer'
import { PinoTransport } from "@loglayer/transport-pino"

const p = pino({
  level: 'trace'  // Enable all log levels
})

const log = new LogLayer<P.Logger>({
  transport: new PinoTransport({
    logger: p
  })
})
```

## Log Level Mapping

| LogLayer | Pino    |
|----------|---------|
| trace    | trace   |
| debug    | debug   |
| info     | info    |
| warn     | warn    |
| error    | error   |
| fatal    | fatal   |
