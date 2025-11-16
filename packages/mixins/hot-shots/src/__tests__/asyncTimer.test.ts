import { LogLayer, TestLoggingLibrary, TestTransport, useLogLayerMixin } from "loglayer";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { hotshotsMixin } from "../index.js";

describe("asyncTimer", () => {
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
      asyncTimer: vi.fn((fn, _stat) => fn),
    } as unknown as InstanceType<typeof import("hot-shots").default>;

    useLogLayerMixin(hotshotsMixin(mockClient));
  });

  it("should call asyncTimer on client when create() is called", async () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const asyncFunc = async (x: number) => x * 2;
    const wrapped = log.stats.asyncTimer(asyncFunc, "test.timer").create();

    expect(mockClient.asyncTimer).toHaveBeenCalledWith(asyncFunc, "test.timer");
    expect(typeof wrapped).toBe("function");

    const result = await wrapped(5);
    expect(result).toBe(10);
  });

  it("should call asyncTimer with array of stats", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const asyncFunc = async () => {};
    log.stats.asyncTimer(asyncFunc, ["test.timer1", "test.timer2"]).create();

    expect(mockClient.asyncTimer).toHaveBeenCalledWith(asyncFunc, ["test.timer1", "test.timer2"]);
  });

  it("should support withTags", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const asyncFunc = async () => {};
    log.stats.asyncTimer(asyncFunc, "test.timer").withTags(["env:production"]).create();

    expect(mockClient.asyncTimer).toHaveBeenCalledWith(asyncFunc, "test.timer", undefined, ["env:production"]);
  });

  it("should support withTags as object", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const asyncFunc = async () => {};
    log.stats.asyncTimer(asyncFunc, "test.timer").withTags({ env: "production", service: "api" }).create();

    expect(mockClient.asyncTimer).toHaveBeenCalledWith(asyncFunc, "test.timer", undefined, [
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
    log.stats.asyncTimer(asyncFunc, "test.timer").withSampleRate(0.5).create();

    expect(mockClient.asyncTimer).toHaveBeenCalledWith(asyncFunc, "test.timer", 0.5);
  });

  it("should support withCallback", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const asyncFunc = async () => {};
    const callback = vi.fn();
    log.stats.asyncTimer(asyncFunc, "test.timer").withCallback(callback).create();

    expect(mockClient.asyncTimer).toHaveBeenCalledWith(asyncFunc, "test.timer", undefined, undefined, callback);
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
      .asyncTimer(asyncFunc, "test.timer")
      .withTags(["env:production"])
      .withSampleRate(0.5)
      .withCallback(callback)
      .create();

    expect(mockClient.asyncTimer).toHaveBeenCalledWith(asyncFunc, "test.timer", 0.5, ["env:production"], callback);
  });
});
