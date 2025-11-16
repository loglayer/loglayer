import { LogLayer, TestLoggingLibrary, TestTransport, useLogLayerMixin } from "loglayer";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { hotshotsMixin } from "../index.js";

describe("decrement", () => {
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

  it("should call decrement on client", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.decrement("test.counter").send();

    expect(mockClient.decrement).toHaveBeenCalledWith("test.counter");
  });

  it("should support withValue", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.decrement("test.counter").withValue(5).send();

    expect(mockClient.decrement).toHaveBeenCalledWith("test.counter", 5);
  });

  it("should support withTags", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.decrement("test.counter").withTags(["env:production"]).send();

    expect(mockClient.decrement).toHaveBeenCalledWith("test.counter", ["env:production"]);
  });

  it("should support withSampleRate", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.decrement("test.counter").withSampleRate(0.5).send();

    expect(mockClient.decrement).toHaveBeenCalledWith("test.counter", 0.5);
  });

  it("should support withCallback", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const callback = vi.fn();

    log.stats.decrement("test.counter").withCallback(callback).send();

    expect(mockClient.decrement).toHaveBeenCalledWith("test.counter", callback);
  });

  it("should support array of stats", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.decrement(["test.counter1", "test.counter2"]).send();

    expect(mockClient.decrement).toHaveBeenCalledWith(["test.counter1", "test.counter2"]);
  });
});
