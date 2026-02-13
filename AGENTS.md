# LogLayer Agent Guidelines

> **Note:** Always-applicable rules (code patterns, testing, documentation, workflow) are in `.claude/rules/`. This file contains reference material for specific development tasks.

## Table of Contents

- [Project Overview](#project-overview)
- [Project Structure](#project-structure)
- [Plugin Development](#plugin-development)
- [Context Manager Development](#context-manager-development)
- [Log Level Manager Development](#log-level-manager-development)
- [Mixin Development](#mixin-development)
- [Transport Development](#transport-development)
- [Core LogLayer Development](#core-loglayer-development)

---

## Project Overview

LogLayer is a universal logging library for TypeScript/JavaScript that provides a unified interface for various logging backends. The project is organized as a monorepo using pnpm workspaces and Turborepo.

**Key Technologies:**
- **Package Manager**: pnpm
- **Build System**: Turborepo (turbo)
- **Testing Framework**: vitest
- **Build Tool**: tsdown
- **Documentation**: VitePress
- **Linting/Formatting**: Biome

---

## Project Structure

```
loglayer/
├── docs/                         # Documentation site (VitePress)
│   ├── .vitepress/               # VitePress configuration (including sidebar config)
│   ├── src/                      # Documentation site doc files
│   │   ├── context-managers/     # Context manager documentation
│   │   ├── example-integrations/ # Example integrations
│   │   ├── logging-api/          # LogLayer API documentation
│   │   ├── log-level-managers/   # Log Level Manager documentation
│   │   ├── plugins/              # Plugin documentation
│   │   ├── transports/           # Transport documentation
│   │   └── mixins/               # Mixin documentation
├── packages/
│   ├── core/                     # Core packages
│   │   ├── context-manager/      # Context manager system core
│   │   ├── log-level-manager/    # Log level manager system core
│   │   ├── loglayer/             # Main LogLayer implementation
│   │   ├── plugin/               # Plugin system core
│   │   ├── transport/            # Transport system core
│   │   ├── shared/               # Shared utilities and types
│   │   └── tsconfig/             # Shared TypeScript configurations
│   ├── context-managers/         # Official context manager implementations
│   ├── log-level-managers/       # Official log level manager implementations
│   ├── transports/               # Official transport implementations
│   ├── mixins/                   # Official mixin implementations
│   └── plugins/                  # Official plugins
```

### Common Package Files

Each package in `packages/` typically includes:

- **`biome.json`**: Biome configuration (extends path depends on package location)
- **`CHANGELOG.md`**: Auto-generated changelog (top header should be package name)
- **`LICENSE`**: License file (usually MIT)
- **`package.json`**: NPM package configuration
- **`README.md`**: Package readme (top header should be package name)
- **`tsconfig.json`**: TypeScript configuration
- **`tsdown.config.json`**: tsdown build configuration
- **`turbo.json`**: Turborepo configuration

---

## Plugin Development

### Overview

Plugins intercept and modify log processing at various stages of the logging pipeline. They can filter, transform, or enrich log data before it reaches transports.

### Plugin Interface

Plugins must implement the `LogLayerPlugin` interface:

```typescript
import type { LogLayerPlugin, PluginShouldSendToLoggerParams } from "@loglayer/plugin";

export function myPlugin(config: MyPluginConfig): LogLayerPlugin {
  return {
    id: config.id,                    // Optional: Plugin identifier
    disabled: config.disabled,        // Optional: Disable plugin

    // Optional: Filter logs before they reach the logger
    shouldSendToLogger: (params: PluginShouldSendToLoggerParams) => {
      // Return true to allow, false to filter out
      return true;
    },

    // Optional: Modify data before it goes to transports
    onBeforeDataOut: (params) => {
      // Transform or enrich the data
      return params;
    },
  };
}
```

### Plugin Hooks

1. **`shouldSendToLogger`**: Determine if a log should be processed (returns `boolean`)
2. **`onBeforeDataOut`**: Transform data before sending to transports (returns modified `params`)

### Plugin Structure

```
packages/plugins/my-plugin/
├── src/
│   ├── plugin.ts          # Main plugin factory function
│   ├── types.ts           # TypeScript types/interfaces
│   └── __tests__/         # Unit tests
├── package.json
├── tsconfig.json
├── tsdown.config.json
└── README.md
```

### Best Practices

1. Keep plugins focused: each plugin should do one thing well
2. Handle errors gracefully: don't throw errors that break logging
3. Document configuration: clear documentation for all config options
4. Test thoroughly: unit tests for filtering logic and transformations
5. Performance matters: plugins run on every log message

---

## Context Manager Development

### Overview

Context managers control how context data (metadata that persists across log calls) is shared between parent and child loggers.

### Context Manager Interface

Context managers must implement the `IContextManager` interface:

```typescript
import type { IContextManager, OnChildLoggerCreatedParams } from "@loglayer/context-manager";

export class MyContextManager implements IContextManager {
  setContext(context?: Record<string, any>): void { /* ... */ }
  appendContext(context: Record<string, any>): void { /* ... */ }
  getContext(): Record<string, any> { /* ... */ }
  hasContext(): boolean { /* ... */ }
  onChildLoggerCreated(params: OnChildLoggerCreatedParams): IContextManager { /* ... */ }
}
```

### Context Manager Types

1. **LinkedContextManager**: Bi-directional sync between parent and children
2. **IsolatedContextManager**: Each logger has independent context
3. **OneWayContextManager**: Parent changes flow to children only

### Key Considerations

1. **Object references**: Decide if parent/child share object references or copy data
2. **Performance**: Context is accessed on every log call
3. **Memory management**: Avoid memory leaks with circular references
4. **Thread safety**: Consider async contexts if applicable

---

## Log Level Manager Development

### Overview

Log level managers control which log levels are enabled/disabled and how settings propagate between parent and child loggers.

### Log Level Manager Interface

```typescript
import type { ILogLevelManager, LogLevelType, OnChildLogLevelManagerCreatedParams } from "@loglayer/log-level-manager";

export class MyLogLevelManager implements ILogLevelManager {
  setLevel(logLevel: LogLevelType): void { /* ... */ }
  enableLevel(logLevel: LogLevelType): void { /* ... */ }
  disableLevel(logLevel: LogLevelType): void { /* ... */ }
  isLevelEnabled(logLevel: LogLevelType): boolean { /* ... */ }
  onChildLogLevelManagerCreated(params: OnChildLogLevelManagerCreatedParams): ILogLevelManager { /* ... */ }
}
```

### Log Level Manager Types

1. **GlobalLogLevelManager**: Changes apply to all loggers globally
2. **LinkedLogLevelManager**: Bi-directional sync between parent and children
3. **OneWayLogLevelManager**: Parent changes flow to children only

### Log Levels and Priority

```typescript
enum LogLevel {
  trace = "trace",    // Priority: 0
  debug = "debug",    // Priority: 1
  info = "info",      // Priority: 2
  warn = "warn",      // Priority: 3
  error = "error",    // Priority: 4
  fatal = "fatal",    // Priority: 5
}
```

---

## Mixin Development

### Overview

Mixins extend LogLayer functionality by adding methods directly to `ILogLayer` and `ILogBuilder` interfaces.

### Type Declarations (Required)

All mixins must augment both modules:

```typescript
// Define generic mixin interface
export interface ICustomMixin<T> {
  customMethod(param: string): T;
}

// Required: Augment @loglayer/shared for type preservation
declare module '@loglayer/shared' {
  interface ILogLayer<This> extends ICustomMixin<This> {}
}

// Required: Augment loglayer for runtime prototype augmentation
declare module 'loglayer' {
  interface LogLayer extends ICustomMixin<LogLayer> {}
  interface MockLogLayer extends ICustomMixin<MockLogLayer> {}
}
```

### Augmenting ILogBuilder

```typescript
export interface ICustomBuilderMixin<T> {
  customBuilderMethod(param: string): T;
}

declare module '@loglayer/shared' {
  interface ILogBuilder<This> extends ICustomBuilderMixin<This> {}
}

declare module 'loglayer' {
  interface LogBuilder extends ICustomBuilderMixin<LogBuilder> {}
  interface MockLogBuilder extends ICustomBuilderMixin<MockLogBuilder> {}
}
```

### Augmenting Both Interfaces

```typescript
export interface IPerfTimingMixin<T> {
  withPerfStart(id: string): T;
  withPerfEnd(id: string): T;
}

declare module '@loglayer/shared' {
  interface ILogLayer<This> extends IPerfTimingMixin<This> {}
  interface ILogBuilder<This> extends IPerfTimingMixin<This> {}
}

declare module 'loglayer' {
  interface LogLayer extends IPerfTimingMixin<LogLayer> {}
  interface LogBuilder extends IPerfTimingMixin<LogBuilder> {}
  interface MockLogLayer extends IPerfTimingMixin<MockLogLayer> {}
  interface MockLogBuilder extends IPerfTimingMixin<MockLogBuilder> {}
}
```

### Implementation Requirements

Always use regular functions (not arrow functions) when assigning methods to prototypes:

```typescript
// ✅ CORRECT
augment: (prototype) => {
  prototype.myMethod = function (this: LogLayer) {
    return this;
  };
}

// ❌ INCORRECT
augment: (prototype) => {
  prototype.myMethod = () => { /* `this` may be wrong */ };
}
```

### Testing Mixins

1. Unit tests with MockLogLayer (test without side effects)
2. Integration tests with real LogLayer instances
3. Multiple mixin tests (verify compatibility)
4. Type tests (compile-time validation) — see `packages/mixins/type-tests/`

---

## Transport Development

### Using HTTP Transport

When creating a transport that calls an HTTP API:

1. Add `@loglayer/transport-http` package dependency
2. Config should extend `HttpTransportConfig`
3. Transport should extend `HttpTransport`
4. Copy `turbo.json` from logflare transport as template

### Documentation Requirements

In `docs/` site documentation:
1. Include HTTP Transport optional configuration options using partial:
   ```markdown
   <!--@include: ./_partials/http-transport-options.md-->
   ```
2. Place after transport-specific options
3. Add environment badges (browser, server, deno, bun)
4. Include `onDebug` and `onError` examples

### Transport Structure

**Required Methods:**
- `sendToTransport()`: Core logging implementation
- Constructor with configuration
- Error handling

**Best Practices:**
- Look at existing transports for patterns
- Handle errors gracefully
- Support all log levels
- Implement batching if appropriate
- Add comprehensive tests (unit + live)

---

## Core LogLayer Development

### Adding New Methods to LogLayer

Update the following files:

1. **`packages/core/loglayer/src/LogLayer.ts`**: Add the implementation
2. **`packages/core/shared/src/loglayer.types.ts`**: Add method signature to `ILogLayer` interface
3. **`packages/core/loglayer/src/MockLogLayer.ts`**: Add mock implementation
4. **`packages/core/loglayer/src/__tests__/`**: Add tests

### Adding New Methods to LogBuilder

1. **`packages/core/loglayer/src/LogBuilder.ts`**: Add the implementation
2. **`packages/core/shared/src/loglayer.types.ts`**: Add method signature to `ILogBuilder` interface
3. **`packages/core/loglayer/src/MockLogBuilder.ts`**: Add mock implementation
4. **`packages/core/loglayer/src/__tests__/`**: Add tests

### Implementation Checklist

```markdown
- [ ] Add method implementation
- [ ] Add method signature to interface in `@loglayer/shared`
- [ ] Add mock implementation
- [ ] Add type test to `mock-types.test.ts`
- [ ] Write unit tests
- [ ] Update documentation (site docs if user-facing)
- [ ] Update `docs/src/whats-new.md`
- [ ] Update `docs/src/public/llms.txt` and `docs/src/public/llms-full.txt` if API surface changed
- [ ] Run `turbo build --filter=loglayer --filter=@loglayer/shared`
- [ ] Run `turbo verify-types --filter=loglayer --filter=@loglayer/shared`
- [ ] Run `turbo test --filter=loglayer`
```

### Updating Mock Implementations

When modifying interfaces, update the corresponding mock implementations:

| Interface | Mock Implementation | Type Tests |
|-----------|-------------------|------------|
| `ILogLayer` | `packages/core/loglayer/src/MockLogLayer.ts` | `packages/core/loglayer/src/__tests__/mock-types.test.ts` |
| `ILogBuilder` | `packages/core/loglayer/src/MockLogBuilder.ts` | `packages/core/loglayer/src/__tests__/mock-types.test.ts` |
| `IContextManager` | `packages/core/context-manager/src/MockContextManager.ts` | `packages/core/context-manager/src/__tests__/mock-types.test.ts` |
| `ILogLevelManager` | `packages/core/log-level-manager/src/MockLogLevelManager.ts` | `packages/core/log-level-manager/src/__tests__/mock-types.test.ts` |

Type tests verify mock implementations match their interfaces using `Parameters<>`:

```typescript
expectTypeOf<Parameters<MockLogLayer["clearContext"]>>().toEqualTypeOf<
  Parameters<ILogLayer<MockLogLayer>["clearContext"]>
>();
```

### Parent-Child Logger Behavior

When implementing features that modify logger state, consider:

1. **Isolation**: Changes should not affect parent or previously-created children
2. **Inheritance**: Document whether child loggers inherit the change
3. **Disposal**: Properly dispose of old resources when replacing them

### Test File Naming

- `LogLayer.basic.test.ts` — Basic logging
- `LogLayer.transport-management.test.ts` — Transport features
- `LogLayer.plugins.test.ts` — Plugin features
- `LogLayer.config.test.ts` — Configuration options
