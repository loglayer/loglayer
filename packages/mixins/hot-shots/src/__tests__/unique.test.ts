import type { StatsD } from "hot-shots";
import { LogLayer, TestLoggingLibrary, TestTransport, useLogLayerMixin } from "loglayer";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { hotshotsMixin } from "../index.js";

describe("unique", () => {
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

  it("should call unique on client", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.unique("test.unique", "value").send();

    expect(mockClient.unique).toHaveBeenCalledWith("test.unique", "value");
  });

  it("should call unique with array of stats", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.unique(["test.unique1", "test.unique2"], "value").send();

    expect(mockClient.unique).toHaveBeenCalledWith(["test.unique1", "test.unique2"], "value");
  });

  it("should support withTags", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.unique("test.unique", "value").withTags(["env:production"]).send();

    expect(mockClient.unique).toHaveBeenCalledWith("test.unique", "value", ["env:production"]);
  });

  it("should support withSampleRate", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.unique("test.unique", "value").withSampleRate(0.5).send();

    expect(mockClient.unique).toHaveBeenCalledWith("test.unique", "value", 0.5);
  });

  it("should support withCallback", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const callback = vi.fn();

    log.stats.unique("test.unique", "value").withCallback(callback).send();

    expect(mockClient.unique).toHaveBeenCalledWith("test.unique", "value", callback);
  });
});
