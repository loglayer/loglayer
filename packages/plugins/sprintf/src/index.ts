import type { LogLayerPlugin } from "@loglayer/plugin";
import type { LogLayerPluginParams } from "@loglayer/plugin";
import { sprintf } from "sprintf-js";

export interface SprintfPluginParams extends LogLayerPluginParams {}

export function sprintfPlugin(config: SprintfPluginParams = {}): LogLayerPlugin {
  return {
    id: config.id,
    disabled: config.disabled,
    onBeforeMessageOut({ messages }) {
      if (messages.length < 2) {
        return messages;
      }

      const [format, ...args] = messages;

      // Only apply sprintf if the first argument is a string
      if (typeof format !== "string") {
        return messages;
      }

      try {
        return [sprintf(format, ...args)];
      } catch (error) {
        // If sprintf fails, return original messages
        return messages;
      }
    },
  };
}
