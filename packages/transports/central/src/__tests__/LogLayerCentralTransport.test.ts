import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_BASE_URL, DEFAULT_PORT, LogLayerCentralTransport } from "../LogLayerCentralTransport.js";

const mockFetch = vi.fn(() => Promise.resolve(new Response(JSON.stringify({ id: "test-id" }), { status: 200 })));

vi.stubGlobal("fetch", mockFetch);

/** Parses the body of the most recent fetch call. For array batch mode, unwraps the first entry. */
function getLastPayload(): Record<string, unknown> {
  const body = (mockFetch.mock.calls[0] as unknown as [string, { body: string }])[1].body;
  const parsed = JSON.parse(body);
  return Array.isArray(parsed) ? parsed[0] : parsed;
}

/** Flushes pending microtasks so fire-and-forget sends complete. */
const flush = () => new Promise((r) => setTimeout(r, 10));

/** Default test config — disables batching so logs are sent immediately. */
const testConfig = (overrides: Partial<ConstructorParameters<typeof LogLayerCentralTransport>[0]> = {}) => ({
  service: "test-service",
  enableBatchSend: false,
  ...overrides,
});

describe("LogLayerCentralTransport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constants", () => {
    it("should export DEFAULT_PORT as 9800", () => {
      expect(DEFAULT_PORT).toBe(9800);
    });

    it("should export DEFAULT_BASE_URL with correct port", () => {
      expect(DEFAULT_BASE_URL).toBe("http://localhost:9800");
    });
  });

  describe("constructor", () => {
    it("should create transport with required config", () => {
      const transport = new LogLayerCentralTransport(testConfig());
      expect(transport).toBeInstanceOf(LogLayerCentralTransport);
    });

    it("should POST to DEFAULT_BASE_URL when no baseUrl provided", async () => {
      const transport = new LogLayerCentralTransport(testConfig());
      transport.shipToLogger({ logLevel: "info", messages: ["test"], data: {}, hasData: false });
      await flush();
      expect(mockFetch).toHaveBeenCalledWith(`${DEFAULT_BASE_URL}/api/logs`, expect.any(Object));
    });

    it("should POST to custom baseUrl when provided", async () => {
      const transport = new LogLayerCentralTransport(testConfig({ baseUrl: "http://custom:8080" }));
      transport.shipToLogger({ logLevel: "info", messages: ["test"], data: {}, hasData: false });
      await flush();
      expect(mockFetch).toHaveBeenCalledWith("http://custom:8080/api/logs", expect.any(Object));
    });
  });

  describe("payload", () => {
    let transport: LogLayerCentralTransport;

    beforeEach(() => {
      transport = new LogLayerCentralTransport(testConfig());
    });

    const send = async (params: Parameters<typeof transport.shipToLogger>[0]) => {
      transport.shipToLogger(params);
      await flush();
    };

    it("should include service in payload", async () => {
      await send({ logLevel: "info", messages: ["test"], data: {}, hasData: false });
      expect(getLastPayload()).toMatchObject({ service: "test-service" });
    });

    it("should join messages with space", async () => {
      await send({ logLevel: "info", messages: ["Hello", "World"], data: {}, hasData: false });
      expect(getLastPayload()).toMatchObject({ message: "Hello World" });
    });

    it("should include ISO timestamp", async () => {
      const before = new Date().toISOString();
      await send({ logLevel: "info", messages: ["test"], data: {}, hasData: false });
      const after = new Date().toISOString();
      const { timestamp } = getLastPayload() as { timestamp: string };
      expect(timestamp >= before).toBe(true);
      expect(timestamp <= after).toBe(true);
    });

    it("should include instanceId when provided", async () => {
      const t = new LogLayerCentralTransport(testConfig({ service: "svc", instanceId: "i-1" }));
      t.shipToLogger({ logLevel: "info", messages: ["test"], data: {}, hasData: false });
      await flush();
      expect(getLastPayload()).toMatchObject({ instanceId: "i-1" });
    });

    describe("log level mapping", () => {
      for (const level of ["trace", "debug", "info", "warn", "error", "fatal"] as const) {
        it(`maps ${level}`, async () => {
          await send({ logLevel: level, messages: ["test"], data: {}, hasData: false });
          expect(getLastPayload()).toMatchObject({ level });
        });
      }

      it("defaults to info for unknown levels", async () => {
        await send({ logLevel: "unknown" as never, messages: ["test"], data: {}, hasData: false });
        expect(getLastPayload()).toMatchObject({ level: "info" });
      });
    });

    describe("metadata extraction", () => {
      it("extracts metadata from data", async () => {
        await send({ logLevel: "info", messages: ["t"], data: { userId: 1, action: "login" }, hasData: true });
        expect(getLastPayload()).toMatchObject({ metadata: { userId: 1, action: "login" } });
      });

      it("excludes context key from metadata", async () => {
        await send({ logLevel: "info", messages: ["t"], data: { userId: 1, context: { env: "test" } }, hasData: true });
        expect(getLastPayload()).toMatchObject({ metadata: { userId: 1 } });
      });

      it("excludes err and error keys from metadata", async () => {
        await send({
          logLevel: "info",
          messages: ["t"],
          data: { userId: 1, err: new Error(), error: new Error() },
          hasData: true,
        });
        expect(getLastPayload()).toMatchObject({ metadata: { userId: 1 } });
      });

      it("sets metadata to undefined when only reserved keys remain", async () => {
        await send({ logLevel: "info", messages: ["t"], data: { context: {} }, hasData: true });
        expect(getLastPayload().metadata).toBeUndefined();
      });

      it("omits metadata when hasData is false", async () => {
        await send({ logLevel: "info", messages: ["t"], data: { userId: 1 }, hasData: false });
        expect(getLastPayload().metadata).toBeUndefined();
      });
    });

    describe("context extraction", () => {
      it("extracts context object", async () => {
        await send({ logLevel: "info", messages: ["t"], data: { context: { requestId: "abc" } }, hasData: true });
        expect(getLastPayload()).toMatchObject({ context: { requestId: "abc" } });
      });

      it("ignores non-object context", async () => {
        await send({ logLevel: "info", messages: ["t"], data: { context: "bad" }, hasData: true });
        expect(getLastPayload().context).toBeUndefined();
      });

      it("ignores array context", async () => {
        await send({ logLevel: "info", messages: ["t"], data: { context: [] }, hasData: true });
        expect(getLastPayload().context).toBeUndefined();
      });
    });

    describe("error serialization", () => {
      it("serializes error with name, message, stack", async () => {
        const error = Object.assign(new Error("oops"), { name: "CustomError" });
        await send({ logLevel: "error", messages: ["t"], data: {}, hasData: false, error });
        expect(getLastPayload()).toMatchObject({
          error: { name: "CustomError", message: "oops", stack: expect.any(String) },
        });
      });

      it("omits error field when no error", async () => {
        await send({ logLevel: "info", messages: ["t"], data: {}, hasData: false });
        expect(getLastPayload().error).toBeUndefined();
      });
    });

    describe("groups", () => {
      it("includes groups when provided", async () => {
        await send({ logLevel: "info", messages: ["t"], data: {}, hasData: false, groups: ["payments", "critical"] });
        expect(getLastPayload()).toMatchObject({ groups: ["payments", "critical"] });
      });

      it("omits groups when empty array", async () => {
        await send({ logLevel: "info", messages: ["t"], data: {}, hasData: false, groups: [] });
        expect(getLastPayload().groups).toBeUndefined();
      });
    });

    describe("tags", () => {
      it("includes tags when provided", async () => {
        const t = new LogLayerCentralTransport(testConfig({ service: "svc", tags: ["env:prod"] }));
        t.shipToLogger({ logLevel: "info", messages: ["t"], data: {}, hasData: false });
        await flush();
        expect(getLastPayload()).toMatchObject({ tags: ["env:prod"] });
      });

      it("omits tags when not provided", async () => {
        await send({ logLevel: "info", messages: ["t"], data: {}, hasData: false });
        expect(getLastPayload().tags).toBeUndefined();
      });
    });
  });
});
