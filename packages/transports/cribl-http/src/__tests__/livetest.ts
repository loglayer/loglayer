import { testTransportOutput } from "@loglayer/transport";
import dotenv from "dotenv";
import { LogLayer } from "loglayer";
import { serializeError } from "serialize-error";
import { CriblTransport } from "../CriblTransport.js";

// This is a live test using Cribl Stream
// It will send logs to a Cribl Stream instance via the HTTP/S Bulk API source
// https://docs.cribl.io/stream/sources-https/
// You need a Cribl Stream instance with an HTTP source configured

dotenv.config();

if (!process.env.CRIBL_URL) {
  throw new Error("CRIBL_URL env var is required (e.g., https://your-cribl-instance:10080)");
}

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: new CriblTransport({
    url: process.env.CRIBL_URL,
    token: process.env.CRIBL_TOKEN,
    source: process.env.CRIBL_SOURCE || "loglayer",
    host: process.env.CRIBL_HOST,
    maxRetries: Number.parseInt(process.env.CRIBL_MAX_RETRIES || "3", 10),
    retryDelay: Number.parseInt(process.env.CRIBL_RETRY_DELAY || "1000", 10),
    respectRateLimit: process.env.CRIBL_RESPECT_RATE_LIMIT !== "false",
    enableBatchSend: process.env.CRIBL_ENABLE_BATCH !== "false",
    batchSize: Number.parseInt(process.env.CRIBL_BATCH_SIZE || "100", 10),
    batchSendTimeout: Number.parseInt(process.env.CRIBL_BATCH_TIMEOUT || "5000", 10),
    onError: (err) => {
      console.error("Failed to send logs to Cribl:", err);
    },
    onDebug: (entry) => {
      console.log("Log entry being sent to Cribl:", entry);
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

// This will send logs to the configured Cribl instance
testTransportOutput("cribl", log);
