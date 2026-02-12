import { node } from "@elysiajs/node";
import { Elysia } from "elysia";
import { ConsoleTransport, LogLayer } from "loglayer";
import { elysiaLogLayer } from "../index.js";

const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
  }),
});

const _app = new Elysia({ adapter: node() })
  .use(
    elysiaLogLayer({
      instance: log,
      autoLogging: {
        ignore: ["/health"],
      },
    }),
  )
  .get("/", ({ log }) => {
    log.info("Hello from root!");
    return "Hello World!";
  })
  .get("/api/users/:id", ({ log, params }) => {
    log.withMetadata({ userId: params.id }).info("Fetching user");
    return { id: params.id, name: "John" };
  })
  .get("/health", () => "ok")
  .get("/error", () => {
    throw new Error("Something went wrong");
  })
  .listen(3000);

console.log("Server running at http://localhost:3000");
console.log("Try:");
console.log("  curl http://localhost:3000/");
console.log("  curl http://localhost:3000/api/users/42");
console.log("  curl http://localhost:3000/health");
console.log("  curl http://localhost:3000/error");
