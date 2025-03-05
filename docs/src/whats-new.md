---
title: What's new in LogLayer
description: Learn about the latest features and improvements in LogLayer
---

# What's new in LogLayer

- [`loglayer` Changelog](/core-changelogs/loglayer-changelog)

## Mar 5, 2025

Documentation updates. 

- Added new comments and links for interfaces, types, and classes.
- Added that booleans can be used in a logging method (eg `log.info("value:", true)`) despite saying only strings and numbers only

In `@loglayer/transport-opentelemetry`:

- Internal: Removed LogLayer version imprinting. This shouldn't affect behavior, but please raise an issue if it does. 

## Mar 3, 2025

In `loglayer`:

Updates to the `MockLogLayer` behavior to help with writing unit tests specifically against the logger:

- `MockLogLayer` now creates an internal instance of `MockLogBuilder` when created. This is changed from the prior
behavior of creating a new instance of `MockLogBuilder` for certain method calls that would return it like `withMetadata`.
- Added `getMockLogBuilder()`, `resetMockLogBuilder()`, and `setMockLogBuilder()` methods to `MockLogLayer` to allow developers
to write direct mocks against chained methods like `withMetadata`, `withError`, etc.

The [testing documentation](/logging-api/unit-testing) for this has been updated as well.

## Mar 1, 2025

- All transports now support multiple parameter passing in log methods. For example, `log.info('User', 123, 'logged in')`.
  * The logging library for the transport may not support sprintf-style string formatting. If it does not, you can use the [sprintf plugin](/plugins/sprintf) to enable support.

## Feb 23, 2025

Added the new [Pretty Terminal Transport](/transports/pretty-terminal) for LogLayer that pretty-prints logs in the terminal.

![Simple View](/images/pretty-terminal/simple-view.webp)

### Pretty Terminal Features

- 🎨 **Color-coded Log Levels** - Each log level has distinct colors for quick visual identification
- 🔍 **Interactive Selection Mode** - Browse and inspect logs in a full-screen interactive view
- 📝 **Detailed Log Inspection** - Examine individual log entries with formatted data and context
- 🔎 **Search/Filter Functionality** - Find specific logs with powerful filtering capabilities
- 💅 **JSON Pretty Printing** - Beautifully formatted structured data with syntax highlighting
- 🎭 **Configurable Themes** - Choose from pre-built themes or customize your own colors
- 🔄 **Real-time Updates** - See logs as they happen with live updates
- 📊 **Context Awareness** - View previous and next logs when inspecting entries

## Feb 15, 2025

in `loglayer`:

- Added `clearContext()` to clear context data.
- `withMetadata()` / `metadataOnly()` / `withContext()` now allows an empty value. Empty values will not result in any data mutations or plugin executions.

## Feb 11, 2025

Major version 6 is out! 🎉

This adds a new feature called [Context Managers](/context-managers/).

### Breaking Changes

- The `linkParentContext` configuration option has been removed. See the [migration guide](/migrating) for more information on how to replicate the functionality.

## Feb 8, 2025

- Added `linkParentContext` configuration option to allow child loggers to link to their parent's context. This enables changes to the context in either logger to affect both parent and child. [Learn more](./logging-api/child-loggers.html#shared-context-reference)
- The plugin method `runOnContextCalled` is no longer called during `child()` if context data exists as it'd be a redundant
  call.

## Feb 3, 2025

- Added a new method [`withFreshPlugins()`](/plugins/#replacing-all-plugins) to replace existing plugins with new ones in `loglayer`.

## Jan 27, 2025

- Added an integration doc for [Next.js](/example-integrations/nextjs) to show how to implement LogLayer with Next.js.
- Fixed the typings for `metadataOnly()` where the 2nd parameter should be optional.

## Jan 24, 2025

- Added a new method [`withFreshTransports()`](/logging-api/transport-management#replacing-transports) to replace existing transports with new ones in `loglayer`.

## Jan 20, 2025

- Plugin callbacks now pass the `loglayer` instance as the last parameter.
- Add the [Axiom.co Transport](https://loglayer.dev/transports/axiom).

## Jan 18, 2025

Add new options to the `ConsoleTransport`:

- `messageField`: Allows you to specify the field in the log message object where the message should be stored. This is useful when you want to log structured data and need to specify the field name for the message.
- `level`: Sets the minimum log level to process. Messages with a lower priority level will be ignored.

## Jan 17, 2025

- Added the [Log File Rotation Transport](https://loglayer.dev/transports/log-file-rotation) to write logs to files and rotate them
- Performance improvements around using multiple transports with `loglayer`

## Jan 15, 2025

- Added the [Filter Plugin](https://loglayer.dev/plugins/filter) for filtering log messages.
