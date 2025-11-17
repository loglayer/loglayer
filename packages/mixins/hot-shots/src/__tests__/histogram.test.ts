import type { StatsD } from "hot-shots";
import { LogLayer, TestLoggingLibrary, TestTransport, useLogLayerMixin } from "loglayer";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { hotshotsMixin } from "../index.js";

describe("histogram", () => {
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

  it("should call histogram on client", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.histogram("test.histogram", 42).send();

    expect(mockClient.histogram).toHaveBeenCalledWith("test.histogram", 42);
  });

  it("should call histogram with array of stats", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.histogram(["test.histogram1", "test.histogram2"], 42).send();

    expect(mockClient.histogram).toHaveBeenCalledWith(["test.histogram1", "test.histogram2"], 42);
  });

  it("should support withTags", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.histogram("test.histogram", 42).withTags(["env:production"]).send();

    expect(mockClient.histogram).toHaveBeenCalledWith("test.histogram", 42, ["env:production"]);
  });

  it("should support withSampleRate", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.histogram("test.histogram", 42).withSampleRate(0.5).send();

    expect(mockClient.histogram).toHaveBeenCalledWith("test.histogram", 42, 0.5);
  });

  it("should support withCallback", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const callback = vi.fn();

    log.stats.histogram("test.histogram", 42).withCallback(callback).send();

    expect(mockClient.histogram).toHaveBeenCalledWith("test.histogram", 42, callback);
  });
});
