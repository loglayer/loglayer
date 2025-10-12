---
title: Better Stack Transport for LogLayer
description: Send logs to Better Stack log management platform with the LogLayer logging library
---

# Better Stack Transport <Badge type="tip" text="Server" /> <Badge type="info" text="Deno" /> <Badge type="info" text="Bun" />

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-betterstack)](https://www.npmjs.com/package/@loglayer/transport-betterstack)

[Transport Source](https://github.com/loglayer/loglayer/blob/master/packages/transports/betterstack)

The Better Stack transport allows you to send logs to [Better Stack's log management platform](https://betterstack.com/log-management) using their HTTP API. It provides a simple and efficient way to ship logs to Better Stack for centralized logging and analysis.

## Installation

::: code-group

```sh [npm]
npm install @loglayer/transport-betterstack loglayer
```

```sh [pnpm]
pnpm add @loglayer/transport-betterstack loglayer
```

```sh [yarn]
yarn add @loglayer/transport-betterstack loglayer
```

:::

## Usage

- Create a "Javascript / Node.js" log source in your Better Stack account.
- In the "Data ingestion" tab of your source, find your `source token` and the `ingesting host`.
- Add `https://` in front of the ingesting host for the `url` parameter.

```typescript
import { LogLayer } from "loglayer";
import { BetterStackTransport } from "@loglayer/transport-betterstack";

const logger = new LogLayer({
  transport: new BetterStackTransport({
    sourceToken: "<source token>",
    url: "https://<ingesting host>",
    onError: (err) => {
      console.error('Failed to send logs to Better Stack:', err);
    },
    onDebug: (entry) => {
      console.log('Log entry being sent to Better Stack:', entry);
    },
    onDebugReqRes: ({ req, res }) => {
      console.log("=== HTTP Request ===");
      console.log("URL:", req.url);
      console.log("Method:", req.method);
      console.log("Headers:", JSON.stringify(req.headers, null, 2));
      console.log("Body:", typeof req.body === "string" ? req.body : `[Uint8Array: ${req.body.length} bytes]`);
      console.log("=== HTTP Response ===");
      console.log("Status:", res.status, res.statusText);
      console.log("Headers:", JSON.stringify(res.headers, null, 2));
      console.log("Body:", res.body);
      console.log("===================");
    },
  }),
});

// Start logging
logger.info("Hello from LogLayer!");
logger.withMetadata({ userId: "123" }).info("User logged in");
```

## Configuration Options

### Required Parameters

| Name | Type | Description |
|------|------|-------------|
| `sourceToken` | `string` | Your Better Stack source token for authentication (found in the "Data ingestion" tab of your "Javascript / Node.js" source) |
| `url` | `string` | Better Stack ingestion host URL (add "https://" in front of the ingestion host from the "Data ingestion" tab of your "Javascript / Node.js" source) |

### Optional Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `includeTimestamp` | `boolean` | `true` | Whether to include timestamp in the log payload |
| `timestampField` | `string` | `"dt"` | Custom field name for the timestamp |
| `onError` | `(error: Error) => void` | - | Callback for error handling |
| `onDebug` | `(entry: Record<string, any>) => void` | - | Callback for debugging log entries |
| `level` | `"trace" \| "debug" \| "info" \| "warn" \| "error" \| "fatal"` | `"trace"` | Minimum log level to process |
| `enabled` | `boolean` | `true` | If false, the transport will not send logs to the logger |
| `id` | `string` | - | A user-defined identifier for the transport |

### HTTP Transport Options

The Better Stack transport extends the HTTP transport and supports all its configuration options:

<partial name="http-transport-options" />

## Changelog

View the changelog [here](./changelogs/betterstack-changelog.md).
