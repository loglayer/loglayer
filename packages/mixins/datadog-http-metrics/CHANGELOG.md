# @loglayer/mixin-datadog-http-metrics

## 2.0.0

### Major Changes

- [`fc56d4b`](https://github.com/loglayer/loglayer/commit/fc56d4b0a989d464f4e727b27ee53cfe22835ddd) Thanks [@theogravity](https://github.com/theogravity)! - Major version bump to align all packages with loglayer v9. No breaking changes in these packages; update your loglayer dependency to v9 for lazy evaluation support.

## 1.0.0

### Major Changes

- [#345](https://github.com/loglayer/loglayer/pull/345) [`bc076f5`](https://github.com/loglayer/loglayer/commit/bc076f529e60edc7ca230bd451292d3974b93c8b) Thanks [@theogravity](https://github.com/theogravity)! - Added new Datadog Metrics (HTTP) mixin package. Adds Datadog metrics functionality to LogLayer using the `datadog-metrics` library, sending metrics directly to Datadog's HTTP API. Provides a fluent builder API via `log.ddStats` for counters, gauges, histograms, and distributions with support for tags, timestamps, and custom histogram options. Includes no-op mode for testing and an `enabled` flag for conditional activation. See the [Datadog Metrics (HTTP) Mixin documentation](/mixins/datadog-http-metrics) for usage examples.
