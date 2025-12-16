# LogLayer Agent Guidelines

This document provides comprehensive guidelines for AI agents working on the LogLayer project. It covers project structure, package management, testing, documentation, and development workflows.

## Table of Contents

- [Project Overview](#project-overview)
- [Project Structure](#project-structure)
- [Package Management](#package-management)
- [Testing](#testing)
- [Documentation](#documentation)
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

## Package Management

### Using pnpm

This project uses **pnpm** as the package manager.

```bash
# Install dependencies
pnpm install

# Run package-level scripts
pnpm run <script>

# Example: Run tests in current package
pnpm run test
```

### Using Turborepo

This project uses **Turborepo** to run package scripts across the monorepo.

```bash
# Build all packages
turbo build

# Run all tests (only use when testing all packages)
turbo test

# Run tests for specific package
turbo test --filter <package-name>

# Force re-run (bypass cache)
turbo build --force
```

### Referencing Project Packages

When a new package depends on another project package, use `workspace:*` for the version in `package.json` since we use pnpm workspaces.

**Example `package.json`:**

```json
{
  "dependencies": {
    "@loglayer/transport-http": "workspace:*"
  },
  "devDependencies": {
    "loglayer": "workspace:*",
    "@loglayer/shared": "workspace:*"
  }
}
```

After adding workspace dependencies, run:

```bash
pnpm install
```

---

## Testing

**IMPORTANT:** All code changes must include tests. Write tests for:
- New features and functionality
- Bug fixes (test that reproduces the bug, then verify the fix)
- Refactorings (ensure behavior is preserved)
- Edge cases and error conditions

### Unit Testing

Unit tests are written using **vitest**.

```bash
# Run tests in current package
pnpm run test

# Run tests for all packages
turbo test
```

**Workflow:**
1. Write your code changes
2. Write tests that cover your changes
3. Run tests to verify they pass
4. If tests fail, fix the code or tests
5. Repeat until all tests pass

### Transport Tests

#### Unit Tests

Transport unit tests are located in `packages/transports/<transport-name>/src/__tests__/`.

**Best Practices:**
- Look at other transport unit tests for examples
- The backing library for the transport is typically mocked
- Tests should verify configuration, error handling, and log formatting

#### Live Tests

Live tests test the transport with the actual backing library (non-mocked). They are defined in `__tests__/livetest.ts`.

**Key Points:**
- Use `import { testTransportOutput } from "@loglayer/transport";` to test the transport
- Look at other `livetest.ts` files for example implementations
- Live tests validate real-world behavior with external services

### Type Testing

For packages that rely heavily on TypeScript types (like mixins), create type tests that verify compile-time type correctness:

```typescript
// type-tests.ts
import type { ILogLayer } from 'loglayer';
import { LogLayer } from 'loglayer';

function test_TypePreservation() {
  const logger: ILogLayer = new LogLayer({ transport: {} as any });
  logger.withContext({ userId: 123 }).info('test');
}
```

Add a `test:types` script in `package.json`:

```json
{
  "scripts": {
    "test:types": "tsc --noEmit"
  }
}
```

---

## Documentation

Documentation consists of:
1. **Package-level `README.md`** files
2. **Documentation site** files (VitePress)

### Writing README.md

Every package `README.md` must include:

1. **npm version badge**
2. **downloads badge**
3. **TypeScript badge**
4. **Simple description** with link to https://loglayer.dev
5. **Link to corresponding site documentation**

**Content Guidelines:**
- Include only installation and basic setup
- Use bare minimum details
- Reserve deeper details/advanced configuration for site documentation
- See other README.md files for examples

### Code Examples

**Correct LogLayer Usage:**

```typescript
// ✅ CORRECT
log.withMetadata({ test: data }).info("hello world")
log.withError(new Error("test")).error("hello world")

// ❌ INCORRECT - LogLayer does NOT support this
log.info("hello world", { test: data })
log.error("hello world", new Error("test"))
```

**Importing LogLayer:**

```typescript
// ✅ CORRECT
import { LogLayer } from 'loglayer';
import { ConsoleTransport } from 'loglayer';

// ❌ INCORRECT - @loglayer/core does not exist
import { LogLayer } from '@loglayer/core';
```

**Configuration Fields:**
- The `id` field on plugins and transports is always optional
- Do NOT include `id` in code examples unless specifically required

### Writing Site Documentation

**Required Elements:**
- npm version badge
- Link to source on GitHub
- Install instructions for npm/yarn/pnpm (presented in a group)
- Configuration presented as tables
- Use LogLayer methods correctly in code examples

**Adding New Packages:**

Add package to appropriate list file:
- `context-manager-list.md`: Context managers
- `plugin-list.md`: Plugins
- `transport-list.md`: Transports
- `mixin-list.md`: Mixins

Add to sidebar config: `docs/.vitepress/config.mts`

### Configuration Tables

Create separate tables for required and optional parameters.

**Table Headers:**
- **Name**: Parameter/property name
- **Type**: Parameter/property type
- **Default**: Default value (use backticks for code)
- **Description**: What the parameter does

### Custom Containers (Info Boxes)

VitePress supports custom containers for highlighting information:

```markdown
::: info Title
This is an info box.
:::

::: tip Title
This is a tip.
:::

::: warning Title
This is a warning.
:::

::: danger Title
This is a dangerous warning. Use for MUST-type instructions.
:::

::: details Title
This is a collapsible details block for optional lengthy information.
:::
```

**Example:**

```markdown
::: tip Defining constants
Use the `const` keyword to define a constant.
:::
```

### Writing What's New

1. Calculate the current date (month in short form: Nov 22, 2025)
2. If date already exists in `docs/src/whats-new.md`, add to that entry
3. Document all significant changes with clear descriptions
4. Include package name and version when applicable

**Format:**

```markdown
## Nov 22, 2025

`package-name`:

- Brief description of change
- Another change

`another-package`:

- Change description
```

### Changelogs

**IMPORTANT:** Do NOT write changelog entries. Changelogs are auto-generated and must be manually managed by the user.

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

Plugins can implement the following hooks:

1. **`shouldSendToLogger`**: Determine if a log should be processed
   - Returns `boolean`
   - Use for filtering logs based on level, content, context, etc.

2. **`onBeforeDataOut`**: Transform data before sending to transports
   - Returns modified `params`
   - Use for adding metadata, redacting sensitive data, etc.

### Plugin Structure

**Typical plugin structure:**

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

1. **Keep plugins focused**: Each plugin should do one thing well
2. **Handle errors gracefully**: Don't throw errors that break logging
3. **Document configuration**: Clear documentation for all config options
4. **Test thoroughly**: Unit tests for filtering logic and transformations
5. **Performance matters**: Plugins run on every log message

### Example: Filter Plugin

```typescript
import type { LogLayerPlugin, PluginShouldSendToLoggerParams } from "@loglayer/plugin";

export function filterPlugin(config: { level: string }): LogLayerPlugin {
  return {
    id: config.id,
    shouldSendToLogger: (params: PluginShouldSendToLoggerParams) => {
      // Only allow logs at or above configured level
      return params.logLevel.priority >= LogLevel[config.level];
    },
  };
}
```

---

## Context Manager Development

### Overview

Context managers control how context data (metadata that persists across log calls) is shared between parent and child loggers.

### Context Manager Interface

Context managers must implement the `IContextManager` interface:

```typescript
import type { IContextManager, OnChildLoggerCreatedParams } from "@loglayer/context-manager";

export class MyContextManager implements IContextManager {
  /**
   * Sets the context data to be included with every log entry.
   * Set to undefined to clear the context data.
   */
  setContext(context?: Record<string, any>): void {
    // Implementation
  }

  /**
   * Appends context data to the existing context data.
   */
  appendContext(context: Record<string, any>): void {
    // Implementation
  }

  /**
   * Returns the context data to be included with every log entry.
   */
  getContext(): Record<string, any> {
    // Implementation
  }

  /**
   * Returns true if context data is present.
   */
  hasContext(): boolean {
    // Implementation
  }

  /**
   * Called when a child logger is created.
   * Return a new context manager instance for the child.
   */
  onChildLoggerCreated(params: OnChildLoggerCreatedParams): IContextManager {
    // Implementation
  }
}
```

### Context Manager Types

LogLayer includes three official context managers:

1. **LinkedContextManager**: Bi-directional sync between parent and children
2. **IsolatedContextManager**: Each logger has independent context
3. **OneWayContextManager**: Parent changes flow to children only

### Implementation Guidelines

**Key considerations:**

1. **Object references**: Decide if parent/child share object references or copy data
2. **Performance**: Context is accessed on every log call
3. **Memory management**: Avoid memory leaks with circular references
4. **Thread safety**: Consider async contexts if applicable

### Example: Isolated Context Manager

```typescript
export class IsolatedContextManager implements IContextManager {
  private context: Record<string, any> = {};
  private _hasContext = false;

  setContext(context?: Record<string, any>): void {
    if (!context) {
      this.context = {};
      this._hasContext = false;
      return;
    }
    this.context = { ...context };
    this._hasContext = true;
  }

  appendContext(context: Record<string, any>): void {
    this.context = { ...this.context, ...context };
    this._hasContext = true;
  }

  getContext(): Record<string, any> {
    return this.context;
  }

  hasContext(): boolean {
    return this._hasContext;
  }

  onChildLoggerCreated(): IContextManager {
    // Return new instance with no shared state
    return new IsolatedContextManager();
  }
}
```

### Testing Context Managers

Test scenarios should cover:

1. **Setting and getting context**
2. **Appending context**
3. **Clearing context**
4. **Parent-child relationships**
5. **Context isolation/sharing behavior**

---

## Log Level Manager Development

### Overview

Log level managers control which log levels are enabled/disabled and how these settings propagate between parent and child loggers.

### Log Level Manager Interface

Log level managers must implement the `ILogLevelManager` interface:

```typescript
import type {
  ILogLevelManager,
  LogLevelType,
  OnChildLogLevelManagerCreatedParams
} from "@loglayer/log-level-manager";

export class MyLogLevelManager implements ILogLevelManager {
  /**
   * Sets the minimum log level. Only messages with this level
   * or higher severity will be logged.
   */
  setLevel(logLevel: LogLevelType): void {
    // Implementation
  }

  /**
   * Enables a specific log level.
   */
  enableLevel(logLevel: LogLevelType): void {
    // Implementation
  }

  /**
   * Disables a specific log level.
   */
  disableLevel(logLevel: LogLevelType): void {
    // Implementation
  }

  /**
   * Returns true if the specified log level is enabled.
   */
  isLevelEnabled(logLevel: LogLevelType): boolean {
    // Implementation
  }

  /**
   * Called when a child logger is created.
   * Return a new log level manager instance for the child.
   */
  onChildLogLevelManagerCreated(params: OnChildLogLevelManagerCreatedParams): ILogLevelManager {
    // Implementation
  }
}
```

### Log Level Manager Types

LogLayer includes three official log level managers:

1. **GlobalLogLevelManager**: Changes apply to all loggers globally
2. **LinkedLogLevelManager**: Bi-directional sync between parent and children
3. **OneWayLogLevelManager**: Parent changes flow to children only

### Log Levels and Priority

LogLayer defines these log levels (in order of severity):

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

### Implementation Guidelines

**Key considerations:**

1. **State sharing**: Decide if parent/child share state or maintain independent state
2. **Performance**: Level checks happen on every log call
3. **Consistency**: Ensure level changes propagate correctly to children
4. **Thread safety**: Consider concurrent access patterns

### Example: Global Log Level Manager

```typescript
// Global shared state container
const globalLogLevelContainer: { status: LogLevelEnabledStatus } = {
  status: {
    info: true,
    warn: true,
    error: true,
    debug: true,
    trace: true,
    fatal: true,
  },
};

export class GlobalLogLevelManager implements ILogLevelManager {
  setLevel(logLevel: LogLevelType): void {
    const minLogValue = LogLevelPriority[logLevel];

    for (const level of Object.values(LogLevel)) {
      const levelKey = level as keyof LogLevelEnabledStatus;
      const levelValue = LogLevelPriority[level];
      globalLogLevelContainer.status[levelKey] = levelValue >= minLogValue;
    }
  }

  isLevelEnabled(logLevel: LogLevelType): boolean {
    return globalLogLevelContainer.status[logLevel];
  }

  onChildLogLevelManagerCreated(): ILogLevelManager {
    // Return new instance that shares global state
    return new GlobalLogLevelManager();
  }
}
```

### Testing Log Level Managers

Test scenarios should cover:

1. **Setting minimum log level**
2. **Enabling/disabling individual levels**
3. **Checking if levels are enabled**
4. **Parent-child propagation behavior**
5. **Multiple logger instances**

---

## Mixin Development

### Overview

Mixins extend LogLayer functionality by adding methods directly to `ILogLayer` and `ILogBuilder` interfaces.

### Type Declarations (Required)

**All mixins must augment both modules:**

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

For methods available during the builder phase:

```typescript
export interface ICustomBuilderMixin<T> {
  customBuilderMethod(param: string): T;
}

// Required: Augment @loglayer/shared
declare module '@loglayer/shared' {
  interface ILogBuilder<This> extends ICustomBuilderMixin<This> {}
}

// Required: Augment loglayer
declare module 'loglayer' {
  interface LogBuilder extends ICustomBuilderMixin<LogBuilder> {}
  interface MockLogBuilder extends ICustomBuilderMixin<MockLogBuilder> {}
}
```

### Augmenting Both Interfaces

Most mixins should extend both `ILogLayer` and `ILogBuilder`:

```typescript
export interface IPerfTimingMixin<T> {
  withPerfStart(id: string): T;
  withPerfEnd(id: string): T;
}

// Augment both interfaces in @loglayer/shared
declare module '@loglayer/shared' {
  interface ILogLayer<This> extends IPerfTimingMixin<This> {}
  interface ILogBuilder<This> extends IPerfTimingMixin<This> {}
}

// Augment all concrete classes in loglayer
declare module 'loglayer' {
  interface LogLayer extends IPerfTimingMixin<LogLayer> {}
  interface LogBuilder extends IPerfTimingMixin<LogBuilder> {}
  interface MockLogLayer extends IPerfTimingMixin<MockLogLayer> {}
  interface MockLogBuilder extends IPerfTimingMixin<MockLogBuilder> {}
}
```

### Implementation Requirements

**Avoid Arrow Functions:**
- Always use regular functions (not arrow functions) when assigning methods to prototypes
- Arrow functions don't have their own `this` binding

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

Comprehensive testing is required:

1. **Unit Tests with MockLogLayer**: Test without side effects
2. **Integration Tests**: Test with real LogLayer instances
3. **Multiple Mixin Tests**: Verify compatibility with other mixins
4. **Type Tests**: Compile-time type validation

See `packages/mixins/type-tests/` for example type test implementations.

---

## Transport Development

### Using HTTP Transport

When creating a transport that calls an HTTP API:

**Requirements:**
1. Add `@loglayer/transport-http` package dependency
2. Config should extend `HttpTransportConfig`
3. Transport should extend `HttpTransport`
4. Copy `turbo.json` from logflare transport as template

### Documentation Requirements

**In `docs/` site documentation:**
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

### Overview

When adding new features or methods to the core LogLayer class, multiple files must be updated to maintain type safety and testing capabilities.

### Adding New Methods to LogLayer

When adding a new method to LogLayer, you must update the following files:

1. **`packages/core/loglayer/src/LogLayer.ts`**: Add the implementation
2. **`packages/core/shared/src/loglayer.types.ts`**: Add the method signature to `ILogLayer` interface
3. **`packages/core/loglayer/src/MockLogLayer.ts`**: Add a mock implementation
4. **`packages/core/loglayer/src/__tests__/`**: Add tests for the new method

### Adding New Methods to LogBuilder

If adding a method to `LogBuilder` (the fluent builder returned by `withMetadata()`, `withError()`, etc.), update:

1. **`packages/core/loglayer/src/LogBuilder.ts`**: Add the implementation
2. **`packages/core/shared/src/loglayer.types.ts`**: Add the method signature to `ILogBuilder` interface
3. **`packages/core/loglayer/src/MockLogBuilder.ts`**: Add a mock implementation
4. **`packages/core/loglayer/src/__tests__/`**: Add tests for the new method

### Implementation Checklist

**For LogLayer methods:**

```markdown
- [ ] Add method implementation to `LogLayer.ts`
- [ ] Add method signature to `ILogLayer` interface in `@loglayer/shared`
- [ ] Add mock implementation to `MockLogLayer.ts`
- [ ] Write unit tests
- [ ] Update documentation (site docs if user-facing)
- [ ] Update `docs/src/whats-new.md` with the new feature
- [ ] Run `turbo build --filter=loglayer --filter=@loglayer/shared` to build (dependencies must be built first)
- [ ] Run `turbo lint --filter=loglayer --filter=@loglayer/shared` to verify linting passes
- [ ] Run `turbo test --filter=loglayer` to verify tests pass
- [ ] Run `turbo verify-types --filter=loglayer --filter=@loglayer/shared` to verify types
```

**For LogBuilder methods:**

```markdown
- [ ] Add method implementation to `LogBuilder.ts`
- [ ] Add method signature to `ILogBuilder` interface in `@loglayer/shared`
- [ ] Add mock implementation to `MockLogBuilder.ts`
- [ ] Write unit tests
- [ ] Update documentation (site docs if user-facing)
- [ ] Update `docs/src/whats-new.md` with the new feature
- [ ] Run `turbo build --filter=loglayer --filter=@loglayer/shared` to build (dependencies must be built first)
- [ ] Run `turbo lint --filter=loglayer --filter=@loglayer/shared` to verify linting passes
- [ ] Run `turbo test --filter=loglayer` to verify tests pass
- [ ] Run `turbo verify-types --filter=loglayer --filter=@loglayer/shared` to verify types
```

### Example: Adding a New Method

**1. Add implementation to `LogLayer.ts`:**

```typescript
/**
 * Description of what this method does.
 *
 * @see {@link https://loglayer.dev/logging-api/relevant-page.html | Docs}
 */
myNewMethod(param: string): LogLayer {
  // Implementation
  return this;
}
```

**2. Add interface signature to `loglayer.types.ts`:**

```typescript
export interface ILogLayer<This = ILogLayer<any>> {
  // ... existing methods ...

  /**
   * Description of what this method does.
   *
   * @see {@link https://loglayer.dev/logging-api/relevant-page.html | Docs}
   */
  myNewMethod(param: string): This;
}
```

**3. Add mock implementation to `MockLogLayer.ts`:**

```typescript
myNewMethod(_param: string) {
  return this;
}
```

**4. Add tests:**

Create or update test files in `packages/core/loglayer/src/__tests__/`. Follow existing test patterns and naming conventions (e.g., `LogLayer.feature-name.test.ts`).

### Parent-Child Logger Behavior

When implementing features that modify logger state (transports, plugins, context, etc.), consider:

1. **Isolation**: Changes to a logger should not affect its parent or children created before the change
2. **Inheritance**: Child loggers created after a change may or may not inherit the change (document the behavior)
3. **Disposal**: If replacing resources, properly dispose of old ones

**Example documentation pattern:**

```typescript
/**
 * Modifies the thing.
 *
 * Changes only affect the current logger instance. Child loggers
 * created before the change will retain their original configuration,
 * and parent loggers are not affected when a child modifies its configuration.
 */
```

### Testing Core Features

Tests for core LogLayer features should cover:

1. **Basic functionality**: The feature works as expected
2. **Edge cases**: Empty inputs, invalid inputs, boundary conditions
3. **Parent-child isolation**: Changes don't leak between parent and child loggers
4. **Method chaining**: Methods that return `this` can be chained
5. **Integration with other features**: Context, plugins, transports work together

**Test file naming convention:**
- `LogLayer.basic.test.ts` - Basic logging functionality
- `LogLayer.transport-management.test.ts` - Transport-related features
- `LogLayer.plugins.test.ts` - Plugin-related features
- `LogLayer.config.test.ts` - Configuration options

---

## Development Workflow

### Making Changes

1. **Create/modify code** in appropriate package
2. **Write/update tests** for your changes (unit tests, type tests, integration tests as needed)
3. **Build packages**: `turbo build` (if making type changes)
4. **Run tests**: `pnpm run test` (package level) or `turbo test`
5. **Verify types**: `turbo verify-types`
6. **Update documentation** (README.md and site docs if needed)
7. **Update what's new**: Add entry to `docs/src/whats-new.md`

**CRITICAL: After ANY code changes, you MUST:**

1. **Write tests** for the new/modified functionality
2. **Run the full validation suite:**

```bash
# For type changes (changes to interfaces, types, or core packages)
turbo build && turbo verify-types && turbo test

# For implementation changes only
turbo verify-types && turbo test

# Or for single package
pnpm run test && turbo verify-types
```

These commands validate that your changes:
- ✅ Compile correctly (`turbo build`)
- ✅ Pass type checking (`turbo verify-types`)
- ✅ Don't break existing tests (`turbo test`)

**Never skip these steps.** Even small changes can have cascading effects in a monorepo.

### Before Committing

1. **Ensure all tests pass** (`turbo test`)
2. **Ensure type checking passes** (`turbo verify-types`)
3. **Ensure build succeeds** (`turbo build`)
4. Documentation is updated
5. What's new entry is added (if applicable)
6. Code follows existing patterns

### Important Notes

- **ALWAYS** write tests for any code changes (new features, bug fixes, refactors)
- **ALWAYS** run tests after writing them to ensure they pass
- **ALWAYS** run `turbo build && turbo verify-types && turbo test` after making code changes
- **ALWAYS** run `turbo build` after type changes before making further changes to other packages
- **ALWAYS** use `workspace:*` for internal dependencies
- **ALWAYS** preserve existing code patterns and conventions
- **Do NOT** modify changelog files (auto-generated)
- **Do NOT** commit with `--no-verify` unless explicitly requested
- **Do NOT** skip writing tests - untested code should not be committed
- **Do NOT** skip test/type verification steps - even small changes can break things

---

## Additional Resources

- **Main Site**: https://loglayer.dev
- **GitHub**: https://github.com/loglayer/loglayer
- **Package Registry**: https://www.npmjs.com/org/loglayer

For more specific guidance, refer to existing implementations in the codebase as examples.
