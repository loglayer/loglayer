---
"@loglayer/elysia": patch
---

Fix TypeError when using LogLayer instances with circular references (e.g. OpenTelemetry transport) as the Elysia plugin seed. The plugin now uses a stable numeric ID derived from the LogLayer instance instead of passing the instance directly as the seed, avoiding `JSON.stringify` failures on circular structures.
