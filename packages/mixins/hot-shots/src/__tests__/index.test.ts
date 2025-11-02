import type { StatsD } from "hot-shots";
import { LogLayer, TestLoggingLibrary, TestTransport, useLogLayerMixin } from "loglayer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { hotshotsMixin } from "../index.js";

describe("hotshotsMixin", () => {
  let mockClient: StatsD;
  let log: LogLayer;
  let logger: TestLoggingLibrary;

  beforeEach(() => {
    // Create a mock StatsD client
    mockClient = {
      increment: vi.fn(),
      decrement: vi.fn(),
      timing: vi.fn(),
      timer: vi.fn((fn) => fn),
      asyncTimer: vi.fn((fn) => fn),
      asyncDistTimer: vi.fn((fn) => fn),
      histogram: vi.fn(),
      distribution: vi.fn(),
      gauge: vi.fn(),
      gaugeDelta: vi.fn(),
      set: vi.fn(),
      unique: vi.fn(),
      check: vi.fn(),
    } as unknown as StatsD;

    // Create test logger
    logger = new TestLoggingLibrary();

    // Register the mixin before creating LogLayer instances
    useLogLayerMixin(hotshotsMixin(mockClient));

    // Create LogLayer instance
    log = new LogLayer({
      transport: new TestTransport({
        logger,
      }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("statsIncrement", () => {
    it("should call client.increment with a single stat", () => {
      log.statsIncrement("test.counter");

      expect(mockClient.increment).toHaveBeenCalledOnce();
      expect(mockClient.increment).toHaveBeenCalledWith("test.counter");
    });

    it("should call client.increment with stat and tags", () => {
      const tags = ["tag1:value1", "tag2:value2"];
      log.statsIncrement("test.counter", tags);

      expect(mockClient.increment).toHaveBeenCalledOnce();
      expect(mockClient.increment).toHaveBeenCalledWith("test.counter", tags);
    });

    it("should call client.increment with stat and value", () => {
      log.statsIncrement("test.counter", 5);

      expect(mockClient.increment).toHaveBeenCalledOnce();
      expect(mockClient.increment).toHaveBeenCalledWith("test.counter", 5);
    });

    it("should call client.increment with stat, value, and sampleRate", () => {
      log.statsIncrement("test.counter", 5, 0.5);

      expect(mockClient.increment).toHaveBeenCalledOnce();
      expect(mockClient.increment).toHaveBeenCalledWith("test.counter", 5, 0.5);
    });

    it("should call client.increment with stat, value, sampleRate, and tags", () => {
      const tags = ["tag1:value1"];
      log.statsIncrement("test.counter", 5, 0.5, tags);

      expect(mockClient.increment).toHaveBeenCalledOnce();
      expect(mockClient.increment).toHaveBeenCalledWith("test.counter", 5, 0.5, tags);
    });

    it("should call client.increment with stat, value, and callback", () => {
      const callback = vi.fn();
      log.statsIncrement("test.counter", 5, callback);

      expect(mockClient.increment).toHaveBeenCalledOnce();
      expect(mockClient.increment).toHaveBeenCalledWith("test.counter", 5, callback);
    });

    it("should call client.increment with multiple stats", () => {
      log.statsIncrement(["test.counter1", "test.counter2"], 10);

      expect(mockClient.increment).toHaveBeenCalledOnce();
      expect(mockClient.increment).toHaveBeenCalledWith(["test.counter1", "test.counter2"], 10);
    });

    it("should return this for chaining", () => {
      const result = log.statsIncrement("test.counter");
      expect(result).toBe(log);
    });
  });

  describe("statsDecrement", () => {
    it("should call client.decrement with a single stat", () => {
      log.statsDecrement("test.counter");

      expect(mockClient.decrement).toHaveBeenCalledOnce();
      expect(mockClient.decrement).toHaveBeenCalledWith("test.counter");
    });

    it("should call client.decrement with stat and tags", () => {
      const tags = ["tag1:value1"];
      log.statsDecrement("test.counter", tags);

      expect(mockClient.decrement).toHaveBeenCalledOnce();
      expect(mockClient.decrement).toHaveBeenCalledWith("test.counter", tags);
    });

    it("should call client.decrement with stat and value", () => {
      log.statsDecrement("test.counter", 3);

      expect(mockClient.decrement).toHaveBeenCalledOnce();
      expect(mockClient.decrement).toHaveBeenCalledWith("test.counter", 3);
    });

    it("should call client.decrement with stat, value, and sampleRate", () => {
      log.statsDecrement("test.counter", 3, 0.5);

      expect(mockClient.decrement).toHaveBeenCalledOnce();
      expect(mockClient.decrement).toHaveBeenCalledWith("test.counter", 3, 0.5);
    });

    it("should call client.decrement with stat, value, sampleRate, and tags", () => {
      const tags = ["tag1:value1"];
      log.statsDecrement("test.counter", 3, 0.5, tags);

      expect(mockClient.decrement).toHaveBeenCalledOnce();
      expect(mockClient.decrement).toHaveBeenCalledWith("test.counter", 3, 0.5, tags);
    });

    it("should call client.decrement with multiple stats", () => {
      log.statsDecrement(["test.counter1", "test.counter2"], 5);

      expect(mockClient.decrement).toHaveBeenCalledOnce();
      expect(mockClient.decrement).toHaveBeenCalledWith(["test.counter1", "test.counter2"], 5);
    });

    it("should return this for chaining", () => {
      const result = log.statsDecrement("test.counter");
      expect(result).toBe(log);
    });
  });

  describe("statsTiming", () => {
    it("should call client.timing with stat and value", () => {
      log.statsTiming("test.timing", 150);

      expect(mockClient.timing).toHaveBeenCalledOnce();
      expect(mockClient.timing).toHaveBeenCalledWith("test.timing", 150);
    });

    it("should call client.timing with stat, value, and tags", () => {
      const tags = ["tag1:value1"];
      log.statsTiming("test.timing", 150, tags);

      expect(mockClient.timing).toHaveBeenCalledOnce();
      expect(mockClient.timing).toHaveBeenCalledWith("test.timing", 150, tags);
    });

    it("should call client.timing with stat, value, and sampleRate", () => {
      log.statsTiming("test.timing", 150, 0.5);

      expect(mockClient.timing).toHaveBeenCalledOnce();
      expect(mockClient.timing).toHaveBeenCalledWith("test.timing", 150, 0.5);
    });

    it("should call client.timing with stat, value, sampleRate, and tags", () => {
      const tags = ["tag1:value1"];
      log.statsTiming("test.timing", 150, 0.5, tags);

      expect(mockClient.timing).toHaveBeenCalledOnce();
      expect(mockClient.timing).toHaveBeenCalledWith("test.timing", 150, 0.5, tags);
    });

    it("should call client.timing with Date object", () => {
      const date = new Date(Date.now() - 100);
      log.statsTiming("test.timing", date);

      expect(mockClient.timing).toHaveBeenCalledOnce();
      expect(mockClient.timing).toHaveBeenCalledWith("test.timing", date);
    });

    it("should call client.timing with multiple stats", () => {
      log.statsTiming(["test.timing1", "test.timing2"], 200);

      expect(mockClient.timing).toHaveBeenCalledOnce();
      expect(mockClient.timing).toHaveBeenCalledWith(["test.timing1", "test.timing2"], 200);
    });

    it("should return this for chaining", () => {
      const result = log.statsTiming("test.timing", 150);
      expect(result).toBe(log);
    });
  });

  describe("statsTimer", () => {
    it("should call client.timer and return wrapped function", () => {
      const fn = vi.fn((a: number, b: number) => a + b);
      const wrappedFn = log.statsTimer(fn, "test.timer");

      expect(mockClient.timer).toHaveBeenCalledOnce();
      expect(mockClient.timer).toHaveBeenCalledWith(fn, "test.timer");
      expect(wrappedFn).toBe(fn);
    });

    it("should call client.timer with tags", () => {
      const fn = vi.fn();
      const tags = ["tag1:value1"];
      log.statsTimer(fn, "test.timer", tags);

      expect(mockClient.timer).toHaveBeenCalledOnce();
      expect(mockClient.timer).toHaveBeenCalledWith(fn, "test.timer", tags);
    });

    it("should call client.timer with sampleRate and tags", () => {
      const fn = vi.fn();
      const tags = ["tag1:value1"];
      log.statsTimer(fn, "test.timer", 0.5, tags);

      expect(mockClient.timer).toHaveBeenCalledOnce();
      expect(mockClient.timer).toHaveBeenCalledWith(fn, "test.timer", 0.5, tags);
    });
  });

  describe("statsAsyncTimer", () => {
    it("should call client.asyncTimer and return wrapped function", () => {
      const fn = vi.fn(async (value: number) => value * 2);
      const wrappedFn = log.statsAsyncTimer(fn, "test.async.timer");

      expect(mockClient.asyncTimer).toHaveBeenCalledOnce();
      expect(mockClient.asyncTimer).toHaveBeenCalledWith(fn, "test.async.timer");
      expect(wrappedFn).toBe(fn);
    });

    it("should call client.asyncTimer with tags", () => {
      const fn = vi.fn(async () => {});
      const tags = ["tag1:value1"];
      log.statsAsyncTimer(fn, "test.async.timer", tags);

      expect(mockClient.asyncTimer).toHaveBeenCalledOnce();
      expect(mockClient.asyncTimer).toHaveBeenCalledWith(fn, "test.async.timer", tags);
    });
  });

  describe("statsAsyncDistTimer", () => {
    it("should call client.asyncDistTimer and return wrapped function", () => {
      const fn = vi.fn(async (value: number) => value * 3);
      const wrappedFn = log.statsAsyncDistTimer(fn, "test.async.dist.timer");

      expect(mockClient.asyncDistTimer).toHaveBeenCalledOnce();
      expect(mockClient.asyncDistTimer).toHaveBeenCalledWith(fn, "test.async.dist.timer");
      expect(wrappedFn).toBe(fn);
    });

    it("should call client.asyncDistTimer with tags", () => {
      const fn = vi.fn(async () => {});
      const tags = ["tag1:value1"];
      log.statsAsyncDistTimer(fn, "test.async.dist.timer", tags);

      expect(mockClient.asyncDistTimer).toHaveBeenCalledOnce();
      expect(mockClient.asyncDistTimer).toHaveBeenCalledWith(fn, "test.async.dist.timer", tags);
    });
  });

  describe("statsHistogram", () => {
    it("should call client.histogram with stat and value", () => {
      log.statsHistogram("test.histogram", 42);

      expect(mockClient.histogram).toHaveBeenCalledOnce();
      expect(mockClient.histogram).toHaveBeenCalledWith("test.histogram", 42);
    });

    it("should call client.histogram with stat, value, and tags", () => {
      const tags = ["tag1:value1"];
      log.statsHistogram("test.histogram", 42, tags);

      expect(mockClient.histogram).toHaveBeenCalledOnce();
      expect(mockClient.histogram).toHaveBeenCalledWith("test.histogram", 42, tags);
    });

    it("should call client.histogram with stat, value, and sampleRate", () => {
      log.statsHistogram("test.histogram", 42, 0.5);

      expect(mockClient.histogram).toHaveBeenCalledOnce();
      expect(mockClient.histogram).toHaveBeenCalledWith("test.histogram", 42, 0.5);
    });

    it("should call client.histogram with multiple stats", () => {
      log.statsHistogram(["test.histogram1", "test.histogram2"], 100);

      expect(mockClient.histogram).toHaveBeenCalledOnce();
      expect(mockClient.histogram).toHaveBeenCalledWith(["test.histogram1", "test.histogram2"], 100);
    });

    it("should return this for chaining", () => {
      const result = log.statsHistogram("test.histogram", 42);
      expect(result).toBe(log);
    });
  });

  describe("statsDistribution", () => {
    it("should call client.distribution with stat and value", () => {
      log.statsDistribution("test.distribution", 50);

      expect(mockClient.distribution).toHaveBeenCalledOnce();
      expect(mockClient.distribution).toHaveBeenCalledWith("test.distribution", 50);
    });

    it("should call client.distribution with stat, value, and tags", () => {
      const tags = ["tag1:value1"];
      log.statsDistribution("test.distribution", 50, tags);

      expect(mockClient.distribution).toHaveBeenCalledOnce();
      expect(mockClient.distribution).toHaveBeenCalledWith("test.distribution", 50, tags);
    });

    it("should call client.distribution with stat, value, and sampleRate", () => {
      log.statsDistribution("test.distribution", 50, 0.5);

      expect(mockClient.distribution).toHaveBeenCalledOnce();
      expect(mockClient.distribution).toHaveBeenCalledWith("test.distribution", 50, 0.5);
    });

    it("should call client.distribution with multiple stats", () => {
      log.statsDistribution(["test.distribution1", "test.distribution2"], 200);

      expect(mockClient.distribution).toHaveBeenCalledOnce();
      expect(mockClient.distribution).toHaveBeenCalledWith(["test.distribution1", "test.distribution2"], 200);
    });

    it("should return this for chaining", () => {
      const result = log.statsDistribution("test.distribution", 50);
      expect(result).toBe(log);
    });
  });

  describe("statsGauge", () => {
    it("should call client.gauge with stat and value", () => {
      log.statsGauge("test.gauge", 100);

      expect(mockClient.gauge).toHaveBeenCalledOnce();
      expect(mockClient.gauge).toHaveBeenCalledWith("test.gauge", 100);
    });

    it("should call client.gauge with stat, value, and tags", () => {
      const tags = ["tag1:value1"];
      log.statsGauge("test.gauge", 100, tags);

      expect(mockClient.gauge).toHaveBeenCalledOnce();
      expect(mockClient.gauge).toHaveBeenCalledWith("test.gauge", 100, tags);
    });

    it("should call client.gauge with stat, value, and sampleRate", () => {
      log.statsGauge("test.gauge", 100, 0.5);

      expect(mockClient.gauge).toHaveBeenCalledOnce();
      expect(mockClient.gauge).toHaveBeenCalledWith("test.gauge", 100, 0.5);
    });

    it("should call client.gauge with multiple stats", () => {
      log.statsGauge(["test.gauge1", "test.gauge2"], 200);

      expect(mockClient.gauge).toHaveBeenCalledOnce();
      expect(mockClient.gauge).toHaveBeenCalledWith(["test.gauge1", "test.gauge2"], 200);
    });

    it("should return this for chaining", () => {
      const result = log.statsGauge("test.gauge", 100);
      expect(result).toBe(log);
    });
  });

  describe("statsGaugeDelta", () => {
    it("should call client.gaugeDelta with stat and value", () => {
      log.statsGaugeDelta("test.gauge", 10);

      expect(mockClient.gaugeDelta).toHaveBeenCalledOnce();
      expect(mockClient.gaugeDelta).toHaveBeenCalledWith("test.gauge", 10);
    });

    it("should call client.gaugeDelta with stat, value, and tags", () => {
      const tags = ["tag1:value1"];
      log.statsGaugeDelta("test.gauge", 10, tags);

      expect(mockClient.gaugeDelta).toHaveBeenCalledOnce();
      expect(mockClient.gaugeDelta).toHaveBeenCalledWith("test.gauge", 10, tags);
    });

    it("should call client.gaugeDelta with negative value", () => {
      log.statsGaugeDelta("test.gauge", -5);

      expect(mockClient.gaugeDelta).toHaveBeenCalledOnce();
      expect(mockClient.gaugeDelta).toHaveBeenCalledWith("test.gauge", -5);
    });

    it("should call client.gaugeDelta with multiple stats", () => {
      log.statsGaugeDelta(["test.gauge1", "test.gauge2"], 15);

      expect(mockClient.gaugeDelta).toHaveBeenCalledOnce();
      expect(mockClient.gaugeDelta).toHaveBeenCalledWith(["test.gauge1", "test.gauge2"], 15);
    });

    it("should return this for chaining", () => {
      const result = log.statsGaugeDelta("test.gauge", 10);
      expect(result).toBe(log);
    });
  });

  describe("statsSet", () => {
    it("should call client.set with stat and string value", () => {
      log.statsSet("test.set", "user123");

      expect(mockClient.set).toHaveBeenCalledOnce();
      expect(mockClient.set).toHaveBeenCalledWith("test.set", "user123");
    });

    it("should call client.set with stat and numeric value", () => {
      log.statsSet("test.set", 42);

      expect(mockClient.set).toHaveBeenCalledOnce();
      expect(mockClient.set).toHaveBeenCalledWith("test.set", 42);
    });

    it("should call client.set with stat, value, and tags", () => {
      const tags = ["tag1:value1"];
      log.statsSet("test.set", "user123", tags);

      expect(mockClient.set).toHaveBeenCalledOnce();
      expect(mockClient.set).toHaveBeenCalledWith("test.set", "user123", tags);
    });

    it("should call client.set with stat, value, and sampleRate", () => {
      log.statsSet("test.set", "user123", 0.5);

      expect(mockClient.set).toHaveBeenCalledOnce();
      expect(mockClient.set).toHaveBeenCalledWith("test.set", "user123", 0.5);
    });

    it("should call client.set with multiple stats", () => {
      log.statsSet(["test.set1", "test.set2"], "value");

      expect(mockClient.set).toHaveBeenCalledOnce();
      expect(mockClient.set).toHaveBeenCalledWith(["test.set1", "test.set2"], "value");
    });

    it("should return this for chaining", () => {
      const result = log.statsSet("test.set", "user123");
      expect(result).toBe(log);
    });
  });

  describe("statsUnique", () => {
    it("should call client.unique with stat and string value", () => {
      log.statsUnique("test.unique", "user789");

      expect(mockClient.unique).toHaveBeenCalledOnce();
      expect(mockClient.unique).toHaveBeenCalledWith("test.unique", "user789");
    });

    it("should call client.unique with stat and numeric value", () => {
      log.statsUnique("test.unique", 99);

      expect(mockClient.unique).toHaveBeenCalledOnce();
      expect(mockClient.unique).toHaveBeenCalledWith("test.unique", 99);
    });

    it("should call client.unique with stat, value, and tags", () => {
      const tags = ["tag1:value1"];
      log.statsUnique("test.unique", "user789", tags);

      expect(mockClient.unique).toHaveBeenCalledOnce();
      expect(mockClient.unique).toHaveBeenCalledWith("test.unique", "user789", tags);
    });

    it("should call client.unique with stat, value, and sampleRate", () => {
      log.statsUnique("test.unique", "user789", 0.5);

      expect(mockClient.unique).toHaveBeenCalledOnce();
      expect(mockClient.unique).toHaveBeenCalledWith("test.unique", "user789", 0.5);
    });

    it("should call client.unique with multiple stats", () => {
      log.statsUnique(["test.unique1", "test.unique2"], "value");

      expect(mockClient.unique).toHaveBeenCalledOnce();
      expect(mockClient.unique).toHaveBeenCalledWith(["test.unique1", "test.unique2"], "value");
    });

    it("should return this for chaining", () => {
      const result = log.statsUnique("test.unique", "user789");
      expect(result).toBe(log);
    });
  });

  describe("statsCheck", () => {
    it("should call client.check with name and status", () => {
      log.statsCheck("service.check", 0);

      expect(mockClient.check).toHaveBeenCalledOnce();
      expect(mockClient.check).toHaveBeenCalledWith("service.check", 0);
    });

    it("should call client.check with name, status, and options", () => {
      const options = { message: "Service is down" };
      log.statsCheck("service.check", 2, options);

      expect(mockClient.check).toHaveBeenCalledOnce();
      expect(mockClient.check).toHaveBeenCalledWith("service.check", 2, options);
    });

    it("should call client.check with name, status, options, and tags", () => {
      const options = { hostname: "server1", message: "Service status unknown" };
      const tags = ["environment:test"];
      log.statsCheck("service.check", 3, options, tags);

      expect(mockClient.check).toHaveBeenCalledOnce();
      expect(mockClient.check).toHaveBeenCalledWith("service.check", 3, options, tags);
    });

    it("should call client.check with name, status, undefined options, and tags", () => {
      const tags = ["tag1:value1"];
      log.statsCheck("service.check", 1, undefined, tags);

      expect(mockClient.check).toHaveBeenCalledOnce();
      expect(mockClient.check).toHaveBeenCalledWith("service.check", 1, undefined, tags);
    });

    it("should return this for chaining", () => {
      const result = log.statsCheck("service.check", 0);
      expect(result).toBe(log);
    });
  });

  describe("method chaining", () => {
    it("should allow chaining multiple stats methods", () => {
      const result = log
        .statsIncrement("test.chain.counter")
        .statsTiming("test.chain.timing", 100)
        .statsGauge("test.chain.gauge", 50);

      expect(result).toBe(log);
      expect(mockClient.increment).toHaveBeenCalledWith("test.chain.counter");
      expect(mockClient.timing).toHaveBeenCalledWith("test.chain.timing", 100);
      expect(mockClient.gauge).toHaveBeenCalledWith("test.chain.gauge", 50);
    });

    it("should allow chaining stats methods with logging methods", () => {
      log.statsIncrement("test.request.counter").info("Request processed");

      expect(mockClient.increment).toHaveBeenCalledWith("test.request.counter");
      expect(logger.lines.length).toBe(1);
      expect(logger.lines[0].level).toBe("info");
    });
  });

  describe("mixin registration", () => {
    it("should return a valid mixin registration", () => {
      const registration = hotshotsMixin(mockClient);

      expect(registration).toHaveProperty("mixinsToAdd");
      expect(registration.mixinsToAdd).toHaveLength(1);
      expect(registration.mixinsToAdd[0]).toHaveProperty("augmentationType");
      expect(registration.mixinsToAdd[0]).toHaveProperty("augment");
    });
  });
});
