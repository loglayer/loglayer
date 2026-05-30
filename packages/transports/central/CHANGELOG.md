# @loglayer/transport-central

## 0.2.0

### Minor Changes

- [#405](https://github.com/loglayer/loglayer/pull/405) [`bdec560`](https://github.com/loglayer/loglayer/commit/bdec56055ffa2ae8b0ca7e06e5bb1332747f82cf) Thanks [@theogravity](https://github.com/theogravity)! - Bump versions for packages depending on loglayer due to minor version update in loglayer and @loglayer/shared (types changed).

### Patch Changes

- Updated dependencies [[`bdec560`](https://github.com/loglayer/loglayer/commit/bdec56055ffa2ae8b0ca7e06e5bb1332747f82cf)]:
  - @loglayer/transport@3.2.0
  - @loglayer/transport-http@2.3.0

## 0.1.0

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

### Patch Changes

- Updated dependencies [[`677043e`](https://github.com/loglayer/loglayer/commit/677043ee2830f9d0e43b0a5276a3e5866342315d)]:
  - @loglayer/transport@3.1.0
  - @loglayer/transport-http@2.2.0

## 0.0.3

### Patch Changes

- Updated dependencies [[`5fcc12f`](https://github.com/loglayer/loglayer/commit/5fcc12f61d0625583cf8589f81084c115fd8af71)]:
  - @loglayer/transport@3.0.3
  - @loglayer/transport-http@2.1.1

## 0.0.2

### Patch Changes

- [#360](https://github.com/loglayer/loglayer/pull/360) [`cc7708a`](https://github.com/loglayer/loglayer/commit/cc7708a1ee2d427347ef80b498b18dbdfd32f6db) Thanks [@theogravity](https://github.com/theogravity)! - Initial release of `@loglayer/transport-central`, a LogLayer transport for sending logs to the Central log aggregation server. Extends `HttpTransport` for built-in batching, retries, compression, and rate limiting support.

- Updated dependencies [[`cc7708a`](https://github.com/loglayer/loglayer/commit/cc7708a1ee2d427347ef80b498b18dbdfd32f6db)]:
  - @loglayer/transport-http@2.1.0
