import { testTransportOutput } from "@loglayer/transport";
import { LogLayer } from "loglayer";
import { configure, getConsoleSink, getLogger } from "@logtape/logtape";
import { LogTapeTransport } from "../index.js";

// Configure LogTape
await configure({
  sinks: { console: getConsoleSink() },
  loggers: [
    { category: "test-app", lowestLevel: "trace", sinks: ["console"] }
  ]
});

// Get a LogTape logger instance
const logtapeLogger = getLogger(["test-app", "livetest"]);

const transport = new LogTapeTransport({
  logger: logtapeLogger,
});

const logger = new LogLayer({
  transport,
});

testTransportOutput("logtape", logger);
