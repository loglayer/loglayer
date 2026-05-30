# @loglayer/transport-betterstack

## 2.2.0

### Minor Changes

- [#405](https://github.com/loglayer/loglayer/pull/405) [`bdec560`](https://github.com/loglayer/loglayer/commit/bdec56055ffa2ae8b0ca7e06e5bb1332747f82cf) Thanks [@theogravity](https://github.com/theogravity)! - Bump versions for packages depending on loglayer due to minor version update in loglayer and @loglayer/shared (types changed).

### Patch Changes

- Updated dependencies [[`bdec560`](https://github.com/loglayer/loglayer/commit/bdec56055ffa2ae8b0ca7e06e5bb1332747f82cf)]:
  - @loglayer/transport@3.2.0
  - @loglayer/transport-http@2.3.0

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
  - @loglayer/transport-http@2.2.0

## 2.0.4

### Patch Changes

- Updated dependencies [[`5fcc12f`](https://github.com/loglayer/loglayer/commit/5fcc12f61d0625583cf8589f81084c115fd8af71)]:
  - @loglayer/transport@3.0.3
  - @loglayer/transport-http@2.1.1

## 2.0.3

### Patch Changes

- Updated dependencies [[`cc7708a`](https://github.com/loglayer/loglayer/commit/cc7708a1ee2d427347ef80b498b18dbdfd32f6db)]:
  - @loglayer/transport-http@2.1.0

## 2.0.2

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport-http@2.0.2
  - @loglayer/transport@3.0.2

## 2.0.1

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@3.0.1
  - @loglayer/transport-http@2.0.1

## 2.0.0

### Major Changes

- [`fc56d4b`](https://github.com/loglayer/loglayer/commit/fc56d4b0a989d464f4e727b27ee53cfe22835ddd) Thanks [@theogravity](https://github.com/theogravity)! - Major version bump to align all packages with loglayer v9. No breaking changes in these packages; update your loglayer dependency to v9 for lazy evaluation support.

### Patch Changes

- Updated dependencies [[`fc56d4b`](https://github.com/loglayer/loglayer/commit/fc56d4b0a989d464f4e727b27ee53cfe22835ddd)]:
  - @loglayer/transport@3.0.0
  - @loglayer/transport-http@2.0.0

## 1.0.10

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport-http@1.1.11
  - @loglayer/transport@2.3.13

## 1.0.9

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport-http@1.1.10
  - @loglayer/transport@2.3.12

## 1.0.8

### Patch Changes

- [#318](https://github.com/loglayer/loglayer/pull/318) [`358032a`](https://github.com/loglayer/loglayer/commit/358032a222e186cb9e34580a644831e7ce584869) Thanks [@theogravity](https://github.com/theogravity)! - - Add to package.json `sideEffects: false`, which will better help with tree shaking
  - Dev dependency updates
- Updated dependencies [[`358032a`](https://github.com/loglayer/loglayer/commit/358032a222e186cb9e34580a644831e7ce584869)]:
  - @loglayer/transport-http@1.1.9
  - @loglayer/transport@2.3.11

## 1.0.7

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport-http@1.1.8
  - @loglayer/transport@2.3.10

## 1.0.7-alpha-0.0

### Patch Changes

- @loglayer/transport-http@1.1.8-alpha-0.0
- @loglayer/transport@2.3.10-alpha-0.0

## 1.0.6

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@2.3.9
  - @loglayer/transport-http@1.1.7

## 1.0.5

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport-http@1.1.6
  - @loglayer/transport@2.3.8

## 1.0.4

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport-http@1.1.5
  - @loglayer/transport@2.3.7

## 1.0.3

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport-http@1.1.4
  - @loglayer/transport@2.3.6

## 1.0.2

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport-http@1.1.3
  - @loglayer/transport@2.3.5

## 1.0.1

### Patch Changes

- [#277](https://github.com/loglayer/loglayer/pull/277) [`1e01627`](https://github.com/loglayer/loglayer/commit/1e01627eeafb5e094da958532ad385cc59d70857) Thanks [@Eptagone](https://github.com/Eptagone)! - Migration from tsup to tsdown and small dependency updates.

- Updated dependencies [[`1e01627`](https://github.com/loglayer/loglayer/commit/1e01627eeafb5e094da958532ad385cc59d70857)]:
  - @loglayer/transport-http@1.1.2
  - @loglayer/transport@2.3.4

## 1.0.0

### Major Changes

- [#272](https://github.com/loglayer/loglayer/pull/272) [`2a24d9a`](https://github.com/loglayer/loglayer/commit/2a24d9abf07087c7121d4eedd98d03cf8c0fbc6c) Thanks [@theogravity](https://github.com/theogravity)! - First version

### Patch Changes

- Updated dependencies [[`2a24d9a`](https://github.com/loglayer/loglayer/commit/2a24d9abf07087c7121d4eedd98d03cf8c0fbc6c)]:
  - @loglayer/transport-http@1.1.1

## 1.0.0

### Added

- Initial release of Better Stack transport
- Support for Better Stack HTTP API
- Configurable source token and endpoint
- Batch sending support
- Error handling and retry logic
