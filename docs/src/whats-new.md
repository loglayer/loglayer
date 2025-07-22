---
title: What's new in LogLayer
description: Learn about the latest features and improvements in LogLayer
---

# What's new in LogLayer

- [`loglayer` Changelog](/core-changelogs/loglayer-changelog)

## July 22, 2025

Added the new [Isolated Context Manager](/context-managers/isolated) - a context manager that does not copy context data from parent loggers to child loggers when a child is created.

## July 10, 2025

`loglayer`:

- Added the new [Blank Transport](/transports/blank-transport) that allows you to quickly create custom transports by providing your own `shipToLogger` function. This is perfect for simple custom logging logic, prototyping new transport ideas, or quick integrations with custom services.
- The built-in [Console Transport](/transports/console.md) has new options to stamp out a timestamp and/or a log level with your log.

## June 30, 2025

- `@loglayer/transport-simple-pretty-terminal`: Fixes a bug where in `expanded` mode, empty lines were being printed when no metadata is being used with a log entry

## June 23, 2025

Updated [Simple Pretty Terminal](/transports/simple-pretty-terminal.md):

- In the `browser` runtime mode, we were printing all logs using `console.log()`. 
This behavior has changed to use the appropriate console method depending on
log level, and should now allow proper filtering from a browser's devtools when
filtering by level.
- Removed algorithmic word-wrapping in the terminal view, which looks awkward when using tools like `turbo` concurrently with other apps. The user's terminal should handle wrapping instead.
- Added a new option `includeDataInBrowserConsole`, which will add the raw data object to the `console` print (eg `console.info(message, data)`), allowing for deep inspection from the devtools.

## June 22, 2025

Added a new [Hono integration guide](/example-integrations/hono).

## June 21, 2025

Added the new [Simple Pretty Terminal](/transports/simple-pretty-terminal.md) that is designed for Next.js, browsers and
apps that run concurrently.

![Simple View](/images/pretty-terminal/simple-view.webp)

Updated the [Next.js integration guide](example-integrations/nextjs.md) to incorporate the Simple Pretty Transport.

## June 19, 2025

- (all packages) Dev dependency package updates

Added the new [HTTP Transport](/transports/http) for LogLayer that allows you to send logs to any HTTP endpoint.

### HTTP Transport Features

- 🌐 **Generic HTTP Support** - Send logs to any HTTP endpoint with configurable method and headers
- 📦 **Custom Payload Templates** - Transform log data into any format your API expects
- 🔄 **Batching Support** - Queue logs and send them in batches for better performance
- 🗜️ **Gzip Compression** - Reduce bandwidth usage with optional compression
- 🔁 **Retry Logic** - Automatic retries with exponential backoff
- ⏱️ **Rate Limiting** - Respect HTTP 429 responses with configurable behavior
- 🎯 **Dynamic Headers** - Use functions to generate headers dynamically
- 🐛 **Error Handling** - Comprehensive error callbacks for debugging and monitoring

Added the new [VictoriaLogs Transport](/transports/victoria-logs) for LogLayer that allows you to send logs to [VictoriaLogs](https://victoriametrics.com/products/victorialogs/) using the [JSON stream API](https://docs.victoriametrics.com/victorialogs/data-ingestion/#json-stream-api).

### VictoriaLogs Transport Features

- 🚀 **VictoriaLogs Integration** - Send logs to VictoriaLogs using the JSON stream API
- 🔧 **Pre-configured Setup** - Thin wrapper around HTTP transport with VictoriaLogs specific defaults
- 📝 **Automatic URL Construction** - Automatically appends `/insert/jsonline` path to your VictoriaLogs host URL
- 🎯 **VictoriaLogs Format** - Pre-configured payload template with `_msg`, `_time`, `level`, `stream`, `service`, and `environment` fields
- 🔄 **Full HTTP Transport Features** - Inherits all features from HTTP transport (batching, compression, retries, etc.)
- ⚡ **High Performance** - Supports unlimited log lines in a single request with stream-based processing

## May 24, 2025

For `loglayer`:

Adds the following type exports for assistance with writing plugins directly:

- `PluginBeforeDataOutParams`, 
- `PluginBeforeMessageOutParams`, 
- `PluginShouldSendToLoggerParams`

## May 23, 2025

For `loglayer`:

Fixes a potential issue where you can't import from `loglayer` due to the package exporting the `LogLevel` enum
from different LogLayer core packages.

## May 10, 2025

*It is advised that if you update `loglayer`, you should update any plugins and transports to the latest versions as well.*

- Added the following new methods to control log levels in `loglayer`:
  - `setLevel()`
  - `enableIndividualLevel()`
  - `disableIndividualLevel()`
  - `isLevelEnabled()`

See [the documentation](/logging-api/basic-logging#enabling-disabling-logging) for more information.

- Fixes a bug in `metadataOnly()` where it was sometimes returning
the LogLayer instance instead of nothing. It should now return nothing.
- Source maps have been disabled to save on package file size. If this is an issue please raise one!

For `loglayer`, plugins, and transports:

- Adds a new TypeScript type called `LogLevelType`, which is a union of the `LogLevel` enum and its string representation.
  - This means you can use either `LogLevel.info` or just `info` (string)
  - All usages of `LogLevel` as a parameter type have been replaced with `LogLevelType`.
- Some packages have source maps disabled to save on package file size. If this is an issue please raise one!

## Apr 12, 2025

Adds support for the [llms.txt](https://llmstxt.org/) format.

- [AI Support](/ai-support)

## Mar 29, 2025

General dev-only package updates.

`loglayer`:

- Fixed a bug in `MockLogLayer` where `child()` and `withPrefix()` should be returning itself instead of a `MockLogBuilder`

## Mar 16, 2025

Documentation:

- Added an integration doc for [Asynchronous Context Tracking](/example-integrations/async-context) to show how to implement LogLayer with `AsyncLocalStorage`.
- Added in the [Typescript Tips](/logging-api/typescript) that `LogLayerTransport` can be used to type array of transports.

`loglayer`:

- Added an export for the `LogLayerTransport` type.

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
