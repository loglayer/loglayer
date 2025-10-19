---
title: Amazon CloudWatch Logs for LogLayer
description: Send logs to Amazon CloudWatch platform with the LogLayer logging library
---

# Amazon CloudWatch Logs Transport <Badge type="tip" text="Server" />

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

## Permissions

The transport uses the [PutLogEvents](https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_PutLogEvents.html) action to send the logs to CloudWatch Logs. If you're using the `createIfNotExists` option, it will also uses the [DescribeLogGroups](https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_DescribeLogGroups.html), [DescribeLogStreams](https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_DescribeLogStreams.html), [CreateLogGroup](https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_CreateLogGroup.html) and [CreateLogStream](https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_CreateLogStream.html) actions. Make sure you have the necessary permissions to use them. See more details in the [CloudWatch Logs permissions reference](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/permissions-reference-cwl.html).

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

The AWS SDK will load your default aws profile or environment. However, you can also specify the cloudwatch client config by yourself via the `clientConfig` option as follows:

```typescript
import { LogLayer } from 'loglayer';
import { CloudWatchLogsTransport } from "@loglayer/transport-aws-cloudwatch-logs";

// Create LogLayer instance with CloudWatch Logs transport
const log = new LogLayer({
  transport: new CloudWatchLogsTransport({
    clientConfig: {
      region: "us-east-1",
      credentials: {
        accessKeyId: "<your access key>",
        secretAccessKey: "<your secret key>"
      },
    }
  })
});
```

See the [available options for CloudWatchLogsTransport](#configuration-options).

### Worker thread strategy

By default, each logs entries is sent in the same thread independently. However, you may want to use worker threads via `CloudWatchLogsWorkerQueueStrategy` to improve performance:

```typescript
import { LogLayer } from 'loglayer';
import { CloudWatchLogsTransport } from "@loglayer/transport-aws-cloudwatch-logs";
import { CloudWatchLogsWorkerQueueStrategy } from "@loglayer/transport-aws-cloudwatch-logs/server";

// Create LogLayer instance with CloudWatch Logs transport
const log = new LogLayer({
  transport: new CloudWatchLogsTransport({
    // ...
    strategy: CloudWatchLogsWorkerQueueStrategy,
  }),
});
```

This allows sending multiple log entries in a single request every 6 seconds. You can customize it by creating via the `createWorkerQueueStrategy` method:

```typescript
import { createWorkerQueueStrategy } from "@loglayer/transport-aws-cloudwatch-logs/server";

// Create a worker strategy with custom options
const CloudWatchLogsWorkerQueueStrategy = createWorkerQueueStrategy({
  delay: 10000 // 10s
})
```

See the [available options for CloudWatchLogsWorkerQueueStrategy](#node-worker-thread-strategy-options).

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
| `strategy`           | `(options: CloudWatchLogsStrategyOptions) => ICloudWatchLogsStrategy` | -       | A strategy object to handle the log events.                            |
| `onError`           | `(error: Error) => void`                                            | -       | Callback for error handling                                           |
| `enabled`           | `boolean`                                                           | `true`  | If false, the transport will not send logs to the logger              |
| `consoleDebug`      | `boolean`                                                           | `false` | If true, the transport will log to the console for debugging purposes |
| `id`                | `string`                                                            | -       | A user-defined identifier for the transport                           |

### Node Worker Thread Strategy Options

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

If you want to customize the log format, use the `messageFn` option as follows:

```typescript
import { LogLayer } from 'loglayer';
import { CloudWatchLogsTransport } from "@loglayer/transport-aws-cloudwatch-logs";

const log = new LogLayer({
  transport: new CloudWatchLogsTransport({
    messageFn: (params, timestamp) => {
      const isoDate = new Date(timestamp).toISOString();
      const msg = params.messages.map((msg) => String(msg)).join(" ");
      return `${isoDate} [${params.logLevel}] ${msg}`;
    },
  })
})
```

The previous code will produce a log entry with the following format:

```json
{
  "message": "2022-01-01T05:04:16.789Z [info] Log message",
  "timestamp": 1641013456789,
}
```

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
