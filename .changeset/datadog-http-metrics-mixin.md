---
"@loglayer/mixin-datadog-http-metrics": major
---

Added new Datadog Metrics (HTTP) mixin package. Adds Datadog metrics functionality to LogLayer using the `datadog-metrics` library, sending metrics directly to Datadog's HTTP API. Provides a fluent builder API via `log.ddStats` for counters, gauges, histograms, and distributions with support for tags, timestamps, and custom histogram options. Includes no-op mode for testing and an `enabled` flag for conditional activation. See the [Datadog Metrics (HTTP) Mixin documentation](/mixins/datadog-http-metrics) for usage examples.
