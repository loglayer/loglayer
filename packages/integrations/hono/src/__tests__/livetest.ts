import { serve } from "@hono/node-server";
import { getSimplePrettyTerminal, moonlight } from "@loglayer/transport-simple-pretty-terminal";
import { Hono } from "hono";
import { LogLayer } from "loglayer";
import { serializeError } from "serialize-error";
import { type HonoLogLayerVariables, honoLogLayer } from "../index.js";

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: getSimplePrettyTerminal({
    runtime: "node",
    theme: moonlight,
  }),
});

const app = new Hono<{ Variables: HonoLogLayerVariables }>();

app.use(
  honoLogLayer({
    instance: log,
    autoLogging: {
      ignore: ["/health"],
    },
  }),
);

app.get("/", (c) => {
  c.var.logger.info("Hello from root!");
  return c.text("Hello World!");
});

app.get("/api/users/:id", (c) => {
  const id = c.req.param("id");
  c.var.logger.withMetadata({ userId: id }).info("Fetching user");
  return c.json({ id, name: "John" });
});

app.get("/health", (c) => {
  return c.text("ok");
});

app.get("/error", () => {
  throw new Error("Something went wrong");
});

serve({ fetch: app.fetch, port: 3000 }, () => {
  console.log("Server running at http://localhost:3000");
  console.log("Try:");
  console.log("  curl http://localhost:3000/");
  console.log("  curl http://localhost:3000/api/users/42");
  console.log("  curl http://localhost:3000/health");
  console.log("  curl http://localhost:3000/error");
});
