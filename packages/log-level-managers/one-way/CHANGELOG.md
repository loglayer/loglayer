# @loglayer/log-level-manager-one-way

## 2.2.0

### Minor Changes

- [#405](https://github.com/loglayer/loglayer/pull/405) [`bdec560`](https://github.com/loglayer/loglayer/commit/bdec56055ffa2ae8b0ca7e06e5bb1332747f82cf) Thanks [@theogravity](https://github.com/theogravity)! - Bump versions for packages depending on loglayer due to minor version update in loglayer and @loglayer/shared (types changed).

### Patch Changes

- Updated dependencies [[`bdec560`](https://github.com/loglayer/loglayer/commit/bdec56055ffa2ae8b0ca7e06e5bb1332747f82cf)]:
  - @loglayer/log-level-manager@2.2.0

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
  - @loglayer/log-level-manager@2.1.0

## 2.0.2

### Patch Changes

- Updated dependencies []:
  - @loglayer/log-level-manager@2.0.2

## 2.0.1

### Patch Changes

- Updated dependencies []:
  - @loglayer/log-level-manager@2.0.1

## 2.0.0

### Major Changes

- [`fc56d4b`](https://github.com/loglayer/loglayer/commit/fc56d4b0a989d464f4e727b27ee53cfe22835ddd) Thanks [@theogravity](https://github.com/theogravity)! - Major version bump to align all packages with loglayer v9. No breaking changes in these packages; update your loglayer dependency to v9 for lazy evaluation support.

### Patch Changes

- Updated dependencies [[`fc56d4b`](https://github.com/loglayer/loglayer/commit/fc56d4b0a989d464f4e727b27ee53cfe22835ddd)]:
  - @loglayer/log-level-manager@2.0.0

## 1.0.5

### Patch Changes

- Updated dependencies []:
  - @loglayer/log-level-manager@1.0.5

## 1.0.4

### Patch Changes

- Updated dependencies []:
  - @loglayer/log-level-manager@1.0.4

## 1.0.3

### Patch Changes

- [#318](https://github.com/loglayer/loglayer/pull/318) [`358032a`](https://github.com/loglayer/loglayer/commit/358032a222e186cb9e34580a644831e7ce584869) Thanks [@theogravity](https://github.com/theogravity)! - - Add to package.json `sideEffects: false`, which will better help with tree shaking
  - Dev dependency updates
- Updated dependencies [[`358032a`](https://github.com/loglayer/loglayer/commit/358032a222e186cb9e34580a644831e7ce584869)]:
  - @loglayer/log-level-manager@1.0.3

## 1.0.2

### Patch Changes

- Updated dependencies []:
  - @loglayer/log-level-manager@1.0.2

## 1.0.2-alpha-0.0

### Patch Changes

- @loglayer/log-level-manager@1.0.2-alpha-0.0

## 1.0.1

### Patch Changes

- [`fa69748`](https://github.com/loglayer/loglayer/commit/fa69748f770bb70733efdfd02218f47770640fc1) Thanks [@theogravity](https://github.com/theogravity)! - Fixed a memory leak issue where circular references between parent and child log level managers prevented proper garbage collection. The manager now uses `WeakRef` for parent and child references, allowing objects to be garbage collected when no longer referenced.

- Updated dependencies []:
  - @loglayer/log-level-manager@1.0.1

## 1.0.0

### Major Changes

- [#305](https://github.com/loglayer/loglayer/pull/305) [`5af0d6b`](https://github.com/loglayer/loglayer/commit/5af0d6b28f0316007fbbe796c631b711630c6787) Thanks [@theogravity](https://github.com/theogravity)! - First version

### Patch Changes

- Updated dependencies [[`5af0d6b`](https://github.com/loglayer/loglayer/commit/5af0d6b28f0316007fbbe796c631b711630c6787)]:
  - @loglayer/log-level-manager@1.0.0
