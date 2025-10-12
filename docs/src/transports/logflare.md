---
title: Logflare Transport for LogLayer
description: Send logs to Logflare with the LogLayer logging library
---

# Logflare Transport <Badge type="tip" text="Server" /> <Badge type="info" text="Deno" /> <Badge type="info" text="Bun" />

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-logflare)](https://www.npmjs.com/package/@loglayer/transport-logflare)

Ships logs to [Logflare](https://logflare.app) using the HTTP transport with Logflare-specific configuration. Features include:

- Automatic Logflare JSON format
- Built on top of the robust HTTP transport
- Retry logic with exponential backoff
- Rate limiting support
- Batch sending with configurable size and timeout
- Error and debug callbacks
- Support for self-hosted Logflare instances

[Transport Source](https://github.com/loglayer/loglayer/tree/master/packages/transports/logflare)

## Installation

::: code-group
```bash [npm]
npm install loglayer @loglayer/transport-logflare serialize-error
```

```bash [pnpm]
pnpm add loglayer @loglayer/transport-logflare serialize-error
```

```bash [yarn]
yarn add loglayer @loglayer/transport-logflare serialize-error
```
:::

## Basic Usage

::: warning Logflare free tier issues
The free tier has very low rate limits which can be *easily* exceeded. You may find yourself
getting `503: Service Unavailable` codes if you exceed the rate limit. Make sure to define
the `onError()` callback to catch this and adjust batch timings accordingly.
:::

```typescript
import { LogLayer } from 'loglayer'
import { LogflareTransport } from "@loglayer/transport-logflare"
import { serializeError } from "serialize-error";

const log = new LogLayer({
  errorSerializer: serializeError,
  contextFieldName: null, // recommended based on testing
  metadataFieldName: null, // recommended based on testing
  transport: new LogflareTransport({
    sourceId: "YOUR-SOURCE-ID",
    apiKey: "YOUR-API-KEY",
    onError: (err) => {
      console.error('Failed to send logs to Logflare:', err);
    },
    onDebug: (entry) => {
      console.log('Log entry being sent to Logflare:', entry);
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
  })
})

// Use the logger
log.info("This is a test message");
log.withMetadata({ userId: "123" }).error("User not found");
```

## Configuration

### Required Parameters

| Name | Type | Description |
|------|------|-------------|
| `sourceId` | `string` | Your Logflare source ID |
| `apiKey` | `string` | Your Logflare API key |

### Optional Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `url` | `string` | `"https://api.logflare.app"` | Custom Logflare API endpoint (for self-hosted instances) |
| `enabled` | `boolean` | `true` | Whether the transport is enabled |
| `level` | `"trace" \| "debug" \| "info" \| "warn" \| "error" \| "fatal"` | `"trace"` | Minimum log level to process. Logs below this level will be filtered out |

<!--@include: ./_partials/http-transport-options.md-->

For more details on these options, see the [HTTP transport documentation](/transports/http#configuration).

