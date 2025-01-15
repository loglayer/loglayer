---
title: Filter Plugin
description: Filter logs using string patterns, regular expressions, or JSON Queries
---

# Filter Plugin

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Fplugin-filter)](https://www.npmjs.com/package/@loglayer/plugin-filter)

[Plugin Source](https://github.com/loglayer/loglayer/tree/master/packages/plugins/filter)

A plugin that filters log messages. You can filter logs using string patterns, regular expressions,
or [JSON Queries](https://jsonquerylang.org/).

## Installation

::: code-group
```bash [npm]
npm install @loglayer/plugin-filter
```

```bash [yarn]
yarn add @loglayer/plugin-filter
```

```bash [pnpm]
pnpm add @loglayer/plugin-filter
```
:::

## Usage

```typescript
import { filterPlugin } from '@loglayer/plugin-filter';

// Create a filter that only allows error messages
const filter = filterPlugin({
  // checks the assembled message using an includes()
  messages: ['error'],
});

// Checks the level of the log
const levelFilter = filterPlugin({
  queries: ['.level == "error" or .level == "warn"'],
});
```

### Configuration

The plugin accepts the following configuration options:

| Option | Type | Description                                                                                                                       |
|--------|------|-----------------------------------------------------------------------------------------------------------------------------------|
| `messages` | `Array<string \| RegExp>` | Optional. Array of string patterns or regular expressions to match against log messages                                           |
| `queries` | `string[]` | Optional. Array of JSON queries to filter logs. A JSON Query `filter()` is applied, which each item being part of an OR condition |
| `debug` | `boolean` | Optional. Enable debug mode for troubleshooting                                                                                   |
| `disabled` | `boolean` | Optional. Disable the plugin                                                                                                      |

## Message Pattern Matching

You can filter logs using string patterns or regular expressions:

```typescript
// Using string patterns
const filter = filterPlugin({
  messages: ['error', 'warning'],
});

// Using regular expressions
const regexFilter = filterPlugin({
  messages: [/error/i, /warning\d+/],
});

// Mixed patterns
const mixedFilter = filterPlugin({
  messages: ['error', /warning\d+/],
});
```

## Query-Based Filtering

You can use [JSON Queries](https://jsonquerylang.org/) to filter logs based on any field.

### Usage

```typescript
const filter = filterPlugin({
  // each item is used as an OR condition
  queries: [
    // Filter by log level
    '.level == "error"',
    // Filter by data properties
    '.data.userId == 123',
    // Complex conditions
    '(.level == "error") and (.data.retryCount > 3)',
  ],
});
```

::: tip
For joining conditions, wrap them in parentheses.
:::

This would translate in JSON Query to:

```text
filter((.level == "error") or (.data.userId == 123) or ((.level == "error") and (.data.retryCount > 3)))
```

::: info
- `filter()` is added around the queries by the plugin.
- Single-quotes are converted to double-quotes.
:::

### Query Context

The queries are executed against an array containing an object that is defined as the following:

```typescript
[{
  level: string;    // Log level
  message: string;  // Combined log message
  data: object;     // Additional log data, which includes, error data, context data and metadata
}]
```

If you did the following:

```typescript
log.withMetadata({ userId: '123' }).error('Failed to process request');
```

Then the query context would be:

```typescript
{
  level: 'error',
  message: 'Failed to process request',
  data: { userId: '123' }
}
```

### Example Queries

```text
// Filter by log level
[".level == 'error'"]

// Filter by message content
// see: https://github.com/jsonquerylang/jsonquery/blob/main/reference/functions.md#regex
["regex(.message, 'test', 'i')"]

// Filter by data properties
[".data.user.age == 25"]

// Complex conditions
["(.level == "error") and (.data.retryCount > 3)"]
```

## Debug Mode

Enable debug mode to see detailed information about the filtering process:

```typescript
const filter = filterPlugin({
  messages: ['error'],
  queries: ['.level == "error"'],
  debug: true,
});
```

## Filter Logic

The plugin follows this logic when filtering logs:

1. If no filters are defined (no messages and no queries), allow all logs
2. If message patterns are defined, check them first
   - If any pattern matches, allow the log
3. If no message patterns match (or none defined) and queries are defined:
   - Execute queries
   - If any query matches, allow the log
4. If no patterns or queries match, filter out the log

## Changelog

View the changelog [here](./changelogs/filter-changelog.md).
