---
"@loglayer/plugin-datadog-apm-trace-injector": patch
"@loglayer/transport-simple-pretty-terminal": patch
"@loglayer/transport-aws-lambda-powertools": patch
"@loglayer/transport-datadog-browser-logs": patch
"@loglayer/transport-google-cloud-logging": patch
"@loglayer/transport-aws-cloudwatch-logs": patch
"@loglayer/transport-log-file-rotation": patch
"@loglayer/log-level-manager-one-way": patch
"@loglayer/transport-pretty-terminal": patch
"@loglayer/context-manager-isolated": patch
"@loglayer/log-level-manager-global": patch
"@loglayer/log-level-manager-linked": patch
"@loglayer/transport-opentelemetry": patch
"@loglayer/transport-victoria-logs": patch
"@loglayer/context-manager-linked": patch
"@loglayer/transport-electron-log": patch
"@loglayer/log-level-manager": patch
"@loglayer/transport-betterstack": patch
"@loglayer/transport-log4js": patch
"@loglayer/plugin-opentelemetry": patch
"@loglayer/transport-sumo-logic": patch
"@loglayer/context-manager": patch
"@loglayer/transport-dynatrace": patch
"@loglayer/transport-new-relic": patch
"@loglayer/transport-logflare": patch
"@loglayer/transport-loglevel": patch
"@loglayer/transport-consola": patch
"@loglayer/transport-datadog": patch
"@loglayer/transport-logtape": patch
"@loglayer/transport-signale": patch
"@loglayer/transport-winston": patch
"@loglayer/plugin-redaction": patch
"@loglayer/transport-bunyan": patch
"@loglayer/transport-sentry": patch
"@loglayer/transport-tracer": patch
"@loglayer/mixin-hot-shots": patch
"@loglayer/transport-axiom": patch
"@loglayer/transport-roarr": patch
"@loglayer/transport-tslog": patch
"@loglayer/plugin-sprintf": patch
"@loglayer/transport-http": patch
"@loglayer/transport-pino": patch
"@loglayer/transport": patch
"@loglayer/plugin-filter": patch
"loglayer": patch
"@loglayer/plugin": patch
"@loglayer/shared": patch
---

- Add to package.json `sideEffects: false`, which will better help with tree shaking
- Dev dependency updates
