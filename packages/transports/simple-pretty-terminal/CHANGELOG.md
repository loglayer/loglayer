# `@loglayer/transport-simple-pretty-terminal` Changelog

## 2.0.0

### Major Changes

- [#207](https://github.com/loglayer/loglayer/pull/207) [`738ebe4`](https://github.com/loglayer/loglayer/commit/738ebe405715662ad9d1417dffe8ab547695afff) Thanks [@theogravity](https://github.com/theogravity)! - Remove writeFn, add in a `runtime` mode, which adds browser-rendering support

## 1.2.0

### Major Changes

- Added browser compatibility with new `runtime` configuration option
- Removed `writeFn` configuration option in favor of `runtime` option
- Made all `process.stdout` references optional for browser compatibility

### Features

- Added `runtime` configuration option with values `'node'` or `'browser'`
- In `'node'` runtime, logs are written using `process.stdout.write`
- In `'browser'` runtime, logs are written using `console.log`
- Default runtime is `'node'` for backward compatibility

## 1.1.0

### Minor Changes

- [#205](https://github.com/loglayer/loglayer/pull/205) [`0c287b2`](https://github.com/loglayer/loglayer/commit/0c287b2a69290d8b623e3cf9b9595d3f007dd7cf) Thanks [@theogravity](https://github.com/theogravity)! - Add writeFn config option to customize how to write out the logs

## 1.0.0

### Major Changes

- [`ebbdad`](https://github.com/loglayer/loglayer/commit/ebbdad24b097412e71d2c30d8e239cf3cc935bb7) Thanks [@theogravity](https://github.com/theogravity)! - First version
