---
"@loglayer/plugin-opentelemetry": patch
"@loglayer/transport-opentelemetry": patch
"@loglayer/transport-datadog": patch
"@loglayer/transport-sentry": patch
---

Update runtime dependencies: `@opentelemetry/api` to 1.10.0, `@opentelemetry/api-logs` to 0.223.0 and `@datadog/datadog-api-client` to 1.64.0. Remove the removed-in-v11 `enableLogs` init option from Sentry setup examples.
