---
"@loglayer/transport-pretty-terminal": major
---

`better-sqlite3` is now an optional peer dependency instead of a bundled dependency. Users relying on the default in-memory or file-based storage must install it manually.

Added `database` config option to accept any synchronous SQLite instance (e.g. `bun:sqlite`), allowing runtimes like Bun to skip `better-sqlite3` entirely.
