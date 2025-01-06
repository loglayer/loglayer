import { Logger } from "@aws-lambda-powertools/logger";
import { testTransportOutput } from "@loglayer/transport";
import { LogLayer } from "loglayer";
import { PowertoolsTransport } from "../PowertoolsTransport.js";

const powertoolsLogger = new Logger({
  serviceName: "test-service",
  logLevel: "DEBUG", // Show all log levels
});

const log = new LogLayer({
  errorFieldName: "err", // Match PowerTools's error field name
  transport: new PowertoolsTransport({
    logger: powertoolsLogger,
  }),
});

testTransportOutput("AWS Lambda PowerTools logger", log);
