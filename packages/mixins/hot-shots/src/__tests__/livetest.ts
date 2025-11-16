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

console.log("Live test completed!");
