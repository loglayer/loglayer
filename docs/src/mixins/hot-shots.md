---
title: Hot-Shots (StatsD) Mixin for LogLayer
description: Add StatsD metrics functionality to LogLayer using hot-shots
---

# Hot-Shots (StatsD) Mixin <Badge type="tip" text="Server" />

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Fmixin-hot-shots)](https://www.npmjs.com/package/@loglayer/mixin-hot-shots)

[![Source](https://img.shields.io/badge/source-GitHub-blue)](https://github.com/loglayer/loglayer/tree/master/packages/mixins/hot-shots)

Adds StatsD metrics functionality to the [LogLayer](https://loglayer.dev) logging library using [hot-shots](https://github.com/bdeitte/hot-shots). All hot-shots methods are namespaced with `stats`, so `increment` becomes `statsIncrement`, `timing` becomes `statsTiming`, etc.

## Installation

This mixin requires the [`hot-shots`](https://github.com/bdeitte/hot-shots) library to be installed in your project.

::: code-group

```bash [npm]
npm install loglayer @loglayer/mixin-hot-shots hot-shots
```

```bash [yarn]
yarn add loglayer @loglayer/mixin-hot-shots hot-shots
```

```bash [pnpm]
pnpm add loglayer @loglayer/mixin-hot-shots hot-shots
```

:::

## Usage

First, create and configure your StatsD client, then register the mixin **before** creating any LogLayer instances:

```typescript
import { LogLayer, useLogLayerMixin, ConsoleTransport } from 'loglayer';
import { StatsD } from 'hot-shots';
import { hotshotsMixin } from '@loglayer/mixin-hot-shots';

// Create and configure your StatsD client
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

## Configuration

The `hotshotsMixin` function requires a configured `StatsD` client instance from the `hot-shots` library.

### Required Parameters

| Name | Type | Description |
|------|------|-------------|
| `hotShotsClient` | `StatsD` | A configured `StatsD` client instance from the `hot-shots` library |

For detailed information about configuring the `StatsD` client, see the [hot-shots documentation](https://github.com/bdeitte/hot-shots).

## Available Methods

Most hot-shots methods are available on LogLayer instances with the `stats` prefix. For detailed usage information, parameters, and examples, refer to the [hot-shots documentation](https://github.com/bdeitte/hot-shots).

### Counters

| Method | Returns | Description |
|--------|---------|-------------|
| `statsIncrement(stat, ...args)` | `LogLayer` | Increments a counter stat by one or by a specified value |
| `statsDecrement(stat, ...args)` | `LogLayer` | Decrements a counter stat by one or by a specified value |

### Timings

| Method | Returns | Description |
|--------|---------|-------------|
| `statsTiming(stat, value, ...args)` | `LogLayer` | Sends a timing command. The value can be milliseconds (number) or a Date object |
| `statsTimer(func, stat, ...args)` | `(...args: P) => R` | Returns a function that records how long the first parameter (function) takes to execute |
| `statsAsyncTimer(func, stat, ...args)` | `(...args: P) => Promise<R>` | Similar to `statsTimer`, but for async functions that return a Promise |
| `statsAsyncDistTimer(func, stat, ...args)` | `(...args: P) => Promise<R>` | Similar to `statsAsyncTimer`, but records the timing as a distribution metric instead of a timing (DogStatsD only) |

### Histograms and Distributions

| Method | Returns | Description |
|--------|---------|-------------|
| `statsHistogram(stat, value, ...args)` | `LogLayer` | Records a value in a histogram. Histograms track the statistical distribution of values (DogStatsD/Telegraf only) |
| `statsDistribution(stat, value, ...args)` | `LogLayer` | Tracks the statistical distribution of a set of values (DogStatsD v6). Similar to histogram but optimized for distributions |

### Gauges

| Method | Returns | Description |
|--------|---------|-------------|
| `statsGauge(stat, value, ...args)` | `LogLayer` | Sets or changes a gauge stat to the specified value |
| `statsGaugeDelta(stat, value, ...args)` | `LogLayer` | Changes a gauge stat by a specified amount rather than setting it to a value |

### Sets

| Method | Returns | Description |
|--------|---------|-------------|
| `statsSet(stat, value, ...args)` | `LogLayer` | Counts unique occurrences of a stat. Records how many unique elements were tracked |
| `statsUnique(stat, value, ...args)` | `LogLayer` | Alias for `statsSet`. Counts unique occurrences of a stat |

### Service Checks (DogStatsD only)

| Method | Returns | Description |
|--------|---------|-------------|
| `statsCheck(name, status, options?, tags?, callback?)` | `LogLayer` | Sends a service check status. Status values: `0` = OK, `1` = WARNING, `2` = CRITICAL, `3` = UNKNOWN |
