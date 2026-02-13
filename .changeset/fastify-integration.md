---
"@loglayer/fastify": major
---

Added new Fastify integration package. A Fastify plugin that provides request-scoped logging via `request.log` with automatic request/response logging following pino-http conventions, error handling, and request ID generation. Includes a `createLogLayerFastifyLogger` adapter for use with Fastify's `loggerInstance` option. See the [Fastify Integration documentation](/integrations/fastify) for usage examples.
