import type { LogLayerPlugin, LogLayerPluginParams, PluginBeforeDataOutParams } from "@loglayer/plugin";
import type { RedactOptions } from "fast-redact";
import fastRedact from "fast-redact";

export interface RedactionPluginParams extends Omit<RedactOptions, "serialize">, LogLayerPluginParams {}

export function redactionPlugin(config: RedactionPluginParams): LogLayerPlugin {
  const redactInstance = fastRedact({
    ...config,
    serialize: false,
  });

  return {
    id: config.id,
    disabled: config.disabled,
    onBeforeDataOut(params: PluginBeforeDataOutParams) {
      if (!params.data) return params.data;

      redactInstance(params.data);
      return params.data;
    },
  };
}
