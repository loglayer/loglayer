import { Database } from "bun:sqlite";
import { LogLayer } from "loglayer";
import { serializeError } from "serialize-error";
import { getPrettyTerminal } from "../index.js";

const db = new Database(":memory:");

const transport = getPrettyTerminal({ database: db });

const logger = new LogLayer({
  errorSerializer: serializeError,
  transport,
});

logger.info("Starting bun:sqlite livetest");
logger.debug("This is a debug message");
logger.warn("This is a warning message");
logger
  .withMetadata({
    user: { id: 123, name: "Alice" },
    isTrue: true,
    number: 12345,
    date: new Date(),
    array: [1, 2, 3, 4, 5],
    buffer: Buffer.from("Hello, world!"),
  })
  .info("Log with structured metadata");

try {
  throw new Error("This is a test error");
} catch (err) {
  logger.withError(err).error("An error occurred");
}

logger.fatal("Fatal message - something went very wrong");
logger.trace("Trace message - very verbose output");
logger.info("Livetest complete");
