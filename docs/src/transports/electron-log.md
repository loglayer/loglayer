---
title: Electron-log Transport for LogLayer
description: Send logs to electron-log with the LogLayer logging library
---

# Electron-log Transport

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-electron-log)](https://www.npmjs.com/package/@loglayer/transport-electron-log)

[Electron-log](https://github.com/megahertz/electron-log) is a logging library designed specifically for Electron applications.

[Transport Source](https://github.com/loglayer/loglayer/tree/master/packages/transports/electron-log)

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

## Changelog

View the changelog [here](./changelogs/electron-log-changelog.md).