### HTTP Transport Optional Parameters

#### General Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Whether the transport is enabled |
| `level` | `"trace" \| "debug" \| "info" \| "warn" \| "error" \| "fatal"` | `"trace"` | Minimum log level to process. Logs below this level will be filtered out |
| `method` | `string` | `"POST"` | HTTP method to use for requests |
| `headers` | `Record<string, string> \| (() => Record<string, string>)` | `{}` | Headers to include in the request. Can be an object or a function that returns headers |
| `contentType` | `string` | `"application/json"` | Content type for single log requests. User-specified headers take precedence |
| `compression` | `boolean` | `false` | Whether to use gzip compression |
| `maxRetries` | `number` | `3` | Number of retry attempts before giving up |
| `retryDelay` | `number` | `1000` | Base delay between retries in milliseconds |
| `respectRateLimit` | `boolean` | `true` | Whether to respect rate limiting by waiting when a 429 response is received |
| `maxLogSize` | `number` | `1048576` | Maximum size of a single log entry in bytes (1MB) |
| `maxPayloadSize` | `number` | `5242880` | Maximum size of the payload (uncompressed) in bytes (5MB) |
| `enableNextJsEdgeCompat` | `boolean` | `false` | Whether to enable Next.js Edge compatibility |

#### Debug Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `onError` | `(err: Error) => void` | - | Error handling callback |
| `onDebug` | `(entry: Record<string, any>) => void` | - | Debug callback for inspecting log entries before they are sent |
| `onDebugReqRes` | `(reqRes: { req: { url: string; method: string; headers: Record<string, string>; body: string \| Uint8Array }; res: { status: number; statusText: string; headers: Record<string, string>; body: string } }) => void` | - | Debug callback for inspecting HTTP requests and responses. Provides complete request/response details including headers and body content |

#### Batch Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `batchContentType` | `string` | `"application/json"` | Content type for batch log requests. User-specified headers take precedence |
| `enableBatchSend` | `boolean` | `true` | Whether to enable batch sending |
| `batchSize` | `number` | `100` | Number of log entries to batch before sending |
| `batchSendTimeout` | `number` | `5000` | Timeout in milliseconds for sending batches regardless of size |
| `batchSendDelimiter` | `string` | `"\n"` | Delimiter to use between log entries in batch mode |
| `batchMode` | `"delimiter" \| "field" \| "array"` | `"delimiter"` | Batch mode for sending multiple log entries. "delimiter" joins entries with a delimiter, "field" wraps an array of entries in an object with a field name, "array" sends entries as a plain JSON array of objects |
| `batchFieldName` | `string` | - | Field name to wrap batch entries in when batchMode is "field" |
