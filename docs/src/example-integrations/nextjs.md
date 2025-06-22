---
title: Custom logging in Next.js
description: Learn how to implement LogLayer with Next.js
---

# Custom logging in Next.js

## Installation

This guide assumes you already have [Next.js](https://nextjs.org/) set up.

First, install the required packages. We'll use [Pino](/transports/pino) for production and [Simple Pretty Terminal](/transports/simple-pretty-terminal) for development:

::: code-group

```sh [npm]
npm i loglayer @loglayer/transport-pino @loglayer/transport-simple-pretty-terminal pino serialize-error
```

```sh [pnpm]
pnpm add loglayer @loglayer/transport-pino @loglayer/transport-simple-pretty-terminal pino serialize-error
```

```sh [yarn]
yarn add loglayer @loglayer/transport-pino @loglayer/transport-simple-pretty-terminal pino serialize-error
```
:::

## Setup

```typescript
// logger.ts
import { LogLayer } from 'loglayer'
import { PinoTransport } from '@loglayer/transport-pino'
import { getSimplePrettyTerminal } from '@loglayer/transport-simple-pretty-terminal'
import { serializeError } from 'serialize-error'
import { pino } from 'pino'

// Detect if we're on the server or client
const isServer = typeof window === 'undefined'

// Create a Pino instance (only needs to be done once)
const pinoLogger = pino({
  level: 'trace' // Set to desired log level
})

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: [
    // Simple Pretty Terminal for development
    getSimplePrettyTerminal({
      enabled: process.env.NODE_ENV === 'development',
      runtime: isServer ? 'node' : 'browser',
      viewMode: 'inline',
    }),
    // Pino for production (both server and client)
    new PinoTransport({
      enabled: process.env.NODE_ENV === 'production',
      logger: pinoLogger
    })
  ]
})

export function getLogger() {
  return log;
}
```

We expose a function called `getLogger()` to get the logger instance. We do this in the event that you want to mock the logger
in your tests, where you can override `getLogger()` to return the LogLayer mock, [MockLogLayer](/logging-api/unit-testing).

At this point you should be able to call `getLogger()` anywhere in your Next.js app to get the logger instance and write logs.

```typescript
// pages.tsx

import { getLogger } from './logger'

export default function Page() {
  const log = getLogger()

  log.withMetadata({
    some: "data"
  }).info('Hello, world!')

  return <div>Hello, world!</div>
}
```

## Distinguish between server and client logs

If you use transports that are only client-side or server-side (such as the [DataDog](/transports/datadog) and [DataDog Browser](/transports/datadog-browser-logs) Transports), you can conditionally enable them based on the environment.

Add a const to detect if the code is running on the server or client:

```typescript
const isServer = typeof window === 'undefined'
```

Modify your transport to run only on the server:

```typescript
const isServer = typeof window === 'undefined'

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: [
    // Simple Pretty Terminal for development
    getSimplePrettyTerminal({
      enabled: process.env.NODE_ENV === 'development',
      runtime: isServer ? 'node' : 'browser',
      viewMode: 'inline',
    }),
    // Pino for production (both server and client)
    new PinoTransport({
      enabled: process.env.NODE_ENV === 'production',
      logger: pinoLogger
    })
  ],
  plugins: [
    {
      // Add a plugin to label the log entry as coming from the server or client
      onBeforeMessageOut(params: PluginBeforeMessageOutParams) {
        const tag = isServer ? "Server" : "Client";

        if (params.messages && params.messages.length > 0) {
          if (typeof params.messages[0] === "string") {
            params.messages[0] = `[${tag}] ${params.messages[0]}`;
          }
        }

        return params.messages;
      },
    },
  ]
})

// Can also add to context data too; would be stamped on every log entry
log.withContext({
  isServer
})
```

## Handling server-side uncaught exceptions and rejections

Next.js [does not](https://github.com/vercel/next.js/discussions/63787) have a way to use a custom logger for server-side uncaught exceptions and rejections.

To use LogLayer for this, you will need to create an [instrumentation file](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation) in the root of your project.

Here's an example using the [Simple Pretty Terminal](/transports/simple-pretty-terminal), [Pino](/transports/pino), and [DataDog](/transports/datadog) transports:

```typescript
// instrumentation.ts
import { LogLayer, type ILogLayer } from 'loglayer';
import { DataDogTransport } from "@loglayer/transport-datadog";
import { PinoTransport } from "@loglayer/transport-pino";
import { getSimplePrettyTerminal } from '@loglayer/transport-simple-pretty-terminal';
import pino from "pino";
import { serializeError } from "serialize-error";

/**
 * Strip ANSI codes from a string, which is something Next.js likes to inject.
 */
function stripAnsiCodes(str: string): string {
  return str.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    "",
  );
}

/**
 * Create a console method that logs to LogLayer
 */
function createConsoleMethod(log: ILogLayer, method: "error" | "info" | "warn" | "debug" | "log") {
  let mappedMethod: "error" | "info" | "warn" | "debug";

  if (method === "log") {
    mappedMethod = "info";
  } else {
    mappedMethod = method;
  }

  return (...args: unknown[]) => {
    const data: Record<string, unknown> = {};
    let hasData = false;
    let error: Error | null = null;
    const messages: string[] = [];

    for (const arg of args) {
      if (arg instanceof Error) {
        error = arg;
        continue;
      }

      if (typeof arg === "object" && arg !== null) {
        Object.assign(data, arg);
        hasData = true;
        continue;
      }

      if (typeof arg === "string") {
        messages.push(arg);
      }
    }

    let finalMessage = stripAnsiCodes(messages.join(" ")).trim();

    // next.js uses an "x" for the error message when it's an error object
    if (finalMessage === "⨯" && error) {
      finalMessage = error?.message || "";
    }

    if (error && hasData && messages.length > 0) {
      log.withError(error).withMetadata(data)[mappedMethod](finalMessage);
    } else if (error && messages.length > 0) {
      log.withError(error)[mappedMethod](finalMessage);
    } else if (hasData && messages.length > 0) {
      log.withMetadata(data)[mappedMethod](finalMessage);
    } else if (error && hasData && messages.length === 0) {
      log.withError(error).withMetadata(data)[mappedMethod]("");
    } else if (error && messages.length === 0) {
      log.errorOnly(error);
    } else if (hasData && messages.length === 0) {
      log.metadataOnly(data);
    } else {
      log[mappedMethod](finalMessage);
    }
  };
}

export async function register() {
  const logger = new LogLayer({
    errorSerializer: serializeError,
    transport: [
      // Simple Pretty Terminal for development
      getSimplePrettyTerminal({
        enabled: process.env.NODE_ENV === 'development',
        runtime: 'node', // Server-side only in instrumentation
        viewMode: 'inline',
      }),
      // Pino for production
      new PinoTransport({
        enabled: process.env.NODE_ENV === 'production',
        logger: pino(),
      }),
      new DataDogTransport({
        enabled: process.env.NODE_ENV === 'production'
      ...
      }),
    ]
  })
 
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.error = createConsoleMethod(logger, "error");
    console.log = createConsoleMethod(logger, "log");
    console.info = createConsoleMethod(logger, "info");
    console.warn = createConsoleMethod(logger, "warn");
    console.debug = createConsoleMethod(logger, "debug");
  }
}
```

If you threw an error from `page.tsx` that is uncaught, you should see this in the terminal:

```json lines
{"err":{"type":"Object","message":"test","stack":"Error: test\n    at Page (webpack-internal:///(rsc)/./src/app/page.tsx:12:11)","digest":"699232626","name":"Error"},"msg":"test"}
```