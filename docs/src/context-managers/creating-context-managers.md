---
title: Creating a Context Manager
description: Learn how to create a custom context manager for LogLayer
---

# Creating Context Managers

::: warning
LogLayer is a synchronous library, so context managers must perform synchronous operations only. 

Integrations that use promises, callbacks, or other asynchronous patterns to set and fetch context data
is not supported / recommended unless you are making those calls out-of-band for other reasons.
:::

## The IContextManager Interface

To create a custom context manager, you'll first need to install the base package:

::: code-group
```bash [npm]
npm install @loglayer/context-manager
```

```bash [yarn]
yarn add @loglayer/context-manager
```

```bash [pnpm]
pnpm add @loglayer/context-manager
```
:::

Then implement the `IContextManager` interface:

```typescript
import type { IContextManager, ILogLayer } from '@loglayer/context-manager';

interface OnChildLoggerCreatedParams {
  /**
   * The parent logger instance
   */
  parentLogger: ILogLayer;
  /**
   * The child logger instance
   */
  childLogger: ILogLayer;
  /**
   * The parent logger's context manager
   */
  parentContextManager: IContextManager;
  /**
   * The child logger's context manager
   */
  childContextManager: IContextManager;
}

interface IContextManager {
  // Sets the context data. Set to undefined to clear the context.
  setContext(context?: Record<string, any>): void;
  
  // Appends context data to existing context
  appendContext(context: Record<string, any>): void;
  
  // Returns the current context data
  getContext(): Record<string, any>;
  
  // Returns true if there is context data present
  hasContextData(): boolean;
  
  // Called when a child logger is created
  onChildLoggerCreated(params: OnChildLoggerCreatedParams): void;
  
  // Creates a new instance with the same context data
  clone(): IContextManager;
}
```

## Context Manager Lifecycle

When using a context manager with a LogLayer logger instance:

