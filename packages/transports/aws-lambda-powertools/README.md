# AWS Lambda Powertools Logger Transport for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-aws-lambda-powertools)](https://www.npmjs.com/package/@loglayer/transport-aws-lambda-powertools)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Ftransport-aws-lambda-powertools)](https://www.npmjs.com/package/@loglayer/transport-aws-lambda-powertools)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

A LogLayer transport for [AWS Lambda Powertools Logger](https://docs.powertools.aws.dev/lambda/typescript/latest/core/logger/).

## Installation

```bash
npm install loglayer @loglayer/transport-aws-lambda-powertools @aws-lambda-powertools/logger
```

## Usage

```typescript
import { Logger } from '@aws-lambda-powertools/logger';
import { LogLayer } from 'loglayer';
import { PowertoolsTransport } from '@loglayer/transport-aws-lambda-powertools';

// Note: The Logger utility must always be instantiated outside the Lambda handler
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

## License

MIT 