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

## Configuration Options

### Required Parameters

| Name         | Type                                                    | Description            |
| ------------ | ------------------------------------------------------- | ---------------------- |
| `groupName`  | `string \| (params: LogLayerTransportParams) => string` | Target log group name. |
| `streamName` | `string \| (params: LogLayerTransportParams) => string` | Target stream name     |

### Optional Parameters

| Name                | Type                                                                  | Default | Description                                                           |
| ------------------- | --------------------------------------------------------------------- | ------- | --------------------------------------------------------------------- |
| `clientConfig`      | `CloudWatchLogsClientConfig`                                          | -       | AWS SDK client configuration.                                         |
| `createIfNotExists` | `boolean`                                                             | `false` | Create log groups and streams if they don't exist.                    |
| `messageFn`         | `(params: LogLayerTransportParams, timestamp: number) => string`      | -       | Build the log message to be sent to cloudwatch.                       |
| `strategy`          | `(options: CloudWatchLogsStrategyOptions) => ICloudWatchLogsStrategy` | -       | Callback to create the strategy object that handles the log events.   |
| `onError`           | `(error: Error) => void`                                              | -       | Callback for error handling                                           |
| `enabled`           | `boolean`                                                             | `true`  | If false, the transport will not send logs to the logger              |
| `consoleDebug`      | `boolean`                                                             | `false` | If true, the transport will log to the console for debugging purposes |
| `id`                | `string`                                                              | -       | A user-defined identifier for the transport                           |

## Processing Strategies

The transport can handle log events in different ways, depending on your needs. It includes two built-in processing strategies: a [default strategy](#default-strategy) and a [worker queue strategy](#worker-queue-strategy).

If needed, you can also create your own strategy by passing a function to the `strategy` option. It will receive the transport basic options and expects to return an object with a method called `sendEvent` and an optional method `cleanup`. The first one will be used to send the log event and the second one is used to clean up any resources in your strategy when the transport is destroyed. See the following example:

```typescript
import { LogLayer } from 'loglayer';
import { CloudWatchLogsClient, PutLogEventsCommand } from "@aws-sdk/client-cloudwatch-logs";
import { CloudWatchLogsTransport } from "@loglayer/transport-aws-cloudwatch-logs";

// Create LogLayer instance with CloudWatch Logs transport
const log = new LogLayer({
  transport: new CloudWatchLogsTransport({
    groupName: "/loglayer/group",
    streamName: "loglayer-stream-name",
    strategy: ({ clientConfig, onError }) => {
      const client = new CloudWatchLogsClient(clientConfig);
      return {
        sendEvent: async (event, logGroupName, logStreamName) => {
          const cmd = new PutLogEventsCommand({
            logEvents: [event],
            logGroupName,
            logStreamName,
          });
          try {
            await client.send(cmd);
          } catch (error) {
            onError?.(error);
          }
        }
      }
    }
  }),
})
```

### Default strategy

Enabled by default, it sends each log event in a single request inmediately. The strategy is exported as `CloudWatchLogsDefaultStrategy` in case you want to wrap it in your own strategy.

### Worker queue strategy

If you're sending a lot of logs, you may prefer to use this strategy to improve performance. It uses a worker thread and allows you to send your logs in batches in a single request every 6 seconds (configurable). See the following example:

```typescript
import { LogLayer } from 'loglayer';
import { CloudWatchLogsTransport, CloudWatchLogsWorkerQueueStrategy } from "@loglayer/transport-aws-cloudwatch-logs";

// Create LogLayer instance with CloudWatch Logs transport
const log = new LogLayer({
  transport: new CloudWatchLogsTransport({
    // ...
    strategy: CloudWatchLogsWorkerQueueStrategy,
  }),
});
```

You can configure it by creating it via the `createWorkerQueueStrategy` method as follows:

```typescript
import { createWorkerQueueStrategy } from "@loglayer/transport-aws-cloudwatch-logs";

// Create a worker strategy with custom options
const CloudWatchLogsWorkerQueueStrategy = createWorkerQueueStrategy({
  delay: 10000 // Send events every 10 seconds
})
```

The following options are available:

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
