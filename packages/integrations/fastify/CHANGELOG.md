# @loglayer/fastify

## 2.3.0

### Minor Changes

- [#405](https://github.com/loglayer/loglayer/pull/405) [`bdec560`](https://github.com/loglayer/loglayer/commit/bdec56055ffa2ae8b0ca7e06e5bb1332747f82cf) Thanks [@theogravity](https://github.com/theogravity)! - Bump versions for packages depending on loglayer due to minor version update in loglayer and @loglayer/shared (types changed).

## 2.2.0

### Minor Changes

- [#387](https://github.com/loglayer/loglayer/pull/387) [`677043e`](https://github.com/loglayer/loglayer/commit/677043ee2830f9d0e43b0a5276a3e5866342315d) Thanks [@theogravity](https://github.com/theogravity)! - Add missing parameters to plugin hooks and transports for feature parity with loglayer-go

  Added to all plugin params (`PluginBeforeDataOutParams`, `PluginBeforeMessageOutParams`, `PluginShouldSendToLoggerParams`, `PluginTransformLogLevelParams`) and `LogLayerTransportParams`:

  - `groups?: string[]` - The group names this log entry belongs to
  - `schema?: LogLayerPluginSchema` - Schema information for navigating the assembled data (contextFieldName, metadataFieldName, errorFieldName)
  - `prefix?: string` - The prefix attached via withPrefix()

  New `LogLayerPluginSchema` interface provides:

  - `contextFieldName?: string` - Key under which persistent context data is nested
  - `metadataFieldName?: string` - Key under which per-call metadata is nested
  - `errorFieldName: string` - Key under which serialized error is stored

## 2.1.0

### Minor Changes

- [#357](https://github.com/loglayer/loglayer/pull/357) [`90d879e`](https://github.com/loglayer/loglayer/commit/90d879e449229ef92eb6c928f3051a433fa9d71d) Thanks [@theogravity](https://github.com/theogravity)! - feat: add group config for tagging auto-logged messages (request, response, errors) with groups for transport routing/filtering

## 2.0.0

### Major Changes

- [`fc56d4b`](https://github.com/loglayer/loglayer/commit/fc56d4b0a989d464f4e727b27ee53cfe22835ddd) Thanks [@theogravity](https://github.com/theogravity)! - Major version bump to align all packages with loglayer v9. No breaking changes in these packages; update your loglayer dependency to v9 for lazy evaluation support.

## 1.0.0

### Major Changes

- [#347](https://github.com/loglayer/loglayer/pull/347) [`f6b615c`](https://github.com/loglayer/loglayer/commit/f6b615cfe80a2766a448bee03a9dfdc1b97a70db) Thanks [@theogravity](https://github.com/theogravity)! - Added new Fastify integration package. A Fastify plugin that provides request-scoped logging via `request.log` with automatic request/response logging following pino-http conventions, error handling, and request ID generation. Includes a `createLogLayerFastifyLogger` adapter for use with Fastify's `loggerInstance` option. See the [Fastify Integration documentation](/integrations/fastify) for usage examples.
