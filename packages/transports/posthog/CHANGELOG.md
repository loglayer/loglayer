# `@loglayer/transport-posthog` Changelog

## 1.1.0

### Minor Changes

- [#418](https://github.com/loglayer/loglayer/pull/418) [`8406eec`](https://github.com/loglayer/loglayer/commit/8406eec67980a167cbbc2f0418b764d1cad6faac) Thanks [@theogravity](https://github.com/theogravity)! - Minor version bump to release the updated `ILogLayer` / `ILogBuilder` type system across the ecosystem. The core type change in `@loglayer/shared` (chainable methods now return `ILogLayer<This>` so types no longer collapse to `any` — see [#417](https://github.com/loglayer/loglayer/issues/417)) affects the types every package exposes and consumes, so all packages are re-released together at minor.

### Patch Changes

- Updated dependencies [[`8406eec`](https://github.com/loglayer/loglayer/commit/8406eec67980a167cbbc2f0418b764d1cad6faac)]:
  - @loglayer/transport@3.3.0

## 1.0.0

### Major Changes

- [#407](https://github.com/loglayer/loglayer/pull/407) [`586fcf4`](https://github.com/loglayer/loglayer/commit/586fcf42291e5e5c2e65d19c75720caf6f903f15) Thanks [@theogravity](https://github.com/theogravity)! - Add `@loglayer/transport-posthog` — a new transport that sends logs to PostHog via the `posthog-js` SDK's structured logger API.
