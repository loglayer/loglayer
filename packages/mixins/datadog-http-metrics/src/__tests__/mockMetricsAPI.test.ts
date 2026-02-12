import { LogLayer, MockLogLayer, TestLoggingLibrary, TestTransport, useLogLayerMixin } from "loglayer";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { datadogMetricsMixin } from "../index.js";

vi.mock("datadog-metrics", () => {
  return {
    BufferedMetricsLogger: vi.fn(),
  };
});

describe("MockMetricsAPI (enabled: false)", () => {
  beforeAll(() => {
    // Register with enabled: false for no-op mode
    useLogLayerMixin(datadogMetricsMixin({ apiKey: "test-key", enabled: false }));
  });

  it("should provide ddStats in no-op mode when enabled is false", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    expect(log.ddStats).toBeDefined();
    expect(typeof log.ddStats.increment).toBe("function");
  });

  it("should not throw when calling metrics with enabled: false", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    expect(() => {
      log.ddStats.increment("test.counter").withValue(5).send();
      log.ddStats.gauge("test.gauge", 42).send();
    }).not.toThrow();
  });
});

describe("MockMetricsAPI (null client)", () => {
  beforeAll(() => {
    // Register with null for no-op mode
    useLogLayerMixin(datadogMetricsMixin(null));
  });

  it("should provide ddStats on LogLayer in no-op mode", () => {
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
  });

  it("should provide ddStats on MockLogLayer in no-op mode", () => {
    const mockLog = new MockLogLayer();

    expect(mockLog.ddStats).toBeDefined();
    expect(typeof mockLog.ddStats.increment).toBe("function");
  });

  it("should not throw when calling increment in no-op mode", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    expect(() => {
      log.ddStats.increment("test.counter").withValue(5).withTags(["env:test"]).withTimestamp(Date.now()).send();
    }).not.toThrow();
  });

  it("should not throw when calling gauge in no-op mode", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    expect(() => {
      log.ddStats.gauge("test.gauge", 42).withTags(["env:test"]).send();
    }).not.toThrow();
  });

  it("should not throw when calling histogram in no-op mode", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    expect(() => {
      log.ddStats
        .histogram("test.histogram", 250)
        .withHistogramOptions({ percentiles: [0.99] })
        .withTags(["env:test"])
        .send();
    }).not.toThrow();
  });

  it("should not throw when calling distribution in no-op mode", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    expect(() => {
      log.ddStats.distribution("test.distribution", 100).withTags(["env:test"]).send();
    }).not.toThrow();
  });

  it("should resolve flush in no-op mode", async () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    await expect(log.ddStats.flush()).resolves.toBeUndefined();
  });

  it("should not throw when calling start in no-op mode", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    expect(() => log.ddStats.start()).not.toThrow();
  });

  it("should resolve stop in no-op mode", async () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    await expect(log.ddStats.stop()).resolves.toBeUndefined();
  });

  it("should return a no-op client from getClient in no-op mode", () => {
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
