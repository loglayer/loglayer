---
"@loglayer/transport-pretty-terminal": major
---

The `database` config option is now required. Pass any synchronous SQLite instance that implements `exec`, `prepare`, and `close` (e.g. `better-sqlite3`, `bun:sqlite`).

`better-sqlite3` is no longer a dependency of the package — bring your own SQLite instance. The `logFile` option has been removed.
