---
title: Using MockLogLayer for Unit Testing in LogLayer
description: Learn how to silence logging during unit tests using MockLogLayer
---

# Working with LogLayer in Testing

## No-op Mock LogLayer for Unit Testing

LogLayer provides a `MockLogLayer` class that implements the `ILogLayer` interface implemented by `LogLayer` but all methods are no-ops (they do nothing). This is useful for testing services that use logging.

This example demonstrates how to use `MockLogLayer` for testing a service that uses logging.

```typescript
import { describe, it, expect } from 'vitest'
import { MockLogLayer, ILogLayer } from 'loglayer'

// Example service that uses logging
class UserService {
  private logger: ILogLayer

  constructor(logger: ILogLayer) {
    this.logger = logger
  }

  async createUser(username: string, email: string) {
    try {
      // Simulate user creation
      this.logger.withMetadata({ username, email }).info('Creating new user')
      
      if (!email.includes('@')) {
        const error = new Error('Invalid email format')
        this.logger.withError(error).error('Failed to create user')
        throw error
      }

      // Simulate successful creation
      this.logger.withContext({ userId: '123' }).info('User created successfully')
      
      return { id: '123', username, email }
    } catch (error) {
      this.logger.errorOnly(error)
      throw error
    }
  }
}

describe('UserService', () => {
  it('should create a user successfully', async () => {
    // Create a mock logger
    const mockLogger = new MockLogLayer()
    const userService = new UserService(mockLogger)

    const result = await userService.createUser('testuser', 'test@example.com')

    expect(result).toEqual({
      id: '123',
      username: 'testuser',
      email: 'test@example.com'
    })
  })

  it('should throw error for invalid email', async () => {
    const mockLogger = new MockLogLayer()
    const userService = new UserService(mockLogger)

    await expect(
      userService.createUser('testuser', 'invalid-email')
    ).rejects.toThrow('Invalid email format')
  })

  // Example showing that the mock logger implements all methods but doesn't actually log
  it('should handle all logging methods without throwing errors', () => {
    const mockLogger = new MockLogLayer()

    // All these calls should work without throwing errors
    mockLogger.info('test message')
    mockLogger.error('error message')
    mockLogger.warn('warning message')
    mockLogger.debug('debug message')
    mockLogger.trace('trace message')
    mockLogger.fatal('fatal message')

    // Method chaining should work
    mockLogger
      .withContext({ userId: '123' })
      .withMetadata({ action: 'test' })
      .info('test with context and metadata')

    // Error logging should work
    mockLogger.withError(new Error('test error')).error('error occurred')
    mockLogger.errorOnly(new Error('standalone error'))

    // All these calls should complete without throwing errors
    expect(true).toBe(true)
  })
})
```

## Writing Tests Against LogLayer Directly

When a new instance of `MockLogLayer` is created, it also internally creates a new instance of a [`MockLogBuilder`](https://github.com/loglayer/loglayer/blob/master/packages/core/loglayer/src/MockLogBuilder.ts), which is used
when chaining methods like `withMetadata`, `withError`, etc.

`MockLogLayer` and `MockLogBuilder` both implement their respective interfaces with generic type parameters:
- `MockLogLayer` implements `ILogLayer<MockLogLayer>` and `ILogBuilder<MockLogLayer>`
- `MockLogBuilder` implements `ILogBuilder<MockLogBuilder>`

This allows proper type preservation through method chaining and mixin support in tests.

`MockLogLayer` has three methods to help with directly testing the logger itself:

- `getMockLogBuilder(): ILogBuilder`: Returns the underlying `MockLogBuilder` instance.
- `resetMockLogBuilder()`: Tells `MockLogLayer` to create a new internal instance of the `MockLogBuilder`.
- `setMockLogBuilder(builder: ILogBuilder)`: Sets the mock log builder instance to be used if you do not want to use the internal instance.

The following example shows how you can use these methods to write tests against the logger directly.

```typescript
import { describe, expect, it, vi } from "vitest";
import { MockLogLayer, MockLogBuilder } from "loglayer";

describe("MockLogLayer tests", () => {
  it("should be able to mock a log message method", () => {
    const logger = new MockLogLayer();
    logger.info = vi.fn();
    logger.info("testing");
    expect(logger.info).toBeCalledWith("testing");
  });

  it("should be able to spy on a log message method", () => {
    const logger = new MockLogLayer();
    const infoSpy = vi.spyOn(logger, "info");
    logger.info("testing");
    expect(infoSpy).toBeCalledWith("testing");
  });

  it("should be able to spy on a chained log message method", () => {
    const logger = new MockLogLayer();

    // Get the mock builder instance
    const builder = logger.getMockLogBuilder();

    const infoSpy = vi.spyOn(builder, "info");

    logger.withMetadata({ test: "test" }).info("testing");

    expect(infoSpy).toBeCalledWith("testing");
  });

  it("should be able to mock a log message method when using withMetadata", () => {
    const logger = new MockLogLayer();

    const builder = logger.getMockLogBuilder();

    // to be able to chain withMetadata with info, we need to
    // make sure the withMetadata method returns the builder
    builder.withMetadata = vi.fn().mockReturnValue(builder);
    builder.info = vi.fn();

    logger.withMetadata({ test: "test" }).info("testing");

    expect(builder.withMetadata).toBeCalledWith({ test: "test" });
    expect(builder.info).toBeCalledWith("testing");
  });

  it("should be able to spy on a log message method when using withMetadata", () => {
    const logger = new MockLogLayer();

    const builder = logger.getMockLogBuilder();

    // to be able to chain withMetadata with info, we need to
    // make sure the withMetadata method returns the builder
    const metadataSpy = vi.spyOn(builder, "withMetadata");
    const infoSpy = vi.spyOn(builder, "info");

    logger.withMetadata({ test: "test" }).info("testing");

    expect(metadataSpy).toBeCalledWith({ test: "test" });
    expect(infoSpy).toBeCalledWith("testing");
  });

  it('should be able to spy on a multi-chained log message method', () => {
    const logger = new MockLogLayer();
    const builder = logger.getMockLogBuilder();
    const error = new Error('test error');

    const metadataSpy = vi.spyOn(builder, 'withMetadata');
    const errorSpy = vi.spyOn(builder, 'withError');
    const infoSpy = vi.spyOn(builder, 'info');

    logger
      .withMetadata({ test: 'test' })
      .withError(error)
      .info('testing');

    expect(metadataSpy).toBeCalledWith({ test: 'test' });
    expect(errorSpy).toBeCalledWith(error);
    expect(infoSpy).toBeCalledWith('testing');
  });

  it("should use a custom MockLogBuilder", () => {
    const builder = new MockLogBuilder();
    const logger = new MockLogLayer();

    // Get the mock builder instance
    logger.setMockLogBuilder(builder);

    builder.withMetadata = vi.fn().mockReturnValue(builder);
    builder.info = vi.fn();

    logger.withMetadata({ test: "test" }).info("testing");

    expect(builder.withMetadata).toBeCalledWith({ test: "test" });
    expect(builder.info).toBeCalledWith("testing");
  });

  it("should be able to mock errorOnly", () => {
    const error = new Error("testing");

    const logger = new MockLogLayer();
    logger.errorOnly = vi.fn();
    logger.errorOnly(error);
    expect(logger.errorOnly).toBeCalledWith(error);
  });
});
```

## References

- [MockLogLayer](https://github.com/loglayer/loglayer/blob/master/packages/core/loglayer/src/MockLogLayer.ts)
- [MockLogBuilder](https://github.com/loglayer/loglayer/blob/master/packages/core/loglayer/src/MockLogBuilder.ts)