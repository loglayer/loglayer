# Google Cloud Logging Transport for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-google-cloud-logging)](https://www.npmjs.com/package/@loglayer/transport-google-cloud-logging)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Ftransport-google-cloud-logging)](https://www.npmjs.com/package/@loglayer/transport-google-cloud-logging)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

Implements the [Google Cloud Logging library](https://www.npmjs.com/package/@google-cloud/logging) for use with the [LogLayer](https://loglayer.dev) logging library.

This transport sends logs to [Google Cloud Logging](https://cloud.google.com/logging) (formerly known as Stackdriver Logging).

## Installation

```bash
npm install @loglayer/transport-google-cloud-logging @google-cloud/logging serialize-error
```

## Notes

This transport uses `log.entry(metadata, data)` as described in the library documentation.

- The `metadata` portion is the data from `withMetadata()` or `withContext()`. Custom fields not known by Google Cloud Logging will end up in the `data` portion. 
- See the `rootLevelData` option for this transport to specify default metadata.
- The `data` portion is actually the `jsonPayload` is what the transport uses for all LogLayer data.
- The message data is stored in `jsonPayload.message`

For more information, see [Structured Logging](https://cloud.google.com/logging/docs/structured-logging), specifically
[LogEntry](https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry).

## Usage

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

## Configuration Options

### `rootLevelData`

The root level metadata to include for all log entries. 
This value is merged with metadata provided using `withContext()`.

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

## Documentation

For more details, visit [https://loglayer.dev/transports/google-cloud-logging](https://loglayer.dev/transports/google-cloud-logging)
