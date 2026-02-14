# @loglayer/hono

## 2.1.0

### Minor Changes

- [#357](https://github.com/loglayer/loglayer/pull/357) [`90d879e`](https://github.com/loglayer/loglayer/commit/90d879e449229ef92eb6c928f3051a433fa9d71d) Thanks [@theogravity](https://github.com/theogravity)! - feat: add group config for tagging auto-logged messages (request, response, errors) with groups for transport routing/filtering

## 2.0.0

### Major Changes

- [`fc56d4b`](https://github.com/loglayer/loglayer/commit/fc56d4b0a989d464f4e727b27ee53cfe22835ddd) Thanks [@theogravity](https://github.com/theogravity)! - Major version bump to align all packages with loglayer v9. No breaking changes in these packages; update your loglayer dependency to v9 for lazy evaluation support.

## 1.0.0

### Major Changes

- [`81858fc`](https://github.com/loglayer/loglayer/commit/81858fc8d4f2b1b7c920fc4ff11b60c08cc612b1) Thanks [@theogravity](https://github.com/theogravity)! - Added new Hono integration package. Hono middleware that provides request-scoped logging with automatic request/response logging, error handling, and request ID generation. See the [Hono Integration documentation](/integrations/hono) for usage examples.
