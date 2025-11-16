import StatsD from "hot-shots";
import { LogLayer, MockLogLayer, TestLoggingLibrary, TestTransport, useLogLayerMixin } from "loglayer";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { hotshotsMixin } from "../index.js";

// Create a StatsD instance to access CHECKS enum
// @ts-expect-error - hot-shots default export is constructable at runtime
const statsDInstance = new StatsD({ mock: true });
const _CHECKS = statsDInstance.CHECKS;

describe("hotshotsMixin", () => {
  let mockClient: InstanceType<typeof import("hot-shots").default>;

  beforeAll(() => {
    // Create a mock hot-shots client
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

    // Register the mixin
    useLogLayerMixin(hotshotsMixin(mockClient));
  });

  describe("stats property", () => {
    it("should add stats property to LogLayer", () => {
      const log = new LogLayer({
        transport: new TestTransport({
          logger: new TestLoggingLibrary(),
        }),
      });

      expect(log.stats).toBeDefined();
      expect(typeof log.stats.increment).toBe("function");
      expect(typeof log.stats.decrement).toBe("function");
      expect(typeof log.stats.gauge).toBe("function");
    });

    it("should add stats property to MockLogLayer", () => {
      const mockLog = new MockLogLayer();

      expect(mockLog.stats).toBeDefined();
      expect(typeof mockLog.stats.increment).toBe("function");
    });
  });

  describe("stats does not chain with LogLayer", () => {
    it("should not return LogBuilder from send()", () => {
      const log = new LogLayer({
        transport: new TestTransport({
          logger: new TestLoggingLibrary(),
        }),
      });

      const result = log.stats.increment("test").send();

      expect(result).toBeUndefined();
    });
  });
});
