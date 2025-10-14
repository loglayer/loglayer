# Sentry Transport <Badge type="warning" text="Browser" /> <Badge type="tip" text="Server" /> <Badge type="info" text="Deno" /> <Badge type="info" text="Bun" />

[![npm version](https://img.shields.io/npm/v/@loglayer/transport-sentry.svg)](https://www.npmjs.com/package/@loglayer/transport-sentry)
[![Source](https://img.shields.io/badge/source-GitHub-blue.svg)](https://github.com/loglayer/loglayer/tree/main/packages/transports/sentry)

The Sentry transport for LogLayer sends structured logs to Sentry using the Sentry SDK's logger API. This transport integrates seamlessly with Sentry's structured logging features and supports all Sentry log levels.

## Installation

```bash
npm install @loglayer/transport-sentry serialize-error <sentry-sdk>
```

```bash
yarn add @loglayer/transport-sentry serialize-error <sentry-sdk>
```

```bash
pnpm add @loglayer/transport-sentry serialize-error <sentry-sdk>
```

Replace `<sentry-sdk>` with the appropriate Sentry SDK for your platform:

- **Browser**: [@sentry/browser](https://docs.sentry.io/platforms/javascript/logs/)
- **Next.js**: [@sentry/nextjs](https://docs.sentry.io/platforms/javascript/guides/nextjs/logs/)
- **Bun**: [@sentry/bun](https://docs.sentry.io/platforms/javascript/guides/bun/logs/)
- **Deno**: [@sentry/deno](https://docs.sentry.io/platforms/javascript/guides/deno/)
- **Node.js**: [@sentry/node](https://docs.sentry.io/platforms/javascript/guides/node/)

## Setup

First, initialize Sentry with structured logging enabled for your platform:

```typescript
// Node.js example, but most of the JS-based SDKs follow this pattern
// Also in most cases, you'll want to initialize at the top-most entrypoint
// to your app so Sentry can instrument your code, such as the index.ts file
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  enableLogs: true,
});
```

Then configure LogLayer with the Sentry transport:

```typescript
// logger.ts
import * as Sentry from "@sentry/node";
import { LogLayer } from "loglayer";
import { SentryTransport } from "@loglayer/transport-sentry";
import { serializeError } from "serialize-error";

const log = new LogLayer({
  errorSerializer: serializeError, 
    new SentryTransport({
      logger: Sentry.logger,
    }),
  ],
});
```

## Configuration

### Required Parameters

| Name | Type | Description |
|------|------|-------------|
| `logger` | `SentryLogger` | The Sentry logger instance to use for logging |

### Optional Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | Auto-generated | An identifier for the transport |
| `enabled` | `boolean` | `true` | If false, the transport will not send logs to the logger |
| `level` | `"trace" \| "debug" \| "info" \| "warn" \| "error" \| "fatal"` | `"trace"` | Minimum log level to process |
| `consoleDebug` | `boolean` | `false` | If true, the transport will log to the console for debugging purposes |

## Changelog

View the changelog [here](./changelogs/sentry-changelog.md).

