import { getSimplePrettyTerminal, moonlight } from "@loglayer/transport-simple-pretty-terminal";
import Koa from "koa";
import { LogLayer } from "loglayer";
import { serializeError } from "serialize-error";
import { koaLogLayer } from "../index.js";

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: getSimplePrettyTerminal({
    runtime: "node",
    theme: moonlight,
  }),
});

const app = new Koa();

app.use(
  koaLogLayer({
    instance: log,
    autoLogging: {
      ignore: ["/health"],
    },
  }),
);

app.use((ctx) => {
  if (ctx.path === "/") {
    ctx.log.info("Hello from root!");
    ctx.body = "Hello World!";
  } else if (ctx.path.startsWith("/api/users/")) {
    const id = ctx.path.split("/").pop();
    ctx.log.withMetadata({ userId: id }).info("Fetching user");
    ctx.body = { id, name: "John" };
  } else if (ctx.path === "/health") {
    ctx.body = "ok";
  } else if (ctx.path === "/error") {
    throw new Error("Something went wrong");
  } else {
    ctx.status = 404;
    ctx.body = "Not Found";
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
  console.log("Try:");
  console.log("  curl http://localhost:3000/");
  console.log("  curl http://localhost:3000/api/users/42");
  console.log("  curl http://localhost:3000/health");
  console.log("  curl http://localhost:3000/error");
});
