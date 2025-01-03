import { testTransportOutput } from "@loglayer/transport";
import { LogLayer } from "loglayer";
import { Roarr as r } from "roarr";
import { serializeError } from "serialize-error";
import { RoarrTransport } from "../RoarrTransport.js";

// Setup Roarr environment first
if (!process.env.ROARR_LOG) {
  process.env.ROARR_LOG = "true";
}

const log = new LogLayer({
  transport: new RoarrTransport({
    logger: r,
  }),
  errorSerializer: serializeError, // Roarr requires error serialization
});

// Test the transport output
testTransportOutput("roarr", log);
