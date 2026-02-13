# @loglayer/fastify

## 2.0.0

### Major Changes

- [`fc56d4b`](https://github.com/loglayer/loglayer/commit/fc56d4b0a989d464f4e727b27ee53cfe22835ddd) Thanks [@theogravity](https://github.com/theogravity)! - Major version bump to align all packages with loglayer v9. No breaking changes in these packages; update your loglayer dependency to v9 for lazy evaluation support.

## 1.0.0

### Major Changes

- [#347](https://github.com/loglayer/loglayer/pull/347) [`f6b615c`](https://github.com/loglayer/loglayer/commit/f6b615cfe80a2766a448bee03a9dfdc1b97a70db) Thanks [@theogravity](https://github.com/theogravity)! - Added new Fastify integration package. A Fastify plugin that provides request-scoped logging via `request.log` with automatic request/response logging following pino-http conventions, error handling, and request ID generation. Includes a `createLogLayerFastifyLogger` adapter for use with Fastify's `loggerInstance` option. See the [Fastify Integration documentation](/integrations/fastify) for usage examples.
