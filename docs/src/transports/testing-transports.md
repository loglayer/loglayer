---
title: Testing Transports
description: Learn how to test transports for LogLayer
---

# Testing Transports

## Unit testing

Unfortunately there is not a prescribed way to unit test transport implementations. 
This is because the implementation of a transport is highly dependent on the target logging library.

You will want to at least test that the calls to LogLayer reaches the intended method of the destination logger.

- Some loggers allow for the specification of an output stream. You can usually use this to end-to-end test the logger output.
  * A lot of loggers do this, and you can check out the unit tests for the LogLayer transports for examples.
- If they don't have an output stream, replace the logger with a mock and test that the mock is called with the correct parameters.

## Live testing

### With `testTransportOutput`

Live testing tests that the transport actually works with the target logger.

The `@loglayer/transport` library exports a `testTransportOutput(label: string, loglayer: LogLayer)` function that can be used to test 
that the transport works with the target logger.

It calls the commonly used methods on the `loglayer` instance and outputs what the result is to the console.

Lots of transports have a `src/__tests__/livetest.ts` file that you can look at to see how to use it.

Here is an example of how to use it from the bunyan transport:

```typescript
// livetest.ts
import { testTransportOutput } from "@loglayer/transport";
import bunyan from "bunyan";
import { LogLayer } from "loglayer";
import { BunyanTransport } from "../BunyanTransport.js";

const b = bunyan.createLogger({
  name: "my-logger",
  level: "trace", // Show all log levels
  serializers: {
    err: bunyan.stdSerializers.err, // Use Bunyan's error serializer
  },
});

const log = new LogLayer({
  errorFieldName: "err", // Match Bunyan's error field name
  transport: new BunyanTransport({
    logger: b,
  }),
});

testTransportOutput("Bunyan logger", log);
```

Then you can use `pnpm run livetest` / `npx tsx livetest.ts` to run the test.

### For cloud providers

For cloud provider-sent logs, you'll have to use the cloud provider's log console to verify that the logs are being sent correctly.
This was done for the DataDog transports, where the logs were sent to DataDog and verified in the DataDog console.
