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
npm install loglayer @loglayer/transport-aws-cloudwatch-logs @aws-sdk/client-cloudwatch-logs serialize-error
```

```sh [pnpm]
pnpm add loglayer @loglayer/transport-aws-cloudwatch-logs @aws-sdk/client-cloudwatch-logs serialize-error
```

```sh [yarn]
yarn add loglayer @loglayer/transport-aws-cloudwatch-logs @aws-sdk/client-cloudwatch-logs serialize-error
```

:::

## Permissions

The transport requires specific AWS permissions to send logs to CloudWatch Logs. The required permissions depend on your configuration:

### Required Permissions

**Always required:**
• `logs:PutLogEvents` - Send log events to CloudWatch Logs

**Required when using `createIfNotExists: true`:**

The included processing strategies have an option to create the groups and streams if they do not exist.

• `logs:DescribeLogGroups` - Check if log group exists
• `logs:DescribeLogStreams` - Check if log stream exists  
• `logs:CreateLogGroup` - Create log group if it doesn't exist
• `logs:CreateLogStream` - Create log stream if it doesn't exist

### IAM Policy Example

Here's a minimal IAM policy that grants the necessary permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:log-group:your-log-group-name"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams",
        "logs:CreateLogGroup",
        "logs:CreateLogStream"
      ],
      "Resource": "*"
    }
  ]
}
```

