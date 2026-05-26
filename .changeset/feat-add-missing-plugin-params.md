---
"@loglayer/shared": minor
"@loglayer/plugin": minor
loglayer: minor
"@loglayer/transport": minor
"@loglayer/context-manager": minor
"@loglayer/context-manager-isolated": minor
"@loglayer/context-manager-linked": minor
"@loglayer/log-level-manager": minor
"@loglayer/log-level-manager-global": minor
"@loglayer/log-level-manager-linked": minor
"@loglayer/log-level-manager-one-way": minor
"@loglayer/elysia": minor
"@loglayer/express": minor
"@loglayer/fastify": minor
"@loglayer/hono": minor
"@loglayer/koa": minor
"@loglayer/mixin-datadog-http-metrics": minor
"@loglayer/mixin-hot-shots": minor
"@loglayer/plugin-datadog-apm-trace-injector": minor
"@loglayer/plugin-filter": minor
"@loglayer/plugin-opentelemetry": minor
"@loglayer/plugin-redaction": minor
"@loglayer/plugin-sprintf": minor
"@loglayer/transport-aws-cloudwatch-logs": minor
"@loglayer/transport-aws-lambda-powertools": minor
"@loglayer/transport-axiom": minor
"@loglayer/transport-betterstack": minor
"@loglayer/transport-bunyan": minor
"@loglayer/transport-central": minor
"@loglayer/transport-consola": minor
"@loglayer/transport-cribl-http": minor
"@loglayer/transport-datadog": minor
"@loglayer/transport-datadog-browser-logs": minor
"@loglayer/transport-dynatrace": minor
"@loglayer/transport-electron-log": minor
"@loglayer/transport-google-cloud-logging": minor
"@loglayer/transport-http": minor
"@loglayer/transport-log4js": minor
"@loglayer/transport-log-file-rotation": minor
"@loglayer/transport-logflare": minor
"@loglayer/transport-loglevel": minor
"@loglayer/transport-logtape": minor
"@loglayer/transport-new-relic": minor
"@loglayer/transport-opentelemetry": minor
"@loglayer/transport-pino": minor
"@loglayer/transport-pretty-terminal": minor
"@loglayer/transport-roarr": minor
"@loglayer/transport-sentry": minor
"@loglayer/transport-signale": minor
"@loglayer/transport-simple-pretty-terminal": minor
"@loglayer/transport-sumo-logic": minor
"@loglayer/transport-tracer": minor
"@loglayer/transport-tslog": minor
"@loglayer/transport-victoria-logs": minor
"@loglayer/transport-winston": minor
---

Add missing parameters to plugin hooks and transports for feature parity with loglayer-go

Added to all plugin params (`PluginBeforeDataOutParams`, `PluginBeforeMessageOutParams`, `PluginShouldSendToLoggerParams`, `PluginTransformLogLevelParams`) and `LogLayerTransportParams`:

- `groups?: string[]` - The group names this log entry belongs to
- `schema?: LogLayerPluginSchema` - Schema information for navigating the assembled data (contextFieldName, metadataFieldName, errorFieldName)
- `prefix?: string` - The prefix attached via withPrefix()

New `LogLayerPluginSchema` interface provides:
- `contextFieldName?: string` - Key under which persistent context data is nested
- `metadataFieldName?: string` - Key under which per-call metadata is nested
- `errorFieldName: string` - Key under which serialized error is stored