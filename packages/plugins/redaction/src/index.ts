import type { LogLayerPlugin } from "@loglayer/plugin";
import type { LogLayerPluginParams } from "@loglayer/plugin";
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
    onMetadataCalled(metadata: Record<string, any>) {
      if (!metadata) return;

      return redactInstance(metadata) as Record<string, any>;
    },
  };
}
