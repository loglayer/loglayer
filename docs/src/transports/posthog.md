---
title: PostHog Transport for LogLayer
description: Send logs using the PostHog JavaScript Web SDK with LogLayer
---

# PostHog Transport <Badge type="warning" text="Browser" /> <Badge type="tip" text="Server" />

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-posthog)](https://www.npmjs.com/package/@loglayer/transport-posthog)

[posthog-js](https://posthog.com/docs/logs/installation/javascript) is PostHog's official JavaScript logging SDK.

[Transport Source](https://github.com/loglayer/loglayer/tree/master/packages/transports/posthog)

## Installation

Install the required packages:

::: code-group

```sh [npm]
npm i loglayer @loglayer/transport-posthog posthog-js serialize-error
```

```sh [pnpm]
pnpm add loglayer @loglayer/transport-posthog posthog-js serialize-error
```

```sh [yarn]
yarn add loglayer @loglayer/transport-posthog posthog-js serialize-error
```

:::

::: info Cross-Engine Compatibility
The `posthog-js` SDK works in both Node.js and browser environments. It may also work in Deno and Bun, but this has not been tested.
:::

## Setup

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

## Configuration Options

### Required Parameters

| Name | Type | Description |
|------|------|-------------|
| `logger` | `PostHog` | The initialized PostHog client instance |

### Optional Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Whether the transport is enabled |
| `level` | `"trace" \| "debug" \| "info" \| "warn" \| "error" \| "fatal"` | `"trace"` | Minimum log level to process. Logs below this level will be filtered out |

## Log Level Mapping

| LogLayer | PostHog |
|----------|---------|
| trace    | trace   |
| debug    | debug   |
| info     | info    |
| warn     | warn    |
| error    | error   |
| fatal    | fatal   |

## Changelog

View the changelog [here](./changelogs/posthog-changelog.md).
