# @loglayer/mixin-datadog-http-metrics

## 2.3.0

### Minor Changes

- [#418](https://github.com/loglayer/loglayer/pull/418) [`8406eec`](https://github.com/loglayer/loglayer/commit/8406eec67980a167cbbc2f0418b764d1cad6faac) Thanks [@theogravity](https://github.com/theogravity)! - Augment the `ILogLayer` interface under `@loglayer/shared` (where it is defined) instead of `declare module "loglayer"` (which only re-exports it), matching `@loglayer/mixin-wide-events`.

  This fixes a type error for consumers that combine these mixins with a mixin that augments `@loglayer/shared` (such as `@loglayer/mixin-wide-events`, which ships with LogLayer): when `ILogLayer` is augmented under both `"loglayer"` and `"@loglayer/shared"` by different coexisting mixins, the `"loglayer"`-targeted methods (e.g. `stats`, `ddStats`) stop resolving on chained return types such as `logger.child()` when the logger is typed as `ILogLayer`. A single mixin augmenting `"loglayer"` in isolation was unaffected. This is a type-only change; runtime behavior is unchanged.

## 2.2.1

### Patch Changes

- [#409](https://github.com/loglayer/loglayer/pull/409) [`99dd6a1`](https://github.com/loglayer/loglayer/commit/99dd6a18142c9ebcc776965ad317b46a4a66a7e4) Thanks [@theogravity](https://github.com/theogravity)! - fix: add `loglayer` as a peer dependency to all mixin packages

  All mixin packages now declare `loglayer` as a peer dependency, ensuring tsdown externalizes `loglayer` types instead of bundling them inline. This fixes type incompatibility when using mixins with consumer projects that have their own `loglayer` installation.

## 2.2.0

### Minor Changes

- [#405](https://github.com/loglayer/loglayer/pull/405) [`bdec560`](https://github.com/loglayer/loglayer/commit/bdec56055ffa2ae8b0ca7e06e5bb1332747f82cf) Thanks [@theogravity](https://github.com/theogravity)! - Bump versions for packages depending on loglayer due to minor version update in loglayer and @loglayer/shared (types changed).

## 2.1.0

### Minor Changes

- [#387](https://github.com/loglayer/loglayer/pull/387) [`677043e`](https://github.com/loglayer/loglayer/commit/677043ee2830f9d0e43b0a5276a3e5866342315d) Thanks [@theogravity](https://github.com/theogravity)! - Add missing parameters to plugin hooks and transports for feature parity with loglayer-go

  Added to all plugin params (`PluginBeforeDataOutParams`, `PluginBeforeMessageOutParams`, `PluginShouldSendToLoggerParams`, `PluginTransformLogLevelParams`) and `LogLayerTransportParams`:

  - `groups?: string[]` - The group names this log entry belongs to
  - `schema?: LogLayerPluginSchema` - Schema information for navigating the assembled data (contextFieldName, metadataFieldName, errorFieldName)
  - `prefix?: string` - The prefix attached via withPrefix()

  New `LogLayerPluginSchema` interface provides:

  - `contextFieldName?: string` - Key under which persistent context data is nested
  - `metadataFieldName?: string` - Key under which per-call metadata is nested
  - `errorFieldName: string` - Key under which serialized error is stored

## 2.0.0

### Major Changes

- [`fc56d4b`](https://github.com/loglayer/loglayer/commit/fc56d4b0a989d464f4e727b27ee53cfe22835ddd) Thanks [@theogravity](https://github.com/theogravity)! - Major version bump to align all packages with loglayer v9. No breaking changes in these packages; update your loglayer dependency to v9 for lazy evaluation support.

## 1.0.0

### Major Changes

- [#345](https://github.com/loglayer/loglayer/pull/345) [`bc076f5`](https://github.com/loglayer/loglayer/commit/bc076f529e60edc7ca230bd451292d3974b93c8b) Thanks [@theogravity](https://github.com/theogravity)! - Added new Datadog Metrics (HTTP) mixin package. Adds Datadog metrics functionality to LogLayer using the `datadog-metrics` library, sending metrics directly to Datadog's HTTP API. Provides a fluent builder API via `log.ddStats` for counters, gauges, histograms, and distributions with support for tags, timestamps, and custom histogram options. Includes no-op mode for testing and an `enabled` flag for conditional activation. See the [Datadog Metrics (HTTP) Mixin documentation](/mixins/datadog-http-metrics) for usage examples.
