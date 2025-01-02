# Mocking LogLayer for Unit Testing

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
