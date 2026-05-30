# Changelog

## 1.1.0

### Minor Changes

- [#405](https://github.com/loglayer/loglayer/pull/405) [`bdec560`](https://github.com/loglayer/loglayer/commit/bdec56055ffa2ae8b0ca7e06e5bb1332747f82cf) Thanks [@theogravity](https://github.com/theogravity)! - Bump versions for packages depending on loglayer due to minor version update in loglayer and @loglayer/shared (types changed).

### Patch Changes

- Updated dependencies [[`bdec560`](https://github.com/loglayer/loglayer/commit/bdec56055ffa2ae8b0ca7e06e5bb1332747f82cf), [`9cf3b79`](https://github.com/loglayer/loglayer/commit/9cf3b795a73fbf932068f2722fefdf0e874a90fc)]:
  - @loglayer/plugin@3.2.0
  - @loglayer/shared@4.3.0

## 1.0.1

### Patch Changes

- [#401](https://github.com/loglayer/loglayer/pull/401) [`c72f5b4`](https://github.com/loglayer/loglayer/commit/c72f5b429277aaafc0632198d419d715f94c6b35) Thanks [@theogravity](https://github.com/theogravity)! - Update documentation

## 1.0.0

### Major Changes

- [#400](https://github.com/loglayer/loglayer/pull/400) [`f0dfe7d`](https://github.com/loglayer/loglayer/commit/f0dfe7df54ab6013d76b49c8ea43893213c9ec39) Thanks [@theogravity](https://github.com/theogravity)! - Add the Sampling plugin (`@loglayer/plugin-sampling`) for randomly dropping log entries to control volume. Supports `rate`-based, `per_level` (unmapped → fallback to `rate`), and callback strategies. `error`/`fatal` default to 100% (can be overridden via `perLevel` or callback). Includes docs, 19 tests, and plugin-list sidebar.
