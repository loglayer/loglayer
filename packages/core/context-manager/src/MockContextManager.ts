import type { IContextManager, OnChildLoggerCreatedParams } from "@loglayer/shared";

/**
 * A mock context manager that does nothing. Useful for use with unit testing.
 */
export class MockContextManager implements IContextManager {
  setContext(_context?: Record<string, any>): void {}
  appendContext(_context: Record<string, any>) {}
  getContext(): Record<string, any> {
    return {};
  }
  hasContextData(): boolean {
    return false;
  }
  clearContext(_keys?: string | string[]): void {}
  onChildLoggerCreated(_params: OnChildLoggerCreatedParams): void {}
  clone(): IContextManager {
    return new MockContextManager();
  }
}
