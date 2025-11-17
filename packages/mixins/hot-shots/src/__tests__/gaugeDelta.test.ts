import type { StatsD } from "hot-shots";
import { LogLayer, TestLoggingLibrary, TestTransport, useLogLayerMixin } from "loglayer";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { hotshotsMixin } from "../index.js";

describe("gaugeDelta", () => {
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

  it("should call gaugeDelta on client", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.gaugeDelta("test.gauge", -5).send();

    expect(mockClient.gaugeDelta).toHaveBeenCalledWith("test.gauge", -5);
  });

  it("should call gaugeDelta with array of stats", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.gaugeDelta(["test.gauge1", "test.gauge2"], -5).send();

    expect(mockClient.gaugeDelta).toHaveBeenCalledWith(["test.gauge1", "test.gauge2"], -5);
  });

  it("should support withTags", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.gaugeDelta("test.gauge", -5).withTags(["env:production"]).send();

    expect(mockClient.gaugeDelta).toHaveBeenCalledWith("test.gauge", -5, ["env:production"]);
  });

  it("should support withSampleRate", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.gaugeDelta("test.gauge", -5).withSampleRate(0.5).send();

    expect(mockClient.gaugeDelta).toHaveBeenCalledWith("test.gauge", -5, 0.5);
  });

  it("should support withCallback", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const callback = vi.fn();

    log.stats.gaugeDelta("test.gauge", -5).withCallback(callback).send();

    expect(mockClient.gaugeDelta).toHaveBeenCalledWith("test.gauge", -5, callback);
  });
});
