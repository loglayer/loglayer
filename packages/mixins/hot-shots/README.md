# hot-shots (StatsD) mixin for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Fmixin-hot-shots)](https://www.npmjs.com/package/@loglayer/mixin-hot-shots)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Fmixin-hot-shots)](https://www.npmjs.com/package/@loglayer/mixin-hot-shots)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

Adds StatsD metrics functionality to the [LogLayer](https://loglayer.dev) logging library using [hot-shots](https://github.com/bdeitte/hot-shots).

All hot-shots methods are namespaced with `stats`, so `increment` becomes `statsIncrement`, `timing` becomes `statsTiming`, etc. See the [hot-shots documentation](https://github.com/bdeitte/hot-shots) for detailed usage information about available methods and options.

## Installation

```bash
npm install loglayer @loglayer/mixin-hot-shots hot-shots
```

```bash
yarn add loglayer @loglayer/mixin-hot-shots hot-shots
```

```bash
pnpm add loglayer @loglayer/mixin-hot-shots hot-shots
```

## Usage

```typescript
import { LogLayer, useLogLayerMixin, ConsoleTransport } from 'loglayer';
import { StatsD } from 'hot-shots';
import { hotshotsMixin } from '@loglayer/mixin-hot-shots';

// Create a StatsD client
const statsd = new StatsD({
  host: 'localhost',
  port: 8125
});

// Register the mixin (must be called before creating LogLayer instances)
useLogLayerMixin(hotshotsMixin(statsd));

// Create LogLayer instance
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  })
});

// Use StatsD methods on LogLayer
log.statsIncrement('request.count').withMetadata({ reqId: '1234' }).info('Request received');
log.statsDecrement('request.count');
log.statsTiming('request.duration', 150).info('Request processed');
log.statsGauge('active.connections', 42).info('Connection established');
```

## Documentation

For more details, visit [https://loglayer.dev/mixins/hot-shots](https://loglayer.dev/mixins/hot-shots).
