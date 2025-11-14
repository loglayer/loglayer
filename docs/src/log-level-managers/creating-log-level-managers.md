---
title: Creating a Log Level Manager
description: Learn how to create a custom log level manager for LogLayer
---

# Creating Log Level Managers

## Installation

To create a custom log level manager, you'll first need to install the base package:

::: code-group
```bash [npm]
npm install @loglayer/log-level-manager
```

```bash [yarn]
yarn add @loglayer/log-level-manager
```

```bash [pnpm]
pnpm add @loglayer/log-level-manager
```
:::

## Understanding Log Level Hierarchy

::: warning Log Level Hierarchy
Log level managers must follow the [log level hierarchy](/logging-api/adjusting-log-levels#log-level-hierarchy) described in the Adjusting Log Levels documentation. The hierarchy defines the priority of log levels, with lower numeric values indicating higher priority.

You can import `LogLevel`, `LogLevelPriority`, and `LogLevelPriorityToNames` from `@loglayer/log-level-manager` to work with the hierarchy in your implementation.
:::

### Log Level Priority Table

The following table shows the log level hierarchy with their priority values:

| Log Level | Priority Value | Description |
|-----------|----------------|-------------|
| `trace` | 10 | Lowest priority, most verbose |
| `debug` | 20 | Debug information |
| `info` | 30 | Informational messages |
| `warn` | 40 | Warning messages |
| `error` | 50 | Error messages |
| `fatal` | 60 | Highest priority, most critical |

::: tip Understanding Priority Values
When setting a log level, all levels with priority **greater than or equal to** the set level are enabled. For example, if you set the level to `warn` (priority 40), all levels with priority >= 40 (warn, error, fatal) will be enabled, and all levels with priority < 40 (trace, debug, info) will be disabled.
:::

### Log Level Priority Mappings

The `LogLevelPriority` mapping provides numeric values for each log level. Note that in the code, higher numeric values indicate higher priority (fatal=60 is highest, trace=10 is lowest):

```typescript
import { LogLevelPriority } from '@loglayer/log-level-manager';

// LogLevelPriority structure:
{
  [LogLevel.trace]: 10,
  [LogLevel.debug]: 20,
  [LogLevel.info]: 30,
  [LogLevel.warn]: 40,
  [LogLevel.error]: 50,
  [LogLevel.fatal]: 60,
}
```

The `LogLevelPriorityToNames` mapping provides the reverse lookup, mapping numeric values back to log level names:

```typescript
import { LogLevelPriorityToNames } from '@loglayer/log-level-manager';

// LogLevelPriorityToNames structure:
{
  10: LogLevel.trace,
  20: LogLevel.debug,
  30: LogLevel.info,
  40: LogLevel.warn,
  50: LogLevel.error,
  60: LogLevel.fatal,
}
```

When implementing `setLevel()`, you'll typically use `LogLevelPriority` to determine which levels should be enabled based on the hierarchy. For example, if you set the level to `warn` (priority 40), all levels with priority >= 40 (warn, error, fatal) should be enabled, and all levels with priority < 40 (trace, debug, info) should be disabled.

## The ILogLevelManager Interface

Then implement the `ILogLevelManager` interface:

```typescript
import type { ILogLevelManager, ILogLayer, LogLevelType, OnChildLogLevelManagerCreatedParams } from '@loglayer/log-level-manager';
import { LogLevel, LogLevelPriority } from '@loglayer/log-level-manager';

interface ILogLevelManager {
  /**
   * Sets the minimum log level to be used by the logger.
   * 
   * **When triggered:** Called when `logger.setLevel()` is invoked on a LogLayer instance.
   */
  setLevel(logLevel: LogLevelType): void;
  
  /**
   * Enables a specific log level.
   * 
   * **When triggered:** Called when `logger.enableIndividualLevel()` is invoked on a LogLayer instance.
   */
  enableIndividualLevel(logLevel: LogLevelType): void;
  
  /**
   * Disables a specific log level.
   * 
   * **When triggered:** Called when `logger.disableIndividualLevel()` is invoked on a LogLayer instance.
   */
  disableIndividualLevel(logLevel: LogLevelType): void;
  
  /**
   * Checks if a specific log level is enabled.
   * 
   * **When triggered:** Called before every log method execution (e.g., `info()`, `warn()`, `error()`, `debug()`, `trace()`, `fatal()`, `raw()`, `metadataOnly()`, `errorOnly()`) to determine if the log should be processed. Also called when `logger.isLevelEnabled()` is invoked directly.
   */
  isLevelEnabled(logLevel: LogLevelType): boolean;
  
  /**
   * Enable sending logs to the logging library.
   * 
   * **When triggered:** Called when `logger.enableLogging()` is invoked on a LogLayer instance.
   */
  enableLogging(): void;
  
  /**
   * All logging inputs are dropped and stops sending logs to the logging library.
   * 
   * **When triggered:** Called when `logger.disableLogging()` is invoked on a LogLayer instance, or when a LogLayer instance is created with `enabled: false` in the configuration.
   */
  disableLogging(): void;
  
  /**
   * Called when a child logger is created. Use to manipulate log level settings between parent and child.
   * 
   * **When triggered:** Called automatically when `logger.child()` is invoked, after the child logger is created and the parent's log level manager has been cloned. This allows the manager to establish relationships between parent and child loggers.
   */
  onChildLoggerCreated(params: OnChildLogLevelManagerCreatedParams): void;
  
  /**
   * Creates a new instance of the log level manager with the same log level settings.
   * 
   * **When triggered:** Called automatically when `logger.child()` is invoked to create a new log level manager instance for the child logger. The cloned instance should have the same initial log level state as the parent, but can be modified independently (unless the manager implements shared state behavior).
   */
  clone(): ILogLevelManager;
}
```

## Log Level Manager Lifecycle

When using a log level manager with a LogLayer logger instance:

1. The log level manager is initialized when the logger is created (or when `withLogLevelManager()` is called)
2. When a child logger is created via `child()`, the parent's log level manager is cloned
3. The `onChildLoggerCreated()` method is called to allow the manager to set up relationships between parent and child
4. Log level changes are managed through the manager's methods

## Example Implementation

Here's an example of an isolated log level manager where children do not inherit log levels from their parent:

```typescript
import type { ILogLevelManager, LogLevelType, OnChildLogLevelManagerCreatedParams } from '@loglayer/log-level-manager';
import { LogLevel, LogLevelPriority } from '@loglayer/log-level-manager';

interface LogLevelEnabledStatus {
  info: boolean;
  warn: boolean;
  error: boolean;
  debug: boolean;
  trace: boolean;
  fatal: boolean;
}

export class IsolatedLogLevelManager implements ILogLevelManager {
  // Track which log levels are enabled for this logger instance
  private logLevelEnabledStatus: LogLevelEnabledStatus = {
    info: true,
    warn: true,
    error: true,
    debug: true,
    trace: true,
    fatal: true,
  };

  /**
   * Sets the minimum log level. All levels at or above this level will be enabled,
   * and all levels below will be disabled.
   * 
   * For example, setting to LogLevel.warn will enable warn, error, and fatal,
   * but disable trace, debug, and info.
   */
  setLevel(logLevel: LogLevelType): void {
    // Get the numeric priority value for the specified log level
    // Lower values = higher priority (fatal=10, error=20, warn=30, etc.)
    const minLogValue = LogLevelPriority[logLevel as LogLevel];

    // Iterate through all log levels and enable/disable based on hierarchy
    for (const level of Object.values(LogLevel)) {
      const levelKey = level as keyof LogLevelEnabledStatus;
      const levelValue = LogLevelPriority[level];

      // Enable if the level's priority is >= the minimum (higher or equal priority)
      // Disable if the level's priority is < the minimum (lower priority)
      this.logLevelEnabledStatus[levelKey] = levelValue >= minLogValue;
    }
  }

  /**
   * Enables a specific log level, regardless of the hierarchy.
   * This allows fine-grained control over individual levels.
   */
  enableIndividualLevel(logLevel: LogLevelType): void {
    const level = logLevel as keyof LogLevelEnabledStatus;
    if (level in this.logLevelEnabledStatus) {
      this.logLevelEnabledStatus[level] = true;
    }
  }

  /**
   * Disables a specific log level, regardless of the hierarchy.
   * This allows fine-grained control over individual levels.
   */
  disableIndividualLevel(logLevel: LogLevelType): void {
    const level = logLevel as keyof LogLevelEnabledStatus;
    if (level in this.logLevelEnabledStatus) {
      this.logLevelEnabledStatus[level] = false;
    }
  }

  /**
   * Checks if a specific log level is currently enabled.
   * This is called before every log operation to determine if the log should be processed.
   */
  isLevelEnabled(logLevel: LogLevelType): boolean {
    const level = logLevel as keyof LogLevelEnabledStatus;
    return this.logLevelEnabledStatus[level];
  }

  /**
   * Enables all log levels. This allows all logs to be processed regardless of level.
   */
  enableLogging(): void {
    for (const level of Object.keys(this.logLevelEnabledStatus)) {
      this.logLevelEnabledStatus[level as keyof LogLevelEnabledStatus] = true;
    }
  }

  /**
   * Disables all log levels. This prevents all logs from being processed.
   */
  disableLogging(): void {
    for (const level of Object.keys(this.logLevelEnabledStatus)) {
      this.logLevelEnabledStatus[level as keyof LogLevelEnabledStatus] = false;
    }
  }

  /**
   * Called when a child logger is created.
   * 
   * For an isolated manager, we intentionally do NOT copy the parent's state.
   * This means children start with their own default state (all levels enabled)
   * and are completely independent from their parent.
   * 
   * Compare this to DefaultLogLevelManager, which copies the parent's state
   * in this method to allow inheritance at creation time.
   */
  onChildLoggerCreated(_params: OnChildLogLevelManagerCreatedParams): void {
    // Intentionally do nothing - children do not inherit from parent
    // The child will have its own default state (all levels enabled)
    // This is what makes this manager "isolated"
  }

  /**
   * Creates a new instance of the log level manager.
   * 
   * For an isolated manager, we create a fresh instance with default state
   * (all levels enabled) rather than copying the current instance's state.
   * 
   * This ensures that when a child logger is created, it starts with
   * all levels enabled, independent of the parent's configuration.
   */
  clone(): ILogLevelManager {
    // Create a new instance with default state (all levels enabled)
    // Children do not inherit the parent's log level state
    // This is the key difference from DefaultLogLevelManager
    return new IsolatedLogLevelManager();
  }
}
```

## Using Your Custom Log Level Manager

```typescript
import { LogLayer, ConsoleTransport, LogLevel } from "loglayer";
import { IsolatedLogLevelManager } from './IsolatedLogLevelManager';

const parentLog = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  })
}).withLogLevelManager(new IsolatedLogLevelManager());

// Set log level on parent
parentLog.setLevel(LogLevel.warn);

// Create child - it will NOT inherit parent's log level
const childLog = parentLog.child();

// Child has all levels enabled by default (not inherited from parent)
childLog.isLevelEnabled(LogLevel.info); // true (not inherited from parent)
childLog.isLevelEnabled(LogLevel.warn); // true
```

