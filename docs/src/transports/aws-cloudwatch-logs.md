---
title: Amazon CloudWatch Logs for LogLayer
description: Send logs to Amazon CloudWatch platform with the LogLayer logging library
---

# Amazon CloudWatch Logs Transport <Badge type="tip" text="Server" /> <Badge type="warning" text="Browser" />

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-aws-cloudwatch-logs)](https://www.npmjs.com/package/@loglayer/transport-aws-cloudwatch-logs)

[Transport Source](https://github.com/loglayer/loglayer/blob/master/packages/transports/aws-cloudwatch-logs)

The Amazon CloudWatch Logs transport allows you to send logs to [Amazon CloudWatch](https://aws.amazon.com/cloudwatch/), a service to monitor and manage resources in AWS.
It uses the [AWS SDK for JavaScript CloudWatchLogs](https://www.npmjs.com/package/@aws-sdk/client-cloudwatch-logs).

## Installation

::: code-group

```sh [npm]
npm install loglayer @loglayer/transport-aws-cloudwatch-logs @aws-sdk/client-cloudwatch-logs
```

```sh [pnpm]
pnpm add loglayer @loglayer/transport-aws-cloudwatch-logs @aws-sdk/client-cloudwatch-logs
```

```sh [yarn]
yarn add loglayer @loglayer/transport-aws-cloudwatch-logs @aws-sdk/client-cloudwatch-logs
```

:::

## Usage

```typescript
import { LogLayer } from 'loglayer';
import { CloudWatchLogsTransport } from "@loglayer/transport-aws-cloudwatch-logs";

// Create LogLayer instance with CloudWatch Logs transport
const log = new LogLayer({
  transport: new CloudWatchLogsTransport({
    groupName: "/loglayer/group",
    streamName: "loglayer-stream-name",
  }),
});

// Use LogLayer as normal
log.withMetadata({ customField: 'value' }).info('Hello from Lambda!');
```

### Server-Side Usage

If you're using NodeJS, you may want to use worker threads via `CloudWatchLogsWorkerQueueHandler` to improve performance:

```typescript
import { LogLayer } from 'loglayer';
import { CloudWatchLogsTransport } from "@loglayer/transport-aws-cloudwatch-logs";
import { CloudWatchLogsWorkerQueueHandler } from "@loglayer/transport-aws-cloudwatch-logs/server";

// Create LogLayer instance with CloudWatch Logs transport
const log = new LogLayer({
  transport: new CloudWatchLogsTransport({
    // ...
    handler: CloudWatchLogsWorkerQueueHandler,
  }),
});
```

By default, the worker handler will send the logs in batches every 6 seconds. You can change this behavior by creating a handler via the `createWorkerQueueHandler` method:

```typescript
import { createWorkerQueueHandler } from "@loglayer/transport-aws-cloudwatch-logs/server";

// Create a worker handler with custom options
const CloudWatchLogsWorkerQueueHandler = createWorkerQueueHandler({
  delay: 10000 // ms
})
```

See the [available options for CloudWatchLogsWorkerQueueHandler](#Node Worker Thread Handler Options)

## Configuration Options

### Required Parameters

| Name         | Type                                                    | Description            |
| ------------ | ------------------------------------------------------- | ---------------------- |
| `groupName`  | `string \| (params: LogLayerTransportParams) => string` | Target log group name. |
| `streamName` | `string \| (params: LogLayerTransportParams) => string` | Target stream name     |

### Optional Parameters

| Name                | Type                                                                | Default | Description                                                           |
| ------------------- | ------------------------------------------------------------------- | ------- | --------------------------------------------------------------------- |
| `clientConfig`      | `CloudWatchLogsClientConfig`                                        | -       | AWS SDK client configuration.                                         |
| `createIfNotExists` | `boolean`                                                           | `false` | Create log groups and streams if they don't exist.                    |
| `messageFn`         | `(params: LogLayerTransportParams, timestamp: number) => string`    | -       | Build the log message to be sent to cloudwatch.                       |
| `handler`           | `(options: CloudWatchLogsHandlerOptions) => ICloudWatchLogsHandler` | -       | A handler object to handle the log events.                            |
| `onError`           | `(error: Error) => void`                                            | -       | Callback for error handling                                           |
| `enabled`           | `boolean`                                                           | `true`  | If false, the transport will not send logs to the logger              |
| `consoleDebug`      | `boolean`                                                           | `false` | If true, the transport will log to the console for debugging purposes |
| `id`                | `string`                                                            | -       | A user-defined identifier for the transport                           |

### Node Worker Thread Handler Options

| Name        | Type     | Default | Description                                            |
| ----------- | -------- | ------- | ------------------------------------------------------ |
| `batchSize` | `number` | 10000   | The maximum number of messages to send in one request. |
| `delay`     | `number` | 6000    | The amount of time to wait before sending logs in ms.  |

## Log Format

Each log entry is written as a [InputLogEvent](https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_InputLogEvent.html) object with the following format:

```json5
{
  "message": "[info] Log message",
  "timestamp": 1641013456789,
}
```

Then, the message is sent to CloudWatch Logs using the [PutLogEvents](https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_PutLogEvents.html) action.

Multiple log entries can be sent in a single request by setting the `delay` option and optionally the `batchSize` option.

## Error Handling

The transport provides error handling through the `onError` callback:

```typescript
const logger = new LogLayer({
  transport: new CloudWatchLogsTransport({
    onError: (error) => {
      // Custom error handling
      console.error("Failed to send log to CloudWatch:", error);
    },
  }),
});
```

## Changelog

View the changelog [here](./changelogs/aws-cloudwatch-logs-changelog.md).
