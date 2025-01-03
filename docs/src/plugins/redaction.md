---
title: Redaction Plugin for LogLayer
description: Learn how to use the redaction plugin to protect sensitive data in your logs
---

[Plugin Source](https://github.com/loglayer/loglayer/tree/master/packages/plugins/redaction)

# Redaction Plugin

The redaction plugin for LogLayer provides a simple way to redact sensitive information from your logs using [fast-redact](https://www.npmjs.com/package/fast-redact).

It currently only performs redaction on metadata.

## Installation

::: code-group

```sh [npm]
npm install @loglayer/plugin-redaction
```

```sh [pnpm]
pnpm add @loglayer/plugin-redaction
```

```sh [yarn]
yarn add @loglayer/plugin-redaction
```

:::

## Basic Usage

```typescript
import { LogLayer, ConsoleTransport } from 'loglayer'
import { redactionPlugin } from '@loglayer/plugin-redaction'

const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
  }),
  plugins: [
    redactionPlugin({
      paths: ["password"],
    }),
  ],
})

// The password will be redacted in the output
log.metadataOnly({
  password: "123456",
})
```

## Configuration Options

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

## Examples

### Basic Path Redaction

```typescript
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
  }),
  plugins: [
    redactionPlugin({
      paths: ["password", "creditCard", "ssn"],
    }),
  ],
})

log.metadataOnly({
  user: "john",
  password: "secret123",
  creditCard: "4111111111111111",
  ssn: "123-45-6789"
})

// Output:
// {
//   "user": "john",
//   "password": "[REDACTED]",
//   "creditCard": "[REDACTED]",
//   "ssn": "[REDACTED]"
// }
```

### Nested Path Redaction

```typescript
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
  }),
  plugins: [
    redactionPlugin({
      paths: ["user.password", "payment.*.number"],
    }),
  ],
})

log.metadataOnly({
  user: {
    name: "john",
    password: "secret123"
  },
  payment: {
    credit: {
      number: "4111111111111111",
      expiry: "12/24"
    },
    debit: {
      number: "4222222222222222",
      expiry: "01/25"
    }
  }
})

// Output:
// {
//   "user": {
//     "name": "john",
//     "password": "[REDACTED]"
//   },
//   "payment": {
//     "credit": {
//       "number": "[REDACTED]",
//       "expiry": "12/24"
//     },
//     "debit": {
//       "number": "[REDACTED]",
//       "expiry": "01/25"
//     }
//   }
// }
```

### Custom Censor Value

```typescript
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
  }),
  plugins: [
    redactionPlugin({
      paths: ["password"],
      censor: "***",
    }),
  ],
})

log.metadataOnly({
  user: "john",
  password: "secret123"
})

// Output:
// {
//   "user": "john",
//   "password": "***"
// }
```

### Remove Instead of Redact

```typescript
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
  }),
  plugins: [
    redactionPlugin({
      paths: ["password"],
      remove: true,
    }),
  ],
})

log.metadataOnly({
  user: "john",
  password: "secret123"
})

// Output:
// {
//   "user": "john"
// }
```

### Custom Censor Function

```typescript
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
  }),
  plugins: [
    redactionPlugin({
      paths: ["creditCard"],
      censor: (value) => {
        if (typeof value === 'string') {
          return value.slice(-4).padStart(value.length, '*')
        }
        return '[REDACTED]'
      },
    }),
  ],
})

log.metadataOnly({
  user: "john",
  creditCard: "4111111111111111"
})

// Output:
// {
//   "user": "john",
//   "creditCard": "************1111"
// }
```
