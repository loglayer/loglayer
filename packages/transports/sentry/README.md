# @loglayer/transport-sentry

[![npm version](https://img.shields.io/npm/v/@loglayer/transport-sentry.svg)](https://www.npmjs.com/package/@loglayer/transport-sentry)
[![npm downloads](https://img.shields.io/npm/dm/@loglayer/transport-sentry.svg)](https://www.npmjs.com/package/@loglayer/transport-sentry)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

Sentry transport for the LogLayer logging library. This transport sends structured logs to Sentry using any Sentry logger instance.

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

## Usage

```typescript
import { LogLayer } from "loglayer";
import { SentryTransport } from "@loglayer/transport-sentry";
import { serializeError } from "serialize-error";
// node.js example, but most of the JS-based SDKs follow this pattern
import * as Sentry from "@sentry/node";

// In most cases, you'll want to initialize at the top-most entrypoint
// to your app so Sentry can instrument your code, such as the index.ts file
Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  enableLogs: true,
});

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: [
    new SentryTransport({
      logger: Sentry.logger,
    }),
  ],
});

// Use LogLayer as normal
log.withMetadata({ userId: 123 }).info("User logged in");
log.withError(new Error("Something went wrong")).error("Operation failed");
```

## Documentation

For more detailed documentation, visit the [LogLayer website](https://loglayer.dev/transports/sentry).
