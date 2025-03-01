---
title: Logging Basics With LogLayer
description: Learn how to log messages at different severity levels with LogLayer
---

# Basic Logging

LogLayer provides a simple and consistent API for logging messages at different severity levels. This guide covers the basics of logging messages.

## Log Levels

LogLayer supports six standard log levels, each with its own method:

- `info()` - For general information messages
- `warn()` - For warning messages
- `error()` - For error messages
- `debug()` - For debug information
- `trace()` - For detailed debugging information
- `fatal()` - For critical errors that require immediate attention

::: info
Some logging libraries may not support all levels. In such cases:

- `trace` is mapped to `debug`
- `fatal` is mapped to `error`
:::

## Basic Message Logging

The simplest way to log a message is to use one of the log level methods:

```typescript
// Basic info message
log.info('User logged in successfully')

// Warning message
log.warn('API rate limit approaching')

// Error message
log.error('Failed to connect to database')

// Debug message
log.debug('Processing request payload')

// Trace message (detailed debugging)
log.trace('Entering authentication function')

// Fatal message (critical errors)
log.fatal('System out of memory')
```

## Message Parameters

All log methods accept multiple parameters, which can be strings, numbers, null, or undefined:

```typescript
// Multiple parameters
log.info('User', 123, 'logged in')

// With string formatting
log.info('User %s logged in from %s', 'john', 'localhost')
```

::: tip sprintf-style formatting
The logging library you use may or may not support sprintf-style string formatting.
If it does not, you can use the [sprintf plugin](/plugins/sprintf) to enable support.
:::

## Message Prefixing

You can add a prefix to all log messages either through configuration or using the `withPrefix` method:

```typescript
// Via configuration
const log = new LogLayer({
  prefix: '[MyApp]',
  transport: new ConsoleTransport({
    logger: console
  })
})

// Via method
const prefixedLogger = log.withPrefix('[MyApp]')

// Output: "[MyApp] User logged in"
prefixedLogger.info('User logged in')
```

## Enabling/Disabling Logging

You can control whether logs are output using these methods:

```typescript
// Disable all logging
log.disableLogging()

// Enable logging again
log.enableLogging()
```

You can also configure this through the initial configuration:

```typescript
const log = new LogLayer({
  enabled: false, // Starts with logging disabled
  transport: new ConsoleTransport({
    logger: console
  })
})
```
