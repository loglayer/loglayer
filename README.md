# LogLayer Monorepo

[![NPM version](https://img.shields.io/npm/v/loglayer.svg?style=flat-square)](https://www.npmjs.com/package/loglayer)
[![NPM Downloads](https://img.shields.io/npm/dm/loglayer)](https://www.npmjs.com/package/loglayer)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

`loglayer` is a unified logger that routes logs to various logging libraries and cloud providers while providing a fluent API for specifying log messages, metadata and errors.

- For full documentation, read the [docs](https://loglayer.dev).
- [Older 4.x documentation](https://github.com/loglayer/loglayer/tree/4.x)

```javascript
// Example using the Pino logging library with LogLayer
import { LogLayer } from 'loglayer';
import { pino } from 'pino';
import { PinoTransport } from '@loglayer/transport-pino';
import { redactionPlugin } from '@loglayer/plugin-redaction';

const log = new LogLayer({
  // Multiple loggers can also be used at the same time. 
  // Need to also ship to a cloud provider like DataDog at the same time? You can!
  transport: new PinoTransport({
    logger: pino()
  }),
  // Plugins can be created to modify log data before it's shipped to your logging library.
  plugins: [
    redactionPlugin({
      paths: ['password'],
      censor: '[REDACTED]',
    }),
  ],
})

log.withPrefix("[my-app]")
  .withMetadata({ some: 'data', password: 'my-pass' })
  .withError(new Error('test'))
  .info('my message')
```

```json5
{
   "level":30,
   "time":1735857465669,
   "pid":30863,
   "msg":"[my-app] my message",
   // The placement of these fields are also configurable!
   "password":"[REDACTED]",
   "some":"data",
   "err":{
      "type":"Error",
      "message":"test",
      "stack":"Error: test\n ..."
   }
}
```

## Development Setup

This is a monorepo using [`pnpm`](https://pnpm.io/installation) for package management and [`turbo`](https://turbo.build/repo/docs/getting-started/installation) for build orchestration. 
If you're looking to contribute or work with the source code, follow these steps:

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Build all packages:
   ```bash
   turbo build
   ```
   
## Running Tests

To run tests for all packages, use the following command:

```bash
turbo test
```

## Viewing docs

The docs use [vitepress](https://vitepress.dev/). To view the docs locally, run:

```bash
turbo docs:dev
```

## Project Structure

```
loglayer/
├── docs/                         # Documentation (vitepress)
├── packages/
│   ├── core/                     # Core packages
│   │   ├── loglayer/             # Main LogLayer implementation
│   │   ├── plugin/               # Plugin system core
│   │   ├── transport/            # Transport system core
│   │   ├── shared/               # Shared utilities and types
│   │   └── tsconfig/             # Shared TypeScript configurations
│   ├── transports/               # Official transport implementations
│   └── plugins/                  # Official plugins
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## Documentation

For detailed documentation, visit [https://loglayer.dev](https://loglayer.dev)
