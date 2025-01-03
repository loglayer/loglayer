import { testTransportOutput } from "@loglayer/transport";
import { LogLayer } from "loglayer";
import { type ILogObj, Logger } from "tslog";
import { TsLogTransport } from "../TsLogTransport.js";

const tslog: Logger<ILogObj> = new Logger();

const log = new LogLayer({
  transport: new TsLogTransport({
    logger: tslog,
  }),
});

testTransportOutput("tslog", log);
