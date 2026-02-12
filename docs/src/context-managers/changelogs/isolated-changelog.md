# @loglayer/context-manager-isolated

## 2.1.0

### Minor Changes

- [#333](https://github.com/loglayer/loglayer/pull/333) [`4916581`](https://github.com/loglayer/loglayer/commit/491658199b210c293e195e708fdbed2be14d5880) Thanks [@theogravity](https://github.com/theogravity)! - `clearContext()` now accepts an optional parameter to clear specific context keys instead of all context data.

### Patch Changes

- Updated dependencies [[`4916581`](https://github.com/loglayer/loglayer/commit/491658199b210c293e195e708fdbed2be14d5880)]:
  - @loglayer/context-manager@1.2.0

## 2.0.14

### Patch Changes

- Updated dependencies []:
  - @loglayer/context-manager@1.1.14

## 2.0.13

### Patch Changes

- [#318](https://github.com/loglayer/loglayer/pull/318) [`358032a`](https://github.com/loglayer/loglayer/commit/358032a222e186cb9e34580a644831e7ce584869) Thanks [@theogravity](https://github.com/theogravity)! - - Add to package.json `sideEffects: false`, which will better help with tree shaking
  - Dev dependency updates
- Updated dependencies [[`358032a`](https://github.com/loglayer/loglayer/commit/358032a222e186cb9e34580a644831e7ce584869)]:
  - @loglayer/context-manager@1.1.13

## 2.0.12

### Patch Changes

- Updated dependencies []:
  - @loglayer/context-manager@1.1.12

## 2.0.12-alpha-0.0

### Patch Changes

- @loglayer/context-manager@1.1.12-alpha-0.0

## 2.0.11

### Patch Changes

- Updated dependencies []:
  - @loglayer/context-manager@1.1.11

## 2.0.10

### Patch Changes

- Updated dependencies []:
  - @loglayer/context-manager@1.1.10

## 2.0.9

### Patch Changes

- Updated dependencies []:
  - @loglayer/context-manager@1.1.9

## 2.0.8

### Patch Changes

- Updated dependencies []:
  - @loglayer/context-manager@1.1.8

## 2.0.7

### Patch Changes

- Updated dependencies []:
  - @loglayer/context-manager@1.1.7

## 2.0.6

### Patch Changes

- [#277](https://github.com/loglayer/loglayer/pull/277) [`1e01627`](https://github.com/loglayer/loglayer/commit/1e01627eeafb5e094da958532ad385cc59d70857) Thanks [@Eptagone](https://github.com/Eptagone)! - Migration from tsup to tsdown and small dependency updates.

- Updated dependencies [[`1e01627`](https://github.com/loglayer/loglayer/commit/1e01627eeafb5e094da958532ad385cc59d70857)]:
  - @loglayer/context-manager@1.1.6

## 2.0.5

### Patch Changes

- Updated dependencies []:
  - @loglayer/context-manager@1.1.5

## 2.0.4

### Patch Changes

- Updated dependencies []:
  - @loglayer/context-manager@1.1.4

## 2.0.3

### Patch Changes

- Updated dependencies []:
  - @loglayer/context-manager@1.1.3

## 2.0.2

### Patch Changes

- Updated dependencies []:
  - @loglayer/context-manager@1.1.2

## 2.0.1

### Patch Changes

- [`ee1ed3b`](https://github.com/loglayer/loglayer/commit/ee1ed3bb3379414f94d94faf4260f8f8d34633a3) Thanks [@theogravity](https://github.com/theogravity)! - Fix broken example in readme.

## 2.0.0

### Major Changes

- [#225](https://github.com/loglayer/loglayer/pull/225) [`eae6213`](https://github.com/loglayer/loglayer/commit/eae621303c3bc7004224d1593effb8bec5a3d1cd) Thanks [@theogravity](https://github.com/theogravity)! - Initial release of IsolatedContextManager that maintains isolated context for each logger instance without copying context to child loggers
