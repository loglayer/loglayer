# Log filtering plugin for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Fplugin-filter)](https://www.npmjs.com/package/@loglayer/plugin-filter)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Fplugin-filter)](https://www.npmjs.com/package/@loglayer/plugin-filter)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

A plugin for [LogLayer](https://loglayer.dev) that filters log messages. You can filter logs using string patterns, regular expressions, 
or [JSON Queries](https://jsonquerylang.org/).

## Installation

```bash
npm install @loglayer/plugin-filter
```

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

## Documentation

For more details, visit [https://loglayer.dev/plugins/filter](https://loglayer.dev/plugins/filter) 
