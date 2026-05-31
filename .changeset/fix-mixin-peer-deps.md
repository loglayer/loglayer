---
"@loglayer/mixin-wide-events": patch
"@loglayer/mixin-hot-shots": patch
"@loglayer/mixin-datadog-http-metrics": patch
---

fix: add `loglayer` as a peer dependency to all mixin packages

All mixin packages now declare `loglayer` as a peer dependency, ensuring tsdown externalizes `loglayer` types instead of bundling them inline. This fixes type incompatibility when using mixins with consumer projects that have their own `loglayer` installation.
