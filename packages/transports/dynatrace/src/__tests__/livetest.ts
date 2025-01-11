import { testTransportOutput } from "@loglayer/transport";
import { LogLayer } from "loglayer";
import { DynatraceTransport } from "../DynatraceTransport.js";

// Replace these values with your actual Dynatrace configuration
const DYNATRACE_URL = process.env.DYNATRACE_URL || "https://<env-id>.live.dynatrace.com/api/v2/logs/ingest";
const DYNATRACE_API_TOKEN = process.env.DYNATRACE_API_TOKEN;

if (!DYNATRACE_API_TOKEN) {
  console.error("Please set DYNATRACE_API_TOKEN environment variable");
  process.exit(1);
}

// Create a transport instance
const transport = new DynatraceTransport({
  url: DYNATRACE_URL,
  ingestToken: DYNATRACE_API_TOKEN,
  onError: (error) => {
    console.error("Error from Dynatrace transport:", error);
  },
});

// Create a logger instance
const logger = new LogLayer({
  transport,
});

// Call testTransportOutput
testTransportOutput("dynatrace", logger);
