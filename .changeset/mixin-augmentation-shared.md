---
"@loglayer/mixin-hot-shots": minor
"@loglayer/mixin-datadog-http-metrics": minor
---

Augment the `ILogLayer` interface under `@loglayer/shared` (where it is defined) instead of `declare module "loglayer"` (which only re-exports it), matching `@loglayer/mixin-wide-events`.

This fixes a type error for consumers that combine these mixins with a mixin that augments `@loglayer/shared` (such as `@loglayer/mixin-wide-events`, which ships with LogLayer): when `ILogLayer` is augmented under both `"loglayer"` and `"@loglayer/shared"` by different coexisting mixins, the `"loglayer"`-targeted methods (e.g. `stats`, `ddStats`) stop resolving on chained return types such as `logger.child()` when the logger is typed as `ILogLayer`. A single mixin augmenting `"loglayer"` in isolation was unaffected. This is a type-only change; runtime behavior is unchanged.
