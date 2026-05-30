# PostHog Transport for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-posthog)](https://www.npmjs.com/package/@loglayer/transport-posthog)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Ftransport-posthog)](https://www.npmjs.com/package/@loglayer/transport-posthog)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

The PostHog transport for the [LogLayer](https://loglayer.dev) logging library.

[posthog-js](https://posthog.com/docs/logs/installation/javascript) is PostHog's official JavaScript logging SDK.

## Installation

```bash
npm install loglayer @loglayer/transport-posthog posthog-js serialize-error
```

## Usage

```typescript
import { posthog } from 'posthog-js'
import { serializeError } from 'serialize-error'
import { LogLayer } from 'loglayer'
import { PosthogTransport } from "@loglayer/transport-posthog"

// Initialize PostHog with logs configuration
posthog.init('<ph_project_token>', {
  api_host: 'https://us.i.posthog.com',
  defaults: '2026-01-30',
  logs: {
    serviceName: 'my-app',
    environment: 'production',
  },
})

const log = new LogLayer({
  transport: new PosthogTransport({
    logger: posthog,
  }),
  errorSerializer: serializeError,
})

log.info('hello from LogLayer')
log.withMetadata({ order_id: 'ord_123' }).info('checkout completed')
```

## Documentation

For more details, visit [https://loglayer.dev/transports/posthog](https://loglayer.dev/transports/posthog)
