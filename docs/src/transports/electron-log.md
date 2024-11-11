# Electron-log Transport

[Electron-log](https://github.com/megahertz/electron-log) is a logging library designed specifically for Electron applications.

## Installation

Install the required packages:

::: code-group

```sh [npm]
npm i loglayer @loglayer/transport-electron-log electron-log
```

```sh [pnpm]
pnpm add loglayer @loglayer/transport-electron-log electron-log
```

```sh [yarn]
yarn add loglayer @loglayer/transport-electron-log electron-log
```

:::

## Setup

```typescript
// Main process logger
import log from 'electron-log/src/main'
// Or for Renderer process
// import log from 'electron-log/src/renderer'
import { LogLayer } from 'loglayer'
import { ElectronLogTransport } from "@loglayer/transport-electron-log"

const logger = new LogLayer({
  transport: new ElectronLogTransport({
    logger: log
  })
})
```

## Log Level Mapping

| LogLayer | Electron-log |
|----------|--------------|
| trace    | silly       |
| debug    | debug       |
| info     | info        |
| warn     | warn        |
| error    | error       |
| fatal    | error       |
