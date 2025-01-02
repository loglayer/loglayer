# Getting Started

## Installation

::: code-group

```sh [npm]
npm install loglayer
```

```sh [pnpm]
pnpm add loglayer
```

```sh [yarn]
yarn add loglayer
```

:::

## Basic Usage with Console Transport

The simplest way to get started is to use the built-in console transport, which uses the standard `console` object for logging:

```typescript
import { LogLayer, ConsoleTransport } from 'loglayer'

const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
  }),
})

// Basic logging
log.info('Hello world!')

// Logging with metadata
log.withMetadata({ user: 'john' }).info('User logged in')

// Logging with context (persists across log calls)
log.withContext({ requestId: '123' })
log.info('Processing request') // Will include requestId

// Logging errors
log.withError(new Error('Something went wrong')).error('Failed to process request')
```
