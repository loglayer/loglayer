---
title: Simple Pretty Terminal Transport
description: Simple, pretty log output for LogLayer in the terminal (no interactive features)
---

# Simple Pretty Terminal Transport

[![NPM Version](https://img.shields.io/npm/v/@loglayer/transport-simple-pretty-terminal)](https://www.npmjs.com/package/@loglayer/transport-simple-pretty-terminal)
[Source on GitHub](https://github.com/loglayer/loglayer/tree/master/packages/transports/simple-pretty-terminal)

![Inline mode](/images/simple-pretty-terminal/terminal-inline.webp)

The Simple Pretty Terminal Transport provides beautiful, themed log output in your terminal, with no interactive features. It is ideal for local development, CI, or anywhere you want clean, readable logs without keyboard navigation or input.

::: tip Looking for a powerful alternative?
This transport is built for frameworks like Next.js and for use with multiple projects running concurrently. 

The Simple Pretty Terminal does not support keyboard navigation, search / filtering, or interactive features. For more advanced terminal printing for a non-Next.js / single application, use the [Pretty Terminal Transport](/transports/pretty-terminal).
:::

## Installation

::: code-group
```bash [npm]
npm install loglayer @loglayer/transport-simple-pretty-terminal
```
```bash [pnpm]
pnpm add loglayer @loglayer/transport-simple-pretty-terminal
```
```bash [yarn]
yarn add loglayer @loglayer/transport-simple-pretty-terminal
```
:::

## Basic Usage

::: warning Development Only
Simple Pretty Terminal is designed to work in a terminal only for local development. It should not be used for production environments.

It is recommended that you disable other transports when using Pretty Terminal to avoid duplicate log output.
:::

```typescript
import { LogLayer } from "loglayer";
import { getSimplePrettyTerminal, moonlight } from "@loglayer/transport-simple-pretty-terminal";

const log = new LogLayer({
  transport: [
    new ConsoleTransport({
      // Example of how to enable a transport for non-development environments
      enabled: process.env.NODE_ENV !== 'development',
    }),
    getSimplePrettyTerminal({
      enabled: process.env.NODE_ENV === 'development',
      viewMode: "expanded", // "inline" | "message-only" | "expanded"
      theme: moonlight
    }),
  ],
});

log.withMetadata({ foo: "bar" }).info("Hello from Simple Pretty Terminal!");
```

## Configuration Options

| Option             | Type    | Default   | Description                                                                                      |
|--------------------|---------|-----------|--------------------------------------------------------------------------------------------------|
| `enabled`          | boolean | `true`      | Enable/disable the transport                                                                     |
| `viewMode`         | string  | "inline"  | Log view: "inline", "message-only", or "expanded"                                                |
| `theme`            | object  | `moonlight` | Theme for log output (see built-in themes)                                                       |
| `maxInlineDepth`   | number  | `4`         | Max depth for inline data in inline mode                                                         |
| `showLogId`        | boolean | `false`     | Whether to show log IDs in the output                                                            |
| `timestampFormat`  | string \| function | "HH:mm:ss.SSS" | Custom timestamp format ([date-fns format string](https://date-fns.org/docs/format) or function) |
| `collapseArrays`   | boolean | `true`      | Whether to collapse arrays in expanded mode for cleaner output                                   |
| `flattenNestedObjects` | boolean | `true` | Whether to flatten nested objects with dot notation in inline mode                               |
| `writeFn`          | function | `process.stdout.write` | Custom function to write messages to the terminal                                                |

## View Modes

The transport supports three view modes:

### Inline (default)

![Inline mode](/images/simple-pretty-terminal/terminal-inline.webp)

- `viewMode: 'inline'`

Shows all information with complete data structures inline using key=value format. Nested objects are flattened with dot notation (e.g., `user.profile.name=John`). Arrays can be controlled with `collapseArrays` - when `true` they show as `[...]`, when `false` they show as full JSON. Complex objects are shown as JSON when expanded.

### Expanded

![Expanded mode](/images/simple-pretty-terminal/terminal-inline.webp)

- `viewMode: 'expanded'`

Shows timestamp, level, and message on first line, with data on indented separate lines for better readability.

### Message only

![Message only mode](/images/simple-pretty-terminal/terminal-message-only.webp)

- `viewMode: 'message-only'`

Shows only the timestamp, log level and message for a cleaner output.

## Themes

The transport comes with several built-in themes:
- `moonlight` (default)
- `sunlight`
- `neon`
- `nature`
- `pastel`

For more information on themes, see the [Pretty Terminal Themes](/transports/pretty-terminal.md#themes)

## Creating Custom Themes

You can create your own custom themes by implementing the `SimplePrettyTerminalTheme` interface. This gives you complete control over the colors and styling of your log output.

### Theme Structure

A theme consists of the following properties:

```typescript
interface SimplePrettyTerminalTheme {
  colors?: {
    trace?: ChalkInstance;
    debug?: ChalkInstance;
    info?: ChalkInstance;
    warn?: ChalkInstance;
    error?: ChalkInstance;
    fatal?: ChalkInstance;
  };
  logIdColor?: ChalkInstance;
  dataValueColor?: ChalkInstance;
  dataKeyColor?: ChalkInstance;
}
```

### Using Chalk for Colors

The transport uses the `chalk` library for styling. You can import it from the transport package:

```typescript
import { chalk } from "@loglayer/transport-simple-pretty-terminal";
```

### Basic Custom Theme Example

Here's a simple custom theme with a dark blue color scheme:

```typescript
import { chalk } from "@loglayer/transport-simple-pretty-terminal";

const darkBlueTheme = {
  colors: {
    trace: chalk.gray,
    debug: chalk.blue,
    info: chalk.cyan,
    warn: chalk.yellow,
    error: chalk.red,
    fatal: chalk.bgRed.white,
  },
  logIdColor: chalk.gray,
  dataValueColor: chalk.white,
  dataKeyColor: chalk.blue,
};

const transport = getSimplePrettyTerminal({
  theme: darkBlueTheme,
});
```

## Custom Timestamp Formatting

You can customize timestamp formatting using date-fns format strings or custom functions:

```typescript
// Using date-fns format strings
const transport1 = getSimplePrettyTerminal({
  timestampFormat: "yyyy-MM-dd HH:mm:ss", // 2024-01-15 14:30:25
  timestampFormat: "MMM dd, yyyy 'at' HH:mm", // Jan 15, 2024 at 14:30
  timestampFormat: "HH:mm:ss.SSS", // 14:30:25.123 (default)
});

// Using custom functions
const transport2 = getSimplePrettyTerminal({
  timestampFormat: (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  },
});
```

Common date-fns format patterns:
- `"HH:mm:ss.SSS"` - Time with milliseconds (default)
- `"yyyy-MM-dd HH:mm:ss"` - Full date and time
- `"MMM dd, yyyy HH:mm"` - Readable date format
- `"HH:mm:ss"` - Time without milliseconds
- `"yyyy-MM-dd"` - Date only

## Custom Output Function

You can customize how log messages are written to the terminal using the `writeFn` option. By default, the transport uses `process.stdout.write` with a newline, but you can provide your own function for more control over output.

### Using console.log

If you prefer to use `console.log` instead of the default `process.stdout.write`:

```typescript
const transport = getSimplePrettyTerminal({
  writeFn: (message: string) => console.log(message),
});
```
