# @loglayer/transport-betterstack

[![npm version](https://img.shields.io/npm/v/@loglayer/transport-betterstack.svg)](https://www.npmjs.com/package/@loglayer/transport-betterstack)
[![npm downloads](https://img.shields.io/npm/dm/@loglayer/transport-betterstack.svg)](https://www.npmjs.com/package/@loglayer/transport-betterstack)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

Better Stack transport for the LogLayer logging library. This transport sends logs to [Better Stack's log management platform](https://betterstack.com/log-management) using their HTTP API.

## Installation

```bash
npm install @loglayer/transport-betterstack
```

```bash
yarn add @loglayer/transport-betterstack
```

```bash
pnpm add @loglayer/transport-betterstack
```

## Usage

- Create a "Javascript / Node.js" log source in your Better Stack account.
- In the "Data ingestion" tab of your source, find your `source token` and the `ingesting host`.
- Add `https://` in front of the ingesting host for the `url` parameter. 

```typescript
import { LogLayer } from "loglayer";
import { BetterStackTransport } from "@loglayer/transport-betterstack";

const transport = new BetterStackTransport({
  sourceToken: "<source token>",
  url: "https://<ingesting host>",
});

const log = new LogLayer({ transport });

log.info("Hello, Better Stack!");
log.withMetadata({ userId: "123" }).info("User logged in");
```

## Configuration

For detailed configuration options and advanced usage, see the [Better Stack transport documentation](https://loglayer.dev/transports/betterstack).
