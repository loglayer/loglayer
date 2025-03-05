---
title: Context Managers
description: Learn how to create and use context managers with LogLayer
---

# Context Managers

*New in LogLayer v6*.

Context managers in LogLayer are responsible for managing contextual data that gets included with log entries. They provide a way to store and retrieve context data that will be automatically included with every log message.

::: tip Do you need to specify a context manager?
Context managers are an advanced feature of LogLayer. 

Unless you need to manage context data in a specific way, you can use the default context manager, which is already automatically used when creating a new LogLayer instance.
:::

<!--@include: ./_partials/context-manager-list.md-->

## Context Manager Management

### Using a custom context manager

You can set a custom context manager using the `withContextManager()` method.

Example usage:

```typescript
import { MyCustomContextManager } from './MyCustomContextManager';

const logger = new LogLayer()
  .withContextManager(new MyCustomContextManager());
```

::: tip
Use the `withContextManager()` method right after creating the LogLayer instance. Using it after the context has
already been set will drop the existing context data.
:::

### Obtaining the current context manager

You can get the current context manager instance using the `getContextManager()` method:

```typescript
const contextManager = logger.getContextManager();
```

You can also type the return value when getting a specific context manager implementation:

```typescript
const linkedContextManager = logger.getContextManager<LinkedContextManager>();
```