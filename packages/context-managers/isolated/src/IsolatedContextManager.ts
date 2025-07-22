import type { IContextManager, OnChildLoggerCreatedParams } from "@loglayer/context-manager";

/**
 * A context manager that maintains isolated context data for each logger instance.
 * When a child logger is created, it starts with no context data - it does not inherit from the parent.
 */
export class IsolatedContextManager implements IContextManager {
  private context: Record<string, any> = {};
  private hasContext = false;

  /**
   * Sets the context data to be included with every log entry. Set to `undefined` to clear the context data.
   */
  setContext(context?: Record<string, any>): void {
    if (!context) {
      this.context = {};
      this.hasContext = false;
      return;
    }

    this.context = context;
    this.hasContext = true;
  }

  /**
   * Appends context data to the existing context data.
   */
  appendContext(context: Record<string, any>) {
    this.context = { ...this.context, ...context };
    this.hasContext = true;
  }

  /**
   * Returns the context data to be included with every log entry.
   */
  getContext(): Record<string, any> {
    return this.context;
  }

  /**
   * Returns true if context data is present.
   */
  hasContextData(): boolean {
    return this.hasContext;
  }

  /**
   * Does not copy context data from parent to child - child starts with empty context.
   * This ensures complete isolation between parent and child context managers.
   */
  onChildLoggerCreated(_params: OnChildLoggerCreatedParams) {
    // Intentionally do nothing - child logger starts with no context data
    // This maintains complete isolation between parent and child contexts
  }

  /**
   * Creates a new instance of the context manager with no context data.
   * The clone starts completely isolated from the original.
   */
  clone(): IContextManager {
    return new IsolatedContextManager();
  }
}
