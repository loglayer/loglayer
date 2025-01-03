import { testTransportOutput } from "@loglayer/transport";
import { LogLayer } from "loglayer";
import winston from "winston";
import { WinstonTransport } from "../WinstonTransport.js";

const transport = new WinstonTransport({
  logger: winston.createLogger({
    format: winston.format.json(),
  }),
});

const logger = new LogLayer({
  transport,
});

testTransportOutput("winston", logger);
