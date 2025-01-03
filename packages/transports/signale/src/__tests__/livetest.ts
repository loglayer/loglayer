import { testTransportOutput } from "@loglayer/transport";
import { LogLayer } from "loglayer";
import signale from "signale";
import { SignaleTransport } from "../SignaleTransport.js";

const transport = new SignaleTransport({
  logger: signale,
});

const logger = new LogLayer({
  transport,
});

testTransportOutput("signale", logger);
