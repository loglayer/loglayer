import type { StatsD } from "hot-shots";
import { LogLayer, TestLoggingLibrary, TestTransport, useLogLayerMixin } from "loglayer";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { hotshotsMixin } from "../index.js";

describe("set", () => {
  let mockClient: StatsD;

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
    } as unknown as StatsD;

    useLogLayerMixin(hotshotsMixin(mockClient));
  });

  it("should call set on client", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.set("test.set", "value").send();

    expect(mockClient.set).toHaveBeenCalledWith("test.set", "value");
  });

  it("should call set with array of stats", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.set(["test.set1", "test.set2"], "value").send();

    expect(mockClient.set).toHaveBeenCalledWith(["test.set1", "test.set2"], "value");
  });

  it("should support withTags", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.set("test.set", "value").withTags(["env:production"]).send();

    expect(mockClient.set).toHaveBeenCalledWith("test.set", "value", ["env:production"]);
  });

  it("should support withSampleRate", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.set("test.set", "value").withSampleRate(0.5).send();

    expect(mockClient.set).toHaveBeenCalledWith("test.set", "value", 0.5);
  });

  it("should support withCallback", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const callback = vi.fn();

    log.stats.set("test.set", "value").withCallback(callback).send();

    expect(mockClient.set).toHaveBeenCalledWith("test.set", "value", callback);
  });
});
