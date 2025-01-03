import { testTransportOutput } from "@loglayer/transport";
import bunyan from "bunyan";
import { LogLayer } from "loglayer";
import { BunyanTransport } from "../BunyanTransport.js";

const b = bunyan.createLogger({
  name: "my-logger",
  level: "trace", // Show all log levels
  serializers: {
    err: bunyan.stdSerializers.err, // Use Bunyan's error serializer
  },
});

const log = new LogLayer({
  errorFieldName: "err", // Match Bunyan's error field name
  transport: new BunyanTransport({
    logger: b,
  }),
});

testTransportOutput("Bunyan logger", log);
