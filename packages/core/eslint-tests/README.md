# @internal/eslint-tests

Private package that validates LogLayer's TypeScript types against strict ESLint rules.

## Purpose

This package uses `@typescript-eslint/recommended-type-checked` (which includes the [`no-floating-promises`](https://typescript-eslint.io/rules/no-floating-promises/) rule) to verify that:

- Log methods (`info`, `warn`, `error`, etc.) return `void` for standard usage
- Log methods return `Promise<void>` only when async lazy metadata is present
- `withMetadata()`, `withError()`, and builder chaining preserve correct return types
- `errorOnly()`, `metadataOnly()`, and `raw()` have correct return types
- `MockLogLayer` matches the same type contracts
- Plugins, mixins, child loggers, and all transports work without lint errors

## Test Files

| File | Coverage |
|------|----------|
| `setup.ts` | Shared LogLayer instances with all built-in transports |
| `log-methods.ts` | Direct log methods, errorOnly, withError, withMetadata, metadataOnly, sync lazy, chaining |
| `raw.ts` | `raw()` method with various configurations |
| `context-prefix-child.ts` | Context, prefix, child loggers, enable/disable, log levels, mute, transport/config |
| `plugins.ts` | All plugin callbacks, combinations, management, typed function signatures |
| `mock.ts` | MockLogLayer |
| `mixins.ts` | LogLayer/LogBuilder mixins, onConstruct, multiple mixins, plugins, array registration, child loggers |
| `async-lazy.ts` | Async lazy metadata (must be awaited) |

## Running

```bash
# TypeScript type checking
pnpm run verify-types

# ESLint with type-checked rules
pnpm run test
```

If any log call incorrectly returns `Promise<void>` when it should return `void`, ESLint will report a `no-floating-promises` error and the test will fail.
