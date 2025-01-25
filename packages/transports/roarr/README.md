# Roarr Transport for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-roarr)](https://www.npmjs.com/package/@loglayer/transport-roarr)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Ftransport-roarr)](https://www.npmjs.com/package/@loglayer/transport-roarr)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

The Roarr transport for the [LogLayer](https://loglayer.dev) logging library.

[Roarr](https://github.com/gajus/roarr) is a JSON logger for Node.js and browser environments.

## Installation

```bash
npm install loglayer @loglayer/transport-roarr roarr serialize-error
```

## Usage

### Node.js Environment Setup
```bash
ROARR_LOG=true node your-app.js
```

### Browser Environment Setup
```typescript
window.ROARR = {
  enabled: true
}
```

### Implementation
```typescript
import { Roarr as r } from 'roarr'
import { LogLayer } from 'loglayer'
import { RoarrTransport } from "@loglayer/transport-roarr"
import { serializeError } from 'serialize-error'

const log = new LogLayer({
  transport: new RoarrTransport({
    logger: r
  }),
  errorSerializer: serializeError  // Roarr requires error serialization
})
```

## Documentation

For more details, visit [https://loglayer.dev/transports/roarr](https://loglayer.dev/transports/roarr)
