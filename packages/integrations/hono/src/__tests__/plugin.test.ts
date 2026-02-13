import { Hono } from "hono";
import { LogLayer, TestLoggingLibrary, TestTransport } from "loglayer";
import { describe, expect, it } from "vitest";
import { type HonoLogLayerVariables, honoLogLayer } from "../index.js";

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

describe("honoLogLayer", () => {
  describe("core functionality", () => {
    it("should make logger available on context", async () => {
      const { logger } = createTestLogger();
      let logAvailable = false;

      const app = new Hono<{ Variables: HonoLogLayerVariables }>();
      app.use(honoLogLayer({ instance: logger }));
      app.get("/test", (c) => {
        logAvailable = !!c.var.logger;
        c.var.logger.info("test message");
        return c.text("ok");
      });

      await app.request("/test");
      expect(logAvailable).toBe(true);
    });

    it("should log messages from route handlers", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Hono<{ Variables: HonoLogLayerVariables }>();
      app.use(honoLogLayer({ instance: logger, autoLogging: false }));
      app.get("/test", (c) => {
        c.var.logger.info("hello from route");
        return c.text("ok");
      });

      await app.request("/test");

      const line = findLogWithMessage(testLib, "hello from route");
      expect(line).toBeTruthy();
      expect(line!.level).toBe("info");
    });

    it("should support LogLayer withMetadata chaining", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Hono<{ Variables: HonoLogLayerVariables }>();
      app.use(honoLogLayer({ instance: logger, autoLogging: false }));
      app.get("/test", (c) => {
        c.var.logger.withMetadata({ userId: "42" }).info("fetching user");
        return c.text("ok");
      });

      await app.request("/test");

      const line = findLogWithMessage(testLib, "fetching user");
      expect(line).toBeTruthy();
      const metadata = getMetadataFromLine(line!);
      expect(metadata?.userId).toBe("42");
    });

    it("should create per-request child loggers (not shared)", async () => {
      const { logger } = createTestLogger();
      const contexts: Record<string, any>[] = [];

      const app = new Hono<{ Variables: HonoLogLayerVariables }>();
      app.use(honoLogLayer({ instance: logger, autoLogging: false }));
      app.get("/test", (c) => {
        contexts.push(c.var.logger.getContext());
        return c.text("ok");
      });

      await app.request("/test");
      await app.request("/test");

      expect(contexts).toHaveLength(2);
      expect(contexts[0].requestId).not.toBe(contexts[1].requestId);
    });

    it("should include requestId in context but not method/path", async () => {
      const { logger } = createTestLogger();
      let capturedContext: Record<string, any> | undefined;

      const app = new Hono<{ Variables: HonoLogLayerVariables }>();
      app.use(honoLogLayer({ instance: logger, autoLogging: false }));
      app.post("/api/users", (c) => {
        capturedContext = c.var.logger.getContext();
        return c.text("ok");
      });

      await app.request("/api/users", { method: "POST" });
      expect(capturedContext?.requestId).toBeDefined();
      expect(capturedContext?.method).toBeUndefined();
      expect(capturedContext?.path).toBeUndefined();
    });

    it("should make logger available in app.onError for error logging", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Hono<{ Variables: HonoLogLayerVariables }>();
      app.use(honoLogLayer({ instance: logger, autoLogging: false }));
      app.onError((err, c) => {
        c.var.logger.withError(err).withMetadata({ url: c.req.path }).error("Request error");
        return c.text("Internal Server Error", 500);
      });
      app.get("/error", () => {
        throw new Error("test error");
      });

      await app.request("/error");

      const errorLine = testLib.lines.find((l) => l.level === "error");
      expect(errorLine).toBeTruthy();
    });
  });

  describe("requestId", () => {
    it("should include a requestId by default", async () => {
      const { logger } = createTestLogger();
      let capturedContext: Record<string, any> | undefined;

      const app = new Hono<{ Variables: HonoLogLayerVariables }>();
      app.use(honoLogLayer({ instance: logger, autoLogging: false }));
      app.get("/test", (c) => {
        capturedContext = c.var.logger.getContext();
        return c.text("ok");
      });

      await app.request("/test");
      expect(capturedContext?.requestId).toBeDefined();
      expect(typeof capturedContext?.requestId).toBe("string");
      expect(capturedContext?.requestId.length).toBeGreaterThan(0);
    });

    it("should allow disabling requestId", async () => {
      const { logger } = createTestLogger();
      let capturedContext: Record<string, any> | undefined;

      const app = new Hono<{ Variables: HonoLogLayerVariables }>();
      app.use(honoLogLayer({ instance: logger, requestId: false, autoLogging: false }));
      app.get("/test", (c) => {
        capturedContext = c.var.logger.getContext();
        return c.text("ok");
      });

      await app.request("/test");
      expect(capturedContext?.requestId).toBeUndefined();
    });

    it("should support custom requestId function", async () => {
      const { logger } = createTestLogger();
      let capturedContext: Record<string, any> | undefined;

      const app = new Hono<{ Variables: HonoLogLayerVariables }>();
      app.use(
        honoLogLayer({
          instance: logger,
          requestId: () => "custom-id-123",
          autoLogging: false,
        }),
      );
      app.get("/test", (c) => {
        capturedContext = c.var.logger.getContext();
        return c.text("ok");
      });

      await app.request("/test");
      expect(capturedContext?.requestId).toBe("custom-id-123");
    });

    it("should support requestId function receiving the request", async () => {
      const { logger } = createTestLogger();
      let capturedContext: Record<string, any> | undefined;

      const app = new Hono<{ Variables: HonoLogLayerVariables }>();
      app.use(
        honoLogLayer({
          instance: logger,
          requestId: (req) => req.headers.get("x-request-id") ?? "fallback",
          autoLogging: false,
        }),
      );
      app.get("/test", (c) => {
        capturedContext = c.var.logger.getContext();
        return c.text("ok");
      });

      await app.request("/test", {
        headers: { "x-request-id": "from-header" },
      });
      expect(capturedContext?.requestId).toBe("from-header");
    });
  });

  describe("contextFn", () => {
    it("should support contextFn for additional context", async () => {
      const { logger } = createTestLogger();
      let capturedContext: Record<string, any> | undefined;

      const app = new Hono<{ Variables: HonoLogLayerVariables }>();
      app.use(
        honoLogLayer({
          instance: logger,
          autoLogging: false,
          contextFn: ({ request }) => ({
            userAgent: request.headers.get("user-agent") ?? "unknown",
          }),
        }),
      );
      app.get("/test", (c) => {
        capturedContext = c.var.logger.getContext();
        return c.text("ok");
      });

      await app.request("/test", {
        headers: { "user-agent": "test-agent" },
      });
      expect(capturedContext?.userAgent).toBe("test-agent");
    });
  });

  describe("request logging", () => {
    it("should log incoming requests by default", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Hono<{ Variables: HonoLogLayerVariables }>();
      app.use(honoLogLayer({ instance: logger }));
      app.get("/test", (c) => {
        return c.text("ok");
      });

      await app.request("/test");

      const line = findLogWithMessage(testLib, "incoming request");
      expect(line).toBeTruthy();
      expect(line!.level).toBe("info");
    });

    it("should include req metadata with method, url, and remoteAddress", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Hono<{ Variables: HonoLogLayerVariables }>();
      app.use(honoLogLayer({ instance: logger, autoLogging: { response: false } }));
      app.post("/api/users", (c) => {
        return c.text("ok");
      });

      await app.request("/api/users", { method: "POST" });

      expect(testLib.lines).toHaveLength(1);
      const line = findLogWithMessage(testLib, "incoming request");
      const metadata = getMetadataFromLine(line!);
      expect(metadata).toBeTruthy();
      expect(metadata.req.method).toBe("POST");
      expect(metadata.req.url).toBe("/api/users");
    });

    it("should not include res or responseTime in request metadata", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Hono<{ Variables: HonoLogLayerVariables }>();
      app.use(honoLogLayer({ instance: logger, autoLogging: { response: false } }));
      app.get("/test", (c) => {
        return c.text("ok");
      });

      await app.request("/test");

      const metadata = getMetadataFromLine(testLib.lines[0]);
      expect(metadata.res).toBeUndefined();
      expect(metadata.responseTime).toBeUndefined();
    });

    it("should disable request logging when request is false", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Hono<{ Variables: HonoLogLayerVariables }>();
      app.use(honoLogLayer({ instance: logger, autoLogging: { request: false, response: false } }));
      app.get("/test", (c) => {
        return c.text("ok");
      });

      await app.request("/test");
      expect(testLib.lines).toHaveLength(0);
    });

    it("should support custom request log level", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Hono<{ Variables: HonoLogLayerVariables }>();
      app.use(
        honoLogLayer({
          instance: logger,
          autoLogging: { request: { logLevel: "debug" }, response: false },
        }),
      );
      app.get("/test", (c) => {
        return c.text("ok");
      });

      await app.request("/test");

      expect(testLib.lines).toHaveLength(1);
      expect(testLib.lines[0].level).toBe("debug");
    });
  });

  describe("response logging", () => {
    it("should log request completed by default", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Hono<{ Variables: HonoLogLayerVariables }>();
      app.use(honoLogLayer({ instance: logger }));
      app.get("/test", (c) => {
        return c.text("ok");
      });

      await app.request("/test");

      const line = findLogWithMessage(testLib, "request completed");
      expect(line).toBeTruthy();
      expect(line!.level).toBe("info");
    });

    it("should include req, res, and responseTime in response metadata", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Hono<{ Variables: HonoLogLayerVariables }>();
      app.use(honoLogLayer({ instance: logger, autoLogging: { request: false } }));
      app.get("/api/data", (c) => {
        return c.text("ok");
      });

      await app.request("/api/data");

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

      const app = new Hono<{ Variables: HonoLogLayerVariables }>();
      app.use(honoLogLayer({ instance: logger, autoLogging: { request: false, response: false } }));
      app.get("/test", (c) => {
        return c.text("ok");
      });

      await app.request("/test");
      expect(testLib.lines).toHaveLength(0);
    });

    it("should support custom response log level", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Hono<{ Variables: HonoLogLayerVariables }>();
      app.use(
        honoLogLayer({
          instance: logger,
          autoLogging: { request: false, response: { logLevel: "debug" } },
        }),
      );
      app.get("/test", (c) => {
        return c.text("ok");
      });

      await app.request("/test");

      const line = findLogWithMessage(testLib, "request completed");
      expect(line).toBeTruthy();
      expect(line!.level).toBe("debug");
    });

    it("should use top-level logLevel as default for response", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Hono<{ Variables: HonoLogLayerVariables }>();
      app.use(
        honoLogLayer({
          instance: logger,
          autoLogging: { request: false, logLevel: "warn" },
        }),
      );
      app.get("/test", (c) => {
        return c.text("ok");
      });

      await app.request("/test");

      const line = findLogWithMessage(testLib, "request completed");
      expect(line).toBeTruthy();
      expect(line!.level).toBe("warn");
    });
  });

  describe("default auto-logging behavior", () => {
    it("should log both request and response by default", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Hono<{ Variables: HonoLogLayerVariables }>();
      app.use(honoLogLayer({ instance: logger }));
      app.get("/test", (c) => {
        return c.text("ok");
      });

      await app.request("/test");

      // Two log lines: incoming request + request completed
      expect(testLib.lines).toHaveLength(2);

      const requestLine = findLogWithMessage(testLib, "incoming request");
      const responseLine = findLogWithMessage(testLib, "request completed");
      expect(requestLine).toBeTruthy();
      expect(responseLine).toBeTruthy();
    });
  });

  describe("auto-logging controls", () => {
    it("should disable all auto-logging when autoLogging is false", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Hono<{ Variables: HonoLogLayerVariables }>();
      app.use(honoLogLayer({ instance: logger, autoLogging: false }));
      app.get("/test", (c) => {
        return c.text("ok");
      });

      await app.request("/test");
      expect(testLib.lines).toHaveLength(0);
    });

    it("should respect ignore patterns for both request and response", async () => {
      const { logger, testLib } = createTestLogger();

      const app = new Hono<{ Variables: HonoLogLayerVariables }>();
      app.use(
        honoLogLayer({
          instance: logger,
          autoLogging: { ignore: ["/health", /^\/internal/] },
        }),
      );
      app.get("/health", (c) => {
        return c.text("ok");
      });
      app.get("/internal/status", (c) => {
        return c.text("ok");
      });
      app.get("/api/data", (c) => {
        return c.text("ok");
      });

      await app.request("/health");
      await app.request("/internal/status");
      expect(testLib.lines).toHaveLength(0);

      await app.request("/api/data");
      // Should have both request and response logs
      expect(testLib.lines).toHaveLength(2);
    });
  });
});
