# AWS CloudWatch Logs Logger Transport for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-aws-cloudwatch-logs)](https://www.npmjs.com/package/@loglayer/transport-aws-cloudwatch-logs)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Ftransport-aws-cloudwatch-logs)](https://www.npmjs.com/package/@loglayer/transport-aws-cloudwatch-logs)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

A transport for the [LogLayer](https://loglayer.dev) logging library using the [AWS CloudWatch Logs](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cloudwatch-logs/).

## Installation

```bash
npm install loglayer @loglayer/transport-aws-cloudwatch-logs @aws-sdk/client-cloudwatch-logs
```

## Usage

```typescript
import { LogLayer } from 'loglayer';
import { CloudWatchLogsTransport } from "@loglayer/transport-aws-cloudwatch-logs";

// Create LogLayer instance with CloudWatch Logs transport
const log = new LogLayer({
  transport: new CloudWatchLogsTransport({
    // Set the log group and stream name to use.
    groupName: "/loglayer/group",
    streamName: "loglayer-stream-name",

    // The maximum number of messages to send in one request
    // batchSize: 10000,

    // The AWS SDK will already use the shared config file (~/.aws/config) or environment variables.
    // However, you can also specify the configuration explicitly.
    // clientConfig: {},

    // Tell the transport to create the log group and log stream if they don't exist
    // createIfNotExists: false,

    // Set the delay between log entries.
    // delay: 0,

    // Use a custom handler
    // handler: MyHandler,
  }),
});

// Use LogLayer as normal
log.withMetadata({ customField: 'value' }).info('Hello from Lambda!');
```

If you're using NodeJS, you may want to use worker threads via the included `CloudWatchLogsWorkerHandler`:

```typescript
import { LogLayer } from 'loglayer';
import { CloudWatchLogsTransport } from "@loglayer/transport-aws-cloudwatch-logs";
import { CloudWatchLogsWorkerHandler } from "@loglayer/transport-aws-cloudwatch-logs/server";

// Create LogLayer instance with CloudWatch Logs transport
const log = new LogLayer({
  transport: new CloudWatchLogsTransport({
    // ...
    handler: CloudWatchLogsWorkerHandler,
  }),
});
```

## License

MIT 
