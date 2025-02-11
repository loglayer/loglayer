import type { IContextManager } from "@loglayer/shared";
import type { OnChildLoggerCreatedParams } from "@loglayer/shared";

/**
 * The default context manager used by LogLayer. It is a simple k/v store for context data.
 */
export class DefaultContextManager implements IContextManager {
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
   * Copies the parent context data to the child context data.
   */
  onChildLoggerCreated({ parentContextManager, childContextManager }: OnChildLoggerCreatedParams) {
    if (parentContextManager.hasContextData()) {
      const parentContext = parentContextManager.getContext();
      childContextManager.setContext({ ...parentContext });
    }
  }

  /**
   * Creates a new instance of the context manager with the same context data.
   */
  clone(): IContextManager {
    const clone = new DefaultContextManager();
    clone.setContext({
      ...this.context,
    });
    clone.hasContext = this.hasContext;
    return clone;
  }
}
