import { testTransportOutput } from "@loglayer/transport";
import dotenv from "dotenv";
import { LogLayer } from "loglayer";
import { serializeError } from "serialize-error";
import { NewRelicTransport } from "../NewRelicTransport.js";

dotenv.config();

if (!process.env.NEW_RELIC_API_KEY) {
  throw new Error("NEW_RELIC_API_KEY env var is required");
}

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: new NewRelicTransport({
    apiKey: process.env.NEW_RELIC_API_KEY,
    endpoint: "https://log-api.newrelic.com/log/v1", // optional, this is the default
    useCompression: true, // optional, defaults to true
    maxRetries: 3, // optional, defaults to 3
    retryDelay: 1000, // optional, base delay in ms, defaults to 1000
    respectRateLimit: true, // optional, defaults to true
    onError: (err) => {
      console.error("Failed to send logs to New Relic:", err);
    },
  }),
});

// This will send logs to New Relic
// You can view them in the Logs UI
testTransportOutput("new-relic", log);
