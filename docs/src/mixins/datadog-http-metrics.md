---
title: Datadog Metrics (HTTP) Mixin for LogLayer
description: Add Datadog metrics functionality to LogLayer using the datadog-metrics HTTP library
---

# Datadog Metrics (HTTP) Mixin <Badge type="tip" text="Server" />

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Fmixin-datadog-http-metrics)](https://www.npmjs.com/package/@loglayer/mixin-datadog-http-metrics)

[![Source](https://img.shields.io/badge/source-GitHub-blue)](https://github.com/loglayer/loglayer/tree/master/packages/mixins/datadog-http-metrics)

Adds Datadog metrics functionality to the [LogLayer](https://loglayer.dev) logging library using [datadog-metrics](https://github.com/dbader/node-datadog-metrics). The mixin provides a fluent builder API for sending metrics to Datadog via HTTP through a `ddStats` property on LogLayer instances.

Unlike the [Hot-Shots mixin](/mixins/hot-shots) which sends metrics via StatsD/UDP, this mixin sends metrics directly to Datadog's HTTP API. This is useful when you don't have a local StatsD agent running, or when you prefer HTTP-based metric submission.

## Installation

This mixin requires the [`datadog-metrics`](https://github.com/dbader/node-datadog-metrics) library to be installed in your project.

::: code-group

```bash [npm]
npm install @loglayer/mixin-datadog-http-metrics datadog-metrics
```

```bash [yarn]
yarn add @loglayer/mixin-datadog-http-metrics datadog-metrics
```

```bash [pnpm]
pnpm add @loglayer/mixin-datadog-http-metrics datadog-metrics
```

:::

## TypeScript Setup

To use this mixin with TypeScript, you must register the types by adding the mixin package to your `tsconfig.json` includes:

```json
{
  "include": [
    "./node_modules/@loglayer/mixin-datadog-http-metrics"
  ]
}
```

This ensures TypeScript recognizes the mixin methods on your LogLayer instances.

## Usage

Configure the mixin with your Datadog options, then register it **before** creating any LogLayer instances:

```typescript
import { LogLayer, useLogLayerMixin, ConsoleTransport } from 'loglayer';
import { datadogMetricsMixin } from '@loglayer/mixin-datadog-http-metrics';

// Register the mixin with Datadog configuration
useLogLayerMixin(datadogMetricsMixin({
  apiKey: process.env.DATADOG_API_KEY,
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
```

### Builder Pattern

All metric methods use a fluent builder pattern. You can chain configuration methods before calling `send()`:

```typescript
// Increment with value, tags, and timestamp
log.ddStats.increment('request.count')
  .withValue(5)
  .withTags(['service:api', 'endpoint:/users'])
  .withTimestamp(Date.now())
  .send();

// Histogram with custom aggregation options
log.ddStats.histogram('response.time', 250)
  .withTags(['method:GET', 'status:200'])
  .withHistogramOptions({
    percentiles: [0.95, 0.99],
    aggregates: ['avg', 'count', 'max']
  })
  .send();

// Gauge with tags
log.ddStats.gauge('active.connections', 42)
  .withTags(['region:us-east-1'])
  .send();
```

### Flushing and Lifecycle

The mixin provides methods for controlling when metrics are sent to Datadog:

```typescript
// Flush all buffered metrics immediately
await log.ddStats.flush();

// Start auto-flushing at the configured interval
log.ddStats.start();

// Stop auto-flushing and flush remaining metrics
await log.ddStats.stop();

// Stop without flushing
await log.ddStats.stop({ flush: false });
```

### Accessing the Underlying Client

You can access the underlying `BufferedMetricsLogger` instance for advanced use cases:

```typescript
const client = log.ddStats.getClient();
```

### Conditional Activation

Use the `enabled` flag to conditionally activate metrics based on your environment:

```typescript
useLogLayerMixin(datadogMetricsMixin({
  apiKey: process.env.DATADOG_API_KEY,
  prefix: 'myapp.',
  enabled: process.env.NODE_ENV === 'production',
}));
```

When `enabled` is `false`, all metric methods become no-ops — no client is created and no metrics are sent, but the `ddStats` API remains fully available so your code doesn't need any conditional logic.

### Testing with MockLogLayer

The mixin is fully compatible with `MockLogLayer` for unit testing:

```typescript
import { MockLogLayer, useLogLayerMixin } from 'loglayer';
import { datadogMetricsMixin } from '@loglayer/mixin-datadog-http-metrics';

// Register the mixin with null or enabled: false for no-op mode
useLogLayerMixin(datadogMetricsMixin(null));

const mockLogger = new MockLogLayer();

// All methods are available but do nothing
mockLogger.ddStats.increment('counter').send();
mockLogger.ddStats.gauge('gauge', 100).send();
await mockLogger.ddStats.flush(); // resolves immediately
```

For more information on testing with MockLogLayer, see the [Unit Testing documentation](/logging-api/unit-testing).

## Configuration

The `datadogMetricsMixin` function accepts a configuration object with all options from the `BufferedMetricsLogger` class, or `null` for no-op mode.

### Options

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Set to `false` to disable metrics (no-op mode). Useful for conditionally enabling based on environment |
| `apiKey` | `string` | `DATADOG_API_KEY` or `DD_API_KEY` env var | Datadog API key. Ignored if `reporter` is set |
| `host` | `string` | - | Default hostname reported with each metric |
| `prefix` | `string` | `''` | Default key prefix prepended to all metrics |
| `site` | `string` | `datadoghq.com` | Datadog site location (e.g. `datadoghq.eu`). Can also use `DATADOG_SITE` or `DD_SITE` env vars |
| `flushIntervalSeconds` | `number` | `5` | Auto-flush interval in seconds. Set to `0` to disable auto-flushing |
| `defaultTags` | `string[]` | - | Tags applied to all metrics |
| `histogram` | `object` | - | Default histogram options (see below) |
| `onError` | `(error: Error) => void` | - | Callback for async flush failures |
| `reporter` | `ReporterType` | `DatadogReporter` | Custom reporter implementation |
| `retries` | `number` | `2` | Retry attempts for failed submissions. Ignored if `reporter` is set |
| `retryBackoff` | `number` | `1` | Seconds before first retry. Subsequent retries double the delay. Ignored if `reporter` is set |

### Histogram Options

| Name | Type | Description |
|------|------|-------------|
| `aggregates` | `string[]` | Aggregation types: `'max'`, `'min'`, `'sum'`, `'avg'`, `'count'`, `'median'` |
| `percentiles` | `number[]` | Percentile values between 0 and 1 (e.g. `[0.95, 0.99]`) |

### Environment Variables

The following environment variables are supported by the underlying `datadog-metrics` library:

| Variable | Description |
|----------|-------------|
| `DATADOG_API_KEY` or `DD_API_KEY` | Datadog API key. Used when `apiKey` is not set in options |
| `DATADOG_SITE` or `DD_SITE` | Datadog site location. Used when `site` is not set in options |
| `DEBUG=metrics` | Enable debug logging from the `datadog-metrics` library |

### Error Handling

When metrics fail to flush, the `onError` callback is invoked. If `onError` is not set, errors are logged to stderr by default.

```typescript
useLogLayerMixin(datadogMetricsMixin({
  apiKey: process.env.DATADOG_API_KEY,
  onError(error) {
    console.error('Failed to flush metrics:', error);
  }
}));
```

### Reporters

The library ships with two built-in reporters:

- **`DatadogReporter`** (default) — Sends metrics to Datadog's HTTP API with automatic retries.
- **`NullReporter`** — Discards all metrics. Useful for testing or temporarily disabling metric submission without using the `enabled` flag.

```typescript
import metrics from 'datadog-metrics';

useLogLayerMixin(datadogMetricsMixin({
  reporter: new metrics.reporters.NullReporter(),
}));
```

You can also provide a custom reporter by implementing the `report` method:

```typescript
useLogLayerMixin(datadogMetricsMixin({
  reporter: {
    async report(series) {
      // series is an array of metric objects
      // Send them to your custom backend
    }
  }
}));
```

For detailed information about configuration options, see the [datadog-metrics documentation](https://github.com/dbader/node-datadog-metrics).

## Available Methods

All metric methods are accessed through the `ddStats` property on LogLayer instances. Each method returns a builder that supports chaining configuration methods before calling `send()`.

### Counters

| Method | Returns | Description |
|--------|---------|-------------|
| `ddStats.increment(key)` | `IIncrementBuilder` | Increments a counter. Use `withValue()` to specify the amount (defaults to 1) |

**Builder methods**: `withValue(value)`, `withTags(tags)`, `withTimestamp(timestamp)`, `send()`

### Gauges

| Method | Returns | Description |
|--------|---------|-------------|
| `ddStats.gauge(key, value)` | `IMetricsBuilder` | Sets a gauge to the specified value. Reports the most recent value at flush time |

**Builder methods**: `withTags(tags)`, `withTimestamp(timestamp)`, `send()`

### Histograms

| Method | Returns | Description |
|--------|---------|-------------|
| `ddStats.histogram(key, value)` | `IHistogramBuilder` | Samples a value and generates min, max, avg, median, count, and percentile metrics |

**Builder methods**: `withHistogramOptions(options)`, `withTags(tags)`, `withTimestamp(timestamp)`, `send()`

### Distributions

| Method | Returns | Description |
|--------|---------|-------------|
| `ddStats.distribution(key, value)` | `IMetricsBuilder` | Records a distribution value. Calculated server-side by Datadog, useful for serverless or multi-instance environments |

**Builder methods**: `withTags(tags)`, `withTimestamp(timestamp)`, `send()`

### Lifecycle Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `ddStats.flush()` | `Promise<void>` | Flush all buffered metrics to Datadog immediately |
| `ddStats.start()` | `void` | Start auto-flushing at the configured `flushIntervalSeconds` |
| `ddStats.stop(options?)` | `Promise<void>` | Stop auto-flushing. Pass `{ flush: false }` to skip flushing remaining metrics |
| `ddStats.getClient()` | `BufferedMetricsLogger` | Returns the underlying `BufferedMetricsLogger` instance |

## Builder Methods

### Common Builder Methods

| Method | Type | Description |
|--------|------|-------------|
| `withTags(tags)` | `string[]` | Add tags to the metric (e.g. `['env:prod', 'service:api']`) |
| `withTimestamp(timestamp)` | `number` | Set the timestamp in milliseconds since epoch (e.g. `Date.now()`) |
| `send()` | `void` | Send the metric with the configured options |

### Increment Builder Methods

| Method | Type | Description |
|--------|------|-------------|
| `withValue(value)` | `number` | Set the increment value (defaults to 1 if not specified) |

### Histogram Builder Methods

| Method | Type | Description |
|--------|------|-------------|
| `withHistogramOptions(options)` | `HistogramOptions` | Set custom aggregates and percentiles for this histogram |

## Examples

### Basic Usage

```typescript
import { LogLayer, useLogLayerMixin, ConsoleTransport } from 'loglayer';
import { datadogMetricsMixin } from '@loglayer/mixin-datadog-http-metrics';

useLogLayerMixin(datadogMetricsMixin({
  apiKey: process.env.DATADOG_API_KEY,
  prefix: 'myapp.',
}));

const log = new LogLayer({
  transport: new ConsoleTransport({ logger: console })
});

// Simple increment
log.ddStats.increment('page.views').send();

// Increment by specific value
log.ddStats.increment('items.sold').withValue(10).send();

// Gauge with tags
log.ddStats.gauge('active.users', 42)
  .withTags(['env:production', 'region:us-east-1'])
  .send();

// Histogram
log.ddStats.histogram('request.duration', 150)
  .withTags(['method:GET', 'status:200'])
  .send();
```

### Advanced Usage

```typescript
// Increment with all options
log.ddStats.increment('api.requests')
  .withValue(1)
  .withTags(['env:production', 'service:api'])
  .withTimestamp(Date.now())
  .send();

// Histogram with custom percentiles
log.ddStats.histogram('response.time', 250)
  .withTags(['endpoint:/api/users'])
  .withHistogramOptions({
    percentiles: [0.5, 0.9, 0.95, 0.99],
    aggregates: ['avg', 'count', 'max']
  })
  .send();

// Distribution for serverless environments
log.ddStats.distribution('lambda.duration', 150)
  .withTags(['function:processOrder', 'env:production'])
  .send();
```

### Graceful Shutdown

When auto-flushing is enabled, the library will automatically attempt to flush remaining metrics before the process exits via signals (e.g. `SIGTERM`, `SIGINT`). However, it **cannot** catch direct `process.exit()` calls. If your application calls `process.exit()`, you should flush metrics beforehand:

```typescript
// Handle signals — auto-flush covers this, but you can be explicit:
process.on('SIGTERM', async () => {
  await log.ddStats.stop();
  process.exit(0);
});

// Before calling process.exit() directly, always flush first:
await log.ddStats.stop();
process.exit(0);
```
