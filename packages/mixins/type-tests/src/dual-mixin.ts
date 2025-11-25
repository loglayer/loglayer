/**
 * Example mixin that extends both ILogLayer and ILogBuilder
 * Used for testing type preservation across both interfaces
 */

// Define the mixin interface
export interface ITracingMixin<T> {
  withTraceId(traceId: string): T;
  withSpanId(spanId: string): T;
}

// Augment both interfaces
declare module '@loglayer/shared' {
  interface ILogLayer<This> extends ITracingMixin<This> {}
  interface ILogBuilder<This> extends ITracingMixin<This> {}
}

// Augment all concrete classes
declare module 'loglayer' {
  interface LogLayer extends ITracingMixin<LogLayer> {}
  interface LogBuilder extends ITracingMixin<LogBuilder> {}
  interface MockLogLayer extends ITracingMixin<MockLogLayer> {}
  interface MockLogBuilder extends ITracingMixin<MockLogBuilder> {}
}
