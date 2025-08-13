import tracer from "dd-trace";
import express from "express";
import { ConsoleTransport, LogLayer } from "loglayer";
import { datadogTraceInjectorPlugin } from "../index.js";

// Initialize dd-trace
tracer.init();

const app = express();

const log = new LogLayer({
  transport: new ConsoleTransport({
    messageField: "msg",
    logger: console,
  }),
  plugins: [
    datadogTraceInjectorPlugin({
      tracerInstance: tracer,
    }),
  ],
});

app.get("/", (_req, res) => {
  // This log will automatically include trace context
  log.info("Fetching users from database");

  // Your API logic here
  res.json({ users: [] });
});

app.listen(3004, (err) => {
  if (err) console.log("Error in server setup");
  console.log("Server listening on Port 3004");
});
