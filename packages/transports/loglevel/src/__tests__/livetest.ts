import { testTransportOutput } from "@loglayer/transport";
import { LogLayer } from "loglayer";
import log from "loglevel";
import { LogLevelTransport } from "../LogLevelTransport.js";

// Create two loggers to demonstrate both configurations
const defaultLogger = log.getLogger("default");
defaultLogger.setLevel("trace"); // Enable all log levels

const appendLogger = log.getLogger("append");
appendLogger.setLevel("trace"); // Enable all log levels

// Test with default configuration (appendObjectData: false)
const defaultLoglayer = new LogLayer({
  transport: new LogLevelTransport({
    logger: defaultLogger,
    id: "default",
  }),
});

// Test with appendObjectData: true
const appendLoglayer = new LogLayer({
  transport: new LogLevelTransport({
    logger: appendLogger,
    id: "append",
    appendObjectData: true,
  }),
});

console.log("Testing with default configuration (appendObjectData: false):");
testTransportOutput("loglevel-default", defaultLoglayer);

console.log("\nTesting with appendObjectData: true:");
testTransportOutput("loglevel-append", appendLoglayer);
