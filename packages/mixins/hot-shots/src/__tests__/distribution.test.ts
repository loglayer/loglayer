import { LogLayer, TestLoggingLibrary, TestTransport, useLogLayerMixin } from "loglayer";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { hotshotsMixin } from "../index.js";

describe("distribution", () => {
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

  it("should call distribution on client", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.distribution("test.distribution", 42).send();

    expect(mockClient.distribution).toHaveBeenCalledWith("test.distribution", 42);
  });

  it("should call distribution with array of stats", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.distribution(["test.distribution1", "test.distribution2"], 42).send();

    expect(mockClient.distribution).toHaveBeenCalledWith(["test.distribution1", "test.distribution2"], 42);
  });

  it("should support withTags", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.distribution("test.distribution", 42).withTags(["env:production"]).send();

    expect(mockClient.distribution).toHaveBeenCalledWith("test.distribution", 42, ["env:production"]);
  });

  it("should support withSampleRate", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.distribution("test.distribution", 42).withSampleRate(0.5).send();

    expect(mockClient.distribution).toHaveBeenCalledWith("test.distribution", 42, 0.5);
  });

  it("should support withCallback", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const callback = vi.fn();

    log.stats.distribution("test.distribution", 42).withCallback(callback).send();

    expect(mockClient.distribution).toHaveBeenCalledWith("test.distribution", 42, callback);
  });
});
