# VictoriaLogs Transport Prompts

```text
Create a new cloud transport for victoria logs under `packages/transports/victoria-logs`. It should use `"@loglayer/transport-http": "workspace:*"` as a dependency and the transport `VictoriaLogsTransport` should extend `HttpTransport` and `HttpTransportConfig` respectively.

Use the Victoria Logs JSON stream API @https://docs.victoriametrics.com/victorialogs/data-ingestion/#json-stream-api  

In the extended config, the url should be optional and should be defaulted to `http://localhost:9428`. When the url is assembled, it should call the `/insert/jsonline` path.

See the http transport livetest.ts as a working example. We'll want to also create a livetest file as well for this. We don't really need unit tests since most of those tests exist in the HttpTransport already. 

The VictoriaLogsTransport is essentially a tiny wrapper over the HttpTransport and we should mention that in the documentation (and link to the HTTP transport package as well). When explaining the configuration options, feel free to link to the HTTP transport options documentation, but note any exceptions such as the url would be just the victoria logs host (and that the path would be appended to it automatically)
```

---

```text
@https://docs.victoriametrics.com/victorialogs/keyconcepts/#data-model 

Add a streamFields input function that returns an object representing the stream-level fields. Default to an empty object.

Add a timestamp input function for the `_time` field with the default using an ISO date.

Remove the service / environment fields as the user may specify that as part of context / stream configuration

And according to @https://docs.victoriametrics.com/victorialogs/data-ingestion/#json-stream-api , the log format should have a "log" property containing the level and message (but adhere to the data model section)
```

---

```text
It looks like we can also set custom query parameters

@https://docs.victoriametrics.com/victorialogs/data-ingestion/#http-parameters 
Expose them under an optional input called httpParameters
```

---

```text
Please add a link to the victoria logs http parameters documentation in the documentation where applicable
```

---

```text
Same with a link to the stream level fields
```

---

```text
According to @https://docs.victoriametrics.com/victorialogs/keyconcepts/#data-model  we shouldn't need the `log` property. Make `level` at the root level, and remove `message` since we have `_msg`.

Also note in the documentation if they use custom http parameters, then we will use the corresponding parameter for constructing the payload.

For example if the user customizes `_msg_field` to `message`, then we should be using `message` instead of `_msg`.
```

---

```text
If streamFields is defined, we should use the keys as the values as defined in `_stream_fields`. @https://docs.victoriametrics.com/victorialogs/data-ingestion/#http-query-string-parameters 

This should be noted in the documentation as well
```

---

```text
Now add unit tests since this now has some additional functionality
```
