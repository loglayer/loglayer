import { testTransportOutput } from "@loglayer/transport";
import dotenv from "dotenv";
import { LogLayer } from "loglayer";
import { serializeError } from "serialize-error";
import { HttpTransport } from "../HttpTransport.js";

// This is a live test using https://victoriametrics.com
// It will send logs to a VictoriaLogs instance using the JSON stream API
// https://docs.victoriametrics.com/victorialogs/data-ingestion/#json-stream-api
// The docker image was used to host the VictoriaLogs instance for testing:
// https://docs.victoriametrics.com/victorialogs/quickstart/#docker-image

dotenv.config();

if (!process.env.VICTORIA_LOGS_URL) {
  throw new Error("VICTORIA_LOGS_URL env var is required (e.g., http://localhost:9428)");
}

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: new HttpTransport({
    url: `${process.env.VICTORIA_LOGS_URL}/insert/jsonline`,
    method: "POST",
    headers: {
      "Content-Type": "application/stream+json",
    },
    payloadTemplate: ({ logLevel, message, data }) => 
      JSON.stringify({
        _msg: message || "(no message)",
        _time: "0",
        level: logLevel,
        stream: "loglayer-http-transport-test",
        service: "loglayer-http-transport-test",
        environment: process.env.NODE_ENV || "development",
        ...data,
      }),
    compression: process.env.VICTORIA_LOGS_COMPRESSION === "true",
    maxRetries: Number.parseInt(process.env.VICTORIA_LOGS_MAX_RETRIES || "3"),
    retryDelay: Number.parseInt(process.env.VICTORIA_LOGS_RETRY_DELAY || "1000"),
    respectRateLimit: process.env.VICTORIA_LOGS_RESPECT_RATE_LIMIT !== "false",
    enableBatchSend: process.env.VICTORIA_LOGS_ENABLE_BATCH !== "false",
    batchSize: Number.parseInt(process.env.VICTORIA_LOGS_BATCH_SIZE || "100"),
    batchSendTimeout: Number.parseInt(process.env.VICTORIA_LOGS_BATCH_TIMEOUT || "5000"),
    batchContentType: "application/stream+json", // VictoriaLogs expects stream+json for batch
    onError: (err) => {
      console.error("Failed to send logs to VictoriaLogs:", err);
    },
    onDebug: (entry) => {
      console.log("Log entry being sent to VictoriaLogs:", entry);
    },
  }),
});

// This will send logs to the configured VictoriaLogs instance
testTransportOutput("victoria-logs", log);
