---
title: Simple Pretty Terminal Transport
description: Simple, pretty log output for LogLayer in the terminal (no interactive features)
---

# Simple Pretty Terminal Transport <Badge type="warning" text="Browser" /> <Badge type="tip" text="Server" /> <Badge type="info" text="Deno" /> <Badge type="info" text="Bun" />

[![NPM Version](https://img.shields.io/npm/v/@loglayer/transport-simple-pretty-terminal)](https://www.npmjs.com/package/@loglayer/transport-simple-pretty-terminal)

[Source on GitHub](https://github.com/loglayer/loglayer/tree/master/packages/transports/simple-pretty-terminal)

![Inline mode](/images/simple-pretty-terminal/terminal-inline.webp)

The Simple Pretty Terminal Transport provides beautiful, themed log output in your console, with no interactive features. Supports printing in both Node.js and browser environments as well as Next.js (client and server-side).

::: tip Looking for a powerful alternative?
The Simple Pretty Terminal does not support keyboard navigation, search / filtering, or interactive features. For more advanced console printing for a non-Next.js / non-browser / single application, use the [Pretty Terminal Transport](/transports/pretty-terminal).
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

::: warning Pair with another logger for production
Simple Pretty Terminal is really meant for local development. Although there's
nothing wrong with running it in production, the log output is not designed to be
ingested by 3rd party log collection systems.

It is recommended that you disable other transports when using Pretty Terminal to avoid duplicate log output.
:::

::: warning Required Runtime Configuration
You **must** specify the `runtime` option when creating the transport.

- `runtime: "node"` — Use in Node.js environments. Logs are written using `process.stdout.write`.
- `runtime: "browser"` — Use in browser environments. Logs are written using `console.log`.
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
      runtime: "node", // Required: "node" or "browser"
      viewMode: "expanded", // "inline" | "message-only" | "expanded"
      theme: moonlight
    }),
  ],
});

log.withMetadata({ foo: "bar" }).info("Hello from Simple Pretty Terminal!");
```

## Configuration Options

### Required Parameters

| Name | Type | Description |
|------|------|-------------|
| `runtime` | `string` | Runtime environment: "node" or "browser" |

### Optional Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable/disable the transport |
| `viewMode` | `string` | `"inline"` | Log view: "inline", "message-only", or "expanded" |
| `theme` | `object` | `moonlight` | Theme for log output (see built-in themes) |
| `maxInlineDepth` | `number` | `4` | Max depth for inline data in inline mode |
| `showLogId` | `boolean` | `false` | Whether to show log IDs in the output |
| `timestampFormat` | `string \| function` | `"HH:mm:ss.SSS"` | Custom timestamp format ([date-fns format string](https://date-fns.org/docs/format) or function) |
| `collapseArrays` | `boolean` | `true` | Whether to collapse arrays in expanded mode for cleaner output |
| `flattenNestedObjects` | `boolean` | `true` | Whether to flatten nested objects with dot notation in inline mode |
| `includeDataInBrowserConsole` | `boolean` | `false` | When enabled, also passes the data object as a second argument to browser console methods for easier inspection. Recommended with `viewMode: "inline"` or `"message-only"` |
| `enableSprintf` | `boolean` | `false` | Enable sprintf-style message formatting with placeholders like `%s`, `%d`, `%f`, `%j` |

## Runtime Environments

The transport supports two runtime environments:

### Node.js Runtime

Use `runtime: "node"` for Node.js applications:

```typescript
const transport = getSimplePrettyTerminal({
  runtime: "node",
  viewMode: "inline",
  theme: moonlight,
});
```

In Node.js runtime, logs are written using `process.stdout.write` for optimal terminal output.

### Browser Runtime

Use `runtime: "browser"` for browser applications:

```typescript
const transport = getSimplePrettyTerminal({
  runtime: "browser",
  viewMode: "inline",
  theme: moonlight,
});
```

In browser runtime, logs are written using appropriate console methods based on log level:
- `trace` and `debug` levels → `console.debug()`
- `info` level → `console.info()`
- `warn` level → `console.warn()`
- `error` and `fatal` levels → `console.error()`

This ensures proper log level filtering and styling in browser developer tools.

## Next.js usage

To configure with Next.js, use the following code to use both server and client-side rendering:

```typescript
const isServer = typeof window === "undefined";

