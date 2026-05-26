# @loglayer/transport-sentry

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

### Patch Changes

- Updated dependencies [[`677043e`](https://github.com/loglayer/loglayer/commit/677043ee2830f9d0e43b0a5276a3e5866342315d)]:
  - @loglayer/transport@3.1.0

## 2.0.3

### Patch Changes

- Updated dependencies [[`5fcc12f`](https://github.com/loglayer/loglayer/commit/5fcc12f61d0625583cf8589f81084c115fd8af71)]:
  - @loglayer/transport@3.0.3

## 2.0.2

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@3.0.2

## 2.0.1

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@3.0.1

## 2.0.0

### Major Changes

- [`fc56d4b`](https://github.com/loglayer/loglayer/commit/fc56d4b0a989d464f4e727b27ee53cfe22835ddd) Thanks [@theogravity](https://github.com/theogravity)! - Major version bump to align all packages with loglayer v9. No breaking changes in these packages; update your loglayer dependency to v9 for lazy evaluation support.

### Patch Changes

- Updated dependencies [[`fc56d4b`](https://github.com/loglayer/loglayer/commit/fc56d4b0a989d464f4e727b27ee53cfe22835ddd)]:
  - @loglayer/transport@3.0.0

## 1.0.9

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@2.3.13

## 1.0.8

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@2.3.12

## 1.0.7

### Patch Changes

- [#318](https://github.com/loglayer/loglayer/pull/318) [`358032a`](https://github.com/loglayer/loglayer/commit/358032a222e186cb9e34580a644831e7ce584869) Thanks [@theogravity](https://github.com/theogravity)! - - Add to package.json `sideEffects: false`, which will better help with tree shaking
  - Dev dependency updates
- Updated dependencies [[`358032a`](https://github.com/loglayer/loglayer/commit/358032a222e186cb9e34580a644831e7ce584869)]:
  - @loglayer/transport@2.3.11

## 1.0.6

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@2.3.10

## 1.0.6-alpha-0.0

### Patch Changes

- @loglayer/transport@2.3.10-alpha-0.0

## 1.0.5

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@2.3.9

## 1.0.4

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@2.3.8

## 1.0.3

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@2.3.7

## 1.0.2

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@2.3.6

## 1.0.1

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@2.3.5

## 1.0.0

### Major Changes

- [#279](https://github.com/loglayer/loglayer/pull/279) [`2d59a4e`](https://github.com/loglayer/loglayer/commit/2d59a4e690714a77c31e0947f4cbd97bd5d13c46) Thanks [@theogravity](https://github.com/theogravity)! - First version
