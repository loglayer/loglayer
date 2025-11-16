import { LogLayer, TestLoggingLibrary, TestTransport, useLogLayerMixin } from "loglayer";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { hotshotsMixin } from "../index.js";

describe("timing", () => {
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

  it("should call timing with number", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.timing("test.timing", 150).send();

    expect(mockClient.timing).toHaveBeenCalledWith("test.timing", 150);
  });

  it("should call timing with Date", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const date = new Date();
    log.stats.timing("test.timing", date).send();

    expect(mockClient.timing).toHaveBeenCalledWith("test.timing", date);
  });

  it("should call timing with array of stats", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.timing(["test.timing1", "test.timing2"], 150).send();

    expect(mockClient.timing).toHaveBeenCalledWith(["test.timing1", "test.timing2"], 150);
  });

  it("should support withTags", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.timing("test.timing", 150).withTags(["env:production"]).send();

    expect(mockClient.timing).toHaveBeenCalledWith("test.timing", 150, ["env:production"]);
  });

  it("should support withSampleRate", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.timing("test.timing", 150).withSampleRate(0.5).send();

    expect(mockClient.timing).toHaveBeenCalledWith("test.timing", 150, 0.5);
  });

  it("should support withCallback", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const callback = vi.fn();

    log.stats.timing("test.timing", 150).withCallback(callback).send();

    expect(mockClient.timing).toHaveBeenCalledWith("test.timing", 150, callback);
  });
});
