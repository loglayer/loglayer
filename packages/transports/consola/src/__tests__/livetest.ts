import { testTransportOutput } from "@loglayer/transport";
import { createConsola } from "consola";
import { LogLayer } from "loglayer";
import { ConsolaTransport } from "../ConsolaTransport.js";

// Create transport with just logger property
const transport = new ConsolaTransport({
  logger: createConsola({
    level: 5, // Enable all log levels
  }),
});

// Create LogLayer with transport
const logger = new LogLayer({
  transport,
});

// Call testTransportOutput
testTransportOutput("consola", logger);
