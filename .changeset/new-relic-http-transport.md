---
"@loglayer/transport-new-relic": major
---

Rewrite New Relic transport to extend HttpTransport for Bun and Deno compatibility

The NewRelicTransport now extends HttpTransport instead of LoggerlessTransport, making it compatible with Bun and Deno runtimes (uses the fetch API instead of Node.js-specific features). Benefits of the HttpTransport base include:
- Batch sending with configurable size and timeout
- Retry logic with exponential backoff
- Rate limiting support
- Compression support
- Bun and Deno compatibility via platform-agnostic fetch API

**Breaking changes:**
- `useCompression` config option renamed to `compression` (consistent with HttpTransport)
- `RateLimitError` is now re-exported from `@loglayer/transport-http` (same shape, same behavior)
