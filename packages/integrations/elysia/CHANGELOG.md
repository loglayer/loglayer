# @loglayer/elysia

## 2.0.0

### Major Changes

- [`fc56d4b`](https://github.com/loglayer/loglayer/commit/fc56d4b0a989d464f4e727b27ee53cfe22835ddd) Thanks [@theogravity](https://github.com/theogravity)! - Major version bump to align all packages with loglayer v9. No breaking changes in these packages; update your loglayer dependency to v9 for lazy evaluation support.

## 1.0.2

### Patch Changes

- [#347](https://github.com/loglayer/loglayer/pull/347) [`f6b615c`](https://github.com/loglayer/loglayer/commit/f6b615cfe80a2766a448bee03a9dfdc1b97a70db) Thanks [@theogravity](https://github.com/theogravity)! - Updated README example to use correct `StructuredTransport` import from `loglayer`.

## 1.0.1

### Patch Changes

- [`2bd0b25`](https://github.com/loglayer/loglayer/commit/2bd0b25a6c043f35217480502738b478aab62dc6) Thanks [@theogravity](https://github.com/theogravity)! - Replaced `@loglayer/shared` dependency with `loglayer` peer dependency to allow users to use any version of loglayer.

## 1.0.0

### Major Changes

- [#341](https://github.com/loglayer/loglayer/pull/341) [`6f73f55`](https://github.com/loglayer/loglayer/commit/6f73f55cf34f9ae1bec8567751cd891be4ecf7f0) Thanks [@theogravity](https://github.com/theogravity)! - Initial release of @loglayer/elysia - ElysiaJS integration for LogLayer with request-scoped logging, automatic request/response logging following pino-http conventions, and error handling. Supports both Bun and Node.js via @elysiajs/node adapter.
