# @loglayer/koa

## 1.3.0

### Minor Changes

- [#418](https://github.com/loglayer/loglayer/pull/418) [`8406eec`](https://github.com/loglayer/loglayer/commit/8406eec67980a167cbbc2f0418b764d1cad6faac) Thanks [@theogravity](https://github.com/theogravity)! - Minor version bump to release the updated `ILogLayer` / `ILogBuilder` type system across the ecosystem. The core type change in `@loglayer/shared` (chainable methods now return `ILogLayer<This>` so types no longer collapse to `any` — see [#417](https://github.com/loglayer/loglayer/issues/417)) affects the types every package exposes and consumes, so all packages are re-released together at minor.

## 1.2.0

### Minor Changes

- [#405](https://github.com/loglayer/loglayer/pull/405) [`bdec560`](https://github.com/loglayer/loglayer/commit/bdec56055ffa2ae8b0ca7e06e5bb1332747f82cf) Thanks [@theogravity](https://github.com/theogravity)! - Bump versions for packages depending on loglayer due to minor version update in loglayer and @loglayer/shared (types changed).

## 1.1.0

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

## 1.0.0

### Major Changes

- [`34e4a0e`](https://github.com/loglayer/loglayer/commit/34e4a0ed0391e7e2a3b9857a66d3f39b44355620) Thanks [@theogravity](https://github.com/theogravity)! - Version bump to 1.0.0 for initial release.

## 0.1.0

### Minor Changes

- [#358](https://github.com/loglayer/loglayer/pull/358) [`cdae5f5`](https://github.com/loglayer/loglayer/commit/cdae5f5f08efb057e05226aa6c9b120ad3416b7d) Thanks [@theogravity](https://github.com/theogravity)! - feat: add Express and Koa integration packages with request-scoped logging, auto request/response logging, error handling, and group routing support.
