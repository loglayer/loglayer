---
title: Adjusting Log Levels Globally
description: Learn how to adjust and control log levels in LogLayer.
---

# Adjusting Log Levels Globally

While certain transports and logging libraries may allow you to adjust log levels at an individual level, you can adjust log levels in LogLayer globally across all transports.

::: warning Global vs Transport Log Levels
The log level methods described here set the global log level for LogLayer. However, individual transports and logging libraries may have their own log level settings that also apply. When both are set, the most restrictive level takes effect.

For example, if LogLayer's global level is set to `debug`, but a transport or logging library has its level set to `error`, the transport will only send out `error` and `fatal` messages, even though the global level allows `debug` messages.
:::

## Log Level Hierarchy

Log levels follow a hierarchy, with higher numeric values indicating higher severity:

| Level | Value |
|-------|-------|
| `trace` | 10 |
| `debug` | 20 |
| `info` | 30 |
| `warn` | 40 |
| `error` | 50 |
| `fatal` | 60 |

For example, when using `setLevel()`, all levels equal to and above it are also enabled.

For example, if you set the log level to `warn`:

- lower severity levels `trace`, `debug`, and `info` messages will be ignored.
- equal and higher severity levels `warn`, `error`, and `fatal` messages will be logged

## Enabling/Disabling Logging

All of these methods can be used during runtime to dynamically adjust log levels without restarting your application. You can control whether logs are output using these methods:

### Set Log Level

All levels equal to and above the set level are enabled.

```typescript
import type { LogLevel } from 'loglayer'

// Enable warn, error, and fatal (disable trace, debug, info)
log.setLevel(LogLevel.warn)
```

### Enable / Disable All Logging

```typescript
log.disableLogging()
```

```typescript
log.enableLogging()
```

### Individual Log Levels

You can ignore the hierarchy by using `enableIndividualLevel()` and `disableIndividualLevel()` methods to enable or disable specific log levels.

```typescript
import type { LogLevel } from 'loglayer'

log.enableIndividualLevel(LogLevel.debug)  // Enable only debug logs
```

```typescript
import type { LogLevel } from 'loglayer'

log.disableIndividualLevel(LogLevel.debug) // Disable only debug logs
```

## Checking if a Log Level is Enabled

You can check if a specific log level is enabled using the `isLevelEnabled` method:

```typescript
import type { LogLevel } from 'loglayer'

if (log.isLevelEnabled(LogLevel.debug)) {
  log.debug('Debugging is enabled')
} else {
  log.info('Debugging is disabled')
}
```

## Log Level Managers

*New in LogLayer v8*.

Log level managers control how log levels are inherited and propagated between parent and child loggers. By default, LogLayer uses the [**Default Log Level Manager**](/log-level-managers/default), which provides independent log level management for each logger instance.

With the default log level manager, child loggers inherit the log level from their parent when created, but subsequent changes to the parent's log level do not affect existing children:

```typescript
import { LogLayer, ConsoleTransport, LogLevel } from "loglayer";

const parentLog = new LogLayer({
  transport: new ConsoleTransport({ logger: console })
});

parentLog.setLevel(LogLevel.warn);
const childLog = parentLog.child();

// Child inherits parent's log level at creation
childLog.isLevelEnabled(LogLevel.warn); // true
childLog.isLevelEnabled(LogLevel.info); // false

// Parent change does not affect child
parentLog.setLevel(LogLevel.debug);
childLog.isLevelEnabled(LogLevel.debug); // false (child not affected)
```

For more information about log level managers and available options, see the [Log Level Managers documentation](/log-level-managers/).

