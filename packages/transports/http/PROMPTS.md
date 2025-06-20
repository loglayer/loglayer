# Vibe-coding prompts

99% of this code was vibe-coded using Cursor and in the agent `auto` mode with some supervision.

These are the prompts utilized:

```text
Create a new transport called http (HttpTransport). It would be the generic implementation for how we implement sending via HTTP. See the NewRelicTransport as an example. It should extend the LogerlessTransport. We should have the following inputs:

- a header object or function which returns the headers to use
- http method to use (default is POST)
- a url to send the logs to
- an onError handler
- an onDebug handler
- a payloadTemplate handler for which the input is an object with the log level, message, and data from 
- compression option
- max retry option
- retry delay option
- respect rate limiting option
- batch size option
- batch send timeout (for sending regardless of batch reached if specified time passed in ms)
- it should have an enable batch send option (default true) and queue log entries until the batch size is reached or a period of time has passed (in ms)
- batch send delimiter (default to \n)
```

---

```text
run the http transport tests.
```

---

```text
you might need to do "workspcae:*" for the http transport core and loglayer as dev deps
```

---

```text
Add an input parameter for max log size in bytes with a default of 1MB and max content size per payload (uncompressed) at 5 MB.

For any log entries that exceed 1MB then we should call onError that includes the log entry as part of the error object.

For batching, we should keep a running tally of uncompressed size and force send if the batch is within 10% of the payload max (update the docs to also note this behavior)

Also add to tests as well
```

---

```text
Add a configurable parameter called enableNextJsEdgeCompat which would disable the TextEncoder and compression when enabled.

Add tests and documentation
```

---

```text
Add parameters for contentType and batchContentType, default to application/json. If the user has specified it via their headers object / function then that should take presidence instead
```
---

```text
We can't always assume that the payload is JSON-based. It should return text and an example usage should have the user do JSON.stringify()
```

----

```text
make an .env.example file for the livetest
```

----

```text
Add to the docs to configure the `batchContentType` / `contentType` if using a payload other than json
```

----

```text
add a section for when using nextjs on the edge
```

---

```text
Update the livetest.ts file to use the victoria logs JSON stream API @https://docs.victoriametrics.com/victorialogs/data-ingestion/#json-stream-api

I don't think it has a notion of an api key here
```
