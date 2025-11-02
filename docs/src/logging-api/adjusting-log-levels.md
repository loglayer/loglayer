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

Log levels follow a hierarchy, with lower numeric values indicating higher priority:

| Level | Value |
|-------|-------|
| `trace` | 60 |
| `debug` | 50 |
| `info` | 40 |
| `warn` | 30 |
| `error` | 20 |
| `fatal` | 10 |

For example, when using `setLevel()`, all levels equal to and below it are also enabled. 

For example, if you set the log level to `warn`:

- higher levels `info`, `debug`, and `trace` messages will be ignored.
- equal and lower levels `warn`, `error`, and `fatal` messages will be logged

## Enabling/Disabling Logging

All of these methods can be used during runtime to dynamically adjust log levels without restarting your application. You can control whether logs are output using these methods:

### Set Log Level

All levels equal to and below the set level are enabled.

```typescript
import type { LogLevel } from 'loglayer'

// Enable warn, error, and fatal (disable info, debug, trace)
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

