# Mixin Type Tests

**Internal package for testing mixin type combinations**

This package contains TypeScript type tests to ensure that the generic type parameters in `ILogLayer` and `ILogBuilder` work correctly with mixins.

## Purpose

- Verify that mixin methods are available on `ILogLayer` and `ILogBuilder` interfaces
- Test that method chaining preserves mixin types
- Ensure multiple mixins work together correctly
- Validate that transitions from `ILogLayer` to `ILogBuilder` preserve types
- Test mock classes (`MockLogLayer`, `MockLogBuilder`) work with mixins

## How It Works

This package defines example mixins:

1. **metrics-mixin** - Extends `ILogLayer` only
2. **dual-mixin** - Extends both `ILogLayer` and `ILogBuilder`
3. **hot-shots** - Real-world mixin from `@loglayer/mixin-hot-shots`

The `type-tests.ts` file contains 28 test functions that exercise various type scenarios. If the package compiles without TypeScript errors, the type system is working correctly.

## Note on Builder-Only Mixins

Builder-only mixins (that extend only `ILogBuilder`) are not included in these tests because `MockLogLayer` implements `ILogBuilder<MockLogLayer>`, and adding builder-only mixin methods would require `MockLogLayer` to also implement them. In practice, most mixins should extend both `ILogLayer` and `ILogBuilder` (like `dual-mixin`) to work seamlessly with both real and mock implementations.

## Running Tests

```bash
# From project root
pnpm --filter @loglayer/mixin-type-tests test:types

# Or with turbo
turbo run test:types --filter @loglayer/mixin-type-tests
```

## Test Scenarios

1. ILogLayer has mixin methods directly
2. Method chaining preserves ILogLayer mixin types
3. ILogBuilder has builder mixin methods
4. Method chaining preserves ILogBuilder mixin types
5. Multiple mixins work together on ILogLayer
6. Multiple mixins work together on ILogBuilder
7. LogLayer to ILogBuilder transition preserves types
8. MockLogLayer has mixin methods
9. MockLogLayer method chaining preserves types
10. MockLogLayer to builder transition
11. Concrete LogLayer type (not interface)
12. Concrete MockLogLayer type
13. Child logger preserves mixin types
14. withPrefix returns type with mixin methods
15. Complex chaining scenario
16. Type narrowing with explicit ILogBuilder type
17. Hot-shots mixin stats property available on ILogLayer
18. Hot-shots chaining with other mixin methods
19. Hot-shots with method chaining and builder transition
20. Hot-shots with MockLogLayer
21. Hot-shots with complex chaining scenarios
22. Hot-shots builder methods with tags and options
23. Intersection type with ILogLayer and single mixin
24. Intersection type with ILogLayer and multiple mixins
25. Intersection type with ILogBuilder and mixins
26. Factory function returning intersection type
27. Intersection type with child logger
28. Mixed usage - intersection types and automatic inference

## Adding New Tests

To add new type tests:

1. Create a new mixin in `src/` if needed
2. Add test functions to `src/type-tests.ts`
3. Run `pnpm test:types` to verify

The tests are purely compile-time - they don't need to run, just compile successfully.
