# `@loglayer/transport-simple-pretty-terminal` Changelog

## 2.2.11

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@2.3.7

## 2.2.10

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@2.3.6

## 2.2.9

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@2.3.5

## 2.2.8

### Patch Changes

- [#277](https://github.com/loglayer/loglayer/pull/277) [`1e01627`](https://github.com/loglayer/loglayer/commit/1e01627eeafb5e094da958532ad385cc59d70857) Thanks [@Eptagone](https://github.com/Eptagone)! - Migration from tsup to tsdown and small dependency updates.

- Updated dependencies [[`1e01627`](https://github.com/loglayer/loglayer/commit/1e01627eeafb5e094da958532ad385cc59d70857)]:
  - @loglayer/transport@2.3.4

## 2.2.7

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@2.3.3

## 2.2.6

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@2.3.2

## 2.2.5

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@2.3.1

## 2.2.4

### Patch Changes

- Updated dependencies [[`94d0230`](https://github.com/loglayer/loglayer/commit/94d0230a9f18f988257b72b9220432fd8101fa60)]:
  - @loglayer/transport@2.3.0

## 2.2.3

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@2.2.2

## 2.2.2

### Patch Changes

- [`edf99c8`](https://github.com/loglayer/loglayer/commit/edf99c8d2a740d2f706646c895848088b272a1be) Thanks [@theogravity](https://github.com/theogravity)! - Update chalk and date-fns packages

## 2.2.1

### Patch Changes

- [`a211dc7`](https://github.com/loglayer/loglayer/commit/a211dc75bdf25df642dff77aac23e023b1569530) Thanks [@theogravity](https://github.com/theogravity)! - Fixes a bug in expanded mode where if there is no data to print, will print out an empty line

## 2.2.0

### Minor Changes

- [#212](https://github.com/loglayer/loglayer/pull/212) [`fc0cdfd`](https://github.com/loglayer/loglayer/commit/fc0cdfde7e3ef70c28a41e2ae35864f950d1eba0) Thanks [@theogravity](https://github.com/theogravity)! - Remove algorithmic wrapping of text (decided it was better for the user's terminal to handle wrapping), add `includeDataInBrowserConsole` option to give users the ability to inspect object data when using browser devtools

## 2.1.0

### Minor Changes

- [#210](https://github.com/loglayer/loglayer/pull/210) [`3f761bb`](https://github.com/loglayer/loglayer/commit/3f761bbe13dc4da24673cac5a1c412ee8aecbcf3) Thanks [@theogravity](https://github.com/theogravity)! - In browser mode, use the appropriate console level method (eg console.error) instead of console.log for everything

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
