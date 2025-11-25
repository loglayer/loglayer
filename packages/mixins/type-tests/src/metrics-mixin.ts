/**
 * Example mixin that extends ILogLayer only
 * Used for testing type preservation through method chaining
 */

// Define the mixin interface
export interface IMetricsMixin<T> {
  recordMetric(name: string, value: number): T;
  incrementCounter(name: string): T;
}

// Augment ILogLayer interface
declare module '@loglayer/shared' {
  interface ILogLayer<This> extends IMetricsMixin<This> {}
}

// Augment concrete classes
declare module 'loglayer' {
  interface LogLayer extends IMetricsMixin<LogLayer> {}
  interface MockLogLayer extends IMetricsMixin<MockLogLayer> {}
}
