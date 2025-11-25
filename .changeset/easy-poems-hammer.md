---
"loglayer": minor
"@loglayer/shared": minor
---

_All changes are backwards-compatible._

**Enhanced Mixin Type System** - Major improvements to mixin type preservation through method chaining:

- `ILogLayer` and `ILogBuilder` interfaces are now generic with a `This` parameter (e.g., `ILogLayer<This = ILogLayer<any>>`), enabling automatic type preservation through method chaining
- All methods that preserve the logger instance (like `withContext()`, `child()`, `withPrefix()`) now return `This`, ensuring mixin methods remain available throughout the chain
- Methods that transition to the builder phase (`withMetadata()`, `withError()`) return `ILogBuilder<any>`
- This enhancement means mixin types are automatically preserved without requiring explicit type intersections
