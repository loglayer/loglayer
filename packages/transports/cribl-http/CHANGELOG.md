# @loglayer/transport-cribl-http

## 1.2.0

### Minor Changes

- [#405](https://github.com/loglayer/loglayer/pull/405) [`bdec560`](https://github.com/loglayer/loglayer/commit/bdec56055ffa2ae8b0ca7e06e5bb1332747f82cf) Thanks [@theogravity](https://github.com/theogravity)! - Bump versions for packages depending on loglayer due to minor version update in loglayer and @loglayer/shared (types changed).

### Patch Changes

- Updated dependencies [[`bdec560`](https://github.com/loglayer/loglayer/commit/bdec56055ffa2ae8b0ca7e06e5bb1332747f82cf)]:
  - @loglayer/transport-http@2.3.0

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

### Patch Changes

- Updated dependencies [[`677043e`](https://github.com/loglayer/loglayer/commit/677043ee2830f9d0e43b0a5276a3e5866342315d)]:
  - @loglayer/transport-http@2.2.0

## 1.0.1

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport-http@2.1.1

## 1.0.0

### Major Changes

- [`3363020`](https://github.com/loglayer/loglayer/commit/336302007ef3336c9c2c38e7974138b34fbe9464) - Major version bump for initial release.

## 0.1.0

### Minor Changes

- [#365](https://github.com/loglayer/loglayer/pull/365) [`e8169bd`](https://github.com/loglayer/loglayer/commit/e8169bd86296c1dbbee758505f1d619b88ac46a3) Thanks [@theogravity](https://github.com/theogravity)! - New transport for sending logs to Cribl Stream via the HTTP/S Bulk API source.
