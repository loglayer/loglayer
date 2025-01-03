import { testTransportOutput } from "@loglayer/transport";
import log4js from "log4js";
import { LogLayer } from "loglayer";
import { Log4JsTransport } from "../Log4JsTransport.js";

const logger = log4js.getLogger();

// Enable logging output
logger.level = "trace";

const transport = new Log4JsTransport({
  logger,
});

const log = new LogLayer({
  transport,
});

testTransportOutput("log4js-node", log);
