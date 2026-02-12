import { LogLayer, MockLogLayer, TestLoggingLibrary, TestTransport, useLogLayerMixin } from "loglayer";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { datadogMetricsMixin } from "../index.js";

const mockClient = {
  gauge: vi.fn(),
  increment: vi.fn(),
  histogram: vi.fn(),
  distribution: vi.fn(),
  flush: vi.fn().mockResolvedValue(undefined),
  start: vi.fn(),
  stop: vi.fn().mockResolvedValue(undefined),
};

vi.mock("datadog-metrics", () => ({
  BufferedMetricsLogger: function MockBufferedMetricsLogger() {
    Object.assign(this, mockClient);
  },
}));

describe("datadogMetricsMixin", () => {
  beforeAll(() => {
    useLogLayerMixin(
      datadogMetricsMixin({
        apiKey: "test-key",
        prefix: "test.",
      } as any),
    );
  });

  describe("ddStats property", () => {
    it("should add ddStats property to LogLayer", () => {
      const log = new LogLayer({
        transport: new TestTransport({
          logger: new TestLoggingLibrary(),
        }),
      });

      expect(log.ddStats).toBeDefined();
      expect(typeof log.ddStats.increment).toBe("function");
      expect(typeof log.ddStats.gauge).toBe("function");
      expect(typeof log.ddStats.histogram).toBe("function");
      expect(typeof log.ddStats.distribution).toBe("function");
      expect(typeof log.ddStats.flush).toBe("function");
      expect(typeof log.ddStats.start).toBe("function");
      expect(typeof log.ddStats.stop).toBe("function");
      expect(typeof log.ddStats.getClient).toBe("function");
    });

    it("should add ddStats property to MockLogLayer", () => {
      const mockLog = new MockLogLayer();

      expect(mockLog.ddStats).toBeDefined();
      expect(typeof mockLog.ddStats.increment).toBe("function");
    });
  });

  describe("ddStats does not chain with LogLayer", () => {
    it("should not return LogBuilder from send()", () => {
      const log = new LogLayer({
        transport: new TestTransport({
          logger: new TestLoggingLibrary(),
        }),
      });

      const result = log.ddStats.increment("test").send();

      expect(result).toBeUndefined();
    });
  });

  describe("getClient", () => {
    it("should return the configured client on LogLayer", () => {
      const log = new LogLayer({
        transport: new TestTransport({
          logger: new TestLoggingLibrary(),
        }),
      });

      const client = log.ddStats.getClient();

      expect(client).toBeDefined();
      expect(typeof client.increment).toBe("function");
      expect(typeof client.gauge).toBe("function");
    });
  });

  describe("lifecycle methods", () => {
    it("should call flush on the client", async () => {
      const log = new LogLayer({
        transport: new TestTransport({
          logger: new TestLoggingLibrary(),
        }),
      });

      const client = log.ddStats.getClient();
      await log.ddStats.flush();

      expect(client.flush).toHaveBeenCalled();
    });

    it("should call start on the client", () => {
      const log = new LogLayer({
        transport: new TestTransport({
          logger: new TestLoggingLibrary(),
        }),
      });

      const client = log.ddStats.getClient();
      log.ddStats.start();

      expect(client.start).toHaveBeenCalled();
    });

    it("should call stop on the client", async () => {
      const log = new LogLayer({
        transport: new TestTransport({
          logger: new TestLoggingLibrary(),
        }),
      });

      const client = log.ddStats.getClient();
      await log.ddStats.stop();

      expect(client.stop).toHaveBeenCalled();
    });

    it("should call stop with options on the client", async () => {
      const log = new LogLayer({
        transport: new TestTransport({
          logger: new TestLoggingLibrary(),
        }),
      });

      const client = log.ddStats.getClient();
      await log.ddStats.stop({ flush: false });

      expect(client.stop).toHaveBeenCalledWith({ flush: false });
    });
  });
});
