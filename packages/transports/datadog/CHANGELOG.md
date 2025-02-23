# `@loglayer/transport-datadog` Changelog

## 3.0.2

### Patch Changes

- [#160](https://github.com/loglayer/loglayer/pull/160) [`161029a`](https://github.com/loglayer/loglayer/commit/161029ae9d89b600ab19bf15cbd500f5358f2403) Thanks [@theogravity](https://github.com/theogravity)! - external dependency version updates

- Updated dependencies [[`161029a`](https://github.com/loglayer/loglayer/commit/161029ae9d89b600ab19bf15cbd500f5358f2403)]:
  - @loglayer/transport@2.0.2

## 3.0.1

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@2.0.1

## 3.0.0

### Major Changes

- [#151](https://github.com/loglayer/loglayer/pull/151) [`5f1260b`](https://github.com/loglayer/loglayer/commit/5f1260b5b4609b2a20093f934a0a5cc1fced8d26) Thanks [@theogravity](https://github.com/theogravity)! - Bump major version to reflect major version bump to v6 in main loglayer library, which implements the new Context Manager feature.

### Patch Changes

- Updated dependencies [[`5f1260b`](https://github.com/loglayer/loglayer/commit/5f1260b5b4609b2a20093f934a0a5cc1fced8d26)]:
  - @loglayer/transport@2.0.0

## 2.0.11

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@1.2.5

## 2.0.10

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@1.2.4

## 2.0.9

### Patch Changes

- Updated dependencies [[`54b8223`](https://github.com/loglayer/loglayer/commit/54b822362f631891cff92d8279883eee994e66cb)]:
  - @loglayer/transport@1.2.3

## 2.0.8

### Patch Changes

- Updated dependencies []:
  - @loglayer/transport@1.2.2

## 2.0.7

### Patch Changes

- [#112](https://github.com/loglayer/loglayer/pull/112) [`561a1a6`](https://github.com/loglayer/loglayer/commit/561a1a64e0f386100bcf4a01fb6375df6e6e72d5) Thanks [@theogravity](https://github.com/theogravity)! - Update changelog doc formatting, add links to documentation site

- Updated dependencies [[`561a1a6`](https://github.com/loglayer/loglayer/commit/561a1a64e0f386100bcf4a01fb6375df6e6e72d5)]:
  - @loglayer/transport@1.2.1

## 2.0.6

### Patch Changes

- Updated dependencies [[`f3b89d3`](https://github.com/loglayer/loglayer/commit/f3b89d3c77da9fe4a4f981aca334145b735d9466)]:
  - @loglayer/transport@1.2.0

## 2.0.5

### Patch Changes

- Updated dependencies [[`06c8c20`](https://github.com/loglayer/loglayer/commit/06c8c207a569d6e7e6b66cc96abed8a7365bcfac)]:
  - @loglayer/transport@1.1.5

## 2.0.4

### Patch Changes

- [#92](https://github.com/loglayer/loglayer/pull/92) [`81c59d7`](https://github.com/loglayer/loglayer/commit/81c59d7bae68dd3f690d0d8d277bcba7c0414dc1) Thanks [@theogravity](https://github.com/theogravity)! - Add serialize-error to readme doc for @loglayer/transport-datadog

## 2.0.3

### Patch Changes

- Updated dependencies [[`d01dcb9`](https://github.com/loglayer/loglayer/commit/d01dcb91517ed1cb2b425799ab3432d36721bf46)]:
  - @loglayer/transport@1.1.4

## 2.0.2

### Patch Changes

- [#79](https://github.com/loglayer/loglayer/pull/79) [`f88d492`](https://github.com/loglayer/loglayer/commit/f88d49216706663c868f695e21bafab8bb8c745b) Thanks [@theogravity](https://github.com/theogravity)! - - Fixes an issue where a transport will still be called even if the enabled flag for it is false
  - Adds the `enabled?` flag to the `LogLayerTransport` interface in `@loglayer/transport`
  - Updates `@loglayer/transport-datadog` to not initialize the client lib if the transport is disabled

## 2.0.1

### Patch Changes

- [`cef5ab1`](https://github.com/loglayer/loglayer/commit/cef5ab1d5013c0759c5d344ef7ad0084f9698b2f) Thanks [@theogravity](https://github.com/theogravity)! - Readme updates

- Updated dependencies []:
  - @loglayer/transport@1.1.3

## 2.0.0

### Major Changes

- [#65](https://github.com/loglayer/loglayer/pull/65) [`a8f243d`](https://github.com/loglayer/loglayer/commit/a8f243d5c60c1deb2d5ce3ae134b797523008316) Thanks [@theogravity](https://github.com/theogravity)! - ## Breaking Changes

  We no longer provide a `createDataDogTransport` function. Instead, you should directly instantiate the `DataDogTransport` class:

  ```typescript
  // v1
  import { createDataDogTransport } from "@loglayer/transport-datadog";

  const log = new LogLayer({
    transport: createDataDogTransport({
      id: "datadog", // id was required in v1
      options: {
        // ... options
      },
    }),
  });

  // v2
  import { DataDogTransport } from "@loglayer/transport-datadog";

  const log = new LogLayer({
    transport: new DataDogTransport({
      options: {
        // ... options
      },
    }),
  });
  ```

### Patch Changes

- Updated dependencies [[`4a25d33`](https://github.com/loglayer/loglayer/commit/4a25d33ced2b5b1596a05b24adfcce26ab991a1f)]:
  - @loglayer/transport@1.1.2

## 1.0.2

### Patch Changes

- Updated dependencies [[`372a062`](https://github.com/loglayer/loglayer/commit/372a062138ffd4768a798180f02f3e9705842f0a)]:
  - @loglayer/transport@1.1.1

## 1.0.1

### Patch Changes

- [#55](https://github.com/loglayer/loglayer/pull/55) [`8aeeeb4`](https://github.com/loglayer/loglayer/commit/8aeeeb46a754a53235ed26a9cea9186a5477fce2) Thanks [@theogravity](https://github.com/theogravity)! - \* Add @loglayer/transport-datadog package for server-side DataDog support.
  - In `@loglayer/transport`, the `LogLayerTransport` interface generic is now defaulted to `any`.
- Updated dependencies [[`8aeeeb4`](https://github.com/loglayer/loglayer/commit/8aeeeb46a754a53235ed26a9cea9186a5477fce2)]:
  - @loglayer/transport@1.1.0
