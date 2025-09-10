---
title: Sprintf Plugin
description: Printf-style string formatting support for LogLayer
---

# Sprintf Plugin <Badge type="warning" text="Browser" /> <Badge type="tip" text="Server" />

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Fplugin-sprintf)](https://www.npmjs.com/package/@loglayer/plugin-sprintf)

[Plugin Source](https://github.com/loglayer/loglayer/tree/master/packages/plugins/sprintf)

The sprintf plugin provides printf-style string formatting support using [sprintf-js](https://www.npmjs.com/package/sprintf-js). 
It allows you to format your log messages using familiar printf-style placeholders if a logging library does not support this behavior.

::: warning
LogLayer does not allow passing items that are not strings, booleans, or numbers into message methods like `info`, `error`,
etc. **It is recommended to only use string / boolean / number specifiers in your format strings.**
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