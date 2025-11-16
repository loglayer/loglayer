// Optional: Live integration test
// Run with: npm run livetest

import { StatsD } from "hot-shots";
import { ConsoleTransport, LogLayer, useLogLayerMixin } from "loglayer";
import { hotshotsMixin } from "../index.js";

// Tested using
// docker run -d --name statsd_debugger -p 8125:8125/udp hypnza/statsd_dumpmessages
const client = new StatsD({
  port: 8125,
  errorHandler: (err) => {
    console.error(err);
  },
});
// Register the mixin
useLogLayerMixin(hotshotsMixin(client));

// Create LogLayer instance
const log = new LogLayer({
  transport: new ConsoleTransport({ logger: console }),
});

// Test the stats API
log.stats.increment("test.counter").send();
log.stats.increment("test.counter").withValue(5).send();
log.stats.timing("test.timing", 42).send();
log.stats.gauge("test.gauge", 10).send();

// Test with chaining
log.stats
  .increment("test.counter")
  .withValue(1)
  .withTags(["env:test", "service:api"])
  .withSampleRate(0.5)
  .withCallback((error, bytes) => {
    if (error) {
      console.error("Error sending metric:", error);
    } else {
      console.log(`Sent ${bytes} bytes`);
    }
  })
  .send();

// Test asyncTimer
const asyncFunc = async (x: number) => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  return x * 2;
};

const timedAsyncFunc = log.stats.asyncTimer(asyncFunc, "test.async.timer").create();
const result = await timedAsyncFunc(5);
console.log(`Async timer result: ${result}`);

// Test asyncDistTimer with options
const timedAsyncFuncWithOptions = log.stats
  .asyncDistTimer(asyncFunc, "test.async.dist.timer")
  .withTags(["env:test"])
  .withSampleRate(1.0)
  .create();
const result2 = await timedAsyncFuncWithOptions(10);
console.log(`Async dist timer result: ${result2}`);

// Test timer (synchronous)
const syncFunc = (x: number) => x * 3;
const timedSyncFunc = log.stats.timer(syncFunc, "test.sync.timer").create();
const result3 = timedSyncFunc(7);
console.log(`Sync timer result: ${result3}`);

// Test timer with options
const timedSyncFuncWithOptions = log.stats
  .timer(syncFunc, "test.sync.timer.options")
  .withTags(["env:test"])
  .withSampleRate(1.0)
  .create();
const result4 = timedSyncFuncWithOptions(8);
console.log(`Sync timer with options result: ${result4}`);

console.log("Live test completed!");
