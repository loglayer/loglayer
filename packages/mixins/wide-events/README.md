# wide-events mixin for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Fmixin-wide-events)](https://www.npmjs.com/package/@loglayer/mixin-wide-events)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Fmixin-wide-events)](https://www.npmjs.com/package/@loglayer/mixin-wide-events)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

Adds wide event logging functionality to the [LogLayer](https://loglayer.dev) logging library, enabling comprehensive, self-contained log entries that capture an entire operation's context using Node.js `AsyncLocalStorage`.

The mixin provides methods to accumulate data across async boundaries and emit it as a single log entry, along with built-in sampling support.

## Installation

```bash
npm install loglayer @loglayer/mixin-wide-events
```

## Documentation

For more details, visit [https://loglayer.dev/mixins/wide-events](https://loglayer.dev/mixins/wide-events).
