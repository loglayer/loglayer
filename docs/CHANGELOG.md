# LogLayer Docs Site Changelog

## 2.2.0

### Minor Changes

- [#158](https://github.com/loglayer/loglayer/pull/158) [`5e9ec91`](https://github.com/loglayer/loglayer/commit/5e9ec9178d2a303ce1bf6e44f96efc636db361ca) Thanks [@theogravity](https://github.com/theogravity)! - Add docs for pretty terminal transport

## 2.1.0

### Minor Changes

- [#153](https://github.com/loglayer/loglayer/pull/153) [`96a5c57`](https://github.com/loglayer/loglayer/commit/96a5c57c787b1cbd92fcc00ecc1d7468ce62fe09) Thanks [@theogravity](https://github.com/theogravity)! - Updates around context and metadata handling.

  - Added `clearContext()` to clear context data.
  - `withMetadata()` / `metadataOnly()` / `withContext()` now allows an empty value. Empty values will not result in any data mutations or plugin executions.

## 2.0.0

### Major Changes

- [#151](https://github.com/loglayer/loglayer/pull/151) [`5f1260b`](https://github.com/loglayer/loglayer/commit/5f1260b5b4609b2a20093f934a0a5cc1fced8d26) Thanks [@theogravity](https://github.com/theogravity)! - - New in v6: Context Manager implementation
  - **Breaking**: Removes `linkParentContext` option from `loglayer` configuration

## 1.16.0

### Minor Changes

- [#149](https://github.com/loglayer/loglayer/pull/149) [`213e3bc`](https://github.com/loglayer/loglayer/commit/213e3bc609a23a76e762ff5e25cb89e04a0010dc) Thanks [@theogravity](https://github.com/theogravity)! - - Add `linkParentContext` config option to keep context reference between child and parent
  - The plugin method `runOnContextCalled` is no longer called during `child()` if context data exists as it'd be a redundant
    call.

## 1.15.0

### Minor Changes

- [#143](https://github.com/loglayer/loglayer/pull/143) [`733ba8f`](https://github.com/loglayer/loglayer/commit/733ba8f754166839fb00e727820e2e8901ceadbb) Thanks [@theogravity](https://github.com/theogravity)! - Add `withFreshPlugins()` to replace existing plugins with new ones.

## 1.14.0

### Minor Changes

- [#138](https://github.com/loglayer/loglayer/pull/138) [`54b8223`](https://github.com/loglayer/loglayer/commit/54b822362f631891cff92d8279883eee994e66cb) Thanks [@theogravity](https://github.com/theogravity)! - Add withFreshTransports method to `loglayer`

## 1.13.0

### Minor Changes

- [`48a8f6f`](https://github.com/loglayer/loglayer/commit/48a8f6f008786ee1f25246a84d07af9555fd689d) Thanks [@theogravity](https://github.com/theogravity)! - Add the Axiom transport

## 1.12.0

### Minor Changes

- [#129](https://github.com/loglayer/loglayer/pull/129) [`d8054c8`](https://github.com/loglayer/loglayer/commit/d8054c887f371621e23a53ff2ea90d99afcc0ec3) Thanks [@theogravity](https://github.com/theogravity)! - LogLayer now passes the `loglayer` instance as the last parameter to all plugin callbacks

## 1.11.0

### Minor Changes

- [#127](https://github.com/loglayer/loglayer/pull/127) [`bf2022b`](https://github.com/loglayer/loglayer/commit/bf2022be6f905c8516748dd9dc8021924dda2c4b) Thanks [@theogravity](https://github.com/theogravity)! - Add new options to the `ConsoleTransport`:

  - `messageField`: Allows you to specify the field in the log message object where the message should be stored. This is useful when you want to log structured data and need to specify the field name for the message.
  - `level`: Sets the minimum log level to process. Messages with a lower priority level will be ignored.

## 1.10.0

### Minor Changes

- [#122](https://github.com/loglayer/loglayer/pull/122) [`e944b8d`](https://github.com/loglayer/loglayer/commit/e944b8de2f7b58391e7043a531b2eb4bdf1bf84e) Thanks [@theogravity](https://github.com/theogravity)! - Add documentation for the Log File Rotation transport

## 1.9.0

### Minor Changes

- [#116](https://github.com/loglayer/loglayer/pull/116) [`f067946`](https://github.com/loglayer/loglayer/commit/f067946e3326c0770b02e0fa59dfc605ad423f40) Thanks [@theogravity](https://github.com/theogravity)! - Add filter plugin

## 1.8.2

### Patch Changes

- [#114](https://github.com/loglayer/loglayer/pull/114) [`d0e67f1`](https://github.com/loglayer/loglayer/commit/d0e67f12ff0cc18cb17fcabc463c9c3a72f276e9) Thanks [@theogravity](https://github.com/theogravity)! - Add missing documentation around optional config options for `@loglayer/plugin-opentelemetry`

## 1.8.1

### Patch Changes

- [#112](https://github.com/loglayer/loglayer/pull/112) [`561a1a6`](https://github.com/loglayer/loglayer/commit/561a1a64e0f386100bcf4a01fb6375df6e6e72d5) Thanks [@theogravity](https://github.com/theogravity)! - Update changelog doc formatting, add links to documentation site

## 1.8.0

### Minor Changes

- [#110](https://github.com/loglayer/loglayer/pull/110) [`13154ed`](https://github.com/loglayer/loglayer/commit/13154eded5c0bb96de9ed73e04f2adb6438715e5) Thanks [@theogravity](https://github.com/theogravity)! - Add OpenTelemetry plugin

## 1.7.0

### Minor Changes

- [#108](https://github.com/loglayer/loglayer/pull/108) [`f3b89d3`](https://github.com/loglayer/loglayer/commit/f3b89d3c77da9fe4a4f981aca334145b735d9466) Thanks [@theogravity](https://github.com/theogravity)! - Add `level` field for cloud provider transports to filter out logs

## 1.6.0

### Minor Changes

- [#106](https://github.com/loglayer/loglayer/pull/106) [`84282df`](https://github.com/loglayer/loglayer/commit/84282dfd42f08f6356ba349f3343690070bd7088) Thanks [@theogravity](https://github.com/theogravity)! - Add OpenTelemetry transport

## 1.5.0

### Minor Changes

- [#101](https://github.com/loglayer/loglayer/pull/101) [`d5496ea`](https://github.com/loglayer/loglayer/commit/d5496ea6196dcf7bf161cdddd7a4f032b14a549c) Thanks [@theogravity](https://github.com/theogravity)! - Add Sumo Logic transport

## 1.4.0

### Minor Changes

- [#99](https://github.com/loglayer/loglayer/pull/99) [`06c8c20`](https://github.com/loglayer/loglayer/commit/06c8c207a569d6e7e6b66cc96abed8a7365bcfac) Thanks [@theogravity](https://github.com/theogravity)! - Adds support for Dynatrace

## 1.3.0

### Minor Changes

- [#97](https://github.com/loglayer/loglayer/pull/97) [`c38d650`](https://github.com/loglayer/loglayer/commit/c38d65064017013aaf13aa4291eddff6936204f8) Thanks [@theogravity](https://github.com/theogravity)! - Add plugin lifecycle method `onContextCalled` to intercept `withContext` calls

## 1.2.0

### Minor Changes

- [#89](https://github.com/loglayer/loglayer/pull/89) [`fe67df6`](https://github.com/loglayer/loglayer/commit/fe67df6167f7cb945cee13d855220cc405b7ef75) Thanks [@theogravity](https://github.com/theogravity)! - Add support for Google Cloud Logging

### Patch Changes

- [#92](https://github.com/loglayer/loglayer/pull/92) [`81c59d7`](https://github.com/loglayer/loglayer/commit/81c59d7bae68dd3f690d0d8d277bcba7c0414dc1) Thanks [@theogravity](https://github.com/theogravity)! - Add serialize-error to readme doc for @loglayer/transport-datadog

## 1.1.5

### Patch Changes

- [#86](https://github.com/loglayer/loglayer/pull/86) [`920c2ef`](https://github.com/loglayer/loglayer/commit/920c2ef269bcb1be2c00a818d92d8ea1dfb654a6) Thanks [@theogravity](https://github.com/theogravity)! - Add @loglayer/transport-loglevel

## 1.1.4

### Patch Changes

- [#82](https://github.com/loglayer/loglayer/pull/82) [`d668ce0`](https://github.com/loglayer/loglayer/commit/d668ce00bf50dc5dc83130f2d9463d1a7bd6f7b4) Thanks [@theogravity](https://github.com/theogravity)! - Add sprintf plugin

## 1.1.3

### Patch Changes

- [#74](https://github.com/loglayer/loglayer/pull/74) [`d92fce0`](https://github.com/loglayer/loglayer/commit/d92fce0bc04c385849614ab0e34fa8ed389b0ff3) Thanks [@theogravity](https://github.com/theogravity)! - Add an option `appendObjectData` in `ConsoleTransport` to allow for the object data to be at the end of the log entry instead of the beginning.

## 1.1.2

### Patch Changes

- [#70](https://github.com/loglayer/loglayer/pull/70) [`c422f9b`](https://github.com/loglayer/loglayer/commit/c422f9bb3eca7c0fe330c6d9af1288b47c80f30b) Thanks [@theogravity](https://github.com/theogravity)! - Add support for AWS Lambda Powertools Logger

## 1.1.1

### Patch Changes

- [`cef5ab1`](https://github.com/loglayer/loglayer/commit/cef5ab1d5013c0759c5d344ef7ad0084f9698b2f) Thanks [@theogravity](https://github.com/theogravity)! - Readme updates
