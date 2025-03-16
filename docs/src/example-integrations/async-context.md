---
title: Using LogLayer with Async Local Storage / Async hooks
description: Learn how to implement LogLayer across async contexts
---

# Asynchronous context tracking with LogLayer

This document will explain how to use LogLayer across async contexts using [`AsyncLocalStorage`](https://nodejs.org/api/async_context.html#class-asynclocalstorage).

## Why use `AsyncLocalStorage`?

Trevor Lasn in his article, [AsyncLocalStorage: Simplify Context Management in Node.js
](https://www.trevorlasn.com/blog/node-async-local-storage), says it best:

*AsyncLocalStorage gives you a way to maintain context across your async operations without manually passing data through every function. Think of it like having a secret storage box that follows your request around, carrying important information that any part of your code can access.*

### Addresses context tracking hell

Like how promises addressed [callback hell](https://medium.com/@raihan_tazdid/callback-hell-in-javascript-all-you-need-to-know-296f7f5d3c1), 
`AsyncLocalStorage` addresses the problem of context tracking hell:

```typescript
// An example of context management hell using express

async function myExternalFunction(log: ILogLayer) {
  log.info('Doing something')

  // need to pass that logger down
  await someNestedFunction(log)
}

async function someNestedFunction(log: ILogLayer) {
  log.info('Doing something else')
}

// Define logging middleware
app.use((req, res, next) => {
  // Create a new LogLayer instance for each request
  req.log = new LogLayer()
  next()
})

// Use the logger in your routes
app.get('/', async (req, res) => {
  req.log.info('Processing request to root endpoint')

  // You have to pass in the logger here
  await myExternalFunction(req.log)
  
  res.send('Hello World!')
})
```

- In the above example, we have to pass the `log` (or a context) object to every function that needs it. This can lead to a lot of boilerplate code.
- Using `AsyncLocalStorage`, we can avoid this and make our code cleaner.

## Do not use async hooks

You may have heard of async hooks for addressing this problem, but it has been superseded by async local storage.

The documentation for [async hooks](https://nodejs.org/api/async_hooks.html) has it in an experimental state for years,
citing that it has "usability issues, safety risks, and performance implications", and to instead use `AsyncLocalStorage`.

## Integration with `AsyncLocalStorage`

The following example has been tested to work. It uses the [`express`](./express) framework, but you can use the `async-local-storage.ts` and `logger.ts` code for any other framework.

### Create a file for the `AsyncLocalStorage` instance

```typescript
// async-local-storage.ts
import { AsyncLocalStorage } from "node:async_hooks";
import type { ILogLayer } from "loglayer";

export const asyncLocalStorage = new AsyncLocalStorage<{ logger: ILogLayer }>();
```

### Create a file to get the logger instance from the storage

```typescript
// logger.ts
import { asyncLocalStorage } from "./async-local-storage";
import { ConsoleTransport, LogLayer } from "loglayer";
import type { ILogLayer } from "loglayer";

export function createLogger() {
  return new LogLayer({
    transport: new ConsoleTransport({
      logger: console,
    }),
  })
}

// Create a default logger for non-request contexts
const defaultLogger = createLogger();

export function getLogger(): ILogLayer {
  const store = asyncLocalStorage.getStore();

  if (!store) {
    // Use non-request specific logger
    // Remove these console logs once you're convinced it works
    console.log("using non-async local storage logger");
    return defaultLogger;
  }

  console.log("Using async local storage logger");
  
  return store.logger;
}
```

### Register the logger per-request to the storage

```typescript
// app.ts
import express from 'express';
import { asyncLocalStorage } from "./async-local-storage";
import { getLogger, createLogger } from "./logger";
import type { ILogLayer } from "loglayer";

// Extend Express Request type to include log property
declare global {
  namespace Express {
    interface Request {
      log: ILogLayer;
    }
  }
}

// Initialize Express app
const app = express();

// no need to pass in the logger now that we can use async local storage
async function myExternalFunction() {
  // Will use the request-specific logger if being called
  // from the context of a request
  getLogger().info('Doing something')
  await someNestedFunction()
}

async function someNestedFunction() {
  getLogger().info('Doing something else')
}

// Define logging middleware
app.use((req, res, next) => {
  const logger = createLogger()
  req.log = logger;
  
  // Stores the request-specific logger into storage
  asyncLocalStorage.run({ logger }, next);
})

// Use the logger in your routes
app.get('/', async (req, res) => {
  // You can also use getLogger() instead
  req.log.info('Processing request to root endpoint')

  await myExternalFunction()
  
  res.send('Hello World!')
})

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

### Output

```
Processing request to root endpoint
Using async local storage logger
Doing something
Using async local storage logger
Doing something else
```