import { testTransportOutput } from "@loglayer/transport";
import { LogLayer } from "loglayer";
import { serializeError } from "serialize-error";
import { SumoLogicTransport } from "../SumoLogicTransport.js";

// Replace with your SumoLogic HTTP Source URL
const SUMOLOGIC_URL = process.env.SUMOLOGIC_URL;

if (!SUMOLOGIC_URL) {
  console.error("Please set SUMOLOGIC_URL environment variable");
  process.exit(1);
}

const transport = new SumoLogicTransport({
  url: SUMOLOGIC_URL,
  onError: (error) => {
    console.error("Error from SumoLogic transport:", error);
  },
});

const logger = new LogLayer({
  errorSerializer: serializeError,
  transport,
});

// Call testTransportOutput
testTransportOutput("sumo logic", logger);