const transport = getSimplePrettyTerminal({
  runtime: isServer ? "node" : "browser",
  viewMode: "inline",
  theme: moonlight,
});
```

For full integration instructions, see the [Next.js integration guide](/example-integrations/nextjs.md)

## View Modes

The transport supports three view modes:

### Inline (default)

![Inline mode](/images/simple-pretty-terminal/terminal-inline.webp)

- `viewMode: 'inline'`

Shows all information with complete data structures inline using key=value format. Nested objects are flattened with dot notation (e.g., `user.profile.name=John`). Arrays can be controlled with `collapseArrays` - when `true` they show as `[...]`, when `false` they show as full JSON. Complex objects are shown as JSON when expanded.

### Expanded

![Expanded mode](/images/simple-pretty-terminal/terminal-expanded.webp)

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
  runtime: "node",
  theme: darkBlueTheme,
});
```

## Custom Timestamp Formatting

You can customize timestamp formatting using [date-fns format strings](https://date-fns.org/docs/format) or custom functions:

```typescript
// Using date-fns format strings
const transport1 = getSimplePrettyTerminal({
  runtime: "node",
  timestampFormat: "yyyy-MM-dd HH:mm:ss", // 2024-01-15 14:30:25
  timestampFormat: "MMM dd, yyyy 'at' HH:mm", // Jan 15, 2024 at 14:30
  timestampFormat: "HH:mm:ss.SSS", // 14:30:25.123 (default)
});

// Using custom functions
const transport2 = getSimplePrettyTerminal({
  runtime: "node",
  timestampFormat: (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  },
});
```

## Browser Console Data Inspection

### `includeDataInBrowserConsole` Option

When running in the browser, you can enable the `includeDataInBrowserConsole` option to pass the log data object as a second argument to the browser's console methods (e.g., `console.info(message, data)` vs `console.info(message)`).

This allows you to expand and inspect the data object directly in your browser's developer tools, making debugging much easier.

**Recommended:** Use this option with `"message-only"` to avoid redundant data printing (otherwise, the data will be printed both inline and as an expandable object).

```typescript
const transport = getSimplePrettyTerminal({
  runtime: "browser",
  viewMode: "message-only"
  includeDataInBrowserConsole: true,
});
```

**Example output in browser devtools:**

```js
INFO [12:34:56.789] ▶ INFO User logged in { user: { id: 123, name: "Alice" } }
```

You can expand the object in the console for deeper inspection.

## Sprintf Message Formatting

The transport supports sprintf-style message formatting when `enableSprintf` is set to `true`, powered by the [sprintf-js](https://github.com/alexei/sprintf.js) package. This allows you to use format specifiers like `%s`, `%d`, `%f`, and `%j` in your log messages.

```typescript
const transport = getSimplePrettyTerminal({
  runtime: "node",
  enableSprintf: true,
});

const log = new LogLayer({ transport });

// String substitution
log.info("User %s logged in from %s", "Alice", "192.168.1.100");
// Output: User Alice logged in from 192.168.1.100

// Integer substitution
log.info("Processing %d items", 42);
// Output: Processing 42 items

// Float with precision
log.info("Completed in %.2f seconds", 3.14159);
// Output: Completed in 3.14 seconds

// JSON substitution
log.info("Request body: %j", { name: "John", age: 30 });
// Output: Request body: {"name":"John","age":30}

// Multiple substitutions
log.warn("Memory usage at %d%% - threshold is %d%%", 85, 90);
// Output: Memory usage at 85% - threshold is 90%
```

### Supported Format Specifiers

| Specifier | Description |
|-----------|-------------|
| `%s` | String |
| `%d` or `%i` | Integer |
| `%f` | Floating point number |
| `%.Nf` | Floating point with N decimal places (e.g., `%.2f`) |
| `%j` | JSON (serializes objects) |
| `%%` | Literal percent sign |

For the full list of format specifiers and advanced formatting options, see the [sprintf-js documentation](https://github.com/alexei/sprintf.js#format-specification).

::: tip
If sprintf formatting fails (e.g., invalid format specifier), the transport will gracefully fall back to joining the messages with spaces.
:::
