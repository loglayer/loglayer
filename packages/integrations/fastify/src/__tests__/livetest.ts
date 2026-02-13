import { getSimplePrettyTerminal, moonlight } from "@loglayer/transport-simple-pretty-terminal";
import Fastify from "fastify";
import { LogLayer } from "loglayer";
import { serializeError } from "serialize-error";
import { fastifyLogLayer } from "../index.js";

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: getSimplePrettyTerminal({
    runtime: "node",
    theme: moonlight,
  }),
});

const app = Fastify();

await app.register(fastifyLogLayer, {
  instance: log,
  autoLogging: {
    ignore: ["/health"],
  },
});

app.get("/", (request, reply) => {
  request.log.info("Hello from root!");
  reply.send("Hello World!");
});

app.get("/api/users/:id", (request, reply) => {
  const { id } = request.params as { id: string };
  request.log.withMetadata({ userId: id }).info("Fetching user");
  reply.send({ id, name: "John" });
});

app.get("/health", (_request, reply) => {
  reply.send("ok");
});

app.get("/error", () => {
  throw new Error("Something went wrong");
});

await app.listen({ port: 3000 });

console.log("Server running at http://localhost:3000");
console.log("Try:");
console.log("  curl http://localhost:3000/");
console.log("  curl http://localhost:3000/api/users/42");
console.log("  curl http://localhost:3000/health");
console.log("  curl http://localhost:3000/error");
