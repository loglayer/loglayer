# @loglayer/log-level-manager-linked

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
