# Sprintf Plugin for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Fplugin-sprintf)](https://www.npmjs.com/package/@loglayer/plugin-sprintf)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Fplugin-sprintf)](https://www.npmjs.com/package/@loglayer/plugin-sprintf)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

The sprintf plugin for [loglayer](https://loglayer.dev) provides printf-style string formatting support using [sprintf-js](https://www.npmjs.com/package/sprintf-js). 

It allows you to format your log messages using familiar printf-style placeholders if a transport does not support this behavior.

## Disclaimer

- LogLayer does not allow passing items that are not strings or numbers into message methods like `info`, `error`,
etc, and would recommend that only string and number specifiers be used.
- Not all logging libraries support multiple parameters in a message method, so this plugin is useful for those that do.

## Installation

```bash
npm install @loglayer/plugin-sprintf
```

## Usage

```typescript
import { LogLayer, ConsoleTransport } from 'loglayer'
import { sprintfPlugin } from '@loglayer/plugin-sprintf'

const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  }),
  plugins: [
    sprintfPlugin()
  ]
})

// Example usage
log.info("Hello %s!", "world")
// Output: Hello world!

log.info("Number: %d", 42)
// Output: Number: 42
```

## Documentation

For more details, visit [https://loglayer.dev/plugins/sprintf](https://loglayer.dev/plugins/sprintf) 