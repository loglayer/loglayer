# `@loglayer/shared` Changelog

## 4.0.0

### Major Changes

- [`fc56d4b`](https://github.com/loglayer/loglayer/commit/fc56d4b0a989d464f4e727b27ee53cfe22835ddd) Thanks [@theogravity](https://github.com/theogravity)! - - Add lazy evaluation for dynamic context and metadata using the `lazy()` function. Lazy values are only evaluated when the log level is enabled, avoiding unnecessary computation for disabled log levels. This feature is adapted from [LogTape's lazy evaluation](https://logtape.org/manual/lazy). Thank you to the LogTape team for answering questions around its implementation!

  - `lazy()` supports async callbacks in metadata for values that require asynchronous operations (database queries, API calls, async storage). When async lazy values are present in metadata, log methods return `Promise<void>` so you can `await` the log call to ensure values are resolved before dispatch. Async lazy is not supported in context.
  - `getContext()` now resolves lazy values by default. Use `getContext({ raw: true })` to get the raw lazy wrappers.
  - Failed lazy callbacks now replace the value with `"[LazyEvalError]"`, still send the original log, and emit a separate error-level entry describing the failure. The `LAZY_EVAL_ERROR` constant is exported for programmatic detection.
  - Added `LogLevelPriority` and `LogLevelPriorityToNames` exports for mapping between log levels and their numeric priority values.

  There are no breaking changes. No migration steps are necessary aside from upgrading any external loglayer dependencies to their next major version.

## 3.3.0

### Minor Changes

- [#333](https://github.com/loglayer/loglayer/pull/333) [`4916581`](https://github.com/loglayer/loglayer/commit/491658199b210c293e195e708fdbed2be14d5880) Thanks [@theogravity](https://github.com/theogravity)! - `clearContext()` now accepts an optional parameter to clear specific context keys instead of all context data.

## 3.2.0

### Minor Changes

- [#321](https://github.com/loglayer/loglayer/pull/321) [`9155ec9`](https://github.com/loglayer/loglayer/commit/9155ec9bade32dfc089d449134bd91adc76d44e0) Thanks [@theogravity](https://github.com/theogravity)! - - Added `addTransport()` method to dynamically add one or more transports to an existing logger. If a transport with the same ID already exists, it will be replaced.
  - Added `removeTransport()` method to remove a transport by its ID. Returns `true` if the transport was found and removed, `false` otherwise.

## 3.1.1

### Patch Changes

- [#318](https://github.com/loglayer/loglayer/pull/318) [`358032a`](https://github.com/loglayer/loglayer/commit/358032a222e186cb9e34580a644831e7ce584869) Thanks [@theogravity](https://github.com/theogravity)! - - Add to package.json `sideEffects: false`, which will better help with tree shaking
  - Dev dependency updates

## 3.1.0

### Minor Changes

- [#316](https://github.com/loglayer/loglayer/pull/316) [`c45b39a`](https://github.com/loglayer/loglayer/commit/c45b39ac22f8209c9674c1c3c7395a9b4b49c2c9) Thanks [@theogravity](https://github.com/theogravity)! - _All changes are backwards-compatible._

  **Enhanced Mixin Type System** - Major improvements to mixin type preservation through method chaining:

  - `ILogLayer` and `ILogBuilder` interfaces are now generic with a `This` parameter (e.g., `ILogLayer<This = ILogLayer<any>>`), enabling automatic type preservation through method chaining
  - All methods that preserve the logger instance (like `withContext()`, `child()`, `withPrefix()`) now return `This`, ensuring mixin methods remain available throughout the chain
  - Methods that transition to the builder phase (`withMetadata()`, `withError()`) return `ILogBuilder<any>`
  - This enhancement means mixin types are automatically preserved without requiring explicit type intersections

## 3.1.0-alpha-0.0

### Minor Changes

- d5bb7f7: Better mixin support

## 3.0.1

### Patch Changes

- [`fa69748`](https://github.com/loglayer/loglayer/commit/fa69748f770bb70733efdfd02218f47770640fc1) Thanks [@theogravity](https://github.com/theogravity)! - Add optional disposable method to the `IContextManager` and `ILogLevelManager` interfaces. They've always supported it, but it was not explicitly noted for the interface.

## 3.0.0

### Major Changes

- [#305](https://github.com/loglayer/loglayer/pull/305) [`5af0d6b`](https://github.com/loglayer/loglayer/commit/5af0d6b28f0316007fbbe796c631b711630c6787) Thanks [@theogravity](https://github.com/theogravity)! - New version 8 of LogLayer introduces [Log Level Managers](https://loglayer.dev/log-level-managers/), a system for managing log level settings across logger instances. Log level managers provide a way to control how log levels are inherited and propagated between parent and child loggers.

  _v8 does not have any breaking changes; no migration steps are necessary to upgrade from v7 -> v8 of `loglayer`._

## 2.7.1

### Patch Changes

- [`8f10f44`](https://github.com/loglayer/loglayer/commit/8f10f4422b7577a048a167e27958bbfa59ab6076) Thanks [@theogravity](https://github.com/theogravity)! - Add the message param to `PluginTransformLogLevelParams`

## 2.7.0

### Minor Changes

- [#295](https://github.com/loglayer/loglayer/pull/295) [`4b0996c`](https://github.com/loglayer/loglayer/commit/4b0996ce75a2863359a1f5de0d563ab24828ec80) Thanks [@theogravity](https://github.com/theogravity)! - Add `transformLogLevel` plugin callback

## 2.6.0

### Minor Changes

- [`8554479`](https://github.com/loglayer/loglayer/commit/85544794d50ed92a427fed09edfbd3c29df8bacd) Thanks [@theogravity](https://github.com/theogravity)! - Add `getConfig()` method to `LogLayer` to get the user settings used when creating the instance.

## 2.5.3

### Patch Changes

- [#277](https://github.com/loglayer/loglayer/pull/277) [`1e01627`](https://github.com/loglayer/loglayer/commit/1e01627eeafb5e094da958532ad385cc59d70857) Thanks [@Eptagone](https://github.com/Eptagone)! - Migration from tsup to tsdown and small dependency updates.

## 2.5.2

### Patch Changes

- [`aa0d9e1`](https://github.com/loglayer/loglayer/commit/aa0d9e11afcbbc8ba4989459976da07557292ef3) Thanks [@theogravity](https://github.com/theogravity)! - Remove the `LogLayerContext` and `LogLayerMetadata` extension from the `LogLayerData` interface as context and metadata fields are user-configured, which the extension wouldn't capture. It now extends the Record instead.

## 2.5.1

### Patch Changes

- [#264](https://github.com/loglayer/loglayer/pull/264) [`1038d13`](https://github.com/loglayer/loglayer/commit/1038d132169add199b1dbd6c7ada6d6fa7a86218) Thanks [@Eptagone](https://github.com/Eptagone)! - Improve typing for log context, metadata, and data objects

## 2.5.0

### Minor Changes

- [#261](https://github.com/loglayer/loglayer/pull/261) [`9b32187`](https://github.com/loglayer/loglayer/commit/9b32187b1040f6331d0c21f666768da41d6c91a1) Thanks [@theogravity](https://github.com/theogravity)! - - Added new `raw()` method for advanced logging scenarios

  - Allows bypassing the normal LogLayer API to directly specify all aspects of a log entry
  - Supports complete control over log level, messages, metadata, error, and context
  - Still processes through all LogLayer features including plugins, context merging, and transport routing
  - See [Basic Logging documentation](https://loglayer.dev/logging-api/basic-logging.html#raw-logging) for usage examples

  - Fixed bug where `errorFieldInMetadata` option was not working correctly
    - Error objects were not being placed in metadata fields when `errorFieldInMetadata` was set to true
    - Now properly places errors in metadata fields as specified by the configuration

## 2.4.0

### Minor Changes

- [#239](https://github.com/loglayer/loglayer/pull/239) [`12ca18a`](https://github.com/loglayer/loglayer/commit/12ca18ad65181fcbfc4c34d804ed875b691b895d) Thanks [@theogravity](https://github.com/theogravity)! - - Transports now additionally receive the `error`, `metadata`, and `context` data in the `shipToLogger()` callback. \* It is still recommended to use `data` for most use-cases as it is a merged object of all data with the user's configured fields.

  - Plugin callbacks `onBeforeDataOut()` and `shouldSendToLogger()` now additionally receive the `error`, `metadata`, and `context` data.

  This change should allow a plugin or transport developer to inspect data without needing to know how the user has configured their `data` object.

## 2.3.1

### Patch Changes

- [#200](https://github.com/loglayer/loglayer/pull/200) [`a2f5a17`](https://github.com/loglayer/loglayer/commit/a2f5a17626279f9545c96796ca181938fe1ed905) Thanks [@theogravity](https://github.com/theogravity)! - Package dev dep updates, linting updates

## 2.3.0

### Minor Changes

- [#190](https://github.com/loglayer/loglayer/pull/190) [`818bae5`](https://github.com/loglayer/loglayer/commit/818bae5efbc4212013ac41878c1e4c4f5594e19c) Thanks [@theogravity](https://github.com/theogravity)! - Adds new log level control methods to `ILogLayer` and adds the `LogLayerType` type.

## 2.2.1

### Patch Changes

- [#175](https://github.com/loglayer/loglayer/pull/175) [`a66ce9b`](https://github.com/loglayer/loglayer/commit/a66ce9ba4f05d912576d3754fe74c5054ae8230d) Thanks [@theogravity](https://github.com/theogravity)! - Documentation updates

## 2.2.0

### Minor Changes

- [#169](https://github.com/loglayer/loglayer/pull/169) [`09e33ab`](https://github.com/loglayer/loglayer/commit/09e33ab216e35502ec9692a5ed44878a26573b1b) Thanks [@theogravity](https://github.com/theogravity)! - All transports now support multiple parameter passing in log methods

## 2.1.1

### Patch Changes

- [#160](https://github.com/loglayer/loglayer/pull/160) [`161029a`](https://github.com/loglayer/loglayer/commit/161029ae9d89b600ab19bf15cbd500f5358f2403) Thanks [@theogravity](https://github.com/theogravity)! - external dependency version updates

## 2.1.0

### Minor Changes

- [#153](https://github.com/loglayer/loglayer/pull/153) [`96a5c57`](https://github.com/loglayer/loglayer/commit/96a5c57c787b1cbd92fcc00ecc1d7468ce62fe09) Thanks [@theogravity](https://github.com/theogravity)! - Updates around context and metadata handling.

  - Added `clearContext()` to clear context data.
  - `withMetadata()` / `metadataOnly()` / `withContext()` now allows an empty value. Empty values will not result in any data mutations or plugin executions.

## 2.0.0

### Major Changes

- [#151](https://github.com/loglayer/loglayer/pull/151) [`5f1260b`](https://github.com/loglayer/loglayer/commit/5f1260b5b4609b2a20093f934a0a5cc1fced8d26) Thanks [@theogravity](https://github.com/theogravity)! - - New in v6: Context Manager implementation
  - **Breaking**: Removes `linkParentContext` option from `loglayer` configuration

## 1.3.0

### Minor Changes

- [#143](https://github.com/loglayer/loglayer/pull/143) [`733ba8f`](https://github.com/loglayer/loglayer/commit/733ba8f754166839fb00e727820e2e8901ceadbb) Thanks [@theogravity](https://github.com/theogravity)! - Move the plugin types to the shared package to support the new `withFreshPlugins()` method on `ILogLayer`,
  expose plugin-only types from shared package to plugin package.

## 1.2.1

### Patch Changes

- [#140](https://github.com/loglayer/loglayer/pull/140) [`d708ff7`](https://github.com/loglayer/loglayer/commit/d708ff76fd23a72343f2a9f8ce3c1fcc180adf74) Thanks [@theogravity](https://github.com/theogravity)! - Fix `metadataOnly` typescript def. The second parameter should always be optional.

## 1.2.0

### Minor Changes

- [#138](https://github.com/loglayer/loglayer/pull/138) [`54b8223`](https://github.com/loglayer/loglayer/commit/54b822362f631891cff92d8279883eee994e66cb) Thanks [@theogravity](https://github.com/theogravity)! - Add withFreshTransports method to `loglayer`

## 1.1.0

### Minor Changes

- [#129](https://github.com/loglayer/loglayer/pull/129) [`d8054c8`](https://github.com/loglayer/loglayer/commit/d8054c887f371621e23a53ff2ea90d99afcc0ec3) Thanks [@theogravity](https://github.com/theogravity)! - LogLayer now passes the `loglayer` instance as the last parameter to all plugin callbacks

## 1.0.5

### Patch Changes

- [#112](https://github.com/loglayer/loglayer/pull/112) [`561a1a6`](https://github.com/loglayer/loglayer/commit/561a1a64e0f386100bcf4a01fb6375df6e6e72d5) Thanks [@theogravity](https://github.com/theogravity)! - Update changelog doc formatting, add links to documentation site

## 1.0.4

### Patch Changes

- [`cef5ab1`](https://github.com/loglayer/loglayer/commit/cef5ab1d5013c0759c5d344ef7ad0084f9698b2f) Thanks [@theogravity](https://github.com/theogravity)! - Readme updates

## 1.0.3

### Patch Changes

- [`43ffd72`](https://github.com/loglayer/loglayer/commit/43ffd725d94e2ecdf58b4f002f06392611489582) Thanks [@theogravity](https://github.com/theogravity)! - docs: fix up documentation

## 1.0.2

### Patch Changes

- [`c136c0f`](https://github.com/loglayer/loglayer/commit/c136c0fbc044d80a03d1851e68e9c6a23dc8a8d8) Thanks [@theogravity](https://github.com/theogravity)! - README.md updates

## 1.0.1

### Patch Changes

- [`da9bc6f`](https://github.com/loglayer/loglayer/commit/da9bc6f59385834643d677bd998213cd84046f6f) Thanks [@theogravity](https://github.com/theogravity)! - Add LICENSE file (MIT) to packages

## 1.0.0

### Major Changes

- [`0fc607b`](https://github.com/loglayer/loglayer/commit/0fc607b2bcacaa1204905b5b54418933b7d5f680) Thanks [@theogravity](https://github.com/theogravity)! - chore: release first version
