# @loglayer/transport-log-file-rotation

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-log-file-rotation)](https://www.npmjs.com/package/@loglayer/transport-log-file-rotation)

A transport for [LogLayer](https://github.com/loglayer/loglayer) that writes logs to files with automatic rotation based on size or time. Built on top of [file-stream-rotator](https://github.com/rogerc/file-stream-rotator/).

## Features

- Automatic log file rotation based on time (hourly, daily)
- Size-based rotation with support for KB, MB, and GB units
- Support for date patterns in filenames using numerical values
- Compression of rotated log files using gzip
- Maximum file count or age-based retention
- Automatic cleanup of old log files
- Batch processing of logs for improved performance

## Installation

```sh
# npm
npm i loglayer @loglayer/transport-log-file-rotation serialize-error

# pnpm
pnpm add loglayer @loglayer/transport-log-file-rotation serialize-error

# yarn
yarn add loglayer @loglayer/transport-log-file-rotation serialize-error
```

## Usage

```typescript
import { LogLayer } from "loglayer";
import { LogFileRotationTransport } from "@loglayer/transport-log-file-rotation";
import { serializeError } from "serialize-error";

const logger = new LogLayer({
  errorSerializer: serializeError,
  transport: [
    new LogFileRotationTransport({
      filename: "./logs/app.log",
    }),
  ],
});

logger.info("Application started");
```

### Filename Uniqueness
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

## Documentation

For detailed documentation, including all configuration options and advanced features, visit the [LogLayer documentation](https://loglayer.dev/transports/log-file-rotation.html). 