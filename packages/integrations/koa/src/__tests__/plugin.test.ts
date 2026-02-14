import Koa from "koa";
import { LogLayer, TestLoggingLibrary, TestTransport } from "loglayer";
import supertest from "supertest";
import { describe, expect, it } from "vitest";
import { koaLogLayer } from "../index.js";

function createTestLogger() {
  const testLib = new TestLoggingLibrary();
  const logger = new LogLayer({
    transport: new TestTransport({ logger: testLib }),
  });
  return { logger, testLib };
}

function findLogWithMessage(testLib: TestLoggingLibrary, message: string) {
  return testLib.lines.find((l) => l.data.some((d: any) => typeof d === "string" && d.includes(message)));
}

function getMetadataFromLine(line: { data: any[] }) {
  return line.data.find((d: any) => typeof d === "object" && d !== null);
}

describe("koaLogLayer", () => {
  describe("core functionality", () => {
    it("should make logger available on ctx.log", async () => {
      const { logger } = createTestLogger();
      let logAvailable = false;

      const app = new Koa();
      app.use(koaLogLayer({ instance: logger, autoLogging: false }));
      app.use((ctx) => {
        logAvailable = !!ctx.log;
        ctx.log.info("test message");
        ctx.body = "ok";
      });

      await supertest(app.callback()).get("/test");
      expect(logAvailable).toBe(true);
    });

    it("should log messages from route handlers", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Koa();
      app.use(koaLogLayer({ instance: logger, autoLogging: false }));
      app.use((ctx) => {
        ctx.log.info("hello from route");
        ctx.body = "ok";
      });

      await supertest(app.callback()).get("/test");

      const line = findLogWithMessage(testLib, "hello from route");
      expect(line).toBeTruthy();
      expect(line!.level).toBe("info");
    });

    it("should support LogLayer withMetadata chaining", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Koa();
      app.use(koaLogLayer({ instance: logger, autoLogging: false }));
      app.use((ctx) => {
        ctx.log.withMetadata({ userId: "42" }).info("fetching user");
        ctx.body = "ok";
      });

      await supertest(app.callback()).get("/test");

      const line = findLogWithMessage(testLib, "fetching user");
      expect(line).toBeTruthy();
      const metadata = getMetadataFromLine(line!);
      expect(metadata?.userId).toBe("42");
    });

    it("should create per-request child loggers (not shared)", async () => {
      const { logger } = createTestLogger();
      const contexts: Record<string, any>[] = [];

      const app = new Koa();
      app.use(koaLogLayer({ instance: logger, autoLogging: false }));
      app.use((ctx) => {
        contexts.push(ctx.log.getContext());
        ctx.body = "ok";
      });

      const server = app.callback();
      await supertest(server).get("/test");
      await supertest(server).get("/test");

      expect(contexts).toHaveLength(2);
      expect(contexts[0].requestId).not.toBe(contexts[1].requestId);
    });

    it("should include requestId in context but not method/path", async () => {
      const { logger } = createTestLogger();
      let capturedContext: Record<string, any> | undefined;

      const app = new Koa();
      app.use(koaLogLayer({ instance: logger, autoLogging: false }));
      app.use((ctx) => {
        capturedContext = ctx.log.getContext();
        ctx.body = "ok";
      });

      await supertest(app.callback()).post("/api/users");
      expect(capturedContext?.requestId).toBeDefined();
      expect(capturedContext?.method).toBeUndefined();
      expect(capturedContext?.path).toBeUndefined();
    });

    it("should log errors via try/catch and re-throw", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Koa();
      // Suppress Koa's default error logging in tests
      app.silent = true;
      app.use(koaLogLayer({ instance: logger, autoLogging: false }));
      app.use(() => {
        throw new Error("test error");
      });

      await supertest(app.callback()).get("/error");

      const errorLine = testLib.lines.find((l) => l.level === "error");
      expect(errorLine).toBeTruthy();
    });
  });

  describe("requestId", () => {
    it("should include a requestId by default", async () => {
      const { logger } = createTestLogger();
      let capturedContext: Record<string, any> | undefined;

      const app = new Koa();
      app.use(koaLogLayer({ instance: logger, autoLogging: false }));
      app.use((ctx) => {
        capturedContext = ctx.log.getContext();
        ctx.body = "ok";
      });

      await supertest(app.callback()).get("/test");
      expect(capturedContext?.requestId).toBeDefined();
      expect(typeof capturedContext?.requestId).toBe("string");
      expect(capturedContext?.requestId.length).toBeGreaterThan(0);
    });

    it("should allow disabling requestId", async () => {
      const { logger } = createTestLogger();
      let capturedContext: Record<string, any> | undefined;

      const app = new Koa();
      app.use(koaLogLayer({ instance: logger, requestId: false, autoLogging: false }));
      app.use((ctx) => {
        capturedContext = ctx.log.getContext();
        ctx.body = "ok";
      });

      await supertest(app.callback()).get("/test");
      expect(capturedContext?.requestId).toBeUndefined();
    });

    it("should support custom requestId function", async () => {
      const { logger } = createTestLogger();
      let capturedContext: Record<string, any> | undefined;

      const app = new Koa();
      app.use(
        koaLogLayer({
          instance: logger,
          requestId: () => "custom-id-123",
          autoLogging: false,
        }),
      );
      app.use((ctx) => {
        capturedContext = ctx.log.getContext();
        ctx.body = "ok";
      });

      await supertest(app.callback()).get("/test");
      expect(capturedContext?.requestId).toBe("custom-id-123");
    });

    it("should support requestId function receiving the context", async () => {
      const { logger } = createTestLogger();
      let capturedContext: Record<string, any> | undefined;

      const app = new Koa();
      app.use(
        koaLogLayer({
          instance: logger,
          requestId: (ctx) => ctx.get("x-request-id") || "fallback",
          autoLogging: false,
        }),
      );
      app.use((ctx) => {
        capturedContext = ctx.log.getContext();
        ctx.body = "ok";
      });

      await supertest(app.callback()).get("/test").set("x-request-id", "from-header");
      expect(capturedContext?.requestId).toBe("from-header");
    });
  });

  describe("contextFn", () => {
    it("should support contextFn for additional context", async () => {
      const { logger } = createTestLogger();
      let capturedContext: Record<string, any> | undefined;

      const app = new Koa();
      app.use(
        koaLogLayer({
          instance: logger,
          autoLogging: false,
          contextFn: (ctx) => ({
            userAgent: ctx.get("user-agent") || "unknown",
          }),
        }),
      );
      app.use((ctx) => {
        capturedContext = ctx.log.getContext();
        ctx.body = "ok";
      });

      await supertest(app.callback()).get("/test").set("user-agent", "test-agent");
      expect(capturedContext?.userAgent).toBe("test-agent");
    });
  });

  describe("request logging", () => {
    it("should log incoming requests by default", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Koa();
      app.use(koaLogLayer({ instance: logger }));
      app.use((ctx) => {
        ctx.body = "ok";
      });

      await supertest(app.callback()).get("/test");

      const line = findLogWithMessage(testLib, "incoming request");
      expect(line).toBeTruthy();
      expect(line!.level).toBe("info");
    });

    it("should include req metadata with method, url, and remoteAddress", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Koa();
      app.use(koaLogLayer({ instance: logger, autoLogging: { response: false } }));
      app.use((ctx) => {
        ctx.body = "ok";
      });

      await supertest(app.callback()).post("/api/users");

      expect(testLib.lines).toHaveLength(1);
      const line = findLogWithMessage(testLib, "incoming request");
      const metadata = getMetadataFromLine(line!);
      expect(metadata).toBeTruthy();
      expect(metadata.req.method).toBe("POST");
      expect(metadata.req.url).toBe("/api/users");
    });

    it("should not include res or responseTime in request metadata", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Koa();
      app.use(koaLogLayer({ instance: logger, autoLogging: { response: false } }));
      app.use((ctx) => {
        ctx.body = "ok";
      });

      await supertest(app.callback()).get("/test");

      const metadata = getMetadataFromLine(testLib.lines[0]);
      expect(metadata.res).toBeUndefined();
      expect(metadata.responseTime).toBeUndefined();
    });

    it("should disable request logging when request is false", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Koa();
      app.use(koaLogLayer({ instance: logger, autoLogging: { request: false, response: false } }));
      app.use((ctx) => {
        ctx.body = "ok";
      });

      await supertest(app.callback()).get("/test");
      expect(testLib.lines).toHaveLength(0);
    });

    it("should support custom request log level", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Koa();
      app.use(
        koaLogLayer({
          instance: logger,
          autoLogging: { request: { logLevel: "debug" }, response: false },
        }),
      );
      app.use((ctx) => {
        ctx.body = "ok";
      });

      await supertest(app.callback()).get("/test");

      expect(testLib.lines).toHaveLength(1);
      expect(testLib.lines[0].level).toBe("debug");
    });
  });

  describe("response logging", () => {
    it("should log request completed by default", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Koa();
      app.use(koaLogLayer({ instance: logger }));
      app.use((ctx) => {
        ctx.body = "ok";
      });

      await supertest(app.callback()).get("/test");

      const line = findLogWithMessage(testLib, "request completed");
      expect(line).toBeTruthy();
      expect(line!.level).toBe("info");
    });

    it("should include req, res, and responseTime in response metadata", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Koa();
      app.use(koaLogLayer({ instance: logger, autoLogging: { request: false } }));
      app.use((ctx) => {
        ctx.body = "ok";
      });

      await supertest(app.callback()).get("/api/data");

      const line = findLogWithMessage(testLib, "request completed");
      expect(line).toBeTruthy();

      const metadata = getMetadataFromLine(line!);
      expect(metadata).toBeTruthy();
      expect(metadata.req.method).toBe("GET");
      expect(metadata.req.url).toBe("/api/data");
      expect(metadata.res).toStrictEqual({ statusCode: 200 });
      expect(typeof metadata.responseTime).toBe("number");
    });

    it("should disable response logging when response is false", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Koa();
      app.use(koaLogLayer({ instance: logger, autoLogging: { request: false, response: false } }));
      app.use((ctx) => {
        ctx.body = "ok";
      });

      await supertest(app.callback()).get("/test");
      expect(testLib.lines).toHaveLength(0);
    });

    it("should support custom response log level", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Koa();
      app.use(
        koaLogLayer({
          instance: logger,
          autoLogging: { request: false, response: { logLevel: "debug" } },
        }),
      );
      app.use((ctx) => {
        ctx.body = "ok";
      });

      await supertest(app.callback()).get("/test");

      const line = findLogWithMessage(testLib, "request completed");
      expect(line).toBeTruthy();
      expect(line!.level).toBe("debug");
    });

    it("should use top-level logLevel as default for response", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Koa();
      app.use(
        koaLogLayer({
          instance: logger,
          autoLogging: { request: false, logLevel: "warn" },
        }),
      );
      app.use((ctx) => {
        ctx.body = "ok";
      });

      await supertest(app.callback()).get("/test");

      const line = findLogWithMessage(testLib, "request completed");
      expect(line).toBeTruthy();
      expect(line!.level).toBe("warn");
    });
  });

  describe("default auto-logging behavior", () => {
    it("should log both request and response by default", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Koa();
      app.use(koaLogLayer({ instance: logger }));
      app.use((ctx) => {
        ctx.body = "ok";
      });

      await supertest(app.callback()).get("/test");

      // Two log lines: incoming request + request completed
      expect(testLib.lines).toHaveLength(2);

      const requestLine = findLogWithMessage(testLib, "incoming request");
      const responseLine = findLogWithMessage(testLib, "request completed");
      expect(requestLine).toBeTruthy();
      expect(responseLine).toBeTruthy();
    });
  });

  describe("group", () => {
    function createGroupTestLogger() {
      const t1Lib = new TestLoggingLibrary();
      const t2Lib = new TestLoggingLibrary();
      const logger = new LogLayer({
        transport: [new TestTransport({ logger: t1Lib, id: "t1" }), new TestTransport({ logger: t2Lib, id: "t2" })],
        groups: {
          koa: { transports: ["t1"] },
          "koa.request": { transports: ["t1"] },
          "koa.response": { transports: ["t2"] },
        },
        ungroupedBehavior: "all",
      });
      return { logger, t1Lib, t2Lib };
    }

    it("should tag auto-logged request messages with default request group when group is true", async () => {
      const { logger, t1Lib, t2Lib } = createGroupTestLogger();

      const app = new Koa();
      app.use(koaLogLayer({ instance: logger, group: true, autoLogging: { response: false } }));
      app.use((ctx) => {
        ctx.body = "ok";
      });

      await supertest(app.callback()).get("/test");

      const t1Line = findLogWithMessage(t1Lib, "incoming request");
      expect(t1Line).toBeTruthy();
      const t2Line = findLogWithMessage(t2Lib, "incoming request");
      expect(t2Line).toBeFalsy();
    });

    it("should tag auto-logged response messages with default response group when group is true", async () => {
      const { logger, t1Lib, t2Lib } = createGroupTestLogger();

      const app = new Koa();
      app.use(koaLogLayer({ instance: logger, group: true, autoLogging: { request: false } }));
      app.use((ctx) => {
        ctx.body = "ok";
      });

      await supertest(app.callback()).get("/test");

      const t2Line = findLogWithMessage(t2Lib, "request completed");
      expect(t2Line).toBeTruthy();
      const t1Line = findLogWithMessage(t1Lib, "request completed");
      expect(t1Line).toBeFalsy();
    });

    it("should tag error logs with name group when configured", async () => {
      const t1Lib = new TestLoggingLibrary();
      const t2Lib = new TestLoggingLibrary();
      const logger = new LogLayer({
        transport: [new TestTransport({ logger: t1Lib, id: "t1" }), new TestTransport({ logger: t2Lib, id: "t2" })],
        groups: {
          koa: { transports: ["t1"] },
        },
        ungroupedBehavior: "all",
      });

      const app = new Koa();
      app.silent = true;
      app.use(koaLogLayer({ instance: logger, group: true, autoLogging: false }));
      app.use(() => {
        throw new Error("test error");
      });

      await supertest(app.callback()).get("/error");

      const t1Error = findLogWithMessage(t1Lib, "Request error");
      expect(t1Error).toBeTruthy();
      const t2Error = findLogWithMessage(t2Lib, "Request error");
      expect(t2Error).toBeFalsy();
    });

    it("should NOT tag user logs from route handlers", async () => {
      const { logger, t1Lib, t2Lib } = createGroupTestLogger();

      const app = new Koa();
      app.use(koaLogLayer({ instance: logger, group: true, autoLogging: false }));
      app.use((ctx) => {
        ctx.log.info("user log");
        ctx.body = "ok";
      });

      await supertest(app.callback()).get("/test");

      // Ungrouped user logs go to all transports (ungroupedBehavior: "all")
      const t1Line = findLogWithMessage(t1Lib, "user log");
      expect(t1Line).toBeTruthy();
      const t2Line = findLogWithMessage(t2Lib, "user log");
      expect(t2Line).toBeTruthy();
    });

    it("should support custom group names", async () => {
      const t1Lib = new TestLoggingLibrary();
      const t2Lib = new TestLoggingLibrary();
      const logger = new LogLayer({
        transport: [new TestTransport({ logger: t1Lib, id: "t1" }), new TestTransport({ logger: t2Lib, id: "t2" })],
        groups: {
          "custom.req": { transports: ["t1"] },
          "custom.res": { transports: ["t2"] },
        },
        ungroupedBehavior: "all",
      });

      const app = new Koa();
      app.use(
        koaLogLayer({
          instance: logger,
          group: { request: "custom.req", response: "custom.res" },
        }),
      );
      app.use((ctx) => {
        ctx.body = "ok";
      });

      await supertest(app.callback()).get("/test");

      // Request goes to t1 (custom.req)
      const t1Req = findLogWithMessage(t1Lib, "incoming request");
      expect(t1Req).toBeTruthy();
      const t2Req = findLogWithMessage(t2Lib, "incoming request");
      expect(t2Req).toBeFalsy();

      // Response goes to t2 (custom.res)
      const t2Res = findLogWithMessage(t2Lib, "request completed");
      expect(t2Res).toBeTruthy();
      const t1Res = findLogWithMessage(t1Lib, "request completed");
      expect(t1Res).toBeFalsy();
    });

    it("should not use groups when group option is not set", async () => {
      const t1Lib = new TestLoggingLibrary();
      const t2Lib = new TestLoggingLibrary();
      const logger = new LogLayer({
        transport: [new TestTransport({ logger: t1Lib, id: "t1" }), new TestTransport({ logger: t2Lib, id: "t2" })],
        groups: {
          koa: { transports: ["t1"] },
        },
      });

      const app = new Koa();
      app.use(koaLogLayer({ instance: logger, autoLogging: false }));
      app.use((ctx) => {
        ctx.log.info("no group log");
        ctx.body = "ok";
      });

      await supertest(app.callback()).get("/test");

      const t1Line = findLogWithMessage(t1Lib, "no group log");
      expect(t1Line).toBeTruthy();
      const t2Line = findLogWithMessage(t2Lib, "no group log");
      expect(t2Line).toBeTruthy();
    });
  });

  describe("auto-logging controls", () => {
    it("should disable all auto-logging when autoLogging is false", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Koa();
      app.use(koaLogLayer({ instance: logger, autoLogging: false }));
      app.use((ctx) => {
        ctx.body = "ok";
      });

      await supertest(app.callback()).get("/test");
      expect(testLib.lines).toHaveLength(0);
    });

    it("should respect ignore patterns for both request and response", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Koa();
      app.use(
        koaLogLayer({
          instance: logger,
          autoLogging: { ignore: ["/health", /^\/internal/] },
        }),
      );
      app.use((ctx) => {
        ctx.body = "ok";
      });

      await supertest(app.callback()).get("/health");
      await supertest(app.callback()).get("/internal/status");
      expect(testLib.lines).toHaveLength(0);

      await supertest(app.callback()).get("/api/data");
      // Should have both request and response logs
      expect(testLib.lines).toHaveLength(2);
    });
  });
});
