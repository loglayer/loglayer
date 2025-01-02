# Redaction Plugin for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Fplugin-redaction)](https://www.npmjs.com/package/@loglayer/plugin-redaction)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Fplugin-redaction)](https://www.npmjs.com/package/@loglayer/plugin-redaction)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

The redaction plugin provides data redaction support for LogLayer using [fast-redact](https://www.npmjs.com/package/fast-redact). 
It allows you to automatically redact sensitive information from your logs.

It currently only performs redaction on metadata.

## Installation

```bash
npm install @loglayer/plugin-redaction
```

## Usage

```typescript
import { LogLayer, ConsoleTransport } from 'loglayer'
import { redactionPlugin } from '@loglayer/plugin-redaction'

const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  }),
  plugins: [
    redactionPlugin({
      paths: ["password", "creditCard"],
      censor: "[REDACTED]"
    })
  ]
})

// Example usage
log.withMetadata({ 
  user: "john", 
  password: "secret123",
  creditCard: "1234-5678-9012-3456"
}).info("User logged in")
// Output will redact password and creditCard fields
```

## Configuration Options

The plugin accepts the following options:

```typescript
interface RedactionPluginOptions {
  /**
   * Unique identifier for the plugin. Used for selectively disabling / enabling
   * and removing the plugin.
   */
  id?: string;

  /**
   * If true, the plugin will skip execution
   */
  disabled?: boolean;

  /**
   * An array of strings describing the nested location of a key in an object.
   * See https://www.npmjs.com/package/fast-redact for path syntax.
   */
  paths?: string[];

  /**
   * This is the value which overwrites redacted properties.
   * Default: "[REDACTED]"
   */
  censor?: string | ((v: any) => any);

  /**
   * When set to true, will cause keys to be removed from the serialized output.
   * Default: false
   */
  remove?: boolean;

  /**
   * When set to true, will cause the redactor function to throw if instead of an object it finds a primitive.
   * Default: false
   */
  strict?: boolean;
}
```

## Documentation

For more details, visit [https://loglayer.dev/plugins/redaction](https://loglayer.dev/plugins/redaction)