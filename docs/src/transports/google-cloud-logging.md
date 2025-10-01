---
title: Google Cloud Logging Transport for LogLayer
description: Send logs to Google Cloud Logging with the LogLayer logging library
---

# Google Cloud Logging Transport <Badge type="tip" text="Server" />

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-google-cloud-logging)](https://www.npmjs.com/package/@loglayer/transport-google-cloud-logging)

[Transport Source](https://github.com/loglayer/loglayer/tree/master/packages/transports/google-cloud-logging)

Implements the [Google Cloud Logging library](https://www.npmjs.com/package/@google-cloud/logging).

This transport sends logs to [Google Cloud Logging](https://cloud.google.com/logging) (formerly known as Stackdriver Logging).

## Configuration Options

### Required Parameters

| Name | Type | Description |
|------|------|-------------|
| `logger` | `Log` | The Google Cloud Logging instance |

### Optional Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `level` | `"trace" \| "debug" \| "info" \| "warn" \| "error" \| "fatal"` | `"trace"` | The minimum log level to process. Logs below this level will be filtered out |
| `rootLevelData` | `Record<string, any>` | - | Data to be included in the metadata portion of the log entry |
| `rootLevelMetadataFields` | `Array<string>` | `[]` | List of LogLayer metadata fields to merge into `rootLevelData` |
| `onError` | `(error: Error) => void` | - | Error handling callback |
| `enabled` | `boolean` | `true` | If false, the transport will not send logs to the logger |
| `consoleDebug` | `boolean` | `false` | If true, the transport will log to the console for debugging purposes |
| `id` | `string` | - | A user-defined identifier for the transport |

## Installation

::: code-group

```bash [npm]
npm install @loglayer/transport-google-cloud-logging @google-cloud/logging serialize-error
```

```bash [yarn]
yarn add @loglayer/transport-google-cloud-logging @google-cloud/logging serialize-error
```

```bash [pnpm]
pnpm add @loglayer/transport-google-cloud-logging @google-cloud/logging serialize-error
```

:::

## Usage

::: info
This transport uses `log.entry(metadata, data)` as described in the library documentation.

- The `metadata` portion is not the data from `withMetadata()` or `withContext()`. See the `rootLevelData` and `rootLevelMetadataFields` options
  for this transport on how to modify this value.
- The `data` portion is actually the `jsonPayload` is what the transport uses for all LogLayer data.
- The message data is stored in `jsonPayload.message`

For more information, see [Structured Logging](https://cloud.google.com/logging/docs/structured-logging), specifically
[LogEntry](https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry).
:::

```typescript
import { LogLayer } from "loglayer";
import { GoogleCloudLoggingTransport } from "@loglayer/transport-google-cloud-logging";
import { Logging } from '@google-cloud/logging';
import { serializeError } from "serialize-error";

// Create the logging client
const logging = new Logging({ projectId: "GOOGLE_CLOUD_PLATFORM_PROJECT_ID" });
const log = logging.log('my-log');

// Create LogLayer instance with the transport
const logger = new LogLayer({
  errorSerializer: serializeError,
  transport: new GoogleCloudLoggingTransport({
    logger: log,
  })
});

// The logs will include the default metadata
logger.info("Hello from Cloud Run!");
```

## Configuration

### `rootLevelData`

The root level data to include for all log entries.
This is not the same as using `withContext()`, which would be included as part of the `jsonPayload`.

The `rootLevelData` option accepts any valid [Google Cloud LogEntry](https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry)
fields except for `severity`, `timestamp`, and `jsonPayload` which are managed by the transport.

```typescript
const logger = new LogLayer({
  transport: new GoogleCloudLoggingTransport({
    logger: log,
    rootLevelData: {
      resource: {
        type: "cloud_run_revision",
        labels: {
          project_id: "my-project",
          service_name: "my-service",
          revision_name: "my-revision",
        },
      },
      labels: {
        environment: "production",
        version: "1.0.0",
      },
    },
  }),
});
```

### `rootLevelMetadataFields`

By default, `withMetadata()` fields are forwarded as part of `jsonPayload` of the [LogEntry](https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry).

The `rootLevelMetadataFields` option accepts an array of field names to pluck from metadata and shallow merge with `rootLevelData`. This allows you to dynamically specify the metadata portion of a log entry.

```typescript
const logger = new LogLayer({
  transport: new GoogleCloudLoggingTransport({
    logger: log,
    rootLevelMetadataFields: ["labels"],
    rootLevelData: {
      labels: {
        environment: "production",
        location: "west",
      },
    },
  }),
});

// This will overwrite `labels` in root level data.
// `customField` is still sent as part of `jsonPayload`.
logger
  .withMetadata({ labels: { location: "east" }, customField: "example" })
  .info("example")
```

To allow mapping to every supported `LogEntry` metadata field, the following list is recommended:

```typescript
const logger = new LogLayer({
  transport: new GoogleCloudLoggingTransport({
    logger: log,
    rootLevelMetadataFields: [
      "logName",
      "resource",
      "insertId",
      "httpRequest",
      "labels",
      "operation",
      "trace",
      "spanId",
      "traceSampled",
      "sourceLocation",
      "split",
    ],
  }),
});
```

## Log Level Mapping

LogLayer log levels are mapped to Google Cloud Logging severity levels as follows:

| LogLayer Level | Google Cloud Logging Severity |
|---------------|------------------------------|
| `fatal` | `CRITICAL` |
| `error` | `ERROR` |
| `warn` | `WARNING` |
| `info` | `INFO` |
| `debug` | `DEBUG` |
| `trace` | `DEBUG` |

## Changelog

View the changelog [here](./changelogs/google-cloud-logging-changelog.md).
