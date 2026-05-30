import { BaseTransport, type LogLayerTransportParams } from "@loglayer/transport";
import type { PostHog } from "posthog-js";

/**
 * Transport that sends logs to PostHog via the posthog-js SDK's structured logger.
 *
 * Requires an initialized PostHog client instance with the `logs` configuration set.
 *
 * @see {@link https://posthog.com/docs/logs/installation/javascript}
 */
export class PosthogTransport extends BaseTransport<PostHog> {
  shipToLogger(params: LogLayerTransportParams): any[] {
    const { logLevel, messages, data, hasData } = params;

    const message = messages.join(" ");
    const logger = this.logger.logger;
    const method = logLevel as keyof typeof logger;

    if (hasData && data) {
      logger[method](message, data);
    } else {
      logger[method](message);
    }

    return messages;
  }
}
