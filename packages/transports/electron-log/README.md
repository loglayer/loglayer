# Electron-log Transport for LogLayer

[![NPM version](https://img.shields.io/npm/v/@loglayer/transport-electron-log.svg?style=flat-square)](https://www.npmjs.com/package/@loglayer/transport-electron-log)
![NPM Downloads](https://img.shields.io/npm/dm/@loglayer/transport-electron-log)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

[Electron-log](https://github.com/megahertz/electron-log) is a logging library designed specifically for Electron applications.

## Installation

```bash
npm install loglayer @loglayer/transport-electron-log electron-log
```

## Usage

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

## Documentation

For more details, visit [https://loglayer.github.io/transports/electron-log](https://loglayer.github.io/transports/electron-log)
