import { LogLayer, TestLoggingLibrary, TestTransport, useLogLayerMixin } from "loglayer";
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

describe("histogram", () => {
  beforeAll(() => {
    useLogLayerMixin(
      datadogMetricsMixin({
        apiKey: "test-key",
      } as any),
    );
  });

  it("should call histogram on client", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.ddStats.histogram("test.histogram", 250).send();

    expect(mockClient.histogram).toHaveBeenCalledWith("test.histogram", 250, undefined, undefined, undefined);
  });

  it("should support withTags", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.ddStats.histogram("test.histogram", 250).withTags(["endpoint:/api"]).send();

    expect(mockClient.histogram).toHaveBeenCalledWith("test.histogram", 250, ["endpoint:/api"], undefined, undefined);
  });

  it("should support withTimestamp", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const ts = Date.now();
    log.ddStats.histogram("test.histogram", 250).withTimestamp(ts).send();

    expect(mockClient.histogram).toHaveBeenCalledWith("test.histogram", 250, undefined, ts, undefined);
  });

  it("should support withHistogramOptions", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.ddStats
      .histogram("test.histogram", 250)
      .withHistogramOptions({ percentiles: [0.95, 0.99], aggregates: ["avg", "count"] })
      .send();

    expect(mockClient.histogram).toHaveBeenCalledWith("test.histogram", 250, undefined, undefined, {
      percentiles: [0.95, 0.99],
      aggregates: ["avg", "count"],
    });
  });

  it("should support chaining all options", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const ts = Date.now();
    log.ddStats
      .histogram("test.histogram", 250)
      .withTags(["env:production"])
      .withTimestamp(ts)
      .withHistogramOptions({ percentiles: [0.99] })
      .send();

    expect(mockClient.histogram).toHaveBeenCalledWith("test.histogram", 250, ["env:production"], ts, {
      percentiles: [0.99],
    });
  });
});
