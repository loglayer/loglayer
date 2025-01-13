---
title: Sprintf Plugin
description: Printf-style string formatting support for LogLayer
---

# Sprintf Plugin

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Fplugin-sprintf)](https://www.npmjs.com/package/@loglayer/plugin-sprintf)

[Plugin Source](https://github.com/loglayer/loglayer/tree/master/packages/plugins/sprintf)

The sprintf plugin provides printf-style string formatting support using [sprintf-js](https://www.npmjs.com/package/sprintf-js). It allows you to format your log messages using familiar printf-style placeholders if a transport does not support this behavior.

::: warning
- LogLayer does not allow passing items that are not strings or numbers into message methods like `info`, `error`,
  etc. **It is recommended to only use string and number specifiers in your format strings.**
- Not all logging libraries support multiple parameters in a message method, so this plugin is only useful for those that do.
:::

## Installation

::: code-group
```bash [npm]
npm install @loglayer/plugin-sprintf
```

```bash [yarn]
yarn add @loglayer/plugin-sprintf
```

```bash [pnpm]
pnpm add @loglayer/plugin-sprintf
```
:::

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

## Changelog

View the changelog [here](./changelogs/sprintf-changelog.md).