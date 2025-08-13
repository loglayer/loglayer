import type { LogLayerPlugin, PluginBeforeDataOutParams } from "@loglayer/plugin";
import type { DatadogTraceInjectorPluginParams } from "./types.js";

/**
 * Creates a new Datadog trace injector plugin.
 *
 * This plugin injects the current Datadog APM trace context into the log data.
 *
 * @param config - The datadog trace injector plugin configuration
 * @returns A LogLayer plugin instance
 */
export function datadogTraceInjectorPlugin(config: DatadogTraceInjectorPluginParams): LogLayerPlugin {
  const tracer = config.tracerInstance;

  return {
    id: config.id,
    disabled: config.disabled,
    onBeforeDataOut({ data }: PluginBeforeDataOutParams): Record<string, any> {
      if (!data) {
        data = {};
      }

      try {
        // Associates log with APM trace
        // https://docs.datadoghq.com/tracing/other_telemetry/connect_logs_and_traces/nodejs/
        const span = tracer.scope().active();

        if (span) {
          tracer.inject(span.context(), "log", data);
        }
      } catch (error) {
        // Call error handler if provided, otherwise silently continue
        if (config.onError && error instanceof Error) {
          config.onError(error, data);
        }
        // Continue logging even if tracer operations fail
        // This ensures logging doesn't break if dd-trace has issues
      }

      return data;
    },
  };
}
