import type { IContextManager, OnChildLoggerCreatedParams } from "@loglayer/context-manager";

/**
 * A context manager that keeps context data synchronized between parent and all children (bi-directional).
 */
export class LinkedContextManager implements IContextManager {
  private contextContainer: { data: Record<string, any>; hasContext: boolean } = {
    data: {},
    hasContext: false,
  };

  /**
   * Sets the context data to be included with every log entry. Set to `undefined` to clear the context data.
   */
  setContext(context?: Record<string, any>): void {
    if (!context) {
      // We can't just assign an empty object else that would break the link between parent and child.
      for (const key in this.contextContainer.data) {
        if (Object.hasOwn(this.contextContainer.data, key)) {
          delete this.contextContainer.data[key];
        }
      }

      this.contextContainer.hasContext = false;
      return;
    }

    // We can't just directly replace the context object else that would break the link between parent and child.
    Object.assign(this.contextContainer.data, context);
    this.contextContainer.hasContext = true;
  }

  /**
   * Appends context data to the existing context data.
   */
  appendContext(context: Record<string, any>) {
    Object.assign(this.contextContainer.data, context);
    this.contextContainer.hasContext = true;
  }

  /**
   * Returns the context data to be included with every log entry.
   */
  getContext(): Record<string, any> {
    return this.contextContainer.data;
  }

  /**
   * Returns true if context data is present.
   */
  hasContextData(): boolean {
    return this.contextContainer.hasContext;
  }

  /**
   * Links the child context manager's context to be the same as the parent context manager's context.
   */
  onChildLoggerCreated({ parentContextManager, childContextManager }: OnChildLoggerCreatedParams) {
    // Share the same context container between parent and child for bi-directional linking
    if (childContextManager instanceof LinkedContextManager) {
      (childContextManager as LinkedContextManager).contextContainer = this.contextContainer;
    } else {
      childContextManager.setContext(this.getContext());
    }
  }

  /**
   * Creates a new instance of the context manager that shares the same context data.
   * The clone maintains a bi-directional link with the original context manager.
   */
  clone(): IContextManager {
    const clone = new LinkedContextManager();
    // Share the same context container to maintain bi-directional linking
    clone.contextContainer = this.contextContainer;
    return clone;
  }
}
