---
title: What's new in LogLayer
description: Learn about the latest features and improvements in LogLayer
---

# What's new in LogLayer

- [`loglayer` Changelog](/core-changelogs/loglayer-changelog)

## Nov 9, 2025

Documentation:

- Updated [Creating Mixins documentation](/mixins/creating-mixins) to clarify the requirement for extending `ILogLayer` and `ILogBuilder` interfaces when creating mixins. Without these interface extensions, TypeScript will not recognize mixin methods when code uses the `ILogLayer` or `ILogBuilder` interfaces, which is common in dependency injection and testing scenarios.

`@loglayer/mixin-hot-shots`:

- Added `interface ILogLayer extends LogLayer {}` declaration to ensure the `ILogLayer` interface includes all augmented methods from the mixin. This ensures proper TypeScript type checking when using the `ILogLayer` interface with the hot-shots mixin.

## Nov 7, 2025

`@loglayer/plugin`:

- Added new `transformLogLevel` plugin callback that allows you to dynamically transform log levels. This is useful for adjusting log levels based on log data, metadata, context, or error information. See [Creating Plugins documentation](/plugins/creating-plugins#transformloglevel) for usage examples.

## Nov 2, 2025

`loglayer`:

New version 7 introduces [Mixins](/mixins/), a system for extending LogLayer and LogBuilder prototypes with custom methods and functionality. Unlike plugins (which intercept and modify log processing) or transports (which send logs to destinations), mixins add new methods directly to the LogLayer API, enabling you to integrate third-party libraries and add domain-specific capabilities beyond logging.

The first official mixin, [`@loglayer/mixin-hot-shots`](/mixins/hot-shots), adds StatsD metrics functionality to LogLayer, allowing you to send metrics alongside your logs using the hot-shots library.

- Added `getConfig()` method to LogLayer, allowing you to retrieve the configuration object used to initialize the logger. This includes all configuration options and any default values that were applied during initialization. See [Configuration documentation](/configuration#retrieving-configuration) for usage examples.

`@loglayer/plugin`

- Updated `PluginBeforeDataOutFn` type to include `loglayer: ILogLayer` as a parameter, providing plugin authors with access to the LogLayer instance when implementing `onBeforeDataOut` callbacks. We were always passing it back, just didn't update the type.

*v7 does not have any breaking changes; no migration steps are necessary to upgrade from v6 -> v7 of `loglayer`.*

## Oct 23, 2025

Add new [AWS Cloudwatch Logs](/transports/aws-cloudwatch-logs) transport for sending logs to AWS CloudWatch Logs using the AWS SDK.

Thanks to [@Eptagone](https://github.com/Eptagone)  for this contribution!

## Oct 21, 2025

`loglayer`:

- `ConsoleTransport`: Fixes an issue where `levelField` and `dateField` should not affect the output in the same way that `messageField` would. 
This change brings the behavior to what is described in the documentation for the `ConsoleTransport`.

## Oct 14, 2025

`@loglayer/transport-sentry`:

- Added [Sentry transport](/transports/sentry) for sending logs to Sentry using the Sentry SDK logger API.

## Oct 13, 2025

`loglayer`:

- Add the `stringify` optional config option to the `ConsoleTransport`, which will apply `JSON.stringify()` to log output in structured log mode.

`@loglayer/transport-logflare`:

- Fixed a bug where the log level was not being passed through.

`@loglayer/transport-pretty-terminal`:

- Update `better-sqlite3` dependency to `12.4.1`

All packages:

- Thanks to [@Eptagone](https://github.com/Eptagone) for updating our builds to use `tsdown` instead of `tsup` as `tsup` is now deprecated.

## Oct 12, 2025

`@loglayer/transport-betterstack`:

- Added new [Better Stack transport](/transports/betterstack) for sending logs to [Better Stack](https://betterstack.com/log-management) using their HTTP API.

`@loglayer/transport-http`:

- Fixed issue where 2xx HTTP codes would call `onError()`

## Oct 11, 2025

Documentation:

- Added guides for Deno and Bun.

`@loglayer/transport-http`:

- New `onDebugReqRes` callback: Debug HTTP requests and responses with complete request/response details including headers and body content
- Improved batch handling with new `batchMode` option supporting three modes:
  - `"delimiter"` (default) - Join entries with a delimiter
  - `"field"` - Wrap entries in an object with a field name (e.g., `{"batch": [...]}`)
  - `"array"` - Send entries as a plain JSON array

`@loglayer/transport-logflare`:

- Added new Logflare transport for the [Logflare](https://logflare.app) logging service
  - Cloud-native logging platform with powerful querying and alerting capabilities
  - Full support for all LogLayer features including context, metadata, and error handling
  - See [Logflare transport documentation](/transports/logflare) for usage examples

`@loglayer/transport-logtape`:

- Added new LogTape transport for the [LogTape](https://logtape.org) logging library
  - Modern, structured logging library for TypeScript and JavaScript
  - Full support for all LogLayer features including context, metadata, and error handling
  - See [LogTape transport documentation](/transports/logtape) for usage examples

`loglayer`:

Thanks to [@Eptagone](https://github.com/Eptagone) for the following:

- Improved TypeScript typing for log context, metadata, and data objects
  - Replaced generic `Record<string, any>` types with specific interfaces: `LogLayerContext`, `LogLayerMetadata`, and `LogLayerData`
  - Better IntelliSense support and type safety when working with logging data
  - Allows developers to extend these types for custom IntelliSense in their applications
  - See [TypeScript documentation](https://loglayer.dev/logging-api/typescript.html) for usage examples

## Oct 9, 2025

`loglayer`:

- Added new `raw()` method for advanced logging scenarios
  - Allows bypassing the normal LogLayer API to directly specify all aspects of a log entry
  - Supports complete control over log level, messages, metadata, error, and context
  - Still processes through all LogLayer features including plugins, context merging, and transport routing
  - See [Basic Logging documentation](https://loglayer.dev/logging-api/basic-logging.html#raw-logging) for usage examples

- Fixed bug where `errorFieldInMetadata` option was not working correctly
  - Error objects were not being placed in metadata fields when `errorFieldInMetadata` was set to true
  - Now properly places errors in metadata fields as specified by the configuration

## Oct 6, 2025

`@loglayer/transport-tslog`:

*breaking change*:

- Added an optional parameter called `stackDepthLevel`, which is defaulted to `9`. 

For more information on this parameter, see the [tslog transport documentation](/transports/tslog.md). 

## Oct 4, 2025

`loglayer`:

- Add `LogLayerPlugin` type export

## Oct 1, 2025

`@loglayer/transport`:

- Add `level` parameter to `LogLayerTransportConfig` for `BaseTransport`-based transports
- `BaseTransport` now supports automatic log level filtering, matching `LoggerlessTransport` behavior
- All transports extending `BaseTransport` can now filter logs by minimum level without additional implementation

**Updated Transports:**
- `@loglayer/transport-pino` - Pino transport now supports level filtering
- `@loglayer/transport-winston` - Winston transport now supports level filtering  
- `@loglayer/transport-bunyan` - Bunyan transport now supports level filtering
- `@loglayer/transport-loglevel` - Loglevel transport now supports level filtering
- `@loglayer/transport-console` - Console transport now supports level filtering
- `@loglayer/transport-datadog` - DataDog transport now supports level filtering
- `@loglayer/transport-http` - HTTP transport now supports level filtering
- `@loglayer/transport-axiom` - Axiom transport now supports level filtering (removed duplicate level filtering)
- `@loglayer/transport-google-cloud-logging` - Google Cloud Logging transport now supports level filtering (removed duplicate level filtering)
- All other `BaseTransport`-based transports now support level filtering

## Sept 16, 2025

`@loglayer/transport-google-cloud-logging`:

Thanks to [@osamaqarem](https://github.com/osamaqarem) for the following:

- Add `rootLevelMetadataFields` config for specifying `LogEntry` metadata using `withMetadata()` / `withContext()`
- Fix type error when passing a `LogSync` instance

## Sept 7, 2025

`loglayer` and plugins:

- Transports now additionally receive the `error`, `metadata`, and `context` data in the `shipToLogger()` callback.
  * It is still recommended to use `data` for most use-cases as it is a merged object of all data with the user's configured fields.
- Plugin callbacks `onBeforeDataOut()` and `shouldSendToLogger()` now additionally receive the `error`, `metadata`, and `context` data.

This change should allow a plugin or transport developer to inspect data without needing to know how the user has configured their `data` object.

## Sept 6, 2025

Potentially breaking:

- `@loglayer/plugin-filter@3.0.0`: Updates `@jsonquerylang/jsonquery` to 5.x. See [notes](https://github.com/jsonquerylang/jsonquery/releases/tag/v5.0.0) for breaking changes.
- `@loglayer/transport-opentelemetry@3.0.0`: Updates `@opentelemetry/api-logs` to 0.204.0. Examples have been updated.
- `@loglayer/transport-pretty-terminal@4.0.0`: Update dependencies. `better-sqlite3` has been updated from 11 to 12 which removes support for node 18

Non-breaking:

- `@loglayer/transport-datadog@3.2.0`: Update `@datadog/datadog-api-client` to 1.41.0
- `@loglayer/transport-pino@2.2.2`: Update pino import type for transport
- `@loglayer/transport-simple-pretty-terminal@2.2.2`: Update `chalk` and `date-fns` packages

## August 13, 2025

Added the new [Datadog APM Trace Injector Plugin](/plugins/datadog-apm-trace-injector) - a plugin that automatically injects Datadog APM trace context into your LogLayer logs, enabling correlation between application logs and distributed traces in Datadog.

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
