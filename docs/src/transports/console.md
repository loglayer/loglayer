# Console Transport

The simplest integration is with the built-in `console` object, which is available in both Node.js and browser environments.

## Installation

No additional packages needed beyond the core `loglayer` package:

::: code-group

```sh [npm]
npm i loglayer
```

```sh [pnpm]
pnpm add loglayer
```

```sh [yarn]
yarn add loglayer
```

:::

## Setup

```typescript
import { LogLayer, ConsoleTransport } from 'loglayer'

const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  })
})
```

## Features

- Works in both Node.js and browser environments
- No additional dependencies required
- Great for development and debugging
- Outputs to standard console methods (`console.log`, `console.error`, etc.)

## Log Level Mapping

| LogLayer | Console   |
|----------|-----------|
| trace    | debug     |
| debug    | debug     |
| info     | info      |
| warn     | warn      |
| error    | error     |
| fatal    | error     |
