---
title: Roarr Transport for LogLayer
description: Learn how to use the roarr logging library with LogLayer
---

# Roarr Transport

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-roarr)](https://www.npmjs.com/package/@loglayer/transport-roarr)

[Roarr](https://github.com/gajus/roarr) is a JSON logger for Node.js and browser environments.

[Transport Source](https://github.com/loglayer/loglayer/tree/master/packages/transports/roarr)

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