- When the logger is first created, the [Default Context Manager](/context-managers/default) is automatically is attached to it
- The context manager is attached to a logger using [`withContextManager()`](/context-managers/#using-a-custom-context-manager)
  - If the existing context manager implements [`Disposable`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html#using-declarations-and-explicit-resource-management), it will be called to clean up resources
- When `withContext()` is called on the logger it calls `appendContext()` on the context manager
- When a child logger is created:
  - `clone()` is called on the parent's context manager and the cloned context manager is attached to the child logger
  - `onChildLoggerCreated()` is called on the parent's context manager
- When LogLayer needs to obtain context data, it first calls `hasContextData()` to check if context is present, then calls `getContext()` to get the context data if it is.


## Resource Cleanup with Disposable

If your context manager needs to clean up resources (like file handles, memory, or external connections), 
you can implement the [`Disposable`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html#using-declarations-and-explicit-resource-management) interface. 

LogLayer will automatically call the dispose method when the context manager is replaced using `withContextManager()` if defined.

### Implementing Disposable

To make your context manager disposable:

1. Add `Disposable` to your class implementation
2. Implement the `[Symbol.dispose]()` method
3. Add a flag to track the disposed state
4. Guard your methods against calls after disposal

Here's an example:

```typescript
export class MyContextManager implements IContextManager, Disposable {
  private isDisposed = false;
  private hasContext = false;
  private someResource: any;

  // ... other methods ...
  hasContextData(): boolean {
    if (this.isDisposed) return false;
    return this.hasContext;
  }

  setContext(context?: Record<string, any>): void {
    if (this.isDisposed) return;
    // Implementation
  }

  getContext(): Record<string, any> {
    if (this.isDisposed) return {};
    return this.context;
  }

  [Symbol.dispose](): void {
    if (this.isDisposed) return;
    
    // Clean up resources
    this.someResource?.close();
    this.context = {};
    this.isDisposed = true;
  }
}
```

:::tip
Always implement `Disposable` if your context manager holds onto resources that need cleanup. This ensures proper resource management and prevents memory leaks.
:::


## Example Implementation

Here's an example of a simple file-based context manager that saves context to a file.

::: warning Don't try this at home
This example is for educational purposes only and will have a significant performance impact and has possible race conditions in actual usage.
:::

```typescript
import { openSync, closeSync, readSync, writeSync, fstatSync } from 'node:fs';
import type { IContextManager, OnChildLoggerCreatedParams } from '@loglayer/context-manager';

/**
 * Example context manager that persists context to a file using a file handle.
 * Implements both IContextManager for context management and Disposable for cleanup.
 * 
 * This example demonstrates proper resource cleanup by maintaining an open file handle
 * that needs to be properly closed when the context manager is disposed.
 */
export class FileContextManager implements IContextManager, Disposable {
  // In-memory storage of context data
  private context: Record<string, any> = {};
  // Flag to track if we have any context data
  private hasContext = false;
  // Path to the file where context is persisted
  private filePath: string;
  // File handle for persistent storage
  private fileHandle: number | null = null;
  // Flag to track if this manager has been disposed
  private isDisposed = false;

  constructor(filePath: string) {
    this.filePath = filePath;
    // Open file handle in read/write mode, create if doesn't exist
    try {
      this.fileHandle = openSync(filePath, 'a+');
      this.loadContext();
    } catch (err) {
      // Handle error gracefully - continue with empty context
      this.context = {};
      this.hasContext = false;
    }
  }

  /**
   * Loads context from the file system into memory using the file handle.
   * Called during initialization and after file changes.
   */
  private loadContext() {
    if (this.isDisposed || this.fileHandle === null) return;
    
    try {
      // Get file size
      const stats = fstatSync(this.fileHandle);
      if (stats.size === 0) {
        this.context = {};
        this.hasContext = false;
        return;
      }

      // Read entire file content
      const buffer = Buffer.alloc(stats.size);
      readSync(this.fileHandle, buffer, 0, stats.size, 0);
      
      // Parse content
      const data = buffer.toString('utf8');
      this.context = JSON.parse(data);
      this.hasContext = Object.keys(this.context).length > 0;
    } catch (err) {
      // Handle error gracefully - initialize empty context
      this.context = {};
      this.hasContext = false;
    }
  }

  /**
   * Persists the current in-memory context to the file system using the file handle.
   * Called after any context modifications.
   */
  private saveContext() {
    if (this.isDisposed || this.fileHandle === null) return;
    
    try {
      const data = JSON.stringify(this.context);
      const buffer = Buffer.from(data);
      
      // Truncate file first
      writeSync(this.fileHandle, buffer, 0, buffer.length, 0);
    } catch (err) {
      // Handle error gracefully - continue with in-memory context
    }
  }

  /**
   * Sets the entire context, replacing any existing context.
   * Passing undefined clears the context.
   */
  setContext(context?: Record<string, any>): void {
    if (this.isDisposed) return;
    
    if (!context) {
      this.context = {};
      this.hasContext = false;
    } else {
      this.context = { ...context };
      this.hasContext = true;
    }
    this.saveContext();
  }

  /**
   * Merges new context data with existing context.
   * Any matching keys will be overwritten with new values.
   */
  appendContext(context: Record<string, any>): void {
    if (this.isDisposed) return;
    
    this.context = { ...this.context, ...context };
    this.hasContext = true;
    this.saveContext();
  }

  /**
   * Returns the current context data.
   * Returns empty object if disposed.
   */
  getContext(): Record<string, any> {
    if (this.isDisposed) return {};
    return this.context;
  }

  /**
   * Checks if there is any context data present.
   * Returns false if disposed.
   */
  hasContextData(): boolean {
    if (this.isDisposed) return false;
    return this.hasContext;
  }

  /**
   * Called when a child logger is created to handle context inheritance.
   * Copies parent context to child if parent has context data.
   */
  onChildLoggerCreated({ parentContextManager, childContextManager }: OnChildLoggerCreatedParams): void {
    if (this.isDisposed) return;
    
    // Copy parent context to child if parent has context
    if (parentContextManager.hasContextData()) {
      const parentContext = parentContextManager.getContext();
      childContextManager.setContext({ ...parentContext });
    }
  }

  /**
   * Creates a new instance with a copy of the current context.
   * Note: This implementation most likely has issues since the same file is being manipulated.
   * This could potentially introduce a race condition when this method is called via child()
   */
  clone(): IContextManager {
    return new FileContextManager(this.filePath);
  }

  /**
   * Implements the Disposable interface for cleanup.
   * Properly closes the file handle and cleans up memory resources.
   * This is critical to prevent file handle leaks in the operating system.
   */
  [Symbol.dispose](): void {
    if (this.isDisposed) return;
    
    // Clean up in-memory resources
    this.context = {};
    this.hasContext = false;
    
    // Close the file handle if it's open
    if (this.fileHandle !== null) {
      try {
        closeSync(this.fileHandle);
      } catch (err) {
        // Handle cleanup error gracefully
      }
      this.fileHandle = null;
    }
    
    this.isDisposed = true;
  }
}
```

You can use this context manager like this:

```typescript
import { LogLayer } from 'loglayer';
import { FileContextManager } from './FileContextManager';

// The context manager will maintain an open file handle until disposed
const logger = new LogLayer()
  .withContextManager(new FileContextManager('./context.json'));

logger.withContext({ user: 'alice' });
logger.info('User logged in'); // Will include { user: 'alice' } in context
```

## Best Practices

When implementing a context manager:

- Make all operations synchronous
- Handle errors gracefully without throwing exceptions
- Implement proper cleanup in stateful context managers with `Disposable`
