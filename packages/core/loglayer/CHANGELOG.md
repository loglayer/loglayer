# `loglayer` Changelog

## 7.0.1

### Patch Changes

- [`4e3b8cd`](https://github.com/loglayer/loglayer/commit/4e3b8cd07fa0b2ecee448548304dc67699a87824) Thanks [@theogravity](https://github.com/theogravity)! - Fix bug where mixin plugins were not being initialized with LogLayer

## 7.0.0

### Major Changes

- [#288](https://github.com/loglayer/loglayer/pull/288) [`017be50`](https://github.com/loglayer/loglayer/commit/017be50980f7d78c5d370f1a7ffea1a5cbb4c97b) Thanks [@theogravity](https://github.com/theogravity)! - New version 7 introduces [Mixins](https://loglayer.dev/mixins/), a system for extending LogLayer and LogBuilder prototypes with custom methods and functionality. Unlike plugins (which intercept and modify log processing) or transports (which send logs to destinations), mixins add new methods directly to the LogLayer API, enabling you to integrate third-party libraries and add domain-specific capabilities beyond logging.

  _v7 does not have any breaking changes; no migration steps are necessary to upgrade from v6 -> v7 of `loglayer`._

## 6.10.0

### Minor Changes

- [#283](https://github.com/loglayer/loglayer/pull/283) [`cca0312`](https://github.com/loglayer/loglayer/commit/cca03129aaa20e3b435cdcb4a7a2a7831ef1f134) Thanks [@theogravity](https://github.com/theogravity)! - `ConsoleTransport`: Fixes an issue where `levelField` and `dateField` should not affect the output in the same way that `messageField` would.
  This change brings the behavior to what is described in the documentation for the `ConsoleTransport`.

## 6.9.1

### Patch Changes

- [#277](https://github.com/loglayer/loglayer/pull/277) [`1e01627`](https://github.com/loglayer/loglayer/commit/1e01627eeafb5e094da958532ad385cc59d70857) Thanks [@Eptagone](https://github.com/Eptagone)! - Migration from tsup to tsdown and small dependency updates.

- Updated dependencies [[`1e01627`](https://github.com/loglayer/loglayer/commit/1e01627eeafb5e094da958532ad385cc59d70857)]:
  - @loglayer/context-manager@1.1.6
  - @loglayer/transport@2.3.4
  - @loglayer/plugin@2.1.6
  - @loglayer/shared@2.5.3

## 6.9.0

### Minor Changes

- [#275](https://github.com/loglayer/loglayer/pull/275) [`d79c827`](https://github.com/loglayer/loglayer/commit/d79c8274c50c3e8d34d7f996d100c16ff90833ca) Thanks [@theogravity](https://github.com/theogravity)! - Add `stringify` option to `ConsoleTransport`

## 6.8.3

### Patch Changes

- [`1472439`](https://github.com/loglayer/loglayer/commit/14724396d721fa1e16085b137d1ddb2ab26a7764) Thanks [@theogravity](https://github.com/theogravity)! - Export the `LogLayerContext`, `LogLayerMetadata`, `LogLayerData` types

## 6.8.2

### Patch Changes

- Updated dependencies [[`aa0d9e1`](https://github.com/loglayer/loglayer/commit/aa0d9e11afcbbc8ba4989459976da07557292ef3)]:
  - @loglayer/shared@2.5.2
  - @loglayer/context-manager@1.1.5
  - @loglayer/plugin@2.1.5
  - @loglayer/transport@2.3.3

## 6.8.1

### Patch Changes

- [#264](https://github.com/loglayer/loglayer/pull/264) [`1038d13`](https://github.com/loglayer/loglayer/commit/1038d132169add199b1dbd6c7ada6d6fa7a86218) Thanks [@Eptagone](https://github.com/Eptagone)! - Improve typing for log context, metadata, and data objects

- Updated dependencies [[`1038d13`](https://github.com/loglayer/loglayer/commit/1038d132169add199b1dbd6c7ada6d6fa7a86218)]:
  - @loglayer/shared@2.5.1
  - @loglayer/context-manager@1.1.4
  - @loglayer/plugin@2.1.4
  - @loglayer/transport@2.3.2

## 6.8.0

### Minor Changes

- [#261](https://github.com/loglayer/loglayer/pull/261) [`9b32187`](https://github.com/loglayer/loglayer/commit/9b32187b1040f6331d0c21f666768da41d6c91a1) Thanks [@theogravity](https://github.com/theogravity)! - - Added new `raw()` method for advanced logging scenarios

  - Allows bypassing the normal LogLayer API to directly specify all aspects of a log entry
  - Supports complete control over log level, messages, metadata, error, and context
  - Still processes through all LogLayer features including plugins, context merging, and transport routing
  - See [Basic Logging documentation](https://loglayer.dev/logging-api/basic-logging.html#raw-logging) for usage examples

  - Fixed bug where `errorFieldInMetadata` option was not working correctly
    - Error objects were not being placed in metadata fields when `errorFieldInMetadata` was set to true
    - Now properly places errors in metadata fields as specified by the configuration

### Patch Changes

- Updated dependencies [[`9b32187`](https://github.com/loglayer/loglayer/commit/9b32187b1040f6331d0c21f666768da41d6c91a1)]:
  - @loglayer/shared@2.5.0
  - @loglayer/context-manager@1.1.3
  - @loglayer/plugin@2.1.3
  - @loglayer/transport@2.3.1

## 6.7.2

### Patch Changes

- [#255](https://github.com/loglayer/loglayer/pull/255) [`f5dc038`](https://github.com/loglayer/loglayer/commit/f5dc038f9b5c79c516730750513083e82c0af102) Thanks [@theogravity](https://github.com/theogravity)! - Export LogLayerPlugin type

## 6.7.1

### Patch Changes

- Updated dependencies [[`94d0230`](https://github.com/loglayer/loglayer/commit/94d0230a9f18f988257b72b9220432fd8101fa60)]:
  - @loglayer/transport@2.3.0

## 6.7.0

### Minor Changes

- [#239](https://github.com/loglayer/loglayer/pull/239) [`12ca18a`](https://github.com/loglayer/loglayer/commit/12ca18ad65181fcbfc4c34d804ed875b691b895d) Thanks [@theogravity](https://github.com/theogravity)! - - Transports now additionally receive the `error`, `metadata`, and `context` data in the `shipToLogger()` callback. \* It is still recommended to use `data` for most use-cases as it is a merged object of all data with the user's configured fields.

  - Plugin callbacks `onBeforeDataOut()` and `shouldSendToLogger()` now additionally receive the `error`, `metadata`, and `context` data.

  This change should allow a plugin or transport developer to inspect data without needing to know how the user has configured their `data` object.

### Patch Changes

- Updated dependencies [[`12ca18a`](https://github.com/loglayer/loglayer/commit/12ca18ad65181fcbfc4c34d804ed875b691b895d)]:
  - @loglayer/shared@2.4.0
  - @loglayer/context-manager@1.1.2
  - @loglayer/plugin@2.1.2
  - @loglayer/transport@2.2.2

## 6.6.0

### Minor Changes

- [#222](https://github.com/loglayer/loglayer/pull/222) [`8407ce5`](https://github.com/loglayer/loglayer/commit/8407ce56eab789b96c4da256d9efc3c3485cb545) Thanks [@theogravity](https://github.com/theogravity)! - Adds the new built-in `BlankTransport`, which allows quick creation of transports.

## 6.5.0

### Minor Changes

- [#218](https://github.com/loglayer/loglayer/pull/218) [`615e257`](https://github.com/loglayer/loglayer/commit/615e2571058933f87618d161d23ad6ca9c4aaed2) Thanks [@theogravity](https://github.com/theogravity)! - Add new options to the `ConsoleTransport` to allow auto-stamping a log level and/or date.

## 6.4.3

### Patch Changes

- [#200](https://github.com/loglayer/loglayer/pull/200) [`a2f5a17`](https://github.com/loglayer/loglayer/commit/a2f5a17626279f9545c96796ca181938fe1ed905) Thanks [@theogravity](https://github.com/theogravity)! - Package dev dep updates, linting updates

- Updated dependencies [[`a2f5a17`](https://github.com/loglayer/loglayer/commit/a2f5a17626279f9545c96796ca181938fe1ed905)]:
  - @loglayer/context-manager@1.1.1
  - @loglayer/transport@2.2.1
  - @loglayer/plugin@2.1.1
  - @loglayer/shared@2.3.1

## 6.4.2

### Patch Changes

- [`98252b5`](https://github.com/loglayer/loglayer/commit/98252b5420315892b29877ef3f901dd709b4b061) Thanks [@theogravity](https://github.com/theogravity)! - Export type `PluginBeforeDataOutParams`, `PluginBeforeMessageOutParams`, `PluginShouldSendToLoggerParams`

## 6.4.1

### Patch Changes

- [#192](https://github.com/loglayer/loglayer/pull/192) [`449a6ad`](https://github.com/loglayer/loglayer/commit/449a6ad63686f6390adbb77e84479a61d25825ca) Thanks [@theogravity](https://github.com/theogravity)! - Fixes an import issue caused by exporting LogLevel from multiple packages.

## 6.4.0

### Minor Changes

- [#190](https://github.com/loglayer/loglayer/pull/190) [`818bae5`](https://github.com/loglayer/loglayer/commit/818bae5efbc4212013ac41878c1e4c4f5594e19c) Thanks [@theogravity](https://github.com/theogravity)! - - Added the following new methods to control log levels in `loglayer`:
  - `setLevel()`
  - `enableIndividualLevel()`
  - `disableIndividualLevel()`
  - `isLevelEnabled()`
  - Fixes a bug in `metadataOnly()` where it was sometimes returning
    the LogLayer instance instead of nothing. It should now return nothing.

### Patch Changes

- Updated dependencies [[`818bae5`](https://github.com/loglayer/loglayer/commit/818bae5efbc4212013ac41878c1e4c4f5594e19c), [`818bae5`](https://github.com/loglayer/loglayer/commit/818bae5efbc4212013ac41878c1e4c4f5594e19c)]:
  - @loglayer/shared@2.3.0
  - @loglayer/transport@2.2.0
  - @loglayer/plugin@2.1.0
  - @loglayer/context-manager@1.1.0

## 6.3.3

### Patch Changes

- [#181](https://github.com/loglayer/loglayer/pull/181) [`a0f6f40`](https://github.com/loglayer/loglayer/commit/a0f6f401355abfa198b646aacf3b5675b64ab149) Thanks [@theogravity](https://github.com/theogravity)! - Fixes `MockLogLayer` where `child()` and `withPrefix()` was not returning itself

## 6.3.2

### Patch Changes

- [#179](https://github.com/loglayer/loglayer/pull/179) [`b03eb3a`](https://github.com/loglayer/loglayer/commit/b03eb3af9b4f428dc79bfcf8a84f31e128202c14) Thanks [@theogravity](https://github.com/theogravity)! - Export the `LogLayerTransport` type and add docs for it

## 6.3.1

### Patch Changes

- [#175](https://github.com/loglayer/loglayer/pull/175) [`a66ce9b`](https://github.com/loglayer/loglayer/commit/a66ce9ba4f05d912576d3754fe74c5054ae8230d) Thanks [@theogravity](https://github.com/theogravity)! - Documentation updates

- Updated dependencies [[`a66ce9b`](https://github.com/loglayer/loglayer/commit/a66ce9ba4f05d912576d3754fe74c5054ae8230d)]:
  - @loglayer/context-manager@1.0.4
  - @loglayer/transport@2.1.1
  - @loglayer/plugin@2.0.4
  - @loglayer/shared@2.2.1

## 6.3.0

### Minor Changes

- [#172](https://github.com/loglayer/loglayer/pull/172) [`16145f1`](https://github.com/loglayer/loglayer/commit/16145f1da24b81783f8d97a0941795294a2319ff) Thanks [@theogravity](https://github.com/theogravity)! - Adds new methods to `MockLogLayer` for better unit testing against the logger methods directly

## 6.2.0

### Minor Changes

- [#169](https://github.com/loglayer/loglayer/pull/169) [`09e33ab`](https://github.com/loglayer/loglayer/commit/09e33ab216e35502ec9692a5ed44878a26573b1b) Thanks [@theogravity](https://github.com/theogravity)! - All transports now support multiple parameter passing in log methods

### Patch Changes

- Updated dependencies [[`09e33ab`](https://github.com/loglayer/loglayer/commit/09e33ab216e35502ec9692a5ed44878a26573b1b)]:
  - @loglayer/transport@2.1.0
  - @loglayer/shared@2.2.0
  - @loglayer/context-manager@1.0.3
  - @loglayer/plugin@2.0.3

## 6.1.3

### Patch Changes

- [`2dbc3a8`](https://github.com/loglayer/loglayer/commit/2dbc3a897c547a63e885ccf166405ac40865cd3f) Thanks [@theogravity](https://github.com/theogravity)! - Fix link to pretty terminal gif

## 6.1.2

### Patch Changes

- [#160](https://github.com/loglayer/loglayer/pull/160) [`161029a`](https://github.com/loglayer/loglayer/commit/161029ae9d89b600ab19bf15cbd500f5358f2403) Thanks [@theogravity](https://github.com/theogravity)! - external dependency version updates

- Updated dependencies [[`161029a`](https://github.com/loglayer/loglayer/commit/161029ae9d89b600ab19bf15cbd500f5358f2403)]:
  - @loglayer/context-manager@1.0.2
  - @loglayer/transport@2.0.2
  - @loglayer/plugin@2.0.2
  - @loglayer/shared@2.1.1

## 6.1.1

### Patch Changes

- [#155](https://github.com/loglayer/loglayer/pull/155) [`a7175b5`](https://github.com/loglayer/loglayer/commit/a7175b588da71d88c3f3bc345b2bf9443216b8bd) Thanks [@theogravity](https://github.com/theogravity)! - Fix: An empty context should not execute plugins

## 6.1.0

### Minor Changes

- [#153](https://github.com/loglayer/loglayer/pull/153) [`96a5c57`](https://github.com/loglayer/loglayer/commit/96a5c57c787b1cbd92fcc00ecc1d7468ce62fe09) Thanks [@theogravity](https://github.com/theogravity)! - Updates around context and metadata handling.

  - Added `clearContext()` to clear context data.
  - `withMetadata()` / `metadataOnly()` / `withContext()` now allows an empty value. Empty values will not result in any data mutations or plugin executions.

### Patch Changes

- Updated dependencies [[`96a5c57`](https://github.com/loglayer/loglayer/commit/96a5c57c787b1cbd92fcc00ecc1d7468ce62fe09)]:
  - @loglayer/shared@2.1.0
  - @loglayer/context-manager@1.0.1
  - @loglayer/plugin@2.0.1
  - @loglayer/transport@2.0.1

## 6.0.0

### Major Changes

- [#151](https://github.com/loglayer/loglayer/pull/151) [`5f1260b`](https://github.com/loglayer/loglayer/commit/5f1260b5b4609b2a20093f934a0a5cc1fced8d26) Thanks [@theogravity](https://github.com/theogravity)! - - New in v6: Context Manager implementation
  - **Breaking**: Removes `linkParentContext` option from `loglayer` configuration

### Patch Changes

- Updated dependencies [[`5f1260b`](https://github.com/loglayer/loglayer/commit/5f1260b5b4609b2a20093f934a0a5cc1fced8d26), [`5f1260b`](https://github.com/loglayer/loglayer/commit/5f1260b5b4609b2a20093f934a0a5cc1fced8d26)]:
  - @loglayer/plugin@2.0.0
  - @loglayer/transport@2.0.0
  - @loglayer/context-manager@1.0.0
  - @loglayer/shared@2.0.0

## 5.7.0

### Minor Changes

- [#149](https://github.com/loglayer/loglayer/pull/149) [`213e3bc`](https://github.com/loglayer/loglayer/commit/213e3bc609a23a76e762ff5e25cb89e04a0010dc) Thanks [@theogravity](https://github.com/theogravity)! - - Add `linkParentContext` config option to keep context reference between child and parent
  - The plugin method `runOnContextCalled` is no longer called during `child()` if context data exists as it'd be a redundant
    call.

## 5.6.0

### Minor Changes

- [#143](https://github.com/loglayer/loglayer/pull/143) [`733ba8f`](https://github.com/loglayer/loglayer/commit/733ba8f754166839fb00e727820e2e8901ceadbb) Thanks [@theogravity](https://github.com/theogravity)! - Add `withFreshPlugins()` to replace existing plugins with new ones.

### Patch Changes

- Updated dependencies [[`733ba8f`](https://github.com/loglayer/loglayer/commit/733ba8f754166839fb00e727820e2e8901ceadbb)]:
  - @loglayer/plugin@1.3.0
  - @loglayer/shared@1.3.0
  - @loglayer/transport@1.2.5

## 5.5.1

### Patch Changes

- [#140](https://github.com/loglayer/loglayer/pull/140) [`d708ff7`](https://github.com/loglayer/loglayer/commit/d708ff76fd23a72343f2a9f8ce3c1fcc180adf74) Thanks [@theogravity](https://github.com/theogravity)! - Fix `metadataOnly` typescript def. The second parameter should always be optional.

- Updated dependencies [[`d708ff7`](https://github.com/loglayer/loglayer/commit/d708ff76fd23a72343f2a9f8ce3c1fcc180adf74)]:
  - @loglayer/shared@1.2.1
  - @loglayer/plugin@1.2.2
  - @loglayer/transport@1.2.4

## 5.5.0

### Minor Changes

- [#138](https://github.com/loglayer/loglayer/pull/138) [`54b8223`](https://github.com/loglayer/loglayer/commit/54b822362f631891cff92d8279883eee994e66cb) Thanks [@theogravity](https://github.com/theogravity)! - Add withFreshTransports method to `loglayer`

### Patch Changes

- Updated dependencies [[`54b8223`](https://github.com/loglayer/loglayer/commit/54b822362f631891cff92d8279883eee994e66cb)]:
  - @loglayer/shared@1.2.0
  - @loglayer/transport@1.2.3
  - @loglayer/plugin@1.2.1

## 5.4.1

### Patch Changes

- [#135](https://github.com/loglayer/loglayer/pull/135) [`b23976d`](https://github.com/loglayer/loglayer/commit/b23976d6d14bdadb37c4dd83dcb0b2ad464c25d7) Thanks [@theogravity](https://github.com/theogravity)! - Updates the main example code on the README.md file.

## 5.4.0

### Minor Changes

- [#129](https://github.com/loglayer/loglayer/pull/129) [`d8054c8`](https://github.com/loglayer/loglayer/commit/d8054c887f371621e23a53ff2ea90d99afcc0ec3) Thanks [@theogravity](https://github.com/theogravity)! - LogLayer now passes the `loglayer` instance as the last parameter to all plugin callbacks

### Patch Changes

- Updated dependencies [[`d8054c8`](https://github.com/loglayer/loglayer/commit/d8054c887f371621e23a53ff2ea90d99afcc0ec3)]:
  - @loglayer/plugin@1.2.0
  - @loglayer/shared@1.1.0
  - @loglayer/transport@1.2.2

## 5.3.0

### Minor Changes

- [#127](https://github.com/loglayer/loglayer/pull/127) [`bf2022b`](https://github.com/loglayer/loglayer/commit/bf2022be6f905c8516748dd9dc8021924dda2c4b) Thanks [@theogravity](https://github.com/theogravity)! - Add new options to the `ConsoleTransport`:

  - `messageField`: Allows you to specify the field in the log message object where the message should be stored. This is useful when you want to log structured data and need to specify the field name for the message.
  - `level`: Sets the minimum log level to process. Messages with a lower priority level will be ignored.

## 5.2.0

### Minor Changes

- [#122](https://github.com/loglayer/loglayer/pull/122) [`e944b8d`](https://github.com/loglayer/loglayer/commit/e944b8de2f7b58391e7043a531b2eb4bdf1bf84e) Thanks [@theogravity](https://github.com/theogravity)! - Performance improvements around using multiple transports

## 5.1.4

### Patch Changes

- [#112](https://github.com/loglayer/loglayer/pull/112) [`561a1a6`](https://github.com/loglayer/loglayer/commit/561a1a64e0f386100bcf4a01fb6375df6e6e72d5) Thanks [@theogravity](https://github.com/theogravity)! - Update changelog doc formatting, add links to documentation site

- Updated dependencies [[`561a1a6`](https://github.com/loglayer/loglayer/commit/561a1a64e0f386100bcf4a01fb6375df6e6e72d5)]:
  - @loglayer/transport@1.2.1
  - @loglayer/plugin@1.1.1
  - @loglayer/shared@1.0.5

Changelogs for other core libraries:

- [`@loglayer/plugin` Changelog](https://loglayer.dev/core-changelogs/plugin-changelog.html)
- [`@loglayer/transport` Changelog](https://loglayer.dev/core-changelogs/transport-changelog.html)

## 5.1.3

### Patch Changes

- [#110](https://github.com/loglayer/loglayer/pull/110) [`13154ed`](https://github.com/loglayer/loglayer/commit/13154eded5c0bb96de9ed73e04f2adb6438715e5) Thanks [@theogravity](https://github.com/theogravity)! - - `loglayer`: Fix an issue where if you use a plugin that creates metadata, and no metadata was present prior, it does not save
  - `@loglayer/transport-opentelemetry`: Add a note about the difference between the plugin and the transport

## 5.1.2

### Patch Changes

- Updated dependencies [[`f3b89d3`](https://github.com/loglayer/loglayer/commit/f3b89d3c77da9fe4a4f981aca334145b735d9466)]:
  - @loglayer/transport@1.2.0

## 5.1.1

### Patch Changes

- Updated dependencies [[`06c8c20`](https://github.com/loglayer/loglayer/commit/06c8c207a569d6e7e6b66cc96abed8a7365bcfac)]:
  - @loglayer/transport@1.1.5

## 5.1.0

### Minor Changes

- [#97](https://github.com/loglayer/loglayer/pull/97) [`c38d650`](https://github.com/loglayer/loglayer/commit/c38d65064017013aaf13aa4291eddff6936204f8) Thanks [@theogravity](https://github.com/theogravity)! - Add plugin lifecycle method `onContextCalled` to intercept `withContext` calls

### Patch Changes

- Updated dependencies [[`c38d650`](https://github.com/loglayer/loglayer/commit/c38d65064017013aaf13aa4291eddff6936204f8)]:
  - @loglayer/plugin@1.1.0

## 5.0.12

### Patch Changes

- Updated dependencies [[`d01dcb9`](https://github.com/loglayer/loglayer/commit/d01dcb91517ed1cb2b425799ab3432d36721bf46)]:
  - @loglayer/transport@1.1.4

## 5.0.11

### Patch Changes

- [#79](https://github.com/loglayer/loglayer/pull/79) [`f88d492`](https://github.com/loglayer/loglayer/commit/f88d49216706663c868f695e21bafab8bb8c745b) Thanks [@theogravity](https://github.com/theogravity)! - - Fixes an issue where a transport will still be called even if the enabled flag for it is false
  - Adds the `enabled?` flag to the `LogLayerTransport` interface in `@loglayer/transport`
  - Updates `@loglayer/transport-datadog` to not initialize the client lib if the transport is disabled

## 5.0.10

### Patch Changes

- [#74](https://github.com/loglayer/loglayer/pull/74) [`d92fce0`](https://github.com/loglayer/loglayer/commit/d92fce0bc04c385849614ab0e34fa8ed389b0ff3) Thanks [@theogravity](https://github.com/theogravity)! - Add an option `appendObjectData` in `ConsoleTransport` to allow for the object data to be at the end of the log entry instead of the beginning.

## 5.0.9

### Patch Changes

- [#67](https://github.com/loglayer/loglayer/pull/67) [`174f545`](https://github.com/loglayer/loglayer/commit/174f545be1eca2d11ea69b2305fb6d49856874b1) Thanks [@theogravity](https://github.com/theogravity)! - Add exports from @loglayer/plugin

## 5.0.8

### Patch Changes

- Updated dependencies [[`cef5ab1`](https://github.com/loglayer/loglayer/commit/cef5ab1d5013c0759c5d344ef7ad0084f9698b2f)]:
  - @loglayer/shared@1.0.4
  - @loglayer/plugin@1.0.4
  - @loglayer/transport@1.1.3

## 5.0.7

### Patch Changes

- Updated dependencies [[`4a25d33`](https://github.com/loglayer/loglayer/commit/4a25d33ced2b5b1596a05b24adfcce26ab991a1f)]:
  - @loglayer/transport@1.1.2

## 5.0.6

### Patch Changes

- [`476702c`](https://github.com/loglayer/loglayer/commit/476702c367c047ac8ab321dd145ec2091cf0f164) Thanks [@theogravity](https://github.com/theogravity)! - Update about copy

## 5.0.5

### Patch Changes

- Updated dependencies [[`372a062`](https://github.com/loglayer/loglayer/commit/372a062138ffd4768a798180f02f3e9705842f0a)]:
  - @loglayer/transport@1.1.1

## 5.0.4

### Patch Changes

- Updated dependencies [[`8aeeeb4`](https://github.com/loglayer/loglayer/commit/8aeeeb46a754a53235ed26a9cea9186a5477fce2)]:
  - @loglayer/transport@1.1.0

## 5.0.3

### Patch Changes

- [`43ffd72`](https://github.com/loglayer/loglayer/commit/43ffd725d94e2ecdf58b4f002f06392611489582) Thanks [@theogravity](https://github.com/theogravity)! - docs: fix up documentation

- Updated dependencies [[`43ffd72`](https://github.com/loglayer/loglayer/commit/43ffd725d94e2ecdf58b4f002f06392611489582)]:
  - @loglayer/transport@1.0.3
  - @loglayer/plugin@1.0.3
  - @loglayer/shared@1.0.3

## 5.0.2

### Patch Changes

- Updated dependencies [[`c136c0f`](https://github.com/loglayer/loglayer/commit/c136c0fbc044d80a03d1851e68e9c6a23dc8a8d8)]:
  - @loglayer/plugin@1.0.2
  - @loglayer/shared@1.0.2
  - @loglayer/transport@1.0.2

## 5.0.1

### Patch Changes

- [`87394f9`](https://github.com/loglayer/loglayer/commit/87394f9480d31222460e88a9163689dbe06cda4e) Thanks [@theogravity](https://github.com/theogravity)! - Add `transportId` parameter to plugin `shouldSendToLogger` call

- Updated dependencies [[`87394f9`](https://github.com/loglayer/loglayer/commit/87394f9480d31222460e88a9163689dbe06cda4e), [`da9bc6f`](https://github.com/loglayer/loglayer/commit/da9bc6f59385834643d677bd998213cd84046f6f)]:
  - @loglayer/plugin@1.0.1
  - @loglayer/transport@1.0.1
  - @loglayer/shared@1.0.1

## 5.0.0

### Major Changes

New documentation site is available at [loglayer.dev](https://loglayer.dev/).

Migration from 4.x to 5.x is available at [here](https://loglayer.dev/migrating).

- Introduced new transport system
  - Replaced direct logger instance and type configuration with transport-specific packages
  - Added new transport classes for each supported logger type
  - See [Transport documentation](https://loglayer.dev/transports) for details
- Configuration changes
  - Moved error configuration options to root level (`errorSerializer`, `errorFieldName`, `copyMsgOnOnlyError`)
  - Moved context and metadata field names to root level (`contextFieldName`, `metadataFieldName`)
  - Added new `errorFieldInMetadata` option to control error object placement
- Removed support for Node.js 14 and 16
- Updated minimum Node.js version requirement to Node.js 18
- Updated all dependencies to their latest major versions
- Improved TypeScript type definitions and stricter type checking
- Removed deprecated APIs and legacy compatibility code

## 4.8.0

### Minor Changes

- [`7033d6e`](https://github.com/theogravity/loglayer/commit/7033d6e18c398728ae6e0cf21524948b47d21e5f) Thanks [@theogravity](https://github.com/theogravity)! - Add support for @datadog/browser-logs

## 4.7.0

### Minor Changes

- [`14f4ce1`](https://github.com/theogravity/loglayer/commit/14f4ce16994e45870b743df18782f1f6e63bce45) Thanks [@theogravity](https://github.com/theogravity)! - Change messages property of ShouldSendToLoggerParams and PluginBeforeMessageOutParams to `any` from `MessageDataType`.
  This allows for more flexibility in the messages property of these params since external libraries may feed in different types of data.

## 4.6.1

### Patch Changes

- [`09991a3`](https://github.com/theogravity/loglayer/commit/09991a39ea1f6be7e4db812d252a54a90063491f) Thanks [@theogravity](https://github.com/theogravity)! - Update docs

## 4.6.0

### Minor Changes

- [#40](https://github.com/theogravity/loglayer/pull/40) [`25212bd`](https://github.com/theogravity/loglayer/commit/25212bde2c3490e7cadd2b43950e37f7c294af13) Thanks [@theogravity](https://github.com/theogravity)! - Add `onBeforeMessageOut` callback to plugins

## 4.5.0

### Minor Changes

- [#38](https://github.com/theogravity/loglayer/pull/38) [`afdfbdd`](https://github.com/theogravity/loglayer/commit/afdfbdd7fe32e8d2023be9598071266e34a69cac) Thanks [@theogravity](https://github.com/theogravity)! - - Add `withError` / `withMetadata` / `enableLogging` / `disableLogging` to `ILogBuilder`.
  - `ILogBuilder` now has `<ErrorType = ErrorDataType>`.

## 4.4.1

### Patch Changes

- [#36](https://github.com/theogravity/loglayer/pull/36) [`40bb3b5`](https://github.com/theogravity/loglayer/commit/40bb3b55a2a442229dbe542a0495b29b406d5a1a) Thanks [@theogravity](https://github.com/theogravity)! - Add enable/disableLogger to ILogLayer

## 4.4.0

### Minor Changes

- [#33](https://github.com/theogravity/loglayer/pull/33) [`1d67e1f`](https://github.com/theogravity/loglayer/commit/1d67e1f23a013d7ef131419ded26a0e7ca7e766e) Thanks [@theogravity](https://github.com/theogravity)! - Fix ILogLayer return types

  `ILogLayer#withPrefix()` and `ILogLayer#withChild()` were of the incorrect return type.

  Changed to `ILogLayer<ExternalLogger, ErrorType>`.

## 4.3.3

### Patch Changes

- [`a824b32`](https://github.com/theogravity/loglayer/commit/a824b32e5d0b6c3055752efe69f0b4ed01c0f694) Thanks [@theogravity](https://github.com/theogravity)! - Update README copy

  Updates the README intro to sound less... odd.

## 4.3.2

### Patch Changes

- [`58a9eaa`](https://github.com/theogravity/loglayer/commit/58a9eaacf4894b66fa6febea29a9b547f4059373) Thanks [@theogravity](https://github.com/theogravity)! - Update readme intro copy

## 4.3.1

### Patch Changes

- [#29](https://github.com/theogravity/loglayer/pull/29) [`0d5a9c7`](https://github.com/theogravity/loglayer/commit/0d5a9c77fd4ed02314285f69d6ab07affb1bbd15) Thanks [@theogravity](https://github.com/theogravity)! - Fixes child transport not inheriting plugins.

  Before plugins, hooks were copied to the child transport, so this fix makes the behavior consistent with prior behavior.

  The README for child loggers has been updated
  to include that plugins are now inherited.

## 4.3.0

### Minor Changes

- [`74756da`](https://github.com/theogravity/loglayer/commit/74756da219c8efaf06636c09255d613080df68e6) Thanks [@theogravity](https://github.com/theogravity)! - Add `onMetadataCalled()` plugin callback to hook into `withMetadata()` and `metadataOnly()` calls.

  See the README section on `intercept metadata calls` for usage details.

### Patch Changes

- [#27](https://github.com/theogravity/loglayer/pull/27) [`a6fb176`](https://github.com/theogravity/loglayer/commit/a6fb1768b9ac28900a09f4097aac47c4465ec7b9) Thanks [@theogravity](https://github.com/theogravity)! - Refactor `PluginManager` for performance improvements.

## 4.2.1

### Patch Changes

- [#25](https://github.com/theogravity/loglayer/pull/25) [`e5632c8`](https://github.com/theogravity/loglayer/commit/e5632c8470f5a16fdf5d70aff07e66ca51669fb0) Thanks [@theogravity](https://github.com/theogravity)! - Readme updates

## 4.2.0

### Minor Changes

- [#23](https://github.com/theogravity/loglayer/pull/23) [`e6323b7`](https://github.com/theogravity/loglayer/commit/e6323b7f182375aa28ee463556a893197c487af8) Thanks [@theogravity](https://github.com/theogravity)! - Add [`signale`](https://github.com/klaudiosinani/signale) support

  See README.md for more details.

- [#20](https://github.com/theogravity/loglayer/pull/20) [`c3b5468`](https://github.com/theogravity/loglayer/commit/c3b5468f961e89ccf1c3ac673d17ae5ef2905fa5) Thanks [@theogravity](https://github.com/theogravity)! - Add [`log4js-node`](https://github.com/log4js-node/log4js-node) support

  See README.md for more details.

- [#22](https://github.com/theogravity/loglayer/pull/22) [`2dfe830`](https://github.com/theogravity/loglayer/commit/2dfe830170b55ffdaaa1783a056ae6c08280187a) Thanks [@theogravity](https://github.com/theogravity)! - Add `fatal` log level support

  - Adds the `fatal()` method in `loglayer` to write to a `fatal`
    log level.
    - Any logging libraries that do not support `fatal` level will
      be written as an `error` level instead.

- [#24](https://github.com/theogravity/loglayer/pull/24) [`f989f15`](https://github.com/theogravity/loglayer/commit/f989f15d8ead2a8bf1e8ff5b6f0b4e810744fad6) Thanks [@theogravity](https://github.com/theogravity)! - Add consola support

## 4.1.1

### Patch Changes

- [#18](https://github.com/theogravity/loglayer/pull/18) [`14b969c`](https://github.com/theogravity/loglayer/commit/14b969cc64614400f9fdfd39d3c57486dc47c731) Thanks [@theogravity](https://github.com/theogravity)! - Tiny perf improvements

## 4.1.0

### Minor Changes

- [#15](https://github.com/theogravity/loglayer/pull/15) [`c583c94`](https://github.com/theogravity/loglayer/commit/c583c944f484df20be4796f77e517ed8aa48a0bf) Thanks [@theogravity](https://github.com/theogravity)! - Adds an optional `id` field to plugins and the ability to manage plugins.

  The following methods have been added:

  - `LogLayer#removePlugin(id: string)`
  - `LogLayer#enablePlugin(id: string)`
  - `LogLayer#disablePlugin(id: string)`

## 4.0.0

### Major Changes

- [#13](https://github.com/theogravity/loglayer/pull/13) [`d1a8cc2`](https://github.com/theogravity/loglayer/commit/d1a8cc21e4191547e839d334c9386e25f0410235) Thanks [@theogravity](https://github.com/theogravity)! - - Removes hooks and adds a plugin system where you can define multiple hooks to run instead.

  - Adds esm and cjs builds to the package

  **Breaking Changes**

  - The `hooks` option has been removed
  - The `setHooks()` method has been removed
  - A `plugins` option has been added
  - An `addPlugins()` method has been added

  _There will be a way to remove / disable specific plugins in a future release._

  **Migrating from 3.x to 4.x**

  Your 3.x definition may look like this:

  ```typescript
  {
    hooks: {
      onBeforeDataOut: ({ data }) => {
        // do something with data
        return data;
      },
      shouldSendToLogger: () => {
        return true;
      }
    }
  }
  ```

  The 4.x version of this would look like this:

  ```typescript
  {
    plugins: [
      {
        onBeforeDataOut: (data) => {
          // do something with data
          return data;
        },
        shouldSendToLogger: () => {
          return true;
        },
      },
    ];
  }
  ```

  Type changes:

  - `LogLayerHooksConfig` -> `LogLayerPlugin`
  - `HookBeforeDataOutParams` -> `PluginBeforeDataOutParams`
  - `HookBeforeDataOutFn` -> `PluginBeforeDataOutFn`
  - `HookShouldSendToLoggerParams` -> `PluginShouldSendToLoggerParams`
  - `HookShouldSendToLoggerFn` -> `PluginShouldSendToLoggerFn`

  Summary:

  - Replace `hooks` with `plugins`
  - For your existing hooks, move them into the `plugins` array where each entry is an object with the hook definition

  See `README.md` for more details.

## 3.1.0

- Added new configuration option `muteContext` and `muteMetadata` to disable context and metadata logging.
- Added the following methods:
  - `LogLayer#muteContext()`
  - `LogLayer#unmuteContext()`
  - `LogLayer#muteMetadata()`
  - `LogLayer#unmuteMetadata()`

See readme for usage details.

Internal: Switch from `eslint` to [`biomejs.dev`](https://biomejs.dev/) for linting.

## 3.0.1

- Created a separate Typescript type for the `onBeforeDataOut` hook parameter, `OnBeforeDataOutParams`.

## 3.0.0

**Breaking change**

- The hook `onBeforeDataOut` signature has changed
  - from: `onBeforeDataOut(data)`
  - to: `onBeforeDataOut({ data, logLevel })`

## 2.0.3

**Contributor:** Theo Gravity

- Adds `electron-log` support.

## 2.0.2 - Mon Mar 20 2023 16:46:04

**Contributor:** Theo Gravity

- Exports the `HookShouldSendToLoggerParams` type and sets a default value for the `Data` generic.

## 2.0.1 - Mon Mar 20 2023 13:19:47

**Contributor:** Theo Gravity

- Fixed issue where `shouldSendToLogger` may not send logs out because `messages` may have been manipulated. `messages`
  is now a copy of the original.

## 2.0.0 - Mon Mar 20 2023 12:25:30

**Contributor:** Theo Gravity

_Breaking change_

The `shouldSendToLogger` hook parameter is now an object, and adds in `logLevel` as a property.

See `README.md` for updated usage details.

## 1.6.0 - Wed Mar 15 2023 13:25:45

**Contributor:** Theo Gravity

- Add `shouldSendToLogger` hook (#11)

This hook allows you to conditionally send a log entry or not to the transport.

## 1.5.0 - Wed Mar 01 2023 13:11:13

**Contributor:** Theo Gravity

- Added log message prefixing
  - Can be set via `prefix` config option, or `LogLayer#withPrefix()`. See README.md for usage info.
- Fix issue where `LogLayer#child()` was setting empty context data when context has not been set at all

## 1.4.2 - Wed Nov 02 2022 05:23:14

**Contributor:** Theo Gravity

- Fix issue where `LogLayer#child()` was not creating a shallow copy of context (#10)

The documentation says the context should be shallow copied, but it wasn't. Now it is.

## 1.4.1 - Wed Nov 02 2022 05:06:51

**Contributor:** Theo Gravity

- Add support for creating child loggers (#9)

This adds a new method called `LogLayer#child()` that will create a new LogLayer instance with the original configuration and context data copied over.

## 1.3.4 - Mon Aug 22 2022 20:18:36

**Contributor:** Theo Gravity

- Add consoleDebug option (#7)

## 1.3.3 - Wed Aug 10 2022 04:17:36

**Contributor:** Theo Gravity

- Add config option and methods to disable / enable logging (#6)

This adds an optional config option called `enabled`, when set to `false`, will stop log output.

Corresponding methods `enableLogging()` and `disableLogging()` have also been added.

## 1.3.2 - Wed Aug 10 2022 02:24:37

**Contributor:** Theo Gravity

- Add `setHooks()` method (#5)

Adds a new method on `LogLayer` called `setHooks()` that allows
hooks to be set or updated after creation of the `LogLayer`.

Useful as an alternative to using configuration on init to set
a hook

## 1.3.1 - Wed Aug 10 2022 02:01:35

**Contributor:** Theo Gravity

- Add hooks feature, add onBeforeDataOut hook (#4)

This adds the ability to register hooks with `LogLayer`. The first available hook, `onBeforeDataOut()`, allows manipulation of the data object before it is sent to the logging library.

See the `README.md` hooks section for more details.

## 1.2.1 - Tue Aug 09 2022 01:50:05

**Contributor:** Theo Gravity

- Fix issue where data is lost if fieldName for context and metadata is the same (#3)

If you configure the context and metadata fieldName to have the same name,
only the metadata is captured, while the context is lost.

The data is now merged into the shared field.

## 1.1.1 - Mon Jun 13 2022 22:14:21

**Contributor:** Theo Gravity

- Add getContext() (#2)

Adds a new method to the transport, `getContext()`, which returns the current context.

## 1.0.2 - Mon Nov 29 2021 04:16:06

**Contributor:** Theo Gravity

- Update README.md

## 1.0.1 - Mon Nov 29 2021 03:48:11

**Contributor:** Theo Gravity

- Make withContext() chainable (#1)

- `withContext()` is now chainable. Most will want to call it right after creating a new `LogLayer` instead of having a separate line for it.
