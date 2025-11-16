import { LogLayer, TestLoggingLibrary, TestTransport, useLogLayerMixin } from "loglayer";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { hotshotsMixin } from "../index.js";

describe("event", () => {
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call event on client", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.event("Test Event").send();

    expect(mockClient.event).toHaveBeenCalledWith("Test Event");
  });

  it("should support withText", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.event("Test Event").withText("Event description").send();

    expect(mockClient.event).toHaveBeenCalledWith("Test Event", "Event description");
  });

  it("should support withTags", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.event("Test Event").withTags(["env:production"]).send();

    expect(mockClient.event).toHaveBeenCalledWith(
      "Test Event",
      undefined, // text
      undefined, // options
      ["env:production"], // tags
      undefined, // callback
    );
  });

  it("should support withCallback", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const callback = vi.fn();

    log.stats.event("Test Event").withCallback(callback).send();

    expect(mockClient.event).toHaveBeenCalledWith(
      "Test Event",
      undefined, // text
      undefined, // options
      callback,
    );
  });

  it("should support event with text, tags, and callback", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const callback = vi.fn();

    log.stats
      .event("Test Event")
      .withText("Event description")
      .withTags(["env:production"])
      .withCallback(callback)
      .send();

    expect(mockClient.event).toHaveBeenCalledWith(
      "Test Event",
      "Event description",
      undefined, // options
      ["env:production"], // tags
      callback,
    );
  });
});
