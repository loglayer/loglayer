# Testing

All code changes must include tests. Write tests for:
- New features and functionality
- Bug fixes (test that reproduces the bug, then verify the fix)
- Refactorings (ensure behavior is preserved)
- Edge cases and error conditions

## Unit Testing

Unit tests use **vitest**.

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

## Transport Tests

### Unit Tests

Located in `packages/transports/<transport-name>/src/__tests__/`.

- Look at other transport unit tests for examples
- The backing library for the transport is typically mocked
- Tests should verify configuration, error handling, and log formatting

### Live Tests

Live tests test the transport with the actual backing library (non-mocked). They are defined in `__tests__/livetest.ts`.

- Use `import { testTransportOutput } from "@loglayer/transport";` to test the transport
- Look at other `livetest.ts` files for example implementations

## Type Testing

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
