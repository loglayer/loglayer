import type { StatsD } from "hot-shots";
import { LogLayer, TestLoggingLibrary, TestTransport, useLogLayerMixin } from "loglayer";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { hotshotsMixin } from "../index.js";

describe("timer", () => {
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
      timer: vi.fn((fn, _stat) => fn),
    } as unknown as StatsD;

    useLogLayerMixin(hotshotsMixin(mockClient));
  });

  it("should call timer on client when create() is called", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const syncFunc = (x: number) => x * 2;
    const wrapped = log.stats.timer(syncFunc, "test.timer").create();

    expect(mockClient.timer).toHaveBeenCalledWith(syncFunc, "test.timer");
    expect(typeof wrapped).toBe("function");

    const result = wrapped(5);
    expect(result).toBe(10);
  });

  it("should call timer with array of stats", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const syncFunc = () => {};
    log.stats.timer(syncFunc, ["test.timer1", "test.timer2"]).create();

    expect(mockClient.timer).toHaveBeenCalledWith(syncFunc, ["test.timer1", "test.timer2"]);
  });

  it("should support withTags", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const syncFunc = () => {};
    log.stats.timer(syncFunc, "test.timer").withTags(["env:production"]).create();

    expect(mockClient.timer).toHaveBeenCalledWith(syncFunc, "test.timer", undefined, ["env:production"]);
  });

  it("should support withTags as object", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const syncFunc = () => {};
    log.stats.timer(syncFunc, "test.timer").withTags({ env: "production", service: "api" }).create();

    expect(mockClient.timer).toHaveBeenCalledWith(syncFunc, "test.timer", undefined, ["env:production", "service:api"]);
  });

  it("should support withSampleRate", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const syncFunc = () => {};
    log.stats.timer(syncFunc, "test.timer").withSampleRate(0.5).create();

    expect(mockClient.timer).toHaveBeenCalledWith(syncFunc, "test.timer", 0.5);
  });

  it("should support withCallback", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const syncFunc = () => {};
    const callback = vi.fn();
    log.stats.timer(syncFunc, "test.timer").withCallback(callback).create();

    expect(mockClient.timer).toHaveBeenCalledWith(syncFunc, "test.timer", undefined, undefined, callback);
  });

  it("should support chaining all options", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const syncFunc = () => {};
    const callback = vi.fn();
    log.stats
      .timer(syncFunc, "test.timer")
      .withTags(["env:production"])
      .withSampleRate(0.5)
      .withCallback(callback)
      .create();

    expect(mockClient.timer).toHaveBeenCalledWith(syncFunc, "test.timer", 0.5, ["env:production"], callback);
  });
});
