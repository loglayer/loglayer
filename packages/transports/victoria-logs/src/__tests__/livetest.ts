import { testTransportOutput } from "@loglayer/transport";
import dotenv from "dotenv";
import { LogLayer } from "loglayer";
import { serializeError } from "serialize-error";
import { VictoriaLogsTransport } from "../VictoriaLogsTransport.js";

// This is a live test using VictoriaLogs
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
  transport: new VictoriaLogsTransport({
    url: process.env.VICTORIA_LOGS_URL,
    // Configure stream-level fields for better performance
    streamFields: () => ({
      service: "loglayer-victoria-logs-test",
      environment: process.env.NODE_ENV || "development",
      instance: process.env.HOSTNAME || "test-instance",
    }),
    // Custom timestamp function (optional)
    timestamp: () => new Date().toISOString(),
    // Custom HTTP parameters for VictoriaLogs ingestion
    httpParameters: {
      _time_field: "_time",
      _msg_field: "_msg",
    },
    // All other options are optional and have sensible defaults
    // You can override any HttpTransport option here
    compression: process.env.VICTORIA_LOGS_COMPRESSION === "true",
    maxRetries: Number.parseInt(process.env.VICTORIA_LOGS_MAX_RETRIES || "3"),
    retryDelay: Number.parseInt(process.env.VICTORIA_LOGS_RETRY_DELAY || "1000"),
    respectRateLimit: process.env.VICTORIA_LOGS_RESPECT_RATE_LIMIT !== "false",
    enableBatchSend: process.env.VICTORIA_LOGS_ENABLE_BATCH !== "false",
    batchSize: Number.parseInt(process.env.VICTORIA_LOGS_BATCH_SIZE || "100"),
    batchSendTimeout: Number.parseInt(process.env.VICTORIA_LOGS_BATCH_TIMEOUT || "5000"),
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
