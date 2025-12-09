# `@loglayer/mixin-hot-shots` Changelog

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
