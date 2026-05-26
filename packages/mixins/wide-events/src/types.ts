import type { AsyncLocalStorage } from "node:async_hooks";
import type { LogLevelType } from "loglayer";

/**
 * Configuration options for creating a wide event mixin.
 */
export interface WideEventMixinOptions {
  /**
   * An async context implementation for propagating wide event data across async boundaries.
   *
   * For Node.js, use `new AsyncLocalStorage()` from `async_hooks`.
   * For browser environments, provide your own compatible implementation.
   */
  asyncContext: AsyncLocalStorage<Record<string, any>>;

  /**
   * Optional: Include data from withContext() calls in the emitted wide event.
   * When true, context data accumulated via withContext() will be included.
   * @default true
   */
  includeContext?: boolean;

  /**
   * Optional: Field name to nest all wide event data under.
   * When set, the wide event data will be wrapped in an object with this key.
   * When undefined (default), wide event data is flattened at the root level.
   * @default undefined
   * @example
   * // With wideEventField: "event"
   * { "event": { "userId": "123", "orderId": "456" }, "msg": "done" }
   * // Without wideEventField (default)
   * { "userId": "123", "orderId": "456", "msg": "done" }
   */
  wideEventField?: string;

  /**
   * Optional: Field name to use for error data in wide events.
   * @default "error" (single mode) or "errors" (array mode)
   */
  errorField?: string;

  /**
   * Optional: When true, errors are collected as an array.
   * Each call to withWideEventError() appends to the array.
   * When false, each call replaces the previous error.
   * @default false
   */
  errorsAsArray?: boolean;
}

/**
 * Configuration for emitting a wide event.
 */
export interface EmitWideEventConfig {
  /**
   * The log message for the wide event.
   */
  message: string;

  /**
   * Optional: Log level (defaults to "info").
   */
  level?: LogLevelType;

  /**
   * Optional: Additional metadata to include in this specific emission.
   * This is merged with the accumulated wide event data.
   */
  metadata?: Record<string, any>;
}

/**
 * Interface for wide event mixin functionality.
 */
export interface IWideEventMixin {
  /**
   * Accumulates data into the wide event.
   * Can be called multiple times to build up the event.
   * Nested objects are deep merged rather than replaced entirely.
   *
   * @param data - Key-value pairs to add to the wide event
   * @returns This logger instance for chaining
   *
   * @example
   * ```typescript
   * // Setup context boundary once (e.g., in middleware)
   * asyncContext.run({}, () => {});
   *
   * // Use anywhere in async chain - no wrapping needed!
   * logger.withWideEvents({ userId: "123" });
   * await processOrder();
   * logger.withWideEvents({ orderId: "456" });
   * ```
   */
  withWideEvents(data: Record<string, any>): this;

  /**
   * Retrieves the currently accumulated wide event data.
   * Returns undefined if called outside async context or if no data has been accumulated.
   *
   * @param key - Optional: Retrieve a specific key from the accumulated data
   * @returns The accumulated data, a specific key's value, or undefined
   *
   * @example
   * ```typescript
   * logger.withWideEvents({ userId: "123" });
   * logger.withWideEvents({ orderId: "456" });
   *
   * // Get all accumulated data
   * const data = logger.getWideEvents();
   * // { userId: "123", orderId: "456" }
   *
   * // Get specific key
   * const userId = logger.getWideEvents("userId");
   * // "123"
   * ```
   */
  getWideEvents(key?: string): Record<string, any> | any;

  /**
   * Clears the accumulated wide event data.
   * Useful when starting a new operation within the same async context.
   *
   * @param key - Optional: Clear only a specific key instead of all data
   * @returns This logger instance for chaining
   *
   * @example
   * ```typescript
   * // Clear all wide event data
   * logger.withWideEvents({ first: "data" });
   * logger.emitWideEvent({ message: "First event" });
   * logger.clearWideEvents();
   * logger.withWideEvents({ second: "data" });
   * logger.emitWideEvent({ message: "Second event" });
   *
   * // Clear specific key
   * logger.withWideEvents({ user: { id: "123", name: "Alice" } });
   * logger.clearWideEvents("user");
   * // Result: user object is removed
   * ```
   */
  clearWideEvents(key?: string): this;

  /**
   * Emits the accumulated wide event as a single log entry.
   * Reads accumulated data from AsyncLocalStorage, merges with current context,
   * and logs at the specified level.
   *
   * @param config - Configuration for the wide event emission
   * @returns This logger instance for chaining
   *
   * @example
   * ```typescript
   * // Emit as info log
   * logger.emitWideEvent({ message: "Order processed" });
   *
   * // Emit as error with additional metadata
   * logger.emitWideEvent({
   *   message: "Order failed",
   *   level: "error",
   *   metadata: { reason: "payment_declined" }
   * });
   * ```
   */
  emitWideEvent(config: EmitWideEventConfig): this;

  /**
   * Captures an error for inclusion in the wide event.
   * Serializes the error using the configured errorSerializer (or default).
   *
   * @param error - The error to capture
   * @returns This logger instance for chaining
   *
   * @example
   * ```typescript
   * try {
   *   await doSomething();
   * } catch (err) {
   *   // For single error (replaces previous)
   *   logger.withWideEventError(err);
   *   
   *   // With errorsAsArray: true - errors accumulate
   *   logger.withWideEventError(err).withWideEventError(otherErr);
   * }
   * ```
   */
  withWideEventError(error: any): this;
};

// Module augmentation for ILogLayer and ILogBuilder
declare module "loglayer" {
  interface LogLayer extends IWideEventMixin {}

  interface MockLogLayer extends IWideEventMixin {}

  interface LogBuilder extends IWideEventMixin {}

  interface MockLogBuilder extends IWideEventMixin {}
}

declare module "@loglayer/shared" {
  interface ILogLayer<This> extends IWideEventMixin {}

  interface ILogBuilder<This> extends IWideEventMixin {}
}
