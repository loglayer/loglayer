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
  default: {
    BufferedMetricsLogger: function MockBufferedMetricsLogger() {
      Object.assign(this, mockClient);
    },
    reporters: {
      NullReporter: class {},
      DatadogReporter: class {},
    },
  },
}));

describe("distribution", () => {
  beforeAll(() => {
    useLogLayerMixin(
      datadogMetricsMixin({
        apiKey: "test-key",
      } as any),
    );
  });

  it("should call distribution on client", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.ddStats.distribution("test.distribution", 100).send();

    expect(mockClient.distribution).toHaveBeenCalledWith("test.distribution", 100, undefined, undefined);
  });

  it("should support withTags", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.ddStats.distribution("test.distribution", 100).withTags(["service:web"]).send();

    expect(mockClient.distribution).toHaveBeenCalledWith("test.distribution", 100, ["service:web"], undefined);
  });

  it("should support withTimestamp", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const ts = Date.now();
    log.ddStats.distribution("test.distribution", 100).withTimestamp(ts).send();

    expect(mockClient.distribution).toHaveBeenCalledWith("test.distribution", 100, undefined, ts);
  });

  it("should support chaining all options", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const ts = Date.now();
    log.ddStats.distribution("test.distribution", 100).withTags(["env:staging"]).withTimestamp(ts).send();

    expect(mockClient.distribution).toHaveBeenCalledWith("test.distribution", 100, ["env:staging"], ts);
  });
});
