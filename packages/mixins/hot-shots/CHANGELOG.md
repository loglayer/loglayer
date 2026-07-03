# `@loglayer/mixin-hot-shots` Changelog

## 4.3.0

### Minor Changes

- [#415](https://github.com/loglayer/loglayer/pull/415) [`ba79471`](https://github.com/loglayer/loglayer/commit/ba79471e235f8b3cbb8d9f793872e0c6d5275fcf) Thanks [@theogravity](https://github.com/theogravity)! - Add two opt-in features:

  - **Context-derived tags**: pass `contextTagKeys` to `hotshotsMixin()` to automatically promote allowlisted scalar (`string`/`number`/`boolean`) logger-context values to metric tags. The allowlist is mandatory (cardinality guard) and explicit `.withTags()` tags override derived tags on the same key.
  - **`MemoryStatsClient`**: a StatsD-compatible client that records structured `{ type, name, value, tags, sampleRate }` records instead of sending, enabling metric assertions in tests without parsing StatsD wire format.

## 4.2.1

### Patch Changes

- [#409](https://github.com/loglayer/loglayer/pull/409) [`99dd6a1`](https://github.com/loglayer/loglayer/commit/99dd6a18142c9ebcc776965ad317b46a4a66a7e4) Thanks [@theogravity](https://github.com/theogravity)! - fix: add `loglayer` as a peer dependency to all mixin packages

  All mixin packages now declare `loglayer` as a peer dependency, ensuring tsdown externalizes `loglayer` types instead of bundling them inline. This fixes type incompatibility when using mixins with consumer projects that have their own `loglayer` installation.

## 4.2.0

### Minor Changes

- [#405](https://github.com/loglayer/loglayer/pull/405) [`bdec560`](https://github.com/loglayer/loglayer/commit/bdec56055ffa2ae8b0ca7e06e5bb1332747f82cf) Thanks [@theogravity](https://github.com/theogravity)! - Bump versions for packages depending on loglayer due to minor version update in loglayer and @loglayer/shared (types changed).

## 4.1.0

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

## 4.0.0

### Major Changes

- [`fc56d4b`](https://github.com/loglayer/loglayer/commit/fc56d4b0a989d464f4e727b27ee53cfe22835ddd) Thanks [@theogravity](https://github.com/theogravity)! - Major version bump to align all packages with loglayer v9. No breaking changes in these packages; update your loglayer dependency to v9 for lazy evaluation support.

## 3.3.1

### Patch Changes

- [#318](https://github.com/loglayer/loglayer/pull/318) [`358032a`](https://github.com/loglayer/loglayer/commit/358032a222e186cb9e34580a644831e7ce584869) Thanks [@theogravity](https://github.com/theogravity)! - - Add to package.json `sideEffects: false`, which will better help with tree shaking
  - Dev dependency updates

## 3.3.0

### Minor Changes

- [#316](https://github.com/loglayer/loglayer/pull/316) [`c45b39a`](https://github.com/loglayer/loglayer/commit/c45b39ac22f8209c9674c1c3c7395a9b4b49c2c9) Thanks [@theogravity](https://github.com/theogravity)! - You now only need to do the following to register mixin types by adding the mixin package
  to your project's `tsconfig.json` includes:

  ```json
  {
    "include": ["./node_modules/@loglayer/mixin-hot-shots"]
  }
  ```

  All custom mixin types are no longer required.

## 3.3.0-alpha-0.0

### Minor Changes

- d5bb7f7: Better mixin support

## 3.2.0

### Minor Changes

- [`4bf19bb`](https://github.com/loglayer/loglayer/commit/4bf19bb52bd95737bf5bda01d538105ea12c1a31) Thanks [@theogravity](https://github.com/theogravity)! - Fix issue where passing `null` to `hotshotsMixin` did not work. A new set of no-ops were created to address this situation

## 3.1.1

### Patch Changes

- [`9955b2f`](https://github.com/loglayer/loglayer/commit/9955b2f27529197d152ca7dee0e24c158b02f241) Thanks [@theogravity](https://github.com/theogravity)! - Updated to use the named `StatsD` type import from `hot-shots` instead of the default export and removed the `StatsDClient` type alias. All type references now use `StatsD` directly from `hot-shots`, providing better type consistency and eliminating the need for type aliases.

## 3.1.0

### Minor Changes

- [#309](https://github.com/loglayer/loglayer/pull/309) [`1e1d4cf`](https://github.com/loglayer/loglayer/commit/1e1d4cfb45bd63716ce3829ee491f8b616700a0c) Thanks [@theogravity](https://github.com/theogravity)! - Added methods

## 3.0.0

### Major Changes

- [#307](https://github.com/loglayer/loglayer/pull/307) [`1bf73aa`](https://github.com/loglayer/loglayer/commit/1bf73aa6821c4d74aa6e0aa1ebe48c0191125546) Thanks [@theogravity](https://github.com/theogravity)! - Complete overhaul of the API. See the documentation on migration instructions.

## 2.0.0

### Major Changes

- [#302](https://github.com/loglayer/loglayer/pull/302) [`29afffc`](https://github.com/loglayer/loglayer/commit/29afffc4cf4b6f19c128863cbc0e2fcf061d2d3a) Thanks [@theogravity](https://github.com/theogravity)! - Update interface definitions to also work with the `ILogLayer` type.

## 1.0.4

### Patch Changes

- [`2dc8a30`](https://github.com/loglayer/loglayer/commit/2dc8a306d558707bb15df7b7f7c61c36b09a9e92) Thanks [@theogravity](https://github.com/theogravity)! - Removed the `interface ILogLayer extends LogLayer {}` from the module declaration.

## 1.0.3

### Patch Changes

- [#299](https://github.com/loglayer/loglayer/pull/299) [`230f0aa`](https://github.com/loglayer/loglayer/commit/230f0aafa49c377abb868a6bcfba9f9ab4865b4f) Thanks [@theogravity](https://github.com/theogravity)! - Add mixin support for ILogLayer

## 1.0.2

### Patch Changes

- [`2af6615`](https://github.com/loglayer/loglayer/commit/2af661515a7920474af43ee92b02dab22bf685b0) Thanks [@theogravity](https://github.com/theogravity)! - Allow for a null hot-shots client to be passed

## 1.0.1

### Patch Changes

- [`b2e42cc`](https://github.com/loglayer/loglayer/commit/b2e42ccd1a72ccbdab051ac39576f115f61192d9) Thanks [@theogravity](https://github.com/theogravity)! - Add missing exports for the module declaration types

## 1.0.0

### Major Changes

- [#288](https://github.com/loglayer/loglayer/pull/288) [`017be50`](https://github.com/loglayer/loglayer/commit/017be50980f7d78c5d370f1a7ffea1a5cbb4c97b) Thanks [@theogravity](https://github.com/theogravity)! - First version.
