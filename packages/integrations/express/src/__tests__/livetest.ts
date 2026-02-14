import { getSimplePrettyTerminal, moonlight } from "@loglayer/transport-simple-pretty-terminal";
import express from "express";
import { LogLayer } from "loglayer";
import { serializeError } from "serialize-error";
import { expressLogLayer, expressLogLayerErrorHandler } from "../index.js";

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: getSimplePrettyTerminal({
    runtime: "node",
    theme: moonlight,
  }),
});

const app = express();

app.use(
  expressLogLayer({
    instance: log,
    autoLogging: {
      ignore: ["/health"],
    },
  }),
);

app.get("/", (req, res) => {
  req.log.info("Hello from root!");
  res.send("Hello World!");
});

app.get("/api/users/:id", (req, res) => {
  req.log.withMetadata({ userId: req.params.id }).info("Fetching user");
  res.json({ id: req.params.id, name: "John" });
});

app.get("/health", (_req, res) => {
  res.send("ok");
});

app.get("/error", () => {
  throw new Error("Something went wrong");
});

app.use(expressLogLayerErrorHandler());
app.use((_err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).send("Internal Server Error");
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
  console.log("Try:");
  console.log("  curl http://localhost:3000/");
  console.log("  curl http://localhost:3000/api/users/42");
  console.log("  curl http://localhost:3000/health");
  console.log("  curl http://localhost:3000/error");
});
