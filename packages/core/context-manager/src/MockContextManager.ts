import type { IContextManager } from "@loglayer/shared";

/**
 * A mock context manager that does nothing. Useful for use with unit testing.
 */
export class MockContextManager implements IContextManager {
  setContext(context?: Record<string, any>): void {}
  appendContext(context: Record<string, any>) {}
  getContext(): Record<string, any> {
    return {};
  }
  hasContextData(): boolean {
    return false;
  }
  onChildLoggerCreated(params: any) {}
  clone(): IContextManager {
    return new MockContextManager();
  }
}
