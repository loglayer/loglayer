---
title: Wide Events Logging
description: Learn how to implement wide events for better observability using LogLayer
---

# Wide Events Logging

This guide shows how to implement [wide events](https://loggingsucks.com/)
using LogLayer's [Wide Events Mixin](/mixins/wide-events) (`@loglayer/mixin-wide-events`).
Instead of emitting many small log entries throughout your code, you accumulate
context into a single comprehensive event emitted at the end of each operation.

::: info Example Framework
This guide uses **Express** to demonstrate wide event logging. The same patterns
apply to any framework—Hono, Fastify, Elysia, Koa, etc.—just adapt the middleware.
:::

## Installation

First, install LogLayer, the wide events mixin, and Express:

::: code-group

```bash [npm]
npm install loglayer @loglayer/mixin-wide-events express
```

```bash [pnpm]
pnpm add loglayer @loglayer/mixin-wide-events express
```

```bash [yarn]
yarn add loglayer @loglayer/mixin-wide-events express
```

```bash [bun]
bun add loglayer @loglayer/mixin-wide-events express
```

:::

## Setup

### 1. Create the AsyncLocalStorage instance

```typescript
// async-local-storage.ts
import { AsyncLocalStorage } from "async_hooks";
import type { ILogLayer } from "loglayer";

export const asyncLocalStorage = new AsyncLocalStorage<{
  logger: ILogLayer;
}>();
```

### 2. Create logger helper

```typescript
// logger.ts
import { asyncLocalStorage } from "./async-local-storage.js";
import { LogLayer, ConsoleTransport, useLogLayerMixin } from "loglayer";
import { createWideEventMixin } from "@loglayer/mixin-wide-events";

// Register the mixin globally (once at startup)
useLogLayerMixin(createWideEventMixin({ asyncContext: asyncLocalStorage }));

// Create LogLayer
export const log = new LogLayer({
  transport: new ConsoleTransport({ logger: console }),
});

// Helper to get the request-specific logger
export function getLogger() {
  return asyncLocalStorage.getStore()?.logger ?? log;
}
```

### 3. Implement with Express

```typescript
// app.ts
import express from "express";
import { asyncLocalStorage, log, getLogger } from "./logger.js";

const app = express();
app.use(express.json());

// Middleware: Set up async context per request
app.use((req, res, next) => {
  req.id = (req.headers["x-request-id"] as string) || crypto.randomUUID();
  
  const logger = log.child().withContext({
    requestId: req.id,
    method: req.method,
    path: req.path,
    service: "my-service",
  });
  
  asyncLocalStorage.run({ logger }, next);
});

// Helper to add timing
function addTiming(operation: string, startTime: number) {
  getLogger().withWideEvents({
    [`${operation}Duration`]: Date.now() - startTime,
  });
}

// Example: Get user
async function getUser(userId: string) {
  const logger = getLogger();
  const startTime = Date.now();
  
  logger.debug("Fetching user");
  const user = { id: userId, name: "Alice", tier: "premium" };
  
  addTiming("getUser", startTime);
  logger.withContext({ userId: user.id }).debug("User fetched");
  
  return user;
}

// Example: Save order
async function saveOrder(order: { userId: string; items: string[] }) {
  const logger = getLogger();
  const startTime = Date.now();
  
  logger.withMetadata({ items: order.items }).debug("Saving order");
  const savedOrder = { ...order, id: "order-123", createdAt: new Date() };
  
  addTiming("saveOrder", startTime);
  logger.withContext({ orderId: savedOrder.id }).info("Order saved");
  
  return savedOrder;
}

// Route handler
app.post("/api/orders", async (req, res) => {
  const logger = getLogger();
  const { userId, items } = req.body as { userId: string; items?: string[] };
  const startTime = Date.now();

  logger
    .withMetadata({ userId, itemCount: items?.length ?? 0 })
    .info("Creating order");

  try {
    const user = await getUser(userId);
    logger.withWideEvents({ user: { id: user.id, tier: user.tier } });

    const order = await saveOrder({ userId, items: items ?? [] });
    logger.withWideEvents({ order: { id: order.id, itemCount: items?.length ?? 0 } });

    res.status(201).json(order);
  } catch (error) {
    logger.withError(error as Error).error("Order failed");
    res.status(500).json({ error: "Failed to create order" });
  }

  // Emit wide event on response finish
  res.on("finish", () => {
    logger.withWideEvents({
      duration: Date.now() - startTime,
      statusCode: res.statusCode,
      outcome: res.statusCode >= 400 ? "error" : "ok",
    });
    logger.emitWideEvent({ message: "Request completed" });
  });

  res.on("error", () => {
    logger.withWideEvents({
      duration: Date.now() - startTime,
      outcome: "error",
    });
    logger.emitWideEvent({ message: "Request failed", level: "error" });
  });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
```

## Run It

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "x-request-id: test-123" \
  -d '{"userId": "user-1", "items": ["widget", "gadget"]}'
```

## Output

The wide event accumulates all data throughout the request:

```json
{
  "level": "info",
  "time": "2026-05-26T03:42:57.070Z",
  "msg": "Request completed",
  "requestId": "test-123",
  "method": "POST",
  "path": "/api/orders",
  "service": "my-service",
  "userId": "user-1",
  "itemCount": 2,
  "user": { "id": "user-1", "tier": "premium" },
  "getUserDuration": 0,
  "saveOrderDuration": 0,
  "order": { "id": "order-123", "itemCount": 2 },
  "duration": 3,
  "statusCode": 201,
  "outcome": "ok"
}
```

## Related

- [Wide Events Mixin](/mixins/wide-events)
- [AsyncLocalStorage](/example-integrations/async-context)
- [Basic Logging](/logging-api/basic-logging)
- [Child Loggers](/logging-api/child-loggers)
- [Logging Sucks](https://loggingsucks.com/) - The original article
