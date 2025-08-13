import type { LogLayerPluginParams } from "@loglayer/plugin";
import type { Tracer } from "dd-trace";

/**
 * Configuration parameters for the datadog trace injector plugin.
 */
export interface DatadogTraceInjectorPluginParams extends LogLayerPluginParams {
  /**
   * dd-trace tracer instance
   */
  tracerInstance: Tracer;
  /**
   * Optional error handler for tracer operation failures
   * @param error - The error that occurred during tracer operations
   * @param data - The log data that was being processed when the error occurred
   */
  onError?: (error: Error, data?: Record<string, any>) => void;
}
