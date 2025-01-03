import { testTransportOutput } from "@loglayer/transport";
import { LogLayer } from "loglayer";
import tracer from "tracer";
import { TracerTransport } from "../TracerTransport.js";

const transport = new TracerTransport({
  logger: tracer.console(),
});

const logger = new LogLayer({
  transport,
});

testTransportOutput("tracer", logger);
