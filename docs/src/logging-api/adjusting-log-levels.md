---
title: Adjusting Log Levels
description: Learn how to adjust and control log levels in LogLayer across global, group, and transport tiers.
---

# Adjusting Log Levels

LogLayer supports log level filtering at three tiers: globally, per-group, and per-transport.

## Log Level Evaluation Order

Log levels can be configured at three independent tiers. A log entry must pass **all** applicable tiers to reach a transport:

| Order | Tier | Configured via | Scope |
|-------|------|----------------|-------|
| 1 | **LogLayer (global)** | `setLevel()`, `enableLogging()` | All logs, checked first |
| 2 | **Group** | `groups: { database: { level: 'error' } }` | Only grouped logs |
| 3 | **Transport** | `new ConsoleTransport({ level: 'warn' })` | Per-transport, checked at dispatch |

Each tier acts as an independent gate. If a log is blocked at any tier, it never reaches the next.

::: tip
When no groups are configured, only tiers 1 (global) and 3 (transport) apply. This is the default behavior.
:::

### Example

```typescript
import { LogLayer, ConsoleTransport, LogLevel } from 'loglayer'

const log = new LogLayer({
  transport: [
    new ConsoleTransport({ id: 'console', logger: console, level: 'info' }),
    new ConsoleTransport({ id: 'debug-file', logger: console, level: 'debug' }),
  ],
  groups: {
    database: { transports: ['console', 'debug-file'], level: 'warn' },
  },
})

log.setLevel(LogLevel.debug)
```

With this configuration:

| Log call | Global (debug) | Group (warn) | Transport | Result |
|----------|---------------|--------------|-----------|--------|
| `log.info('hello')` | Pass | N/A (ungrouped) | console: Pass, debug-file: Pass | Both transports |
| `log.withGroup('database').debug('query')` | Pass | Fail (debug < warn) | — | Dropped at group tier |
| `log.withGroup('database').warn('slow query')` | Pass | Pass | console: Pass (warn >= info), debug-file: Pass | Both transports |
| `log.trace('verbose')` | Fail (trace < debug) | — | — | Dropped at global tier |

::: warning
When multiple tiers are set, the most restrictive combination takes effect. A log must pass the global level, then the group level (if grouped), then the transport level.
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

