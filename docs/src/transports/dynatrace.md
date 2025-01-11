---
title: Dynatrace Transport for LogLayer
description: Send logs to Dynatrace using their Log Monitoring API v2
---

# Dynatrace Transport

The Dynatrace transport sends logs to Dynatrace using their [Log Monitoring API v2](https://docs.dynatrace.com/docs/discover-dynatrace/references/dynatrace-api/environment-api/log-monitoring-v2/post-ingest-logs).

::: warning
See the "Limitations" section of the documentation for limits.
This transport does not do any checks on limitations, so it's up to you to ensure you're not exceeding them.
Although the limitations are pretty generous, it is advised to define the `onError` callback to handle any errors that may occur.
:::

## Installation

```bash
npm install loglayer @loglayer/transport-dynatrace serialize-error
```

## Usage

You will need an access token with the `logs.ingest` scope. See [access token documentation](https://docs.dynatrace.com/docs/discover-dynatrace/references/dynatrace-api/basics/dynatrace-api-authentication) for more details.

```typescript
import { LogLayer } from 'loglayer'
import { DynatraceTransport } from "@loglayer/transport-dynatrace"

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: new DynatraceTransport({
    url: "https://your-environment-id.live.dynatrace.com/api/v2/logs/ingest",
    ingestToken: "your-api-token",
    onError: (error) => {
      console.error('Failed to send log to Dynatrace:', error)
    }
  })
})

log.info('Hello world')
```

## Configuration

The transport accepts the following configuration options:

### Required Options

- `url`: The URL to post logs to. Should be in one of these formats:
  - `https://<env-id>.live.dynatrace.com/api/v2/logs/ingest`
  - `https://{your-activegate-domain}:9999/e/{your-environment-id}/api/v2/logs/ingest`
- `ingestToken`: An API token with the `logs.ingest` scope

### Optional Options

- `onError`: A callback function that will be called when there's an error sending logs to Dynatrace
- `enabled`: If set to `false`, the transport will not send any logs (defaults to `true`)
- `consoleDebug`: If set to `true`, logs will also be output to the console (defaults to `false`)

## Log Format

The transport sends logs to Dynatrace in the following format:

```json
{
  "content": "Your log message",
  "severity": "info|warn|error|debug",
  "timestamp": "2024-01-01T00:00:00.000Z",
  // Any additional metadata fields
}
```
