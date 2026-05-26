---
"@internal/tsconfig": patch
"@loglayer/express": patch
"@loglayer/koa": patch
"@loglayer/bunyan": patch
"@loglayer/opentelemetry": patch
"@loglayer/pretty-terminal": patch
"@loglayer/signale": patch
"@loglayer/simple-pretty-terminal": patch
---

chore: migrate to TypeScript 6

- Removed deprecated `esModuleInterop: false` (now always true in TS6)
- Added `types: ["node"]` to base config (TS6 changed default behavior)
- Added ES2024 lib for Symbol.dispose support
- Updated packages with additional @types dependencies
- Fixed unnecessary type assertions in eslint-tests (TS6 type inference improvement)