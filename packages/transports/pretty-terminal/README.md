# Pretty Terminal Transport for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-pretty-terminal)](https://www.npmjs.com/package/@loglayer/transport-pretty-terminal)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Ftransport-pretty-terminal)](https://www.npmjs.com/package/@loglayer/transport-pretty-terminal)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-compatible-F9F1E1?logo=bun)](https://bun.sh)

A transport for the [LogLayer](https://loglayer.dev) logging library that pretty-prints logs printed in the terminal.

![Pretty Terminal Transport](https://loglayer.dev/images/pretty-terminal/pretty-terminal-short-v2.gif)

## Features

- 🎨 **Color-coded Log Levels** - Each log level has distinct colors for quick visual identification
- 🔍 **Interactive Selection Mode** - Browse and inspect logs in a full-screen interactive view
- 📝 **Detailed Log Inspection** - Examine individual log entries with formatted data and context
- 🔎 **Search/Filter Functionality** - Find specific logs with powerful filtering capabilities
- 💅 **JSON Pretty Printing** - Beautifully formatted structured data with syntax highlighting
- 🎭 **Configurable Themes** - Choose from pre-built themes or customize your own colors

## Next.js / browser support

The Pretty Terminal does not work in a browser or Next.js as Pretty Terminal has dependencies that are incompatible with
in a Next.js environment.

Use [Simple Pretty terminal](https://loglayer.dev/transports/simple-pretty-terminal) instead.


## Installation

### Node.js

```bash
npm install loglayer @loglayer/transport-pretty-terminal serialize-error better-sqlite3
```

### Bun

Bun has a built-in SQLite module — `better-sqlite3` is not needed. Pass a `bun:sqlite` `Database` via the `database` option (see usage below).

```bash
bun add loglayer @loglayer/transport-pretty-terminal serialize-error
```

## Usage

### Node.js

```typescript
import Database from 'better-sqlite3';
import { LogLayer, ConsoleTransport } from 'loglayer';
import { getPrettyTerminal } from '@loglayer/transport-pretty-terminal';
import { serializeError } from 'serialize-error';

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: [
    new ConsoleTransport({
      // Use console logging in non-development environments
      enabled: process.env.NODE_ENV !== 'development',
    }),
    getPrettyTerminal({
      database: new Database(':memory:'),
      // Only enable Pretty Terminal in development
      enabled: process.env.NODE_ENV === 'development',
    }),
  ],
});
```

### Bun

```typescript
import { Database } from 'bun:sqlite';
import { LogLayer, ConsoleTransport } from 'loglayer';
import { getPrettyTerminal } from '@loglayer/transport-pretty-terminal';
import { serializeError } from 'serialize-error';

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: [
    new ConsoleTransport({
      // Use console logging in non-development environments
      enabled: process.env.NODE_ENV !== 'development',
    }),
    getPrettyTerminal({
      database: new Database(':memory:'),
      // Only enable Pretty Terminal in development
      enabled: process.env.NODE_ENV === 'development',
    }),
  ],
});
```

For full documentation visit the [Pretty Terminal docs](https://loglayer.dev/transports/pretty-terminal).
