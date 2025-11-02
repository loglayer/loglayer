import { StatsD } from "hot-shots";
import { ConsoleTransport, LogLayer, MockLogLayer, useLogLayerMixin } from "loglayer";
import { hotshotsMixin } from "../index.js";

// Tested using
// docker run -d --name statsd_debugger -p 8125:8125/udp hypnza/statsd_dumpmessages
const client = new StatsD({
  port: 8125,
  errorHandler: (err) => {
    console.error(err);
  },
});

useLogLayerMixin(hotshotsMixin(client));

async function runTests(log: LogLayer | MockLogLayer, testName: string) {
  console.log(`\n===== ${testName} =====\n`);

  // statsIncrement examples
  console.log("===== statsIncrement() ====");
  log.statsIncrement("test.counter").info("Incremented counter");
  log.statsIncrement("test.counter", ["tag1:value1", "tag2:value2"]).info("Incremented counter with tags");
  log.statsIncrement("test.counter", 5).info("Incremented counter by 5");
  log.statsIncrement("test.counter", 5, 0.5).info("Incremented counter by 5 with 50% sample rate");
  log
    .statsIncrement("test.counter", 5, 0.5, ["tag1:value1"])
    .info("Incremented counter by 5 with sample rate and tags");
  log.statsIncrement(["test.counter1", "test.counter2"], 10).info("Incremented multiple counters");
  log
    .statsIncrement("test.counter", 3, (err, _bytes) => {
      if (err) console.error("Increment callback error:", err);
    })
    .info("Incremented counter with callback");

  // statsDecrement examples
  console.log("\n===== statsDecrement() ====");
  log.statsDecrement("test.counter").info("Decremented counter");
  log.statsDecrement("test.counter", ["tag1:value1"]).info("Decremented counter with tags");
  log.statsDecrement("test.counter", 3).info("Decremented counter by 3");
  log.statsDecrement("test.counter", 3, 0.5).info("Decremented counter by 3 with 50% sample rate");
  log
    .statsDecrement("test.counter", 3, 0.5, ["tag1:value1"])
    .info("Decremented counter by 3 with sample rate and tags");
  log.statsDecrement(["test.counter1", "test.counter2"], 5).info("Decremented multiple counters");
  log
    .statsDecrement("test.counter", 2, (err, _bytes) => {
      if (err) console.error("Decrement callback error:", err);
    })
    .info("Decremented counter with callback");

  // statsTiming examples
  console.log("\n===== statsTiming() ====");
  log.statsTiming("test.timing", 150).info("Recorded timing of 150ms");
  log.statsTiming("test.timing", 150, ["tag1:value1"]).info("Recorded timing with tags");
  log.statsTiming("test.timing", 150, 0.5).info("Recorded timing with 50% sample rate");
  log.statsTiming("test.timing", 150, 0.5, ["tag1:value1"]).info("Recorded timing with sample rate and tags");
  log.statsTiming("test.timing", new Date(Date.now() - 100)).info("Recorded timing with Date object");
  log.statsTiming(["test.timing1", "test.timing2"], 200).info("Recorded timing for multiple stats");
  log
    .statsTiming("test.timing", 100, (err, _bytes) => {
      if (err) console.error("Timing callback error:", err);
    })
    .info("Recorded timing with callback");

  // statsTimer examples
  console.log("\n===== statsTimer() ====");
  const timedFunction = log.statsTimer((a: number, b: number) => {
    // Simulate some work
    const start = Date.now();
    while (Date.now() - start < 50) {}
    return a + b;
  }, "test.timer.function");
  const result = timedFunction(5, 10);
  console.log(`Timer wrapped function result: ${result}`);

  const timedFunctionWithTags = log.statsTimer(
    (name: string) => {
      return `Hello, ${name}`;
    },
    "test.timer.withtags",
    ["environment:test"],
  );
  console.log(`Timer wrapped function with tags result: ${timedFunctionWithTags("World")}`);

  // statsAsyncTimer examples
  console.log("\n===== statsAsyncTimer() ====");
  const asyncTimedFunction = log.statsAsyncTimer(async (value: number) => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return value * 2;
  }, "test.async.timer");
  const asyncResult = await asyncTimedFunction(10);
  console.log(`Async timer wrapped function result: ${asyncResult}`);

  const asyncTimedFunctionWithTags = log.statsAsyncTimer(
    async (name: string) => {
      await new Promise((resolve) => setTimeout(resolve, 30));
      return `Async Hello, ${name}`;
    },
    "test.async.timer.withtags",
    ["environment:test"],
  );
  const asyncResultWithTags = await asyncTimedFunctionWithTags("World");
  console.log(`Async timer wrapped function with tags result: ${asyncResultWithTags}`);

  // statsAsyncDistTimer examples
  console.log("\n===== statsAsyncDistTimer() ====");
  const asyncDistTimedFunction = log.statsAsyncDistTimer(async (value: number) => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return value * 3;
  }, "test.async.dist.timer");
  const asyncDistResult = await asyncDistTimedFunction(10);
  console.log(`Async dist timer wrapped function result: ${asyncDistResult}`);

  const asyncDistTimedFunctionWithTags = log.statsAsyncDistTimer(
    async (name: string) => {
      await new Promise((resolve) => setTimeout(resolve, 30));
      return `Async Dist Hello, ${name}`;
    },
    "test.async.dist.timer.withtags",
    ["environment:test"],
  );
  const asyncDistResultWithTags = await asyncDistTimedFunctionWithTags("World");
  console.log(`Async dist timer wrapped function with tags result: ${asyncDistResultWithTags}`);

  // statsHistogram examples
  console.log("\n===== statsHistogram() ====");
  log.statsHistogram("test.histogram", 42).info("Recorded histogram value");
  log.statsHistogram("test.histogram", 42, ["tag1:value1"]).info("Recorded histogram value with tags");
  log.statsHistogram("test.histogram", 42, 0.5).info("Recorded histogram value with 50% sample rate");
  log
    .statsHistogram("test.histogram", 42, 0.5, ["tag1:value1"])
    .info("Recorded histogram value with sample rate and tags");
  log.statsHistogram(["test.histogram1", "test.histogram2"], 100).info("Recorded histogram for multiple stats");
  log
    .statsHistogram("test.histogram", 75, (err, _bytes) => {
      if (err) console.error("Histogram callback error:", err);
    })
    .info("Recorded histogram with callback");

  // statsDistribution examples
  console.log("\n===== statsDistribution() ====");
  log.statsDistribution("test.distribution", 50).info("Recorded distribution value");
  log.statsDistribution("test.distribution", 50, ["tag1:value1"]).info("Recorded distribution value with tags");
  log.statsDistribution("test.distribution", 50, 0.5).info("Recorded distribution value with 50% sample rate");
  log
    .statsDistribution("test.distribution", 50, 0.5, ["tag1:value1"])
    .info("Recorded distribution value with sample rate and tags");
  log
    .statsDistribution(["test.distribution1", "test.distribution2"], 200)
    .info("Recorded distribution for multiple stats");
  log
    .statsDistribution("test.distribution", 150, (err, _bytes) => {
      if (err) console.error("Distribution callback error:", err);
    })
    .info("Recorded distribution with callback");

  // statsGauge examples
  console.log("\n===== statsGauge() ====");
  log.statsGauge("test.gauge", 100).info("Set gauge to 100");
  log.statsGauge("test.gauge", 100, ["tag1:value1"]).info("Set gauge with tags");
  log.statsGauge("test.gauge", 100, 0.5).info("Set gauge with 50% sample rate");
  log.statsGauge("test.gauge", 100, 0.5, ["tag1:value1"]).info("Set gauge with sample rate and tags");
  log.statsGauge(["test.gauge1", "test.gauge2"], 200).info("Set multiple gauges");
  log
    .statsGauge("test.gauge", 75, (err, _bytes) => {
      if (err) console.error("Gauge callback error:", err);
    })
    .info("Set gauge with callback");

  // statsGaugeDelta examples
  console.log("\n===== statsGaugeDelta() ====");
  log.statsGaugeDelta("test.gauge", 10).info("Increased gauge by 10");
  log.statsGaugeDelta("test.gauge", -5).info("Decreased gauge by 5");
  log.statsGaugeDelta("test.gauge", 10, ["tag1:value1"]).info("Changed gauge delta with tags");
  log.statsGaugeDelta("test.gauge", 10, 0.5).info("Changed gauge delta with 50% sample rate");
  log.statsGaugeDelta("test.gauge", 10, 0.5, ["tag1:value1"]).info("Changed gauge delta with sample rate and tags");
  log.statsGaugeDelta(["test.gauge1", "test.gauge2"], 15).info("Changed multiple gauge deltas");
  log
    .statsGaugeDelta("test.gauge", 5, (err, _bytes) => {
      if (err) console.error("Gauge delta callback error:", err);
    })
    .info("Changed gauge delta with callback");

  // statsSet examples
  console.log("\n===== statsSet() ====");
  log.statsSet("test.set", "user123").info("Tracked unique value in set");
  log.statsSet("test.set", 42).info("Tracked unique numeric value in set");
  log.statsSet("test.set", "user123", ["tag1:value1"]).info("Tracked unique value with tags");
  log.statsSet("test.set", "user123", 0.5).info("Tracked unique value with 50% sample rate");
  log.statsSet("test.set", "user123", 0.5, ["tag1:value1"]).info("Tracked unique value with sample rate and tags");
  log.statsSet(["test.set1", "test.set2"], "value").info("Tracked unique value for multiple stats");
  log
    .statsSet("test.set", "user456", (err, _bytes) => {
      if (err) console.error("Set callback error:", err);
    })
    .info("Tracked unique value with callback");

  // statsUnique examples (alias for statsSet)
  console.log("\n===== statsUnique() ====");
  log.statsUnique("test.unique", "user789").info("Tracked unique value");
  log.statsUnique("test.unique", 99).info("Tracked unique numeric value");
  log.statsUnique("test.unique", "user789", ["tag1:value1"]).info("Tracked unique value with tags");
  log.statsUnique("test.unique", "user789", 0.5).info("Tracked unique value with 50% sample rate");
  log
    .statsUnique("test.unique", "user789", 0.5, ["tag1:value1"])
    .info("Tracked unique value with sample rate and tags");
  log.statsUnique(["test.unique1", "test.unique2"], "value").info("Tracked unique value for multiple stats");
  log
    .statsUnique("test.unique", "user999", (err, _bytes) => {
      if (err) console.error("Unique callback error:", err);
    })
    .info("Tracked unique value with callback");

  // statsCheck examples (DogStatsD service checks)
  console.log("\n===== statsCheck() ====");
  log.statsCheck("service.check.ok", 0).info("Service check OK");
  log.statsCheck("service.check.warning", 1, undefined, ["tag1:value1"]).info("Service check WARNING with tags");
  log
    .statsCheck("service.check.critical", 2, { message: "Service is down" })
    .info("Service check CRITICAL with message");
  log
    .statsCheck("service.check.unknown", 3, { hostname: "server1", message: "Service status unknown" }, [
      "environment:test",
    ])
    .info("Service check UNKNOWN with options and tags");
  log
    .statsCheck("service.check.ok", 0, undefined, undefined, (err, _bytes) => {
      if (err) console.error("Check callback error:", err);
    })
    .info("Service check with callback");

  // Chaining examples
  console.log("\n===== Method Chaining ====");
  log
    .statsIncrement("test.chain.counter")
    .statsTiming("test.chain.timing", 100)
    .statsGauge("test.chain.gauge", 50)
    .info("Chained multiple stats methods");

  // Combined with logging methods
  console.log("\n===== Stats Methods with Logging ====");
  log.statsIncrement("test.request.counter").info("Request processed");
  log.statsTiming("test.request.duration", 150).warn("Slow request detected");
  log.statsGauge("test.active.connections", 42).error("Connection pool at capacity");
  log.statsCheck("service.api", 0).debug("API health check passed");
}

console.log("\n===== Start Livetest for: hot-shots mixin =====\n");

// Test with LogLayer
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
  }),
});
await runTests(log, "Testing with LogLayer");

// Give StatsD a moment to process
await new Promise((resolve) => setTimeout(resolve, 1000));

// Test with MockLogLayer
const mockLog = new MockLogLayer();
await runTests(mockLog, "Testing with MockLogLayer");

console.log("\n===== End Livetest for: hot-shots mixin =====\n");
