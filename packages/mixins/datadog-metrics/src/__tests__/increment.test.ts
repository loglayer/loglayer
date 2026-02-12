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

describe("increment", () => {
  beforeAll(() => {
    useLogLayerMixin(
      datadogMetricsMixin({
        apiKey: "test-key",
      } as any),
    );
  });

  it("should call increment on client when send() is called", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.ddStats.increment("test.counter").send();

    expect(mockClient.increment).toHaveBeenCalledWith("test.counter", undefined, undefined, undefined);
  });

  it("should support withValue", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.ddStats.increment("test.counter").withValue(10).send();

    expect(mockClient.increment).toHaveBeenCalledWith("test.counter", 10, undefined, undefined);
  });

  it("should support withTags", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.ddStats.increment("test.counter").withTags(["env:production", "service:api"]).send();

    expect(mockClient.increment).toHaveBeenCalledWith(
      "test.counter",
      undefined,
      ["env:production", "service:api"],
      undefined,
    );
  });

  it("should support withTimestamp", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const ts = Date.now();
    log.ddStats.increment("test.counter").withTimestamp(ts).send();

    expect(mockClient.increment).toHaveBeenCalledWith("test.counter", undefined, undefined, ts);
  });

  it("should support chaining all options", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const ts = Date.now();
    log.ddStats.increment("test.counter").withValue(5).withTags(["env:production"]).withTimestamp(ts).send();

    expect(mockClient.increment).toHaveBeenCalledWith("test.counter", 5, ["env:production"], ts);
  });
});
