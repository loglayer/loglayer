---
"@loglayer/shared": patch
"loglayer": patch
---

Log methods now return `void` by default instead of `void | Promise<void>`. Only when async lazy values are present in metadata do log methods return `Promise<void>`. This fixes `@typescript-eslint/no-floating-promises` lint errors for users not using async lazy.
