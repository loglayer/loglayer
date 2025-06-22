import express from "express";
import { type ILogLayer, LogLayer } from "loglayer";
import { serializeError } from "serialize-error";
import { getSimplePrettyTerminal } from "../index.js";

const app = express();

// Add types for the req.log property
declare global {
  namespace Express {
    interface Request {
      log: ILogLayer;
    }
  }
}

// Create a transport instance with some nice defaults for demo
const transport = getSimplePrettyTerminal({
  viewMode: "message-only",
  runtime: "node",
});

const logger = new LogLayer({
  errorSerializer: serializeError,
  transport,
});

// Define logging middleware
app.use((req, _res, next) => {
  // Create a new LogLayer instance for each request
  req.log = logger.child();

  next();
});

// Example route that demonstrates different log levels and metadata
app.get("/", (req, res) => {
  req.log.info("Processing request to root endpoint");

  // Log with different levels
  req.log.debug("This is a debug message");
  req.log
    .withMetadata({
      user: {
        id: 123,
        name: "Alice",
      },
      isTrue: true,
      number: 12345,
      date: new Date(),
      array: [1, 2, 3, 4, 5],
      buffer: Buffer.from("Hello, world!"),
    })
    .warn("This is a warning message");

  res.send("Hello World! Check your terminal for pretty logs!");
});

// Error handling route
app.get("/error", (req, res) => {
  try {
    throw new Error("This is a test error");
  } catch (err) {
    req.log.withError(err).error("An error occurred while processing the request");
    res.status(500).send("Internal Server Error");
  }
});

// Start the server
const port = 3000;
app.listen(port, () => {
  logger.info(`Server is running on http://localhost:${port}`);
});
