# Datadog Metrics (HTTP) mixin for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Fmixin-datadog-http-metrics)](https://www.npmjs.com/package/@loglayer/mixin-datadog-http-metrics)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Fmixin-datadog-http-metrics)](https://www.npmjs.com/package/@loglayer/mixin-datadog-http-metrics)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

Adds Datadog metrics functionality to the [LogLayer](https://loglayer.dev) logging library using [datadog-metrics](https://github.com/dbader/node-datadog-metrics).

The mixin provides a fluent builder API for sending metrics to Datadog via HTTP through a `ddStats` property on LogLayer instances. Unlike the [hot-shots mixin](https://www.npmjs.com/package/@loglayer/mixin-hot-shots) which sends metrics via StatsD/UDP, this mixin sends metrics directly to Datadog's HTTP API.

## Installation

```bash
npm install loglayer @loglayer/mixin-datadog-http-metrics
```

```bash
yarn add loglayer @loglayer/mixin-datadog-http-metrics
```

```bash
pnpm add loglayer @loglayer/mixin-datadog-http-metrics
```

## Usage

```typescript
import { LogLayer, useLogLayerMixin, ConsoleTransport } from 'loglayer';
import { datadogMetricsMixin } from '@loglayer/mixin-datadog-http-metrics';

// Register the mixin (must be called before creating LogLayer instances)
useLogLayerMixin(datadogMetricsMixin({
  apiKey: process.env.DATADOG_API_KEY,
  site: process.env.DATADOG_SITE, // e.g. 'us5.datadoghq.com'
  prefix: 'myapp.',
  defaultTags: ['env:production'],
}));

// Create LogLayer instance
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  })
});

// Use Datadog metrics through the ddStats property
log.ddStats.increment('request.count').send();
log.ddStats.gauge('queue.size', 42).send();
log.ddStats.histogram('response.time', 250).send();
log.ddStats.distribution('latency', 100).send();

// Use builder pattern for advanced configuration
log.ddStats.increment('request.count')
  .withValue(5)
  .withTags(['env:production', 'service:api'])
  .withTimestamp(Date.now())
  .send();
```

## Documentation

For more details, visit [https://loglayer.dev/mixins/datadog-http-metrics](https://loglayer.dev/mixins/datadog-http-metrics).
