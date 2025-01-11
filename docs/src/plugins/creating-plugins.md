---
title: Creating LogLayer Plugins
description: Learn how to create custom plugins for LogLayer
---

# Creating Plugins

## Overview

A plugin is a plain object that implements the `LogLayerPlugin` interface from `@loglayer/plugin` or `loglayer`:

```typescript
interface LogLayerPlugin {
  /**
   * Unique identifier for the plugin. Used for selectively disabling / enabling
   * and removing the plugin.
   */
  id?: string;
  
  /**
   * If true, the plugin will skip execution
   */
  disabled?: boolean;
  
  /**
   * Called after the assembly of the data object that contains
   * metadata / context / error data before being sent to the logging library.
   */
  onBeforeDataOut?(params: PluginBeforeDataOutParams): Record<string, any> | null | undefined;
  
  /**
   * Called to modify message data before it is sent to the logging library.
   */
  onBeforeMessageOut?(params: PluginBeforeMessageOutParams): MessageDataType[];
  
  /**
   * Controls whether the log entry should be sent to the logging library.
   */
  shouldSendToLogger?(params: PluginShouldSendToLoggerParams): boolean;
  
  /**
   * Called when withMetadata() or metadataOnly() is called.
   */
  onMetadataCalled?(metadata: Record<string, any>): Record<string, any> | null | undefined;
}
```

## In-Project

If you want to quickly write a plugin for your own project, you can use the `loglayer` package to get the Typescript types for 
the plugin interface.

### Example

```typescript
import { LogLayer, ConsoleTransport } from 'loglayer'
import type { LogLayerPlugin, PluginBeforeMessageOutParams } from 'loglayer'

// Create a timestamp plugin
const timestampPlugin: LogLayerPlugin = {
  onBeforeMessageOut: ({ messages }: PluginBeforeMessageOutParams): string[] => {
    // Add timestamp prefix to each message
    return messages.map(msg => `[${new Date().toISOString()}] ${msg}`)
  }
}

// Create LogLayer instance with console transport and timestamp plugin
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  }),
  plugins: [timestampPlugin]
})

// Usage example
log.info('Hello world!') // Output: [2024-01-17T12:34:56.789Z] Hello world!
```

## As an NPM Package

If you're creating an npm package, you should use the `@loglayer/plugin` package to get the Typescript types for the plugin interface
instead of making `loglayer` a dependency.

::: info
We recommend it as a `dependency` and not a `devDependency` as `@loglayer/plugin` may not be types-only in the future.
:::

### Installation

::: code-group

```sh [npm]
npm install @loglayer/plugin
```

```sh [pnpm]
pnpm add @loglayer/plugin
```

```sh [yarn]
yarn add @loglayer/plugin
```

:::

### Example

```typescript
import type { LogLayerPlugin, PluginBeforeMessageOutParams, LogLayerPluginParams } from '@loglayer/plugin'

// LogLayerPluginParams provides the common options for the plugin
export interface TimestampPluginOptions extends LogLayerPluginParams {
  /**
   * Format of the timestamp. If not provided, uses ISO string
   */
  format?: 'iso' | 'locale'
}

export const createTimestampPlugin = (options: TimestampPluginOptions = {}): LogLayerPlugin => {
  return {
    // Copy over the common options
    id: options.id,
    disabled: options.disabled,
    // Implement the onBeforeMessageOut lifecycle method
    onBeforeMessageOut: ({ messages }: PluginBeforeMessageOutParams): string[] => {
      const timestamp = options.format === 'locale' 
        ? new Date().toLocaleString()
        : new Date().toISOString()
      
      return messages.map(msg => `[${timestamp}] ${msg}`)
    }
  }
}
```

## Plugin Lifecycle Methods

### onBeforeDataOut

Allows you to modify or transform the data object containing metadata, context, and error information before it's sent to the logging library. This is useful for adding additional fields, transforming data formats, or filtering sensitive information.

**Method Signature:**
```typescript
onBeforeDataOut?(params: PluginBeforeDataOutParams): Record<string, any> | null | undefined
```

**Parameters:**
```typescript
interface PluginBeforeDataOutParams {
  data?: Record<string, any>;  // The object containing metadata / context / error data
  logLevel: LogLevel;          // Log level of the data
}
```

**Example:**
```typescript
const dataEnrichmentPlugin = {
  onBeforeDataOut: ({ data, logLevel }) => {
    return {
      ...(data || {}),
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      logLevel
    }
  }
}
```

### onBeforeMessageOut

Allows you to modify or transform the message content before it's sent to the logging library. This is useful for adding prefixes, formatting messages, or transforming message content.

**Method Signature:**
```typescript
onBeforeMessageOut?(params: PluginBeforeMessageOutParams): MessageDataType[]
```

**Parameters:**
```typescript
interface PluginBeforeMessageOutParams {
  messages: any[];    // Message data that is copied from the original
  logLevel: LogLevel; // Log level of the message
}
```

**Example:**
```typescript
const messageFormatterPlugin = {
  onBeforeMessageOut: ({ messages, logLevel }) => {
    return messages.map(msg => `[${logLevel.toUpperCase()}][${new Date().toISOString()}] ${msg}`)
  }
}
```

### shouldSendToLogger

Controls whether a log entry should be sent to the logging library. This is useful for implementing log filtering, rate limiting, or environment-specific logging.

**Method Signature:**
```typescript
shouldSendToLogger?(params: PluginShouldSendToLoggerParams): boolean
```

**Parameters:**
```typescript
interface PluginShouldSendToLoggerParams {
  transportId?: string;        // ID of the transport that will send the log
  messages: any[];              // Message data that is copied from the original
  logLevel: LogLevel;          // Log level of the message
  data?: Record<string, any>;  // The object containing metadata / context / error data
}
```

**Example:**
```typescript
const productionFilterPlugin = {
  shouldSendToLogger: ({ logLevel, data }) => {
    // Filter out debug logs in production
    if (process.env.NODE_ENV === 'production') {
      return logLevel !== 'debug'
    }
    // Rate limit error logs
    if (logLevel === 'error') {
      return !isRateLimited('error-logs')
    }
    return true
  }
}
```

**Example:**
```typescript

const productionFilterPlugin = {
  shouldSendToLogger: ({ transportId, logLevel, data }) => {
    // don't send logs if the transportId is 'console'
    if (transportId === 'console') {
      return false
    }
    
    return true
  }
}
```

### onMetadataCalled

Intercepts and modifies metadata when `withMetadata()` or `metadataOnly()` is called. This is useful for transforming or enriching metadata before it's attached to logs.

**Method Signature:**
```typescript
onMetadataCalled?(metadata: Record<string, any>): Record<string, any> | null | undefined
```

**Parameters:**
- `metadata`: Record<string, any> - The metadata object being added

**Example:**
```typescript
const metadataEnrichmentPlugin = {
  id: 'metadata-enrichment',
  onMetadataCalled: (metadata) => {
    return {
      ...metadata,
      enrichedAt: new Date().toISOString(),
      userId: getCurrentUser()?.id
    }
  }
}
```

## Boilerplate / Template Code

A sample project that you can use as a template is provided here:

[GitHub Boilerplate Template](https://github.com/loglayer/loglayer-plugin-boilerplate)
