# Axiom Transport for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-axiom)](https://www.npmjs.com/package/@loglayer/transport-axiom)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Ftransport-axiom)](https://www.npmjs.com/package/@loglayer/transport-axiom)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

A transport for sending logs to [Axiom.co](https://axiom.co) with the [LogLayer](https://loglayer.dev) logging library.

## Installation

```bash
npm install @loglayer/transport-axiom @axiomhq/js serialize-error loglayer
```

## Usage

```typescript
import { LogLayer } from 'loglayer';
import { serializeError } from 'serialize-error';
import { AxiomTransport } from '@loglayer/transport-axiom';
import { Axiom } from '@axiomhq/js';

// Create the Axiom client
const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN,
  // Optional: other Axiom client options
  // orgId: 'your-org-id',
  // url: 'https://cloud.axiom.co',
});

// Create the LogLayer instance with AxiomTransport
const logger = new LogLayer({
  errorSerializer: serializeError,
  transport: new AxiomTransport({
    logger: axiom,
    dataset: 'your-dataset',
  }),
});

logger.info('Hello world');
```

## Documentation

For configuration options and examples, visit [https://loglayer.dev/transports/axiom](https://loglayer.dev/transports/axiom)
