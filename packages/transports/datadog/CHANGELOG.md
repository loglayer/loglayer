# Datadog Transport Changelog

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
