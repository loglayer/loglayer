import { LogLayer, TestLoggingLibrary, TestTransport, useLogLayerMixin } from "loglayer";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { hotshotsMixin } from "../index.js";
import { MockStatsAPI } from "../MockStatsAPI.js";

describe("MockStatsAPI", () => {
  describe("when hotshotsMixin is called with null", () => {
    beforeAll(() => {
      // Register the mixin with null client
      useLogLayerMixin(hotshotsMixin(null));
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it("should use MockStatsAPI instead of real StatsAPI", () => {
      const log = new LogLayer({
        transport: new TestTransport({
          logger: new TestLoggingLibrary(),
        }),
      });

      // The stats property should be an instance of MockStatsAPI
      expect(log.stats).toBeInstanceOf(MockStatsAPI);
    });

    it("should allow increment to be called and chained without errors", () => {
      const log = new LogLayer({
        transport: new TestTransport({
          logger: new TestLoggingLibrary(),
        }),
      });

      // These should all work without throwing errors
      expect(() => {
        log.stats.increment("test.counter").send();
      }).not.toThrow();

      expect(() => {
        log.stats.increment("test.counter").withValue(5).send();
      }).not.toThrow();

      expect(() => {
        log.stats
          .increment("test.counter")
          .withValue(1)
          .withTags(["env:prod"])
          .withSampleRate(0.5)
          .withCallback(() => {})
          .send();
      }).not.toThrow();
    });

    it("should allow decrement to be called and chained without errors", () => {
      const log = new LogLayer({
        transport: new TestTransport({
          logger: new TestLoggingLibrary(),
        }),
      });

      expect(() => {
        log.stats.decrement("test.counter").send();
      }).not.toThrow();

      expect(() => {
        log.stats.decrement("test.counter").withValue(3).withTags({ env: "staging" }).send();
      }).not.toThrow();
    });

    it("should allow gauge to be called and chained without errors", () => {
      const log = new LogLayer({
        transport: new TestTransport({
          logger: new TestLoggingLibrary(),
        }),
      });

      expect(() => {
        log.stats.gauge("test.gauge", 42).send();
      }).not.toThrow();

      expect(() => {
        log.stats.gauge("test.gauge", 42).withTags(["env:prod"]).withSampleRate(0.8).send();
      }).not.toThrow();
    });

    it("should allow gaugeDelta to be called and chained without errors", () => {
      const log = new LogLayer({
        transport: new TestTransport({
          logger: new TestLoggingLibrary(),
        }),
      });

      expect(() => {
        log.stats.gaugeDelta("test.gauge", 5).send();
      }).not.toThrow();
    });

    it("should allow histogram to be called and chained without errors", () => {
      const log = new LogLayer({
        transport: new TestTransport({
          logger: new TestLoggingLibrary(),
        }),
      });

      expect(() => {
        log.stats.histogram("test.histogram", 100).send();
      }).not.toThrow();
    });

    it("should allow distribution to be called and chained without errors", () => {
      const log = new LogLayer({
        transport: new TestTransport({
          logger: new TestLoggingLibrary(),
        }),
      });

      expect(() => {
        log.stats.distribution("test.distribution", 200).send();
      }).not.toThrow();
    });

    it("should allow timing to be called and chained without errors", () => {
      const log = new LogLayer({
        transport: new TestTransport({
          logger: new TestLoggingLibrary(),
        }),
      });

      expect(() => {
        log.stats.timing("test.timing", 150).send();
      }).not.toThrow();

      expect(() => {
        log.stats.timing("test.timing", new Date()).send();
      }).not.toThrow();
    });

    it("should allow set to be called and chained without errors", () => {
      const log = new LogLayer({
        transport: new TestTransport({
          logger: new TestLoggingLibrary(),
        }),
      });

      expect(() => {
        log.stats.set("test.set", "unique-value").send();
      }).not.toThrow();

      expect(() => {
        log.stats.set("test.set", 12345).send();
      }).not.toThrow();
    });

    it("should allow unique to be called and chained without errors", () => {
      const log = new LogLayer({
        transport: new TestTransport({
          logger: new TestLoggingLibrary(),
        }),
      });

      expect(() => {
        log.stats.unique("test.unique", "user-id-123").send();
      }).not.toThrow();
    });

    it("should allow event to be called and chained without errors", () => {
      const log = new LogLayer({
        transport: new TestTransport({
          logger: new TestLoggingLibrary(),
        }),
      });

      expect(() => {
        log.stats.event("Deployment").send();
      }).not.toThrow();

      expect(() => {
        log.stats.event("Deployment").withText("Deployed version 1.2.3").withTags(["env:prod"]).send();
      }).not.toThrow();
    });

    it("should allow check to be called and chained without errors", () => {
      const log = new LogLayer({
        transport: new TestTransport({
          logger: new TestLoggingLibrary(),
        }),
      });

      expect(() => {
        log.stats.check("service.check", 0).send();
      }).not.toThrow();

      expect(() => {
        log.stats.check("service.check", 0).withOptions({ message: "Service is OK" }).send();
      }).not.toThrow();
    });

    it("should allow timer to be called and return unwrapped function", () => {
      const log = new LogLayer({
        transport: new TestTransport({
          logger: new TestLoggingLibrary(),
        }),
      });

      const originalFunc = (x: number, y: number) => x + y;
      const wrappedFunc = log.stats.timer(originalFunc, "test.timer").create();

      // The wrapped function should execute without timing
      const result = wrappedFunc(5, 3);
      expect(result).toBe(8);
    });

    it("should allow asyncTimer to be called and return unwrapped async function", async () => {
      const log = new LogLayer({
        transport: new TestTransport({
          logger: new TestLoggingLibrary(),
        }),
      });

      const originalFunc = async (x: number, y: number) => {
        return x + y;
      };
      const wrappedFunc = log.stats.asyncTimer(originalFunc, "test.asyncTimer").create();

      // The wrapped async function should execute without timing
      const result = await wrappedFunc(10, 20);
      expect(result).toBe(30);
    });

    it("should allow asyncDistTimer to be called and return unwrapped async function", async () => {
      const log = new LogLayer({
        transport: new TestTransport({
          logger: new TestLoggingLibrary(),
        }),
      });

      const originalFunc = async (name: string) => {
        return `Hello, ${name}`;
      };
      const wrappedFunc = log.stats.asyncDistTimer(originalFunc, "test.asyncDistTimer").create();

      // The wrapped async function should execute without timing
      const result = await wrappedFunc("World");
      expect(result).toBe("Hello, World");
    });

    it("should support chaining on timer builders", async () => {
      const log = new LogLayer({
        transport: new TestTransport({
          logger: new TestLoggingLibrary(),
        }),
      });

      const originalFunc = async (x: number) => x * 2;

      expect(() => {
        const wrappedFunc = log.stats
          .asyncTimer(originalFunc, "test.timer")
          .withTags(["env:test"])
          .withSampleRate(0.5)
          .withCallback(() => {})
          .create();

        wrappedFunc(5);
      }).not.toThrow();
    });

    it("should handle array of stats", () => {
      const log = new LogLayer({
        transport: new TestTransport({
          logger: new TestLoggingLibrary(),
        }),
      });

      expect(() => {
        log.stats.increment(["counter1", "counter2"]).send();
      }).not.toThrow();

      expect(() => {
        log.stats.gauge(["gauge1", "gauge2"], 50).send();
      }).not.toThrow();
    });

    it("should not actually send any metrics (no-op)", () => {
      const log = new LogLayer({
        transport: new TestTransport({
          logger: new TestLoggingLibrary(),
        }),
      });

      // Create a spy to ensure nothing gets called
      const consoleSpy = vi.spyOn(console, "log");

      // Call various stats methods
      log.stats.increment("test").send();
      log.stats.gauge("test", 42).send();
      log.stats.event("test").send();

      // Console.log should not have been called (no-op behavior)
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should return a no-op StatsD client from getClient()", () => {
      const log = new LogLayer({
        transport: new TestTransport({
          logger: new TestLoggingLibrary(),
        }),
      });

      const client = log.getClient();

      // Client should exist and have all methods
      expect(client).toBeDefined();
      expect(typeof client.increment).toBe("function");
      expect(typeof client.gauge).toBe("function");
      expect(typeof client.timing).toBe("function");
      expect(typeof client.timer).toBe("function");
      expect(typeof client.asyncTimer).toBe("function");
      expect(typeof client.asyncDistTimer).toBe("function");

      // Methods should be no-op (not throw)
      expect(() => {
        client.increment("test");
        client.gauge("test", 42);
        client.timing("test", 100);
        client.timer(() => {}, "test");
        client.asyncTimer(async () => {}, "test");
        client.asyncDistTimer(async () => {}, "test");
      }).not.toThrow();
    });

    it("should support all builder methods returning this for chaining", () => {
      const log = new LogLayer({
        transport: new TestTransport({
          logger: new TestLoggingLibrary(),
        }),
      });

      const builder = log.stats.increment("test");

      // All methods should return the builder for chaining
      expect(builder.withValue(1)).toBe(builder);
      expect(builder.withTags(["env:test"])).toBe(builder);
      expect(builder.withSampleRate(0.5)).toBe(builder);
      expect(builder.withCallback(() => {})).toBe(builder);
    });
  });

  describe("MockStatsAPI direct instantiation", () => {
    it("should be able to instantiate MockStatsAPI directly", () => {
      const mockApi = new MockStatsAPI();

      expect(mockApi).toBeInstanceOf(MockStatsAPI);
      expect(typeof mockApi.increment).toBe("function");
      expect(typeof mockApi.gauge).toBe("function");
    });

    it("should work when instantiated directly", () => {
      const mockApi = new MockStatsAPI();

      expect(() => {
        mockApi.increment("test").withValue(5).send();
        mockApi.gauge("test", 100).send();
        mockApi.event("test").withText("description").send();
      }).not.toThrow();
    });
  });
});
