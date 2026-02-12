// Optional: Live integration test
// Run with: npm run livetest
// Requires DATADOG_API_KEY or DD_API_KEY environment variable to be set

import { ConsoleTransport, LogLayer, useLogLayerMixin } from "loglayer";
import { datadogMetricsMixin } from "../index.js";

const apiKey = process.env.DATADOG_API_KEY || process.env.DD_API_KEY;

if (!apiKey) {
  console.error("ERROR: DATADOG_API_KEY or DD_API_KEY environment variable is required");
  process.exit(1);
}

let flushError: Error | null = null;

// Register the mixin with Datadog configuration
useLogLayerMixin(
  datadogMetricsMixin({
    apiKey,
    prefix: "loglayer.livetest.",
    defaultTags: ["env:test"],
    flushIntervalSeconds: 0, // disable auto-flush, we'll flush manually
    onError: (error) => {
      flushError = error;
      console.error("ERROR on flush:", error.message);
    },
  }),
);

// Create LogLayer instance
const log = new LogLayer({
  transport: new ConsoleTransport({ logger: console }),
});

// Test increment
log.ddStats.increment("counter").send();
console.log("Buffered increment: counter (value: 1)");

log.ddStats.increment("counter").withValue(5).send();
console.log("Buffered increment: counter (value: 5)");

log.ddStats
  .increment("counter.tagged")
  .withValue(1)
  .withTags(["service:api", "endpoint:/users"])
  .withTimestamp(Date.now())
  .send();
console.log("Buffered increment: counter.tagged (with tags and timestamp)");

// Test gauge
log.ddStats.gauge("queue.size", 42).send();
console.log("Buffered gauge: queue.size = 42");

log.ddStats.gauge("active.connections", 100).withTags(["region:us-east-1"]).send();
console.log("Buffered gauge: active.connections = 100 (with tags)");

// Test histogram
log.ddStats.histogram("response.time", 250).send();
console.log("Buffered histogram: response.time = 250");

log.ddStats
  .histogram("response.time", 150)
  .withTags(["method:GET", "status:200"])
  .withHistogramOptions({
    percentiles: [0.5, 0.9, 0.95, 0.99],
    aggregates: ["avg", "count", "max"],
  })
  .send();
console.log("Buffered histogram: response.time = 150 (with tags and histogram options)");

// Test distribution
log.ddStats.distribution("latency", 100).send();
console.log("Buffered distribution: latency = 100");

log.ddStats.distribution("latency", 200).withTags(["function:processOrder"]).withTimestamp(Date.now()).send();
console.log("Buffered distribution: latency = 200 (with tags and timestamp)");

// Flush all buffered metrics
console.log("\nFlushing metrics to Datadog...");

try {
  await log.ddStats.flush();
} catch (error) {
  console.error("ERROR: flush() threw:", error);
  process.exit(1);
}

// Give the onError callback a moment to fire (flush reports errors async)
await new Promise((resolve) => setTimeout(resolve, 2000));

if (flushError) {
  console.error("\nFAILED: Metrics flush reported an error (see above)");
  process.exit(1);
}

console.log("SUCCESS: All metrics flushed to Datadog without errors");

// Test getClient
const client = log.ddStats.getClient();
console.log(`Underlying client type: ${client.constructor.name}`);
