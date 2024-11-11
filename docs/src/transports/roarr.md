# Roarr Transport

[Roarr](https://github.com/gajus/roarr) is a JSON logger for Node.js and browser environments.

## Installation

Install the required packages:

::: code-group

```sh [npm]
npm i loglayer @loglayer/transport-roarr roarr serialize-error
```

```sh [pnpm]
pnpm add loglayer @loglayer/transport-roarr roarr serialize-error
```

```sh [yarn]
yarn add loglayer @loglayer/transport-roarr roarr serialize-error
```

:::

## Setup

Roarr requires environment configuration to enable logging:

### Node.js
```bash
ROARR_LOG=true node your-app.js
```

### Browser
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
