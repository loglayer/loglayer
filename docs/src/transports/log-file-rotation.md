# Log File Rotation Transport

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-log-file-rotation)](https://www.npmjs.com/package/@loglayer/transport-log-file-rotation)

[Transport Source](https://github.com/loglayer/loglayer/blob/master/packages/transports/log-file-rotation)

The Log File Rotation transport writes logs to files with automatic rotation based on size or time. This transport is built on top of [`file-stream-rotator`](https://github.com/rogerc/file-stream-rotator/), a library for handling log file rotation in Node.js applications.

## Features

- Automatic log file rotation based on time (hourly, daily)
- Support for date patterns in filenames using numerical values
- Size-based rotation with support for KB, MB, and GB units
- Compression of rotated log files
- Maximum file count or age-based retention
- Automatic cleanup of old log files
- Batch processing of logs for improved performance (must be enabled)

## Installation

::: code-group

```sh [npm]
npm i loglayer @loglayer/transport-log-file-rotation serialize-error
```

```sh [pnpm]
pnpm add loglayer @loglayer/transport-log-file-rotation serialize-error
```

```sh [yarn]
yarn add loglayer @loglayer/transport-log-file-rotation serialize-error
```

:::

## Usage

```typescript
import { LogLayer } from "loglayer";
import { LogFileRotationTransport } from "@loglayer/transport-log-file-rotation";
import { serializeError } from "serialize-error";

const logger = new LogLayer({
  errorSerializer: serializeError,
  transport: [
    new LogFileRotationTransport({
      filename: "./logs/app.log"
    }),
  ],
});

logger.info("Application started");
```

::: warning Filename Uniqueness
Each instance of `LogFileRotationTransport` must have a unique filename to prevent possible race conditions. If you try to create multiple transport instances with the same filename, an error will be thrown. If you need multiple loggers to write to the same file, they should share the same transport instance:

```typescript
// Create a single transport instance
const fileTransport = new LogFileRotationTransport({
  filename: "./logs/app-%DATE%.log",
  dateFormat: "YMD",
  frequency: "daily"
});

// Share it between multiple loggers
const logger1 = new LogLayer({
  transport: [fileTransport]
});

const logger2 = new LogLayer({
  transport: [fileTransport]
});
```

Child loggers do not have this problem as they inherit the transport instance from their parent logger.
:::

## Configuration Options

### Required Parameters

| Option | Type | Description                                                                                                                        |
|--------|------|------------------------------------------------------------------------------------------------------------------------------------|
| `filename` | `string` | The filename pattern to use for the log files. Supports date format using numerical values (e.g., `"./logs/application-%DATE%.log"`) |

### Optional Parameters

| Option | Type | Description                                                                                                                                        | Default |
|--------|------|----------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `frequency` | `string` | The frequency of rotation. Can be 'daily', 'date', '[1-30]m' for minutes, or '[1-12]h' for hours                                                   | None |
| `dateFormat` | `string` | The date format to use in the filename. Uses single characters: 'Y' (full year), 'M' (month), 'D' (day), 'H' (hour), 'm' (minutes), 's' (seconds)  | `"YMD"` |
| `size` | `string` | The size at which to rotate. Must include a unit suffix: "k"/"K" for kilobytes, "m"/"M" for megabytes, "g"/"G" for gigabytes (e.g., "10M", "100K") | None |
| `maxLogs` | `string \| number` | Maximum number of logs to keep. Can be a number of files or days (e.g., "10d" for 10 days)                                                         | None |
| `auditFile` | `string` | Location to store the log audit file                                                                                                               | None |
| `extension` | `string` | File extension to be appended to the filename                                                                                                      | None |
| `createSymlink` | `boolean` | Create a tailable symlink to the current active log file                                                                                           | `false` |
| `symlinkName` | `string` | Name to use when creating the symbolic link                                                                                                        | `"current.log"` |
| `utc` | `boolean` | Use UTC time for date in filename                                                                                                                  | `false` |
| `auditHashType` | `"md5" \| "sha256"` | Hashing algorithm for audit file. Use 'sha256' for FIPS compliance                                                                                 | `"md5"` |
| `fileMode` | `number` | File mode (permissions) to be used when creating log files | `0o640` |
| `fileOptions` | `object` | Options passed to fs.createWriteStream                                                                                                             | `{ flags: 'a' }` |
| `verbose` | `boolean` | Whether to enable verbose mode in the underlying file-stream-rotator                                                                               | `false` |
| `callbacks` | `object` | Event callbacks for various file stream events                                                                                                     | None |
| `fieldNames` | `object` | Custom field names for the log entry JSON                                                                                                          | See below |
| `delimiter` | `string` | Delimiter between log entries                                                                                                                      | `"\n"` |
| `timestampFn` | `() => string \| number` | Custom function to generate timestamps                                                                                                             | `() => new Date().toISOString()` |
| `levelMap` | `object` | Custom mapping for log levels. Each level can be mapped to a string or number                                                                      | None |
| `compressOnRotate` | `boolean` | Whether to compress rotated log files using gzip                                                                                                   | `false` |
| `batch` | `object` | Batch processing configuration. See [Batch Configuration](#batch-configuration)                                                                    | None |

### Field Names

The `fieldNames` object allows you to customize the field names in the log entry JSON:

| Field | Type | Description                                                      | Default |
|-------|------|------------------------------------------------------------------|---------|
| `level` | `string` | Field name for the log level                                     | `"level"` |
| `message` | `string` | Field name for the log message                                   | `"message"` |
| `timestamp` | `string` | Field name for the timestamp                                     | `"timestamp"` |

### Callbacks

The `callbacks` object supports the following event handlers:

| Callback | Parameters | Description |
|----------|------------|-------------|
| `onRotate` | `(oldFile: string, newFile: string) => void` | Called when a log file is rotated |
| `onNew` | `(newFile: string) => void` | Called when a new log file is created |
| `onOpen` | `() => void` | Called when a log file is opened |
| `onClose` | `() => void` | Called when a log file is closed |
| `onError` | `(error: Error) => void` | Called when an error occurs |
| `onFinish` | `() => void` | Called when the stream is finished |
| `onLogRemoved` | `(info: { date: number; name: string; hash: string }) => void` | Called when a log file is removed due to retention policy |

### Level Mapping

The `levelMap` object allows you to map each log level to either a string or number:

| Level | Type | Example (Numeric) | Example (String) |
|-------|------|------------------|------------------|
| `fatal` | `string \| number` | 60 | `"FATAL"` |
| `error` | `string \| number` | 50 | `"ERROR"` |
| `warn` | `string \| number` | 40 | `"WARNING"` |
| `info` | `string \| number` | 30 | `"INFO"` |
| `debug` | `string \| number` | 20 | `"DEBUG"` |
| `trace` | `string \| number` | 10 | `"TRACE"` |

### Batch Configuration

The `batch` option enables batching of log entries to improve performance by reducing disk writes. When enabled, logs are queued in memory and written to disk in batches. The configuration accepts the following options:

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `size` | `number` | Maximum number of log entries to queue before writing | `1000` |
| `timeout` | `number` | Maximum time in milliseconds to wait before writing queued logs | `5000` |

Queued logs are automatically flushed in the following situations:
- When the batch size is reached
- When the batch timeout is reached
- When the transport is disposed
- When the process exits (including SIGINT and SIGTERM signals)

Example usage:
```typescript
new LogFileRotationTransport({
  filename: "./logs/app",
  frequency: "daily",
  dateFormat: "YMD",
  extension: ".log",
  batch: {
    size: 1000,     // Write after 1000 logs are queued
    timeout: 5000   // Or after 5 seconds, whichever comes first
  }
});
```

::: warning Memory Usage
When using batch processing, be mindful of memory usage. Setting a very large `batch.size` or `batch.timeout` will cause more logs to be held in memory before being written to disk. In most cases, the default values provide a good balance between performance and memory usage.
:::

::: tip Performance Tuning
For high-throughput applications, you might want to adjust the batch settings based on your needs:
- Increase `batch.size` for better throughput at the cost of higher memory usage
- Decrease `batch.timeout` to reduce the risk of losing logs in case of crashes
:::

## Verbose Mode

It is recommended to enable `verbose` when configuring log rotation rules. This option allows troubleshooting and debugging of the rotation settings.
Once properly configured, it can be removed / disabled.

```typescript
new LogFileRotationTransport({
  filename: "./logs/daily/test-%DATE%.log",
  frequency: "1h",
  dateFormat: "YMD", // using hourly frequency, but missing the "m" part
  verbose: true,
});
```

If there is something wrong with the configuration, you will get something like:

```bash
[FileStreamRotator] Date format not suitable for X hours rotation. Changing date format to 'YMDHm
```

Which will help you identify the issue and correct it:

```typescript
new LogFileRotationTransport({
  filename: "./logs/daily/test-%DATE%.log",
  frequency: "1h",
  dateFormat: "YMDm",
});
```

## Log Format

Each log entry is written as a JSON object with the following format:

```json5
{
  "level": "info",
  "message": "Log message",
  "timestamp": "2024-01-17T12:34:56.789Z",
  // metadata / context / error data will depend on your LogLayer configuration
  "userId": "123",
  "requestId": "abc-123"
}
```

## Examples

Here are several examples demonstrating different rotation scenarios:

### Daily Rotation
```typescript
new LogFileRotationTransport({
  filename: "./logs/daily/test-%DATE%.log",
  frequency: "daily",
  dateFormat: "YMD",  // Required for daily rotation
});
```

### Hourly Rotation
```typescript
new LogFileRotationTransport({
  filename: "./logs/hourly/test-%DATE%.log",
  frequency: "1h",
  dateFormat: "YMDHm",  // Required for hourly rotation
});
```

### Minute-based Rotation
```typescript
new LogFileRotationTransport({
  filename: "./logs/minutes/test-%DATE%.log",
  frequency: "5m",
  dateFormat: "YMDHm",  // Required for minute rotation
});
```

### Size-based Rotation
```typescript
new LogFileRotationTransport({
  filename: "./logs/size/app.log",
  size: "50k",
  maxLogs: 5,
});
```

### Combined Size and Date Rotation
```typescript
new LogFileRotationTransport({
  filename: "./logs/combined/app-%DATE%.log",
  frequency: "daily",
  dateFormat: "YMD",  // Required for daily rotation
  size: "50k",
  maxLogs: "5",
});
```

::: tip Date Format Requirements
The transport requires specific date formats based on the rotation frequency:
- For daily rotation: use `dateFormat: "YMD"`
- For hourly rotation: use `dateFormat: "YMDHm"`
- For minute rotation: use `dateFormat: "YMDHm"`

These formats ensure proper rotation timing and file naming.
:::
