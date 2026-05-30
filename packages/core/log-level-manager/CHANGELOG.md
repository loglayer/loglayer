# @loglayer/log-level-manager

## 2.2.0

### Minor Changes

- [#405](https://github.com/loglayer/loglayer/pull/405) [`bdec560`](https://github.com/loglayer/loglayer/commit/bdec56055ffa2ae8b0ca7e06e5bb1332747f82cf) Thanks [@theogravity](https://github.com/theogravity)! - Bump versions for packages depending on loglayer due to minor version update in loglayer and @loglayer/shared (types changed).

### Patch Changes

- Updated dependencies [[`9cf3b79`](https://github.com/loglayer/loglayer/commit/9cf3b795a73fbf932068f2722fefdf0e874a90fc)]:
  - @loglayer/shared@4.3.0

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

- Updated dependencies [[`677043e`](https://github.com/loglayer/loglayer/commit/677043ee2830f9d0e43b0a5276a3e5866342315d), [`9628fa4`](https://github.com/loglayer/loglayer/commit/9628fa42caffea52197ad90baedb6aed177824f2)]:
  - @loglayer/shared@4.2.0

## 2.0.2

### Patch Changes

- Updated dependencies [[`c022bb1`](https://github.com/loglayer/loglayer/commit/c022bb1051c7c4f4831d7674869426d088eb3e52)]:
  - @loglayer/shared@4.1.0

## 2.0.1

### Patch Changes

- Updated dependencies [[`f9b32cd`](https://github.com/loglayer/loglayer/commit/f9b32cd3573b5f04fee8f0394b24c5ad02ea4c75)]:
  - @loglayer/shared@4.0.1

## 2.0.0

### Major Changes

- [`fc56d4b`](https://github.com/loglayer/loglayer/commit/fc56d4b0a989d464f4e727b27ee53cfe22835ddd) Thanks [@theogravity](https://github.com/theogravity)! - Major version bump to align all packages with loglayer v9. No breaking changes in these packages; update your loglayer dependency to v9 for lazy evaluation support.

### Patch Changes

- Updated dependencies [[`fc56d4b`](https://github.com/loglayer/loglayer/commit/fc56d4b0a989d464f4e727b27ee53cfe22835ddd)]:
  - @loglayer/shared@4.0.0

## 1.0.5

### Patch Changes

- Updated dependencies [[`4916581`](https://github.com/loglayer/loglayer/commit/491658199b210c293e195e708fdbed2be14d5880)]:
  - @loglayer/shared@3.3.0

## 1.0.4

### Patch Changes

- Updated dependencies [[`9155ec9`](https://github.com/loglayer/loglayer/commit/9155ec9bade32dfc089d449134bd91adc76d44e0)]:
  - @loglayer/shared@3.2.0

## 1.0.3

### Patch Changes

- [#318](https://github.com/loglayer/loglayer/pull/318) [`358032a`](https://github.com/loglayer/loglayer/commit/358032a222e186cb9e34580a644831e7ce584869) Thanks [@theogravity](https://github.com/theogravity)! - - Add to package.json `sideEffects: false`, which will better help with tree shaking
  - Dev dependency updates
- Updated dependencies [[`358032a`](https://github.com/loglayer/loglayer/commit/358032a222e186cb9e34580a644831e7ce584869)]:
  - @loglayer/shared@3.1.1

## 1.0.2

### Patch Changes

- Updated dependencies [[`c45b39a`](https://github.com/loglayer/loglayer/commit/c45b39ac22f8209c9674c1c3c7395a9b4b49c2c9)]:
  - @loglayer/shared@3.1.0

## 1.0.2-alpha-0.0

### Patch Changes

- Updated dependencies [d5bb7f7]
  - @loglayer/shared@3.1.0-alpha-0.0

## 1.0.1

### Patch Changes

- Updated dependencies [[`fa69748`](https://github.com/loglayer/loglayer/commit/fa69748f770bb70733efdfd02218f47770640fc1)]:
  - @loglayer/shared@3.0.1

## 1.0.0

### Major Changes

- [#305](https://github.com/loglayer/loglayer/pull/305) [`5af0d6b`](https://github.com/loglayer/loglayer/commit/5af0d6b28f0316007fbbe796c631b711630c6787) Thanks [@theogravity](https://github.com/theogravity)! - First version

### Patch Changes

- Updated dependencies [[`5af0d6b`](https://github.com/loglayer/loglayer/commit/5af0d6b28f0316007fbbe796c631b711630c6787)]:
  - @loglayer/shared@3.0.0
