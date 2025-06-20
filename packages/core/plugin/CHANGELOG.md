# `@loglayer/plugin` Changelog

## 2.1.1

### Patch Changes

- [#200](https://github.com/loglayer/loglayer/pull/200) [`a2f5a17`](https://github.com/loglayer/loglayer/commit/a2f5a17626279f9545c96796ca181938fe1ed905) Thanks [@theogravity](https://github.com/theogravity)! - Package dev dep updates, linting updates

- Updated dependencies [[`a2f5a17`](https://github.com/loglayer/loglayer/commit/a2f5a17626279f9545c96796ca181938fe1ed905)]:
  - @loglayer/shared@2.3.1

## 2.1.0

### Minor Changes

- [#190](https://github.com/loglayer/loglayer/pull/190) [`818bae5`](https://github.com/loglayer/loglayer/commit/818bae5efbc4212013ac41878c1e4c4f5594e19c) Thanks [@theogravity](https://github.com/theogravity)! - Update to use new `LogLevelType` instead of `LogLevel` where applicable

### Patch Changes

- Updated dependencies [[`818bae5`](https://github.com/loglayer/loglayer/commit/818bae5efbc4212013ac41878c1e4c4f5594e19c)]:
  - @loglayer/shared@2.3.0

## 2.0.4

### Patch Changes

- [#175](https://github.com/loglayer/loglayer/pull/175) [`a66ce9b`](https://github.com/loglayer/loglayer/commit/a66ce9ba4f05d912576d3754fe74c5054ae8230d) Thanks [@theogravity](https://github.com/theogravity)! - Documentation updates

- Updated dependencies [[`a66ce9b`](https://github.com/loglayer/loglayer/commit/a66ce9ba4f05d912576d3754fe74c5054ae8230d)]:
  - @loglayer/shared@2.2.1

## 2.0.3

### Patch Changes

- Updated dependencies [[`09e33ab`](https://github.com/loglayer/loglayer/commit/09e33ab216e35502ec9692a5ed44878a26573b1b)]:
  - @loglayer/shared@2.2.0

## 2.0.2

### Patch Changes

- [#160](https://github.com/loglayer/loglayer/pull/160) [`161029a`](https://github.com/loglayer/loglayer/commit/161029ae9d89b600ab19bf15cbd500f5358f2403) Thanks [@theogravity](https://github.com/theogravity)! - external dependency version updates

- Updated dependencies [[`161029a`](https://github.com/loglayer/loglayer/commit/161029ae9d89b600ab19bf15cbd500f5358f2403)]:
  - @loglayer/shared@2.1.1

## 2.0.1

### Patch Changes

- Updated dependencies [[`96a5c57`](https://github.com/loglayer/loglayer/commit/96a5c57c787b1cbd92fcc00ecc1d7468ce62fe09)]:
  - @loglayer/shared@2.1.0

## 2.0.0

### Major Changes

- [#151](https://github.com/loglayer/loglayer/pull/151) [`5f1260b`](https://github.com/loglayer/loglayer/commit/5f1260b5b4609b2a20093f934a0a5cc1fced8d26) Thanks [@theogravity](https://github.com/theogravity)! - Bump major version to reflect major version bump to v6 in main loglayer library, which implements the new Context Manager feature.

### Patch Changes

- Updated dependencies [[`5f1260b`](https://github.com/loglayer/loglayer/commit/5f1260b5b4609b2a20093f934a0a5cc1fced8d26)]:
  - @loglayer/shared@2.0.0

## 1.3.0

### Minor Changes

- [#143](https://github.com/loglayer/loglayer/pull/143) [`733ba8f`](https://github.com/loglayer/loglayer/commit/733ba8f754166839fb00e727820e2e8901ceadbb) Thanks [@theogravity](https://github.com/theogravity)! - Move the plugin types to the shared package to support the new `withFreshPlugins()` method on `ILogLayer`,
  expose plugin-only types from shared package to plugin package.

### Patch Changes

- Updated dependencies [[`733ba8f`](https://github.com/loglayer/loglayer/commit/733ba8f754166839fb00e727820e2e8901ceadbb)]:
  - @loglayer/shared@1.3.0

## 1.2.2

### Patch Changes

- Updated dependencies [[`d708ff7`](https://github.com/loglayer/loglayer/commit/d708ff76fd23a72343f2a9f8ce3c1fcc180adf74)]:
  - @loglayer/shared@1.2.1

## 1.2.1

### Patch Changes

- Updated dependencies [[`54b8223`](https://github.com/loglayer/loglayer/commit/54b822362f631891cff92d8279883eee994e66cb)]:
  - @loglayer/shared@1.2.0

## 1.2.0

### Minor Changes

- [#129](https://github.com/loglayer/loglayer/pull/129) [`d8054c8`](https://github.com/loglayer/loglayer/commit/d8054c887f371621e23a53ff2ea90d99afcc0ec3) Thanks [@theogravity](https://github.com/theogravity)! - LogLayer now passes the `loglayer` instance as the last parameter to all plugin callbacks

### Patch Changes

- Updated dependencies [[`d8054c8`](https://github.com/loglayer/loglayer/commit/d8054c887f371621e23a53ff2ea90d99afcc0ec3)]:
  - @loglayer/shared@1.1.0

## 1.1.1

### Patch Changes

- [#112](https://github.com/loglayer/loglayer/pull/112) [`561a1a6`](https://github.com/loglayer/loglayer/commit/561a1a64e0f386100bcf4a01fb6375df6e6e72d5) Thanks [@theogravity](https://github.com/theogravity)! - Update changelog doc formatting, add links to documentation site

- Updated dependencies [[`561a1a6`](https://github.com/loglayer/loglayer/commit/561a1a64e0f386100bcf4a01fb6375df6e6e72d5)]:
  - @loglayer/shared@1.0.5

## 1.1.0

### Minor Changes

- [#97](https://github.com/loglayer/loglayer/pull/97) [`c38d650`](https://github.com/loglayer/loglayer/commit/c38d65064017013aaf13aa4291eddff6936204f8) Thanks [@theogravity](https://github.com/theogravity)! - Add plugin lifecycle method `onContextCalled` to intercept `withContext` calls

## 1.0.4

### Patch Changes

- Updated dependencies [[`cef5ab1`](https://github.com/loglayer/loglayer/commit/cef5ab1d5013c0759c5d344ef7ad0084f9698b2f)]:
  - @loglayer/shared@1.0.4

## 1.0.3

### Patch Changes

- [`43ffd72`](https://github.com/loglayer/loglayer/commit/43ffd725d94e2ecdf58b4f002f06392611489582) Thanks [@theogravity](https://github.com/theogravity)! - docs: fix up documentation

- Updated dependencies [[`43ffd72`](https://github.com/loglayer/loglayer/commit/43ffd725d94e2ecdf58b4f002f06392611489582)]:
  - @loglayer/shared@1.0.3

## 1.0.2

### Patch Changes

- [`c136c0f`](https://github.com/loglayer/loglayer/commit/c136c0fbc044d80a03d1851e68e9c6a23dc8a8d8) Thanks [@theogravity](https://github.com/theogravity)! - README.md updates

- Updated dependencies [[`c136c0f`](https://github.com/loglayer/loglayer/commit/c136c0fbc044d80a03d1851e68e9c6a23dc8a8d8)]:
  - @loglayer/shared@1.0.2

## 1.0.1

### Patch Changes

- [`87394f9`](https://github.com/loglayer/loglayer/commit/87394f9480d31222460e88a9163689dbe06cda4e) Thanks [@theogravity](https://github.com/theogravity)! - Add `transportId` parameter to plugin `shouldSendToLogger` call

- [`da9bc6f`](https://github.com/loglayer/loglayer/commit/da9bc6f59385834643d677bd998213cd84046f6f) Thanks [@theogravity](https://github.com/theogravity)! - Add LICENSE file (MIT) to packages

- Updated dependencies [[`da9bc6f`](https://github.com/loglayer/loglayer/commit/da9bc6f59385834643d677bd998213cd84046f6f)]:
  - @loglayer/shared@1.0.1

## 1.0.0

### Major Changes

- [`44b9b77`](https://github.com/loglayer/loglayer/commit/44b9b77fe3366648852d947a7b83b884bada5bba) Thanks [@theogravity](https://github.com/theogravity)! - chore: release 5.x version of loglayer

### Patch Changes

- Updated dependencies [[`0fc607b`](https://github.com/loglayer/loglayer/commit/0fc607b2bcacaa1204905b5b54418933b7d5f680)]:
  - @loglayer/shared@1.0.0
