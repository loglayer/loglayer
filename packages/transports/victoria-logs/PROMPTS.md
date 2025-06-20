# VictoriaLogs Transport Prompts

## Initial Creation

Create a new cloud transport for VictoriaLogs under `packages/transports/victoria-logs`. It should use `"@loglayer/transport-http": "workspace:*"` as a dependency and the transport `VictoriaLogsTransport` should extend `HttpTransport`.

Use the VictoriaLogs JSON stream API @https://docs.victoriametrics.com/victorialogs/data-ingestion/#json-stream-api

The transport should default the URL to `http://localhost:9428` with the path `/insert/jsonline` appended to it.

The transport should use the VictoriaLogs JSON stream API.

The transport should have a live test file similar to the HTTP transport's live test, no unit tests, and documentation linking to the HTTP transport and VictoriaLogs API.

The transport should have a `streamFields` function that returns stream-level fields (default empty), a `timestamp` function for the `_time` field (default ISO date), and remove hardcoded service/environment fields.

The transport should update the payload to have `level` at the root level and remove the `log` property and `message` field, since `_msg` is used for the message.

The transport should support custom HTTP query parameters (`httpParameters`).

The transport should add links to the VictoriaLogs HTTP parameters and stream fields documentation in the README and documentation site.

The transport should use the keys from `streamFields` as the values for `_stream_fields` parameter.

When referencing VictoriaLogs, it should be styled as "VictoriaLogs" not "Victoria Logs".

## Documentation Updates

Please add a link to the VictoriaLogs HTTP parameters documentation in the documentation where applicable.

Please add a link to the VictoriaLogs stream fields documentation in the documentation where applicable.

## Testing

Please add unit tests for the VictoriaLogs transport since it now has some additional functionality.

## Styling

When referencing VictoriaLogs, it should be styled as "VictoriaLogs" not "Victoria Logs".