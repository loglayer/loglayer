import type { StatsD } from "hot-shots";
import { LogLayer, TestLoggingLibrary, TestTransport, useLogLayerMixin } from "loglayer";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { hotshotsMixin } from "../index.js";

describe("asyncDistTimer", () => {
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
      asyncDistTimer: vi.fn((fn, _stat) => fn),
    } as unknown as StatsD;

    useLogLayerMixin(hotshotsMixin(mockClient));
  });

  it("should call asyncDistTimer on client when create() is called", async () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const asyncFunc = async (x: number) => x * 2;
    const wrapped = log.stats.asyncDistTimer(asyncFunc, "test.dist.timer").create();

    expect(mockClient.asyncDistTimer).toHaveBeenCalledWith(asyncFunc, "test.dist.timer");
    expect(typeof wrapped).toBe("function");

    const result = await wrapped(5);
    expect(result).toBe(10);
  });

  it("should call asyncDistTimer with array of stats", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const asyncFunc = async () => {};
    log.stats.asyncDistTimer(asyncFunc, ["test.dist.timer1", "test.dist.timer2"]).create();

    expect(mockClient.asyncDistTimer).toHaveBeenCalledWith(asyncFunc, ["test.dist.timer1", "test.dist.timer2"]);
  });

  it("should support withTags", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const asyncFunc = async () => {};
    log.stats.asyncDistTimer(asyncFunc, "test.dist.timer").withTags(["env:production"]).create();

    expect(mockClient.asyncDistTimer).toHaveBeenCalledWith(asyncFunc, "test.dist.timer", undefined, ["env:production"]);
  });

  it("should support withTags as object", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const asyncFunc = async () => {};
    log.stats.asyncDistTimer(asyncFunc, "test.dist.timer").withTags({ env: "production", service: "api" }).create();

    expect(mockClient.asyncDistTimer).toHaveBeenCalledWith(asyncFunc, "test.dist.timer", undefined, [
      "env:production",
      "service:api",
    ]);
  });

  it("should support withSampleRate", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const asyncFunc = async () => {};
    log.stats.asyncDistTimer(asyncFunc, "test.dist.timer").withSampleRate(0.5).create();

    expect(mockClient.asyncDistTimer).toHaveBeenCalledWith(asyncFunc, "test.dist.timer", 0.5);
  });

  it("should support withCallback", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const asyncFunc = async () => {};
    const callback = vi.fn();
    log.stats.asyncDistTimer(asyncFunc, "test.dist.timer").withCallback(callback).create();

    expect(mockClient.asyncDistTimer).toHaveBeenCalledWith(
      asyncFunc,
      "test.dist.timer",
      undefined,
      undefined,
      callback,
    );
  });

  it("should support chaining all options", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const asyncFunc = async () => {};
    const callback = vi.fn();
    log.stats
      .asyncDistTimer(asyncFunc, "test.dist.timer")
      .withTags(["env:production"])
      .withSampleRate(0.5)
      .withCallback(callback)
      .create();

    expect(mockClient.asyncDistTimer).toHaveBeenCalledWith(
      asyncFunc,
      "test.dist.timer",
      0.5,
      ["env:production"],
      callback,
    );
  });
});
