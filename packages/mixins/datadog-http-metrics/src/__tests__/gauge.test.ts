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

describe("gauge", () => {
  beforeAll(() => {
    useLogLayerMixin(
      datadogMetricsMixin({
        apiKey: "test-key",
      } as any),
    );
  });

  it("should call gauge on client", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.ddStats.gauge("test.gauge", 42).send();

    expect(mockClient.gauge).toHaveBeenCalledWith("test.gauge", 42, undefined, undefined);
  });

  it("should support withTags", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.ddStats.gauge("test.gauge", 42).withTags(["region:us"]).send();

    expect(mockClient.gauge).toHaveBeenCalledWith("test.gauge", 42, ["region:us"], undefined);
  });

  it("should support withTimestamp", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const ts = Date.now();
    log.ddStats.gauge("test.gauge", 42).withTimestamp(ts).send();

    expect(mockClient.gauge).toHaveBeenCalledWith("test.gauge", 42, undefined, ts);
  });

  it("should support chaining all options", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const ts = Date.now();
    log.ddStats.gauge("test.gauge", 42).withTags(["env:production"]).withTimestamp(ts).send();

    expect(mockClient.gauge).toHaveBeenCalledWith("test.gauge", 42, ["env:production"], ts);
  });
});
