# `@loglayer/transport` Changelog

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

## 1.2.5

### Patch Changes

- Updated dependencies [[`733ba8f`](https://github.com/loglayer/loglayer/commit/733ba8f754166839fb00e727820e2e8901ceadbb)]:
  - @loglayer/shared@1.3.0

## 1.2.4

### Patch Changes

- Updated dependencies [[`d708ff7`](https://github.com/loglayer/loglayer/commit/d708ff76fd23a72343f2a9f8ce3c1fcc180adf74)]:
  - @loglayer/shared@1.2.1

## 1.2.3

### Patch Changes

- [#138](https://github.com/loglayer/loglayer/pull/138) [`54b8223`](https://github.com/loglayer/loglayer/commit/54b822362f631891cff92d8279883eee994e66cb) Thanks [@theogravity](https://github.com/theogravity)! - Add withFreshTransports method to `loglayer`

- Updated dependencies [[`54b8223`](https://github.com/loglayer/loglayer/commit/54b822362f631891cff92d8279883eee994e66cb)]:
  - @loglayer/shared@1.2.0

## 1.2.2

### Patch Changes

- Updated dependencies [[`d8054c8`](https://github.com/loglayer/loglayer/commit/d8054c887f371621e23a53ff2ea90d99afcc0ec3)]:
  - @loglayer/shared@1.1.0

## 1.2.1

### Patch Changes

- [#112](https://github.com/loglayer/loglayer/pull/112) [`561a1a6`](https://github.com/loglayer/loglayer/commit/561a1a64e0f386100bcf4a01fb6375df6e6e72d5) Thanks [@theogravity](https://github.com/theogravity)! - Update changelog doc formatting, add links to documentation site

- Updated dependencies [[`561a1a6`](https://github.com/loglayer/loglayer/commit/561a1a64e0f386100bcf4a01fb6375df6e6e72d5)]:
  - @loglayer/shared@1.0.5

## 1.2.0

### Minor Changes

- [#108](https://github.com/loglayer/loglayer/pull/108) [`f3b89d3`](https://github.com/loglayer/loglayer/commit/f3b89d3c77da9fe4a4f981aca334145b735d9466) Thanks [@theogravity](https://github.com/theogravity)! - Add `level` field for cloud provider transports to filter out logs

## 1.1.5

### Patch Changes

- [#99](https://github.com/loglayer/loglayer/pull/99) [`06c8c20`](https://github.com/loglayer/loglayer/commit/06c8c207a569d6e7e6b66cc96abed8a7365bcfac) Thanks [@theogravity](https://github.com/theogravity)! - Adds support for Dynatrace

## 1.1.4

### Patch Changes

- [`d01dcb9`](https://github.com/loglayer/loglayer/commit/d01dcb91517ed1cb2b425799ab3432d36721bf46) Thanks [@theogravity](https://github.com/theogravity)! - Adds the enabled? flag to the LogLayerTransport interface in @loglayer/transport

## 1.1.3

### Patch Changes

- Updated dependencies [[`cef5ab1`](https://github.com/loglayer/loglayer/commit/cef5ab1d5013c0759c5d344ef7ad0084f9698b2f)]:
  - @loglayer/shared@1.0.4

## 1.1.2

### Patch Changes

- [#63](https://github.com/loglayer/loglayer/pull/63) [`4a25d33`](https://github.com/loglayer/loglayer/commit/4a25d33ced2b5b1596a05b24adfcce26ab991a1f) Thanks [@theogravity](https://github.com/theogravity)! - Add the `LoggerlessTransport` class for implementing libraries that aren't logging-based

## 1.1.1

### Patch Changes

- [#59](https://github.com/loglayer/loglayer/pull/59) [`372a062`](https://github.com/loglayer/loglayer/commit/372a062138ffd4768a798180f02f3e9705842f0a) Thanks [@theogravity](https://github.com/theogravity)! - Add the `testTransportOutput` testing utility to the `@loglayer/transport` package

## 1.1.0

### Minor Changes

- [#55](https://github.com/loglayer/loglayer/pull/55) [`8aeeeb4`](https://github.com/loglayer/loglayer/commit/8aeeeb46a754a53235ed26a9cea9186a5477fce2) Thanks [@theogravity](https://github.com/theogravity)! - \* Add @loglayer/transport-datadog package for server-side DataDog support.
  - In `@loglayer/transport`, the `LogLayerTransport` interface generic is now defaulted to `any`.

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

- [`da9bc6f`](https://github.com/loglayer/loglayer/commit/da9bc6f59385834643d677bd998213cd84046f6f) Thanks [@theogravity](https://github.com/theogravity)! - Add LICENSE file (MIT) to packages

- Updated dependencies [[`da9bc6f`](https://github.com/loglayer/loglayer/commit/da9bc6f59385834643d677bd998213cd84046f6f)]:
  - @loglayer/shared@1.0.1

## 1.0.0

### Major Changes

- [`44b9b77`](https://github.com/loglayer/loglayer/commit/44b9b77fe3366648852d947a7b83b884bada5bba) Thanks [@theogravity](https://github.com/theogravity)! - chore: release 5.x version of loglayer

### Patch Changes

- Updated dependencies [[`0fc607b`](https://github.com/loglayer/loglayer/commit/0fc607b2bcacaa1204905b5b54418933b7d5f680)]:
  - @loglayer/shared@1.0.0
