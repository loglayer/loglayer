---
title: AWS Lambda Powertools Transport for LogLayer
description: Logging for AWS Lambdas with the LogLayer logging library
---

# AWS Lambda Powertools Transport

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-aws-lambda-powertools)](https://www.npmjs.com/package/@loglayer/transport-aws-lambda-powertools)

A LogLayer transport for [AWS Lambda Powertools Logger](https://docs.powertools.aws.dev/lambda/typescript/latest/core/logger/).

[Transport Source](https://github.com/loglayer/loglayer/tree/master/packages/transports/aws-lambda-powertools)

## Installation

Install the required packages:

::: code-group

```sh [npm]
npm i loglayer @loglayer/transport-aws-lambda-powertools @aws-lambda-powertools/logger
```

```sh [pnpm]
pnpm add loglayer @loglayer/transport-aws-lambda-powertools @aws-lambda-powertools/logger
```

```sh [yarn]
yarn add loglayer @loglayer/transport-aws-lambda-powertools @aws-lambda-powertools/logger
```

:::

## Setup

::: warning
The Logger utility from `@aws-lambda-powertools/logger` must always be instantiated outside the Lambda handler.
:::

```typescript
import { Logger } from '@aws-lambda-powertools/logger';
import { LogLayer } from 'loglayer';
import { PowertoolsTransport } from '@loglayer/transport-aws-lambda-powertools';

// Create a new Powertools logger instance
const powertoolsLogger = new Logger({
  serviceName: 'my-service',
  logLevel: 'INFO'
});

// Create LogLayer instance with Powertools transport
const log = new LogLayer({
  transport: new PowertoolsTransport({
    logger: powertoolsLogger
  })
});

// Use LogLayer as normal
log.withMetadata({ customField: 'value' }).info('Hello from Lambda!');
```

## Log Level Mapping

| LogLayer | Powertools |
|----------|------------|
| trace    | DEBUG      |
| debug    | DEBUG      |
| info     | INFO       |
| warn     | WARN       |
| error    | ERROR      |
| fatal    | ERROR      |

## Changelog

View the changelog [here](./changelogs/aws-lambda-powertools-changelog.md).
