# Tagged Template Syntax Support — Design

## Overview

Add native tagged template syntax support to LogLayer log methods (`info`, `warn`, `error`, `debug`, `trace`, `fatal`) on both `LogLayer` and `LogBuilder`.

This allows users to write:
```typescript
log.info`User ${userId} logged in`;

// Works with fluent chains
log.withMetadata({ requestId }).warn`Request ${requestId} timed out`;
```

## Motivation

Tagged template syntax is a common JavaScript pattern for logging. Users expect to be able to write natural template strings without parentheses, and expect it to work seamlessly with LogLayer's fluent API.

## Design

### Tagged Template Detection

A tagged template call looks like:
```typescript
log.info`User ${userId} logged in`;
// Actually calls: log.info(["User ", " logged in"], userId)
```

**Detection logic:**
```typescript
function isTaggedTemplate(args: any[]): args is [TemplateStringsArray, ...any[]] {
  const first = args[0];
  return Array.isArray(first) && typeof (first as any).raw !== "undefined";
}
```

### String Reconstruction

```typescript
function taggedToString(strings: TemplateStringsArray, values: any[]): string {
  let result = "";
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      result += String(values[i]);
    }
  }
  return result;
}
```

- Uses `String()` for all values (produces "null" for null, "undefined" for undefined, "[object Object]" for objects)
- Template spaces are preserved (e.g., `${a} ${b}` keeps the space)

### Supported Methods

All log level methods on both `LogLayer` and `LogBuilder`:
- `info`
- `warn`
- `error`
- `debug`
- `trace`
- `fatal`

### TypeScript Overloads

Add overloaded signatures to `ILogLayer` and `ILogBuilder` interfaces:

```typescript
// Regular call
info(...messages: MessageDataType[]): LogReturnType<...>;

// Tagged template
info(strings: TemplateStringsArray, ...values: any[]): LogReturnType<...>;
```

### Behavior Rules

1. **Immediate value capture** — Values are captured when the template is evaluated (standard tagged template behavior)
2. **String coercion** — All interpolated values use `String(value)` for coercion
3. **Null/undefined handling** — `String(null)` → `"null"`, `String(undefined)` → `"undefined"`
4. **Object handling** — `String({...})` → `"[object Object]"` — encourages use of `withMetadata()`/`withContext()` for structured data
5. **Multiple interpolations** — Fully supported, all values concatenated in order
6. **Empty template** — `` info`message` `` works (values array is empty)

## Files to Modify

### Core Implementation

| File | Changes |
|------|---------|
| `packages/core/loglayer/src/LogLayer.ts` | Add tagged template detection + handling to all log methods |
| `packages/core/loglayer/src/LogBuilder.ts` | Add tagged template detection + handling to all log methods |
| `packages/core/loglayer/src/MockLogLayer.ts` | Add tagged template methods for test compatibility |
| `packages/core/loglayer/src/MockLogBuilder.ts` | Add tagged template methods for test compatibility |
| `packages/core/shared/src/loglayer.types.ts` | Add TypeScript overloads to `ILogLayer` and `ILogBuilder` |

### Tests

| File | Changes |
|------|---------|
| `packages/core/loglayer/src/__tests__/LogLayer.basic.test.ts` | Add tagged template tests |
| `packages/core/loglayer/src/__tests__/LogBuilder.test.ts` | Add tagged template tests |
| `packages/core/loglayer/src/__tests__/mock-types.test.ts` | Add type tests for mock implementations |

### Documentation

| File | Changes |
|------|---------|
| `docs/src/public/llms.txt` | Add reference |
| `docs/src/public/llms-full.txt` | Add reference |
| `docs/src/cheatsheet.md` | Add tagged template example |
| `docs/src/whats-new.md` | Document new feature |

## Implementation Checklist

- [ ] Add `isTaggedTemplate` and `taggedToString` utilities
- [ ] Update `LogLayer.info()` to handle tagged templates
- [ ] Update `LogLayer.warn()` to handle tagged templates
- [ ] Update `LogLayer.error()` to handle tagged templates
- [ ] Update `LogLayer.debug()` to handle tagged templates
- [ ] Update `LogLayer.trace()` to handle tagged templates
- [ ] Update `LogLayer.fatal()` to handle tagged templates
- [ ] Update `LogBuilder` log methods (same 6 methods)
- [ ] Update `MockLogLayer` and `MockLogBuilder`
- [ ] Update `ILogLayer` interface with overloads
- [ ] Update `ILogBuilder` interface with overloads
- [ ] Add unit tests
- [ ] Add type tests
- [ ] Update documentation
- [ ] Create changeset
- [ ] Run `turbo build && turbo verify-types && turbo test`

## Example Usage

```typescript
const log = new LogLayer({ transport: new ConsoleTransport() });

// Basic tagged template
const userId = "123";
log.info`User ${userId} logged in`;
// → "User 123 logged in"

// Multiple interpolations
const action = "login";
const timestamp = new Date().toISOString();
log.info`${action} at ${timestamp}`;
// → "login at 2026-05-25T10:30:00.000Z"

// With context
log.withContext({ requestId: "abc" }).info`Request ${requestId} completed`;

// With metadata and error
log
  .withMetadata({ duration: 150 })
  .withError(new Error("timeout"))
  .warn`Request timed out after ${duration}ms`;
```