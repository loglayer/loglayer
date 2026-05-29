# Changelog

## 1.0.0

### Major Changes

- [#400](https://github.com/loglayer/loglayer/pull/400) [`f0dfe7d`](https://github.com/loglayer/loglayer/commit/f0dfe7df54ab6013d76b49c8ea43893213c9ec39) Thanks [@theogravity](https://github.com/theogravity)! - Add the Sampling plugin (`@loglayer/plugin-sampling`) for randomly dropping log entries to control volume. Supports `rate`-based, `per_level` (unmapped → fallback to `rate`), and callback strategies. `error`/`fatal` default to 100% (can be overridden via `perLevel` or callback). Includes docs, 19 tests, and plugin-list sidebar.
