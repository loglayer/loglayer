---
"@loglayer/shared": minor
"loglayer": minor
---

Fix `ILogLayer` type collapsing to `any` when chaining two or more methods that return the logger (e.g. `.child().child()`, `.withPrefix("a").withPrefix("b")`). These methods now return `ILogLayer<This>` instead of `This`, matching how `ILogBuilder` is typed, so the type stays stable across arbitrarily deep chains. Fixes [#417](https://github.com/loglayer/loglayer/issues/417).

Released as a minor because it changes the public `ILogLayer` type surface (exported from both `@loglayer/shared` and `loglayer`). Note that the tighter typing means downstream code that unknowingly relied on the previous `any` collapse (e.g. calling a nonexistent method on a doubly-chained result) may now surface a compile error.
