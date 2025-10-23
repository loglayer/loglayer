# AWS CloudWatch Logs Logger Transport for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-aws-cloudwatch-logs)](https://www.npmjs.com/package/@loglayer/transport-aws-cloudwatch-logs)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Ftransport-aws-cloudwatch-logs)](https://www.npmjs.com/package/@loglayer/transport-aws-cloudwatch-logs)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

A transport for the [LogLayer](https://loglayer.dev) logging library using the [AWS CloudWatch Logs](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cloudwatch-logs/).

## Installation

```bash
npm install loglayer @loglayer/transport-aws-cloudwatch-logs @aws-sdk/client-cloudwatch-logs serialize-error
```

## Usage

```typescript
import { LogLayer } from 'loglayer';
import { CloudWatchLogsTransport } from "@loglayer/transport-aws-cloudwatch-logs";
import { serializeError } from "serialize-error";

// Create LogLayer instance with CloudWatch Logs transport
const log = new LogLayer({
  errorSerializer: serializeError,
  transport: new CloudWatchLogsTransport({
    // Set the log group and stream name to use.
    groupName: "/loglayer/group",
    streamName: "loglayer-stream-name",
  }),
});

// Use LogLayer as normal
log.withMetadata({ customField: 'value' }).info('Hello from Lambda!');

// The transport formats messages as JSON with level, timestamp, data fields, and msg
// Example output: {"level":"info","timestamp":1641013456789,"customField":"value","msg":"Hello from Lambda!"}
```

## Documentation

For configuration options and examples, visit [https://loglayer.dev/transports/aws-cloudwatch-logs](https://loglayer.dev/transports/aws-cloudwatch-logs)
