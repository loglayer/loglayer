# `@loglayer/transport-http` Changelog

## 1.1.8-alpha-0.0

### Patch Changes

- @loglayer/transport@2.3.10-alpha-0.0

## 1.1.7

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@2.3.9

## 1.1.6

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@2.3.8

## 1.1.5

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@2.3.7

## 1.1.4

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@2.3.6

## 1.1.3

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@2.3.5

## 1.1.2

### Patch Changes

- [#277](https://github.com/loglayer/loglayer/pull/277) [`1e01627`](https://github.com/loglayer/loglayer/commit/1e01627eeafb5e094da958532ad385cc59d70857) Thanks [@Eptagone](https://github.com/Eptagone)! - Migration from tsup to tsdown and small dependency updates.

- Updated dependencies [[`1e01627`](https://github.com/loglayer/loglayer/commit/1e01627eeafb5e094da958532ad385cc59d70857)]:
  - @loglayer/transport@2.3.4

## 1.1.1

### Patch Changes

- [#272](https://github.com/loglayer/loglayer/pull/272) [`2a24d9a`](https://github.com/loglayer/loglayer/commit/2a24d9abf07087c7121d4eedd98d03cf8c0fbc6c) Thanks [@theogravity](https://github.com/theogravity)! - Fix issue where `onError()` gets called for 2xx messages outside of 200

## 1.1.0

### Minor Changes

- [#270](https://github.com/loglayer/loglayer/pull/270) [`e1cf20a`](https://github.com/loglayer/loglayer/commit/e1cf20a1bb2535127d1f05d14c337f060c8b399b) Thanks [@theogravity](https://github.com/theogravity)! - Batching and debugging enhancements:

  - New `onDebugReqRes` callback: Debug HTTP requests and responses with complete request/response details including headers and body content
  - Improved batch handling with new `batchMode` option supporting three modes:
    - `"delimiter"` (default) - Join entries with a delimiter
    - `"field"` - Wrap entries in an object with a field name (e.g., `{"batch": [...]}`)
    - `"array"` - Send entries as a plain JSON array

## 1.0.7

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@2.3.3

## 1.0.6

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@2.3.2

## 1.0.5

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@2.3.1

## 1.0.4

### Patch Changes

- Updated dependencies [[`94d0230`](https://github.com/loglayer/loglayer/commit/94d0230a9f18f988257b72b9220432fd8101fa60)]:
  - @loglayer/transport@2.3.0

## 1.0.3

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@2.2.2

## 1.0.2

### Patch Changes

- [`3d429fe`](https://github.com/loglayer/loglayer/commit/3d429fe09817c6c170bf42ac79d3b2d0743277c0) Thanks [@theogravity](https://github.com/theogravity)! - Documentation and build fixes

## 1.0.1

### Patch Changes

- [#197](https://github.com/loglayer/loglayer/pull/197) [`358b13c`](https://github.com/loglayer/loglayer/commit/358b13c027eda2308ab6e6b269706552606a05bf) Thanks [@theogravity](https://github.com/theogravity)! - First version of the http transport

- [#200](https://github.com/loglayer/loglayer/pull/200) [`a2f5a17`](https://github.com/loglayer/loglayer/commit/a2f5a17626279f9545c96796ca181938fe1ed905) Thanks [@theogravity](https://github.com/theogravity)! - Package dev dep updates, linting updates

- Updated dependencies [[`a2f5a17`](https://github.com/loglayer/loglayer/commit/a2f5a17626279f9545c96796ca181938fe1ed905)]:
  - @loglayer/transport@2.2.1
