import StatsD from "hot-shots";
import { LogLayer, TestLoggingLibrary, TestTransport, useLogLayerMixin } from "loglayer";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { hotshotsMixin } from "../index.js";

// Create a StatsD instance to access CHECKS enum
// @ts-expect-error - hot-shots default export is constructable at runtime
const statsDInstance = new StatsD({ mock: true });
const CHECKS = statsDInstance.CHECKS;

describe("check", () => {
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

  it("should call check on client", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.check("service.health", CHECKS.OK).send();

    expect(mockClient.check).toHaveBeenCalledWith("service.health", CHECKS.OK);
  });

  it("should support withOptions", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const options = { hostname: "server-1" };

    log.stats.check("service.health", CHECKS.OK).withOptions(options).send();

    expect(mockClient.check).toHaveBeenCalledWith("service.health", CHECKS.OK, options);
  });

  it("should support withTags", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    log.stats.check("service.health", CHECKS.OK).withTags(["env:production"]).send();

    expect(mockClient.check).toHaveBeenCalledWith("service.health", CHECKS.OK, ["env:production"]);
  });

  it("should support withCallback", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const callback = vi.fn();

    log.stats.check("service.health", CHECKS.OK).withCallback(callback).send();

    expect(mockClient.check).toHaveBeenCalledWith("service.health", CHECKS.OK, callback);
  });

  it("should support check with options, tags, and callback", () => {
    const log = new LogLayer({
      transport: new TestTransport({
        logger: new TestLoggingLibrary(),
      }),
    });

    const callback = vi.fn();
    const options = { hostname: "server-1" };

    log.stats
      .check("service.health", CHECKS.OK)
      .withOptions(options)
      .withTags(["env:production"])
      .withCallback(callback)
      .send();

    expect(mockClient.check).toHaveBeenCalledWith("service.health", CHECKS.OK, options, ["env:production"], callback);
  });
});