For more details, see the [CloudWatch Logs permissions reference](https://docs.aws.amazon.com/AmazonCloud/latest/logs/permissions-reference-cwl.html).

## Usage

```typescript
import { LogLayer } from 'loglayer';
import { CloudWatchLogsTransport } from "@loglayer/transport-aws-cloudwatch-logs";
import { serializeError } from "serialize-error";

// Create LogLayer instance with CloudWatch Logs transport
const log = new LogLayer({
  errorSerializer: serializeError,
  transport: new CloudWatchLogsTransport({
    groupName: "/loglayer/group",
    streamName: "loglayer-stream-name",
  }),
});

// Use LogLayer as normal
log.withMetadata({ customField: 'value' }).info('Hello from Lambda!');
```

When no processing strategy is explicitly defined, the transport uses the [default strategy](#default-strategy) with your default AWS profile or environment variables (such as `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION`).


## Configuration Options

### Required Parameters

| Name         | Type                                                    | Description            |
| ------------ | ------------------------------------------------------- | ---------------------- |
| `groupName`  | `string \| (params: LogLayerTransportParams) => string` | Target log group name. |
| `streamName` | `string \| (params: LogLayerTransportParams) => string` | Target stream name     |

### Optional Parameters

| Name                | Type                                                                  | Default | Description                                                           |
| ------------------- | --------------------------------------------------------------------- | ------- | --------------------------------------------------------------------- |
| `strategy`          | `BaseStrategy`                                                        | `DefaultCloudWatchStrategy()` | Strategy object that handles the log events. |
| `payloadTemplate`   | `(params: LogLayerTransportParams, timestamp: number) => string`      | -       | Build the log message to be sent to cloudwatch.                       |
| `onError`           | `(error: Error) => void`                                              | -       | Callback for error handling                                           |
| `enabled`           | `boolean`                                                             | `true`  | If false, the transport will not send logs to the logger              |
| `consoleDebug`      | `boolean`                                                             | `false` | If true, the transport will log to the console for debugging purposes |
| `id`                | `string`                                                              | -       | A user-defined identifier for the transport                           |

## Log Format

Each log entry is written as a [InputLogEvent](https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_InputLogEvent.html) object with the following format:

```json5
{
  "message": "{\"level\":\"info\",\"timestamp\":1641013456789,\"msg\":\"Log message\"}",
  "timestamp": 1641013456789,
}
```

The message field contains a JSON stringified object with:
- `level`: The log level (e.g., "info", "error", "debug")
- `timestamp`: The timestamp when the log was created
- `msg`: The joined message string
- Additional data fields (only included when present)

Then, the message is sent to CloudWatch Logs using the [PutLogEvents](https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_PutLogEvents.html) action.

### Customizing log entries

If you want to customize the log format, use the `payloadTemplate` option as follows:

```typescript
import { LogLayer } from 'loglayer';
import { CloudWatchLogsTransport } from "@loglayer/transport-aws-cloudwatch-logs";

const log = new LogLayer({
  transport: new CloudWatchLogsTransport({
    groupName: "/loglayer/group",
    streamName: "loglayer-stream-name",
    payloadTemplate: (params, timestamp) => {
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

#### PayloadTemplate Parameters

The `payloadTemplate` function receives two parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `params` | `LogLayerTransportParams` | The log entry data containing all the information about the log message |
| `timestamp` | `number` | The timestamp when the log was created (in milliseconds) |

#### LogLayerTransportParams Properties

The `params` object contains the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `logLevel` | `LogLevelType` | The log level of the message (e.g., "info", "error", "debug") |
| `messages` | `any[]` | The parameters that were passed to the log message method |
| `data` | `LogLayerData` | Combined object data containing the metadata, context, and/or error data |
| `hasData` | `boolean` | If true, the data object is included in the message parameters |
| `metadata` | `LogLayerMetadata` | Individual metadata object passed to the log message method |
| `error` | `any` | Error passed to the log message method |
| `context` | `LogLayerContext` | Context data that is included with each log entry |


## Error Handling

The transport provides error handling through the `onError` callback:

```typescript
const logger = new LogLayer({
  transport: new CloudWatchLogsTransport({
    groupName: "/loglayer/group",
    streamName: "loglayer-stream-name",
    strategy: new DefaultCloudWatchStrategy(),
    onError: (error) => {
      // Custom error handling
      console.error("Failed to send log to CloudWatch:", error);
    },
  }),
});
```

## Processing Strategies

The transport uses a strategy-based architecture to handle log events. It includes two built-in processing strategies: a [default strategy](#default-strategy) and a [worker queue strategy](#worker-queue-strategy).

### Default Strategy

The default strategy is used when a strategy is not specified in the transport and sends each log event immediately in a single request. It's the most straightforward approach and is suitable for most use cases.

```typescript
import { LogLayer } from 'loglayer';
import { CloudWatchLogsTransport, DefaultCloudWatchStrategy } from "@loglayer/transport-aws-cloudwatch-logs";

// Simple usage with default AWS configuration
const log = new LogLayer({
  transport: new CloudWatchLogsTransport({
    groupName: "/loglayer/group",
    streamName: "loglayer-stream-name",
  }),
});
```

Or with custom AWS client configuration:

```typescript
import { LogLayer } from 'loglayer';
import { CloudWatchLogsTransport, DefaultCloudWatchStrategy } from "@loglayer/transport-aws-cloudwatch-logs";

const log = new LogLayer({
  transport: new CloudWatchLogsTransport({
    groupName: "/loglayer/group",
    streamName: "loglayer-stream-name",
    strategy: new DefaultCloudWatchStrategy({
      clientConfig: {
        region: "us-east-1",
      },
    }),
  }),
});
```

Or with automatic log group and stream creation:

```typescript
import { LogLayer } from 'loglayer';
import { CloudWatchLogsTransport, DefaultCloudWatchStrategy } from "@loglayer/transport-aws-cloudwatch-logs";

const log = new LogLayer({
  transport: new CloudWatchLogsTransport({
    groupName: "/loglayer/group",
    streamName: "loglayer-stream-name",
    strategy: new DefaultCloudWatchStrategy({
      createIfNotExists: true,
    }),
  }),
});
```

#### Default Strategy Options

| Name                | Type                        | Default | Description                                                           |
| ------------------- | --------------------------- | ------- | --------------------------------------------------------------------- |
| `clientConfig`      | `CloudWatchLogsClientConfig` | -       | AWS SDK client configuration.                                         |
| `createIfNotExists` | `boolean`                   | `false` | Try to create the log group and log stream if they don't exist yet.  |

### Worker Queue Strategy

If you're sending a lot of logs, you may prefer to use the worker queue strategy to improve performance. It uses a worker thread and allows you to send your logs in batches.

```typescript
import { LogLayer } from 'loglayer';
import { CloudWatchLogsTransport, WorkerQueueStrategy } from "@loglayer/transport-aws-cloudwatch-logs";

const log = new LogLayer({
  transport: new CloudWatchLogsTransport({
    groupName: "/loglayer/group",
    streamName: "loglayer-stream-name",
    strategy: new WorkerQueueStrategy({
      batchSize: 1000,
      delay: 5000,
    }),
  }),
});
```

Or with automatic log group and stream creation:

```typescript
import { LogLayer } from 'loglayer';
import { CloudWatchLogsTransport, WorkerQueueStrategy } from "@loglayer/transport-aws-cloudwatch-logs";

const log = new LogLayer({
  transport: new CloudWatchLogsTransport({
    groupName: "/loglayer/group",
    streamName: "loglayer-stream-name",
    strategy: new WorkerQueueStrategy({
      batchSize: 1000,
      delay: 5000,
      createIfNotExists: true,
    }),
  }),
});
```

#### Worker Queue Strategy Options

| Name                | Type     | Default | Description                                                           |
| ------------------- | -------- | ------- | --------------------------------------------------------------------- |
| `batchSize`         | `number` | 10000   | The maximum number of messages to send in one request.                |
| `delay`             | `number` | 6000    | The amount of time to wait before sending logs in ms.                 |
| `clientConfig`      | `CloudWatchLogsClientConfig` | - | AWS SDK client configuration.                                         |
| `createIfNotExists` | `boolean` | `false` | Try to create the log group and log stream if they don't exist yet.  |

## Creating Custom Strategies

The strategy-based architecture allows you to create custom strategies that implement your own logging behavior. This is useful when you need specialized functionality like custom batching, retry logic, or integration with other services.

### Strategy Interface

All strategies must extend the `BaseStrategy` class and implement the required methods. The `BaseStrategy` class provides the foundation for all custom strategies and includes several protected properties and methods that you can use in your implementations.

#### BaseStrategy Properties

The `BaseStrategy` class provides these protected properties that are automatically configured by the transport:

| Property | Type | Description |
|----------|------|-------------|
| `onError` | `ErrorHandler \| undefined` | Error handler callback function. Set by the transport's `onError` option. |

#### BaseStrategy Methods

| Method | Type | Description |
|--------|------|-------------|
| `sendEvent(params)` | `(params: SendEventParams) => Promise<void> \| void` | **Abstract method** - Must be implemented. Handles sending log events to CloudWatch Logs. |
| `cleanup()` | `() => Promise<void> \| void` | **Optional override** - Called when the transport is disposed. Use this to clean up resources. |

#### Basic Strategy Template

```typescript
import { BaseStrategy } from "@loglayer/transport-aws-cloudwatch-logs";
import type { SendEventParams, CloudWatchLogsStrategyOptions } from "@loglayer/transport-aws-cloudwatch-logs";

class MyCustomStrategy extends BaseStrategy {
  // Optional: Add your own properties
  private myProperty: string;

  constructor(myProperty: string) {
    super();
    this.myProperty = myProperty;
  }

  // Required: Implement the sendEvent method
  async sendEvent({ event, logGroupName, logStreamName }: SendEventParams): Promise<void> {
    // Your custom implementation here
    // You can access this.onError
  }

  // Optional: Override cleanup for resource management
  cleanup(): void {
    // Clean up any resources (timers, connections, etc.)
  }
}
```

#### SendEventParams Interface

The `sendEvent` method receives a `SendEventParams` object with these properties:

| Property | Type | Description |
|----------|------|-------------|
| `event` | `InputLogEvent` | The log event to send, containing `timestamp` and `message` |
| `logGroupName` | `string` | The CloudWatch Logs group name |
| `logStreamName` | `string` | The CloudWatch Logs stream name |

### Basic Custom Strategy

Here's a simple example that adds custom retry logic:

```typescript
import { LogLayer } from 'loglayer';
import { CloudWatchLogsTransport, BaseStrategy } from "@loglayer/transport-aws-cloudwatch-logs";
import { CloudWatchLogsClient, PutLogEventsCommand } from "@aws-sdk/client-cloudwatch-logs";

class RetryStrategy extends BaseStrategy {
  private client: CloudWatchLogsClient;
  private maxRetries: number;

  constructor(maxRetries = 3) {
    super();
    this.client = new CloudWatchLogsClient({});
    this.maxRetries = maxRetries;
  }

  async sendEvent({ event, logGroupName, logStreamName }: SendEventParams): Promise<void> {
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const command = new PutLogEventsCommand({
          logEvents: [event],
          logGroupName,
          logStreamName,
        });
        
        await this.client.send(command);
        return; // Success, exit retry loop
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === this.maxRetries) {
          this.onError?.(lastError);
          throw lastError;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
}

const log = new LogLayer({
  transport: new CloudWatchLogsTransport({
    groupName: "/loglayer/group",
    streamName: "loglayer-stream-name",
    strategy: new RetryStrategy(5), // 5 retry attempts
  }),
});
```


## Changelog

View the changelog [here](./changelogs/aws-cloudwatch-logs-changelog.md).