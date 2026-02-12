---
title: Hot-Shots (StatsD) Mixin for LogLayer
description: Add StatsD metrics functionality to LogLayer using hot-shots
---

# Hot-Shots (StatsD) Mixin <Badge type="tip" text="Server" />

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Fmixin-hot-shots)](https://www.npmjs.com/package/@loglayer/mixin-hot-shots)

[![Source](https://img.shields.io/badge/source-GitHub-blue)](https://github.com/loglayer/loglayer/tree/master/packages/mixins/hot-shots)

Adds StatsD metrics functionality to the [LogLayer](https://loglayer.dev) logging library using [hot-shots](https://github.com/bdeitte/hot-shots). The mixin provides a fluent builder API for sending metrics to StatsD, DogStatsD, and Telegraf through a `stats` property on LogLayer instances.

## Installation

This mixin requires the [`hot-shots`](https://github.com/bdeitte/hot-shots) library to be installed in your project.

::: code-group

```bash [npm]
npm install @loglayer/mixin-hot-shots hot-shots
```

```bash [yarn]
yarn add @loglayer/mixin-hot-shots hot-shots
```

```bash [pnpm]
pnpm add @loglayer/mixin-hot-shots hot-shots
```

:::

## TypeScript Setup

To use this mixin with TypeScript, you must register the types by adding the mixin package to your `tsconfig.json` includes:

```json
{
  "include": [
    "./node_modules/@loglayer/mixin-hot-shots"
  ]
}
```

This ensures TypeScript recognizes the mixin methods on your LogLayer instances.

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

// Use StatsD methods through the stats property
log.stats.increment('request.count').send();
log.stats.decrement('request.count').send();
log.stats.timing('request.duration', 150).send();
log.stats.gauge('active.connections', 42).send();
```

### Builder Pattern

All stats methods use a fluent builder pattern. You can chain configuration methods before calling `send()`. Since `send()` returns `void`, stats calls should be placed at the end of a method chain:

```typescript
// Increment with value, tags, and sample rate
log.stats.increment('request.count')
  .withValue(5)
  .withTags(['env:production', 'service:api'])
  .withSampleRate(0.5)
  .withCallback((error, bytes) => {
    if (error) {
      log.withError(error).error('Error sending metric');
    } else {
      log.info(`Sent ${bytes} bytes`);
    }
  })
  .send();

// Chain LogLayer methods BEFORE stats
log
  .withContext({ userId: '123' })
  .withPrefix('API')
  .stats.increment('user.login').send(); // Chain ends here

// Stats methods are available on child loggers
const childLogger = log.child();
childLogger.stats.timing('operation.duration', 150).send();

// To continue logging after stats, start a new statement
log.stats.increment('login').send();
log.info('User logged in');
```

### Testing with MockLogLayer

The hot-shots mixin is fully compatible with `MockLogLayer` for unit testing:

```typescript
import { MockLogLayer } from 'loglayer';
import { useLogLayerMixin } from 'loglayer';
import { hotshotsMixin, MockStatsAPI } from '@loglayer/mixin-hot-shots';

// Register the mixin with a null client for testing
useLogLayerMixin(hotshotsMixin(null));

const mockLogger = new MockLogLayer();

// All stats methods are available on MockLogLayer
mockLogger.stats.increment('counter').send();
mockLogger.stats.gauge('gauge', 100).send();
mockLogger.stats.timing('timer', 500).send();

// The stats property will be a MockStatsAPI when using null client
// No actual metrics are sent, making it safe for unit tests
```

For more information on testing with MockLogLayer, see the [Unit Testing documentation](/logging-api/unit-testing).

## Configuration

The `hotshotsMixin` function requires a configured `StatsD` client instance from the `hot-shots` library.

### Required Parameters

| Name | Type | Description |
|------|------|-------------|
| `client` | `StatsD` | A configured `StatsD` client instance from the `hot-shots` library |

For detailed information about configuring the `StatsD` client, see the [hot-shots documentation](https://github.com/bdeitte/hot-shots).

## Available Methods

All stats methods are accessed through the `stats` property on LogLayer instances. Each method returns a builder that supports chaining configuration methods before calling `send()` or `create()`. For detailed usage information, parameters, and examples, refer to the [hot-shots documentation](https://github.com/bdeitte/hot-shots).

### Accessing the StatsD Client

| Method | Returns | Description |
|--------|---------|-------------|
| `getClient()` | `StatsD` | Returns the underlying hot-shots StatsD client instance that was configured when the mixin was registered. Useful for accessing advanced features that aren't directly exposed through the mixin API. |

### Counters

| Method | Returns | Description |
|--------|---------|-------------|
| `stats.increment(stat)` | `IIncrementDecrementBuilder` | Increments a counter stat. Use `withValue()` to specify the increment amount (defaults to 1) |
| `stats.decrement(stat)` | `IIncrementDecrementBuilder` | Decrements a counter stat. Use `withValue()` to specify the decrement amount (defaults to 1) |

**Builder methods**: `withValue(value)`, `withTags(tags)`, `withSampleRate(rate)`, `withCallback(callback)`, `send()`

### Timings

| Method | Returns | Description |
|--------|---------|-------------|
| `stats.timing(stat, value)` | `IStatsBuilder` | Sends a timing command. The value can be milliseconds (number) or a Date object |
| `stats.timer(func, stat)` | `ITimerBuilder` | Wraps a synchronous function to automatically time its execution. Returns a builder that supports chaining with `withTags()`, `withSampleRate()`, and `withCallback()`. Call `create()` to get the wrapped function |
| `stats.asyncTimer(func, stat)` | `IAsyncTimerBuilder` | Wraps an async function to automatically time its execution. Returns a builder that supports chaining with `withTags()`, `withSampleRate()`, and `withCallback()`. Call `create()` to get the wrapped function |
| `stats.asyncDistTimer(func, stat)` | `IAsyncDistTimerBuilder` | Wraps an async function to automatically time its execution as a distribution metric (DogStatsD only). Returns a builder that supports chaining with `withTags()`, `withSampleRate()`, and `withCallback()`. Call `create()` to get the wrapped function |

**Builder methods for `timing`**: `withTags(tags)`, `withSampleRate(rate)`, `withCallback(callback)`, `send()`

**Builder methods for `timer`, `asyncTimer`, and `asyncDistTimer`**: `withTags(tags)`, `withSampleRate(rate)`, `withCallback(callback)`, `create()`

```typescript
// Wrap a synchronous function to automatically time it
const processData = (data: string) => {
  // Your synchronous logic
  return data.toUpperCase();
};

const timedProcess = log.stats.timer(processData, 'data.process.duration').create();
const result = timedProcess('hello'); // Automatically records timing

// Wrap an async function to automatically time it
const fetchData = async (url: string) => {
  const response = await fetch(url);
  return response.json();
};

// Simple usage
const timedFetch = log.stats.asyncTimer(fetchData, 'api.fetch.duration').create();
const data = await timedFetch('https://api.example.com/data');

// With tags and sample rate
const timedFetchWithOptions = log.stats
  .asyncTimer(fetchData, 'api.fetch.duration')
  .withTags(['env:production', 'service:api'])
  .withSampleRate(0.5)
  .create();

const data2 = await timedFetchWithOptions('https://api.example.com/data');
```

### Histograms and Distributions

| Method | Returns | Description |
|--------|---------|-------------|
| `stats.histogram(stat, value)` | `IStatsBuilder` | Records a value in a histogram. Histograms track the statistical distribution of values (DogStatsD/Telegraf only) |
| `stats.distribution(stat, value)` | `IStatsBuilder` | Tracks the statistical distribution of a set of values (DogStatsD v6). Similar to histogram but optimized for distributions |

**Builder methods**: `withTags(tags)`, `withSampleRate(rate)`, `withCallback(callback)`, `send()`

### Gauges

| Method | Returns | Description |
|--------|---------|-------------|
| `stats.gauge(stat, value)` | `IStatsBuilder` | Sets or changes a gauge stat to the specified value |
| `stats.gaugeDelta(stat, delta)` | `IStatsBuilder` | Changes a gauge stat by a specified amount rather than setting it to a value |

**Builder methods**: `withTags(tags)`, `withSampleRate(rate)`, `withCallback(callback)`, `send()`

### Sets

| Method | Returns | Description |
|--------|---------|-------------|
| `stats.set(stat, value)` | `IStatsBuilder` | Counts unique occurrences of a stat. Records how many unique elements were tracked |
| `stats.unique(stat, value)` | `IStatsBuilder` | Alias for `set`. Counts unique occurrences of a stat |

**Builder methods**: `withTags(tags)`, `withSampleRate(rate)`, `withCallback(callback)`, `send()`

### Service Checks (DogStatsD only)

| Method | Returns | Description |
|--------|---------|-------------|
| `stats.check(name, status)` | `ICheckBuilder` | Sends a service check status. Status values: `0` = OK, `1` = WARNING, `2` = CRITICAL, `3` = UNKNOWN |

**Builder methods**: `withOptions(options)`, `withTags(tags)`, `withCallback(callback)`, `send()`

**Note**: `withSampleRate()` is not supported for service checks and is a no-op.

### Events (DogStatsD only)

| Method | Returns | Description |
|--------|---------|-------------|
| `stats.event(title)` | `IEventBuilder` | Sends an event. Use `withText()` to set the event description |

**Builder methods**: `withText(text)`, `withTags(tags)`, `withCallback(callback)`, `send()`

**Note**: `withSampleRate()` is not supported for events and is a no-op.

## Builder Methods

All stats methods return a builder that supports the following configuration methods:

### Common Builder Methods

| Method | Type | Description |
|--------|------|-------------|
| `withTags(tags)` | `StatsTags` | Add tags to the metric. Can be an array of strings (`['env:prod', 'service:api']`) or an object (`{ env: 'prod', service: 'api' }`) |
| `withSampleRate(rate)` | `number` | Set the sample rate for the metric (0.0 to 1.0). Not supported for events and service checks |
| `withCallback(callback)` | `StatsCallback` | Add a callback function to be called after sending the metric. Receives `(error?: Error, bytes?: number)` |
| `send()` | `void` | Send the metric with the configured options |

### Increment/Decrement Builder Methods

| Method | Type | Description |
|--------|------|-------------|
| `withValue(value)` | `number` | Set the increment/decrement value (defaults to 1 if not specified) |

### Event Builder Methods

| Method | Type | Description |
|--------|------|-------------|
| `withText(text)` | `string` | Set the event text/description |

### Check Builder Methods

| Method | Type | Description |
|--------|------|-------------|
| `withOptions(options)` | `CheckOptions` | Set service check options (hostname, timestamp, message, etc.) |

## Examples

### Basic Usage

```typescript
import { LogLayer, useLogLayerMixin, ConsoleTransport } from 'loglayer';
import { StatsD } from 'hot-shots';
import { hotshotsMixin } from '@loglayer/mixin-hot-shots';

const statsd = new StatsD({ host: 'localhost', port: 8125 });
useLogLayerMixin(hotshotsMixin(statsd));

const log = new LogLayer({
  transport: new ConsoleTransport({ logger: console })
});

// Simple increment
log.stats.increment('page.views').send();

// Increment by specific value
log.stats.increment('items.sold').withValue(10).send();

// Timing with tags
log.stats.timing('request.duration', 150)
  .withTags(['method:GET', 'status:200'])
  .send();

// Gauge with object tags
log.stats.gauge('active.users', 42)
  .withTags({ env: 'production', region: 'us-east-1' })
  .send();
```

### Advanced Usage

```typescript
// Increment with all options
log.stats.increment('api.requests')
  .withValue(1)
  .withTags(['env:production', 'service:api'])
  .withSampleRate(0.1) // Sample 10% of requests
  .withCallback((error, bytes) => {
    if (error) {
      log.error('Failed to send metric').withError(error).send();
    }
  })
  .send();

// Service check (DogStatsD)
import { StatsD } from 'hot-shots';
const statsd = new StatsD({ host: 'localhost', port: 8125 });
const CHECKS = statsd.CHECKS;

log.stats.check('database.health', CHECKS.OK)
  .withOptions({
    hostname: 'db-server-1',
    message: 'Database is healthy'
  })
  .withTags(['service:database', 'env:production'])
  .send();

// Event (DogStatsD)
log.stats.event('Deployment completed')
  .withText('Version 1.2.3 deployed to production')
  .withTags(['env:production', 'version:1.2.3'])
  .send();
```

### Multiple Stats

All methods support arrays of stat names:

```typescript
// Increment multiple counters at once
log.stats.increment(['requests.total', 'requests.api']).send();

// Set multiple gauges
log.stats.gauge(['cpu.usage', 'memory.usage'], 75).send();
```
