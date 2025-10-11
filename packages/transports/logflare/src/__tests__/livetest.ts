import { testTransportOutput } from "@loglayer/transport";
import dotenv from "dotenv";
import { LogLayer } from "loglayer";
import { serializeError } from "serialize-error";
import { LogflareTransport } from "../LogflareTransport.js";

// This is a live test using Logflare
// It will send logs to a Logflare source using their JSON API
// https://docs.logflare.app/
// You need to create a Logflare account and source to test this

dotenv.config();

if (!process.env.LOGFLARE_SOURCE_ID) {
  throw new Error("LOGFLARE_SOURCE_ID env var is required");
}

if (!process.env.LOGFLARE_API_KEY) {
  throw new Error("LOGFLARE_API_KEY env var is required");
}

const log = new LogLayer({
  errorSerializer: serializeError,
  contextFieldName: null,
  metadataFieldName: null,
  transport: new LogflareTransport({
    sourceId: process.env.LOGFLARE_SOURCE_ID,
    apiKey: process.env.LOGFLARE_API_KEY,
    url: process.env.LOGFLARE_API_ENDPOINT || "https://api.logflare.app",
    maxRetries: Number.parseInt(process.env.LOGFLARE_MAX_RETRIES || "3", 10),
    retryDelay: Number.parseInt(process.env.LOGFLARE_RETRY_DELAY || "1000", 10),
    respectRateLimit: process.env.LOGFLARE_RESPECT_RATE_LIMIT !== "false",
    enableBatchSend: process.env.LOGFLARE_ENABLE_BATCH !== "false",
    batchSize: Number.parseInt(process.env.LOGFLARE_BATCH_SIZE || "100", 10),
    batchSendTimeout: Number.parseInt(process.env.LOGFLARE_BATCH_TIMEOUT || "5000", 10),
    onError: (err) => {
      console.error("Failed to send logs to Logflare:", err);
    },
    onDebug: (entry) => {
      console.log("Log entry being sent to Logflare:", entry);
    },
    onDebugReqRes: ({ req, res }) => {
      console.log("=== HTTP Request ===");
      console.log("URL:", req.url);
      console.log("Method:", req.method);
      console.log("Headers:", JSON.stringify(req.headers, null, 2));
      console.log("Body:", typeof req.body === "string" ? req.body : `[Uint8Array: ${req.body.length} bytes]`);
      console.log("=== HTTP Response ===");
      console.log("Status:", res.status, res.statusText);
      console.log("Headers:", JSON.stringify(res.headers, null, 2));
      console.log("Body:", res.body);
      console.log("===================");
    },
  }),
});

// This will send logs to the configured Logflare source
testTransportOutput("logflare", log);
