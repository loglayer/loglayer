import "global-jsdom/register";

import { LogLayer } from "loglayer";
import type { PostHog } from "posthog-js";
import { posthog } from "posthog-js";
import { serializeError } from "serialize-error";
import { PosthogTransport } from "../PosthogTransport.js";

posthog.init(process.env.POSTHOG_PROJECT_TOKEN!, {
  api_host: "https://us.i.posthog.com",
  defaults: "2026-01-30",
  logs: {
    serviceName: "loglayer-livetest",
    environment: "test",
  },
});

const phInstance = posthog as unknown as PostHog;

const log = new LogLayer({
  transport: new PosthogTransport({
    id: "posthog",
    logger: phInstance,
  }),
  errorSerializer: (err) => serializeError(err),
});

console.log("\n===== Start Livetest for: PosthogTransport =====");
console.log("\n===== info() =====");
log.info("info message");

console.log("\n===== warn() =====");
log.warn("warn message");

console.log("\n===== error() =====");
log.error("error message");

console.log("\n===== debug() =====");
log.debug("debug message");

console.log("\n===== trace() =====");
log.trace("trace message");

console.log("\n===== fatal() =====");
log.fatal("fatal message");

console.log("\n===== multiple parameters =====");
log.info("multiple info message", "with multiple", "parameters");

console.log("\n===== withMetadata() =====");
log
  .withMetadata({
    test: "metadata",
    test2: "metadata2",
  })
  .info("message with metadata");

console.log("\n===== withError() =====");
log.withError(new Error("error object")).error("message with error");

console.log("\n===== withContext() =====");
log.withContext({
  test: "data",
});
log.info("context data");

console.log("\n===== End Livetest for: PosthogTransport =====");
