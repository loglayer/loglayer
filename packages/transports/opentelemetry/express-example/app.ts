import express from "express";
import { type ILogLayer, LogLayer } from "loglayer";
import { serializeError } from "serialize-error";
import { OpenTelemetryTransport } from "../src/OpenTelemetryTransport.js";

const app = express();

// Add types for the req.log property
declare global {
  namespace Express {
    interface Request {
      log: ILogLayer;
    }
  }
}

// Define logging middleware
app.use((req, res, next) => {
  // Create a new LogLayer instance for each request
  req.log = new LogLayer({
    transport: [new OpenTelemetryTransport()],
    errorSerializer: serializeError,
  }).withContext({
    reqId: crypto.randomUUID(), // Add unique request ID
    method: req.method,
    path: req.path,
  });

  next();
});

function sayHelloWorld(req: express.Request) {
  req.log.info("Printing hello world");

  return "Hello world!";
}

// Use the logger in your routes
app.get("/", (req, res) => {
  req.log.info("Processing request to root endpoint");

  // Add additional context for specific logs
  req.log.withContext({ query: req.query }).info("Request includes query parameters");

  res.send(sayHelloWorld(req));
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  req.log.withError(err).error("An error occurred while processing the request");
  res.status(500).send("Internal Server Error");
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});