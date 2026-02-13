# @loglayer/fastify

## 1.0.0

### Major Changes

- [#347](https://github.com/loglayer/loglayer/pull/347) [`f6b615c`](https://github.com/loglayer/loglayer/commit/f6b615cfe80a2766a448bee03a9dfdc1b97a70db) Thanks [@theogravity](https://github.com/theogravity)! - Added new Fastify integration package. A Fastify plugin that provides request-scoped logging via `request.log` with automatic request/response logging following pino-http conventions, error handling, and request ID generation. Includes a `createLogLayerFastifyLogger` adapter for use with Fastify's `loggerInstance` option. See the [Fastify Integration documentation](/integrations/fastify) for usage examples.
