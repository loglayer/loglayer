---
title: Cribl HTTP/S Transport for LogLayer
description: Send logs to Cribl Stream with the LogLayer logging library
---

# Cribl HTTP/S Transport <Badge type="warning" text="Browser" /> <Badge type="tip" text="Server" /> <Badge type="info" text="Deno" /> <Badge type="info" text="Bun" />

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-cribl-http)](https://www.npmjs.com/package/@loglayer/transport-cribl-http)

Ships logs to [Cribl Stream](https://cribl.io) via the [HTTP/S Bulk API source](https://docs.cribl.io/stream/sources-https/) (`/cribl/_bulk` endpoint). Features include:

- Automatic Cribl HTTP/S Bulk API JSON format
- Built on top of the robust HTTP transport
- Retry logic with exponential backoff
- Rate limiting support
- Batch sending with configurable size and timeout
- Error and debug callbacks
- Configurable event metadata (source, host)

[Transport Source](https://github.com/loglayer/loglayer/tree/master/packages/transports/cribl-http)

## Installation

::: code-group
```bash [npm]
npm install loglayer @loglayer/transport-cribl-http serialize-error
```

```bash [pnpm]
pnpm add loglayer @loglayer/transport-cribl-http serialize-error
```

```bash [yarn]
yarn add loglayer @loglayer/transport-cribl-http serialize-error
```
:::

## Setup

You need a Cribl Stream instance with an [HTTP/S source](https://docs.cribl.io/stream/sources-https/) configured:

1. In Cribl Stream, add an **HTTP/S** source (Data > Sources > HTTP/S)
2. Configure the port (default: `10080`)
3. Optionally configure auth tokens in the source's Auth Tokens tab

Use the **HTTP** source URL from your Cribl sources list as the `url` value.

::: info Cribl Cloud Port Configuration
In Cribl Cloud, only specific ports are externally reachable:

- **Port 443** (mapped to internal port `10443`) — set your HTTP source port to `10443` to use this
- **Ports 20000–20010** — available for additional sources

Other ports (e.g., `10080`, `8084`) are **not externally accessible** on Cribl Cloud. See the [Cribl Cloud ports documentation](https://docs.cribl.io/reference-architectures/arch-cloud-ports/) for details.

**Recommended setup**: Set the HTTP source port to `10443`, then use:
```
https://default.main.<organizationId>.cribl.cloud/cribl/_bulk
```
:::

::: warning Node.js Unsafe Port Restriction
Node.js blocks `fetch` requests to certain ports (including `10080`) for security reasons. If you encounter a `TypeError: fetch failed` with `cause: Error: bad port`, you are hitting this restriction.

To avoid this, use port `443` (via internal port `10443`) or a port in the `20000–20010` range.
:::

## Basic Usage

```typescript
import { LogLayer } from 'loglayer'
import { CriblTransport } from "@loglayer/transport-cribl-http"
import { serializeError } from "serialize-error";

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: new CriblTransport({
    url: "https://your-cribl-instance:10080",
    token: "YOUR-AUTH-TOKEN",
    source: "my-app",
    host: "server-01",
    onError: (err) => {
      console.error('Failed to send logs to Cribl:', err);
    },
    onDebug: (entry) => {
      console.log('Log entry being sent to Cribl:', entry);
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

### Cribl Cloud

For Cribl Cloud instances, set the HTTP source port to `10443` and use:

```typescript
const log = new LogLayer({
  errorSerializer: serializeError,
  transport: new CriblTransport({
    url: "https://default.main.<organizationId>.cribl.cloud",
    token: "YOUR-AUTH-TOKEN",
  })
})
```

## Configuration

### Required Parameters

| Name | Type | Description |
|------|------|-------------|
| `url` | `string` | The Cribl Stream instance URL (e.g., `"https://your-cribl-instance"`) |

### Optional Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `token` | `string` | - | Auth token configured in the Cribl HTTP source. If omitted and the source has no tokens configured, unauthorized access is permitted |
| `source` | `string` | - | Source value for events |
| `host` | `string` | - | Host value for events |
| `messageField` | `string` | `"_raw"` | The field name used for the log message in the event payload |
| `timeField` | `string` | `"_time"` | The field name used for the timestamp in the event payload |
| `basePath` | `string` | `"/cribl"` | The base path for the Cribl HTTP event API. The endpoint will be `<basePath>/_bulk`. Configurable in the Cribl source under "Cribl HTTP event API" |
| `headers` | `Record<string, string>` | - | Custom headers to merge with default headers |
| `enabled` | `boolean` | `true` | Whether the transport is enabled |
| `level` | `"trace" \| "debug" \| "info" \| "warn" \| "error" \| "fatal"` | `"trace"` | Minimum log level to process. Logs below this level will be filtered out |

<!--@include: ./_partials/http-transport-options.md-->

For more details on these options, see the [HTTP transport documentation](/transports/http#configuration).
