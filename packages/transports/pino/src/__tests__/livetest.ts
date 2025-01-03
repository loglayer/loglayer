import { testTransportOutput } from "@loglayer/transport";
import { LogLayer } from "loglayer";
import { pino } from "pino";
import { PinoTransport } from "../index.js";

// Note: Pino prints logs in an async fashion, so most of the logs get printed after
// the normal console logs. It will look like some of the tests are empty, but they're
// just printed at the end

const p = pino({
  level: "trace",
});

const transport = new PinoTransport({
  logger: p,
});

const logger = new LogLayer({
  transport,
});

testTransportOutput("pino", logger);
