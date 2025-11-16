import StatsD from "hot-shots";
import { LogLayer, TestLoggingLibrary, TestTransport, useLogLayerMixin } from "loglayer";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { hotshotsMixin } from "../index.js";

// Create a StatsD instance to access CHECKS enum
// @ts-expect-error - hot-shots default export is constructable at runtime
const statsDInstance = new StatsD({ mock: true });
const _CHECKS = statsDInstance.CHECKS;

describe("increment", () => {
  let mockClient: InstanceType<typeof import("hot-shots").default>;

  beforeAll(() => {
    mockClient = {
      increment: vi.fn(),
      decrement: vi.fn(),
      gauge: vi.fn(),
      gaugeDelta: vi.fn(),
      histogram: vi.fn(),
      distribution: vi.fn(),
      timing: vi.fn(),
      set: vi.fn(),
      unique: vi.fn(),
      event: vi.fn(),
      check: vi.fn(),
    } as unknown as InstanceType<typeof import("hot-shots").default>;

    useLogLayerMixin(hotshotsMixin(mockClient));
  });

  it("should call increment on client when send() is called", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.increment("test.counter").send();

    expect(mockClient.increment).toHaveBeenCalledWith("test.counter");
  });

  it("should support withValue", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.increment("test.counter").withValue(10).send();

    expect(mockClient.increment).toHaveBeenCalledWith("test.counter", 10);
  });

  it("should support withTags", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.increment("test.counter").withTags(["env:production", "service:api"]).send();

    expect(mockClient.increment).toHaveBeenCalledWith("test.counter", ["env:production", "service:api"]);
  });

  it("should support withTags as object", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.increment("test.counter").withTags({ env: "production", service: "api" }).send();

    expect(mockClient.increment).toHaveBeenCalledWith("test.counter", ["env:production", "service:api"]);
  });

  it("should support withSampleRate", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.increment("test.counter").withSampleRate(0.5).send();

    expect(mockClient.increment).toHaveBeenCalledWith("test.counter", 0.5);
  });

  it("should support withCallback", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const callback = vi.fn();

    log.stats.increment("test.counter").withCallback(callback).send();

    expect(mockClient.increment).toHaveBeenCalledWith("test.counter", callback);
  });

  it("should support chaining all options", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const callback = vi.fn();

    log.stats
      .increment("test.counter")
      .withValue(1)
      .withSampleRate(0.5)
      .withTags(["env:production"])
      .withCallback(callback)
      .send();

    expect(mockClient.increment).toHaveBeenCalledWith("test.counter", 1, 0.5, ["env:production"], callback);
  });

  it("should support array of stats", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.increment(["test.counter1", "test.counter2"]).send();

    expect(mockClient.increment).toHaveBeenCalledWith(["test.counter1", "test.counter2"]);
  });
});
