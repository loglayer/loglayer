import { Elysia } from "elysia";
import { LogLayer, TestLoggingLibrary, TestTransport } from "loglayer";
import { describe, expect, it } from "vitest";
import { elysiaLogLayer } from "../index.js";

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

describe("elysiaLogLayer", () => {
  describe("core functionality", () => {
    it("should make log available on the route handler context", async () => {
      const { logger } = createTestLogger();
      let logAvailable = false;

      const app = new Elysia().use(elysiaLogLayer({ instance: logger })).get("/test", ({ log }) => {
        logAvailable = !!log;
        log.info("test message");
        return "ok";
      });

      await app.handle(new Request("http://localhost/test"));
      expect(logAvailable).toBe(true);
    });

    it("should log messages from route handlers", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Elysia().use(elysiaLogLayer({ instance: logger, autoLogging: false })).get("/test", ({ log }) => {
        log.info("hello from route");
        return "ok";
      });

      await app.handle(new Request("http://localhost/test"));

      const line = findLogWithMessage(testLib, "hello from route");
      expect(line).toBeTruthy();
      expect(line!.level).toBe("info");
    });

    it("should create per-request child loggers (not shared)", async () => {
      const { logger } = createTestLogger();
      const contexts: Record<string, any>[] = [];

      const app = new Elysia().use(elysiaLogLayer({ instance: logger, autoLogging: false })).get("/test", ({ log }) => {
        contexts.push(log.getContext());
        return "ok";
      });

      await app.handle(new Request("http://localhost/test"));
      await app.handle(new Request("http://localhost/test"));

      expect(contexts).toHaveLength(2);
      expect(contexts[0].requestId).not.toBe(contexts[1].requestId);
    });

    it("should include requestId in context but not method/path", async () => {
      const { logger } = createTestLogger();
      let capturedContext: Record<string, any> | undefined;

      const app = new Elysia()
        .use(elysiaLogLayer({ instance: logger, autoLogging: false }))
        .post("/api/users", ({ log }) => {
          capturedContext = log.getContext();
          return "ok";
        });

      await app.handle(new Request("http://localhost/api/users", { method: "POST" }));
      expect(capturedContext?.requestId).toBeDefined();
      expect(capturedContext?.method).toBeUndefined();
      expect(capturedContext?.path).toBeUndefined();
    });

    it("should log errors via onError hook", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Elysia().use(elysiaLogLayer({ instance: logger, autoLogging: false })).get("/error", () => {
        throw new Error("test error");
      });

      await app.handle(new Request("http://localhost/error"));

      const errorLine = testLib.lines.find((l) => l.level === "error");
      expect(errorLine).toBeTruthy();
    });
  });

  describe("requestId", () => {
    it("should include a requestId by default", async () => {
      const { logger } = createTestLogger();
      let capturedContext: Record<string, any> | undefined;

      const app = new Elysia().use(elysiaLogLayer({ instance: logger, autoLogging: false })).get("/test", ({ log }) => {
        capturedContext = log.getContext();
        return "ok";
      });

      await app.handle(new Request("http://localhost/test"));
      expect(capturedContext?.requestId).toBeDefined();
      expect(typeof capturedContext?.requestId).toBe("string");
      expect(capturedContext?.requestId.length).toBeGreaterThan(0);
    });

    it("should allow disabling requestId", async () => {
      const { logger } = createTestLogger();
      let capturedContext: Record<string, any> | undefined;

      const app = new Elysia()
        .use(elysiaLogLayer({ instance: logger, requestId: false, autoLogging: false }))
        .get("/test", ({ log }) => {
          capturedContext = log.getContext();
          return "ok";
        });

      await app.handle(new Request("http://localhost/test"));
      expect(capturedContext?.requestId).toBeUndefined();
    });

    it("should support custom requestId function", async () => {
      const { logger } = createTestLogger();
      let capturedContext: Record<string, any> | undefined;

      const app = new Elysia()
        .use(
          elysiaLogLayer({
            instance: logger,
            requestId: () => "custom-id-123",
            autoLogging: false,
          }),
        )
        .get("/test", ({ log }) => {
          capturedContext = log.getContext();
          return "ok";
        });

      await app.handle(new Request("http://localhost/test"));
      expect(capturedContext?.requestId).toBe("custom-id-123");
    });

    it("should support requestId function receiving the request", async () => {
      const { logger } = createTestLogger();
      let capturedContext: Record<string, any> | undefined;

      const app = new Elysia()
        .use(
          elysiaLogLayer({
            instance: logger,
            requestId: (req) => req.headers.get("x-request-id") ?? "fallback",
            autoLogging: false,
          }),
        )
        .get("/test", ({ log }) => {
          capturedContext = log.getContext();
          return "ok";
        });

      await app.handle(
        new Request("http://localhost/test", {
          headers: { "x-request-id": "from-header" },
        }),
      );
      expect(capturedContext?.requestId).toBe("from-header");
    });
  });

  describe("contextFn", () => {
    it("should support contextFn for additional context", async () => {
      const { logger } = createTestLogger();
      let capturedContext: Record<string, any> | undefined;

      const app = new Elysia()
        .use(
          elysiaLogLayer({
            instance: logger,
            autoLogging: false,
            contextFn: ({ request }) => ({
              userAgent: request.headers.get("user-agent") ?? "unknown",
            }),
          }),
        )
        .get("/test", ({ log }) => {
          capturedContext = log.getContext();
          return "ok";
        });

      await app.handle(
        new Request("http://localhost/test", {
          headers: { "user-agent": "test-agent" },
        }),
      );
      expect(capturedContext?.userAgent).toBe("test-agent");
    });
  });

  describe("request logging", () => {
    it("should log incoming requests by default", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Elysia().use(elysiaLogLayer({ instance: logger })).get("/test", () => "ok");

      await app.handle(new Request("http://localhost/test"));

      const line = findLogWithMessage(testLib, "incoming request");
      expect(line).toBeTruthy();
      expect(line!.level).toBe("info");
    });

    it("should include req metadata with method, url, and remoteAddress", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Elysia()
        .use(elysiaLogLayer({ instance: logger, autoLogging: { response: false } }))
        .post("/api/users", () => "ok");

      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "x-forwarded-for": "192.168.1.1" },
        }),
      );

      expect(testLib.lines).toHaveLength(1);
      const line = findLogWithMessage(testLib, "incoming request");
      const metadata = getMetadataFromLine(line!);
      expect(metadata).toBeTruthy();
      expect(metadata.req).toStrictEqual({
        method: "POST",
        url: "/api/users",
        remoteAddress: "192.168.1.1",
      });
    });

    it("should not include res or responseTime in request metadata", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Elysia()
        .use(elysiaLogLayer({ instance: logger, autoLogging: { response: false } }))
        .get("/test", () => "ok");

      await app.handle(new Request("http://localhost/test"));

      const metadata = getMetadataFromLine(testLib.lines[0]);
      expect(metadata.res).toBeUndefined();
      expect(metadata.responseTime).toBeUndefined();
    });

    it("should disable request logging when request is false", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Elysia()
        .use(elysiaLogLayer({ instance: logger, autoLogging: { request: false, response: false } }))
        .get("/test", () => "ok");

      await app.handle(new Request("http://localhost/test"));
      expect(testLib.lines).toHaveLength(0);
    });

    it("should support custom request log level", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Elysia()
        .use(
          elysiaLogLayer({
            instance: logger,
            autoLogging: { request: { logLevel: "debug" }, response: false },
          }),
        )
        .get("/test", () => "ok");

      await app.handle(new Request("http://localhost/test"));

      expect(testLib.lines).toHaveLength(1);
      expect(testLib.lines[0].level).toBe("debug");
    });
  });

  describe("response logging", () => {
    it("should log request completed by default", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Elysia().use(elysiaLogLayer({ instance: logger })).get("/test", () => "ok");

      await app.handle(new Request("http://localhost/test"));

      const line = findLogWithMessage(testLib, "request completed");
      expect(line).toBeTruthy();
      expect(line!.level).toBe("info");
    });

    it("should include req, res, and responseTime in response metadata", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Elysia()
        .use(elysiaLogLayer({ instance: logger, autoLogging: { request: false } }))
        .get("/api/data", () => "ok");

      await app.handle(new Request("http://localhost/api/data"));

      const line = findLogWithMessage(testLib, "request completed");
      expect(line).toBeTruthy();

      const metadata = getMetadataFromLine(line!);
      expect(metadata).toBeTruthy();
      expect(metadata.req.method).toBe("GET");
      expect(metadata.req.url).toBe("/api/data");
      expect(metadata.res).toStrictEqual({ statusCode: 200 });
      expect(typeof metadata.responseTime).toBe("number");
    });

    it("should include remoteAddress from x-forwarded-for header", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Elysia()
        .use(elysiaLogLayer({ instance: logger, autoLogging: { request: false } }))
        .get("/test", () => "ok");

      await app.handle(
        new Request("http://localhost/test", {
          headers: { "x-forwarded-for": "192.168.1.1" },
        }),
      );

      const line = findLogWithMessage(testLib, "request completed");
      const metadata = getMetadataFromLine(line!);
      expect(metadata.req.remoteAddress).toBe("192.168.1.1");
    });

    it("should include remoteAddress from x-real-ip header", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Elysia()
        .use(elysiaLogLayer({ instance: logger, autoLogging: { request: false } }))
        .get("/test", () => "ok");

      await app.handle(
        new Request("http://localhost/test", {
          headers: { "x-real-ip": "10.0.0.1" },
        }),
      );

      const line = findLogWithMessage(testLib, "request completed");
      const metadata = getMetadataFromLine(line!);
      expect(metadata.req.remoteAddress).toBe("10.0.0.1");
    });

    it("should disable response logging when response is false", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Elysia()
        .use(elysiaLogLayer({ instance: logger, autoLogging: { request: false, response: false } }))
        .get("/test", () => "ok");

      await app.handle(new Request("http://localhost/test"));
      expect(testLib.lines).toHaveLength(0);
    });

    it("should support custom response log level", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Elysia()
        .use(elysiaLogLayer({ instance: logger, autoLogging: { request: false, response: { logLevel: "debug" } } }))
        .get("/test", () => "ok");

      await app.handle(new Request("http://localhost/test"));

      const line = findLogWithMessage(testLib, "request completed");
      expect(line).toBeTruthy();
      expect(line!.level).toBe("debug");
    });

    it("should use top-level logLevel as default for response", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Elysia()
        .use(elysiaLogLayer({ instance: logger, autoLogging: { request: false, logLevel: "warn" } }))
        .get("/test", () => "ok");

      await app.handle(new Request("http://localhost/test"));

      const line = findLogWithMessage(testLib, "request completed");
      expect(line).toBeTruthy();
      expect(line!.level).toBe("warn");
    });
  });

  describe("default auto-logging behavior", () => {
    it("should log both request and response by default", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Elysia().use(elysiaLogLayer({ instance: logger })).get("/test", () => "ok");

      await app.handle(new Request("http://localhost/test"));

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
          elysia: { transports: ["t1"] },
          "elysia.request": { transports: ["t1"] },
          "elysia.response": { transports: ["t2"] },
        },
        ungroupedBehavior: "all",
      });
      return { logger, t1Lib, t2Lib };
    }

    it("should tag auto-logged request messages with default request group when group is true", async () => {
      const { logger, t1Lib, t2Lib } = createGroupTestLogger();

      const app = new Elysia()
        .use(elysiaLogLayer({ instance: logger, group: true, autoLogging: { response: false } }))
        .get("/test", () => "ok");

      await app.handle(new Request("http://localhost/test"));

      // "elysia.request" routes to t1
      const t1Line = findLogWithMessage(t1Lib, "incoming request");
      expect(t1Line).toBeTruthy();
      // Should not go to t2 (only elysia.request group, which routes to t1)
      const t2Line = findLogWithMessage(t2Lib, "incoming request");
      expect(t2Line).toBeFalsy();
    });

    it("should tag auto-logged response messages with default response group when group is true", async () => {
      const { logger, t1Lib, t2Lib } = createGroupTestLogger();

      const app = new Elysia()
        .use(elysiaLogLayer({ instance: logger, group: true, autoLogging: { request: false } }))
        .get("/test", () => "ok");

      await app.handle(new Request("http://localhost/test"));

      // "elysia.response" routes to t2
      const t2Line = findLogWithMessage(t2Lib, "request completed");
      expect(t2Line).toBeTruthy();
      // Should not go to t1 (only elysia.response group, which routes to t2)
      const t1Line = findLogWithMessage(t1Lib, "request completed");
      expect(t1Line).toBeFalsy();
    });

    it("should tag error logs with the name group", async () => {
      const { logger, t1Lib, t2Lib } = createGroupTestLogger();

      const app = new Elysia()
        .use(elysiaLogLayer({ instance: logger, group: true, autoLogging: false }))
        .get("/error", () => {
          throw new Error("test error");
        });

      await app.handle(new Request("http://localhost/error"));

      // "elysia" group routes to t1
      const t1Error = t1Lib.lines.find((l) => l.level === "error");
      expect(t1Error).toBeTruthy();
      // Should not go to t2
      const t2Error = t2Lib.lines.find((l) => l.level === "error");
      expect(t2Error).toBeFalsy();
    });

    it("should NOT tag user logs from route handlers", async () => {
      const { logger, t1Lib, t2Lib } = createGroupTestLogger();

      const app = new Elysia()
        .use(elysiaLogLayer({ instance: logger, group: true, autoLogging: false }))
        .get("/test", ({ log }) => {
          log.info("user log");
          return "ok";
        });

      await app.handle(new Request("http://localhost/test"));

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

      const app = new Elysia()
        .use(
          elysiaLogLayer({
            instance: logger,
            group: { request: "custom.req", response: "custom.res" },
          }),
        )
        .get("/test", () => "ok");

      await app.handle(new Request("http://localhost/test"));

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
          elysia: { transports: ["t1"] },
        },
      });

      const app = new Elysia().use(elysiaLogLayer({ instance: logger, autoLogging: false })).get("/test", ({ log }) => {
        log.info("no group log");
        return "ok";
      });

      await app.handle(new Request("http://localhost/test"));

      // Ungrouped logs go to all transports by default
      const t1Line = findLogWithMessage(t1Lib, "no group log");
      expect(t1Line).toBeTruthy();
      const t2Line = findLogWithMessage(t2Lib, "no group log");
      expect(t2Line).toBeTruthy();
    });
  });

  describe("auto-logging controls", () => {
    it("should disable all auto-logging when autoLogging is false", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Elysia().use(elysiaLogLayer({ instance: logger, autoLogging: false })).get("/test", () => "ok");

      await app.handle(new Request("http://localhost/test"));
      expect(testLib.lines).toHaveLength(0);
    });

    it("should respect ignore patterns for both request and response", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Elysia()
        .use(
          elysiaLogLayer({
            instance: logger,
            autoLogging: { ignore: ["/health", /^\/internal/] },
          }),
        )
        .get("/health", () => "ok")
        .get("/internal/status", () => "ok")
        .get("/api/data", () => "ok");

      await app.handle(new Request("http://localhost/health"));
      await app.handle(new Request("http://localhost/internal/status"));
      expect(testLib.lines).toHaveLength(0);

      await app.handle(new Request("http://localhost/api/data"));
      // Should have both request and response logs
      expect(testLib.lines).toHaveLength(2);
    });
  });
});
