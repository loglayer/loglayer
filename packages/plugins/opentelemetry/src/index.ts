import type { LogLayerPlugin, LogLayerPluginParams } from "@loglayer/plugin";
import { context, isSpanContextValid, trace } from "@opentelemetry/api";

export interface OpenTelemetryPluginParams extends LogLayerPluginParams {
  /**
   * If specified, all trace fields will be nested under this key
   */
  traceFieldName?: string;
  /**
   * Field name for the trace ID. Defaults to 'trace_id'
   */
  traceIdFieldName?: string;
  /**
   * Field name for the span ID. Defaults to 'span_id'
   */
  spanIdFieldName?: string;
  /**
   * Field name for the trace flags. Defaults to 'trace_flags'
   */
  traceFlagsFieldName?: string;
}

export function openTelemetryPlugin(config: OpenTelemetryPluginParams = {}): LogLayerPlugin {
  const traceIdField = config.traceIdFieldName || "trace_id";
  const spanIdField = config.spanIdFieldName || "span_id";
  const traceFlagsField = config.traceFlagsFieldName || "trace_flags";

  const addTraceContext = (data: Record<string, any> | undefined) => {
    const span = trace.getSpan(context.active());
    if (span) {
      const spanContext = span.spanContext();
      if (isSpanContextValid(spanContext)) {
        const fields = {
          [traceIdField]: spanContext.traceId,
          [spanIdField]: spanContext.spanId,
          [traceFlagsField]: `0${spanContext.traceFlags.toString(16)}`,
        };

        if (config.traceFieldName) {
          const traceData = {
            [config.traceFieldName]: fields,
          };
          if (data) {
            return {
              ...data,
              ...traceData,
            };
          }
          return traceData;
        }

        if (data) {
          return {
            ...data,
            ...fields,
          };
        }
        return fields;
      }
    }
    return data || {};
  };

  return {
    id: config.id,
    disabled: config.disabled,
    onBeforeDataOut: ({ data }) => addTraceContext(data),
  };
}
