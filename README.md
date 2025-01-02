# LogLayer Monorepo

[![NPM version](https://img.shields.io/npm/v/loglayer.svg?style=flat-square)](https://www.npmjs.com/package/loglayer)
![NPM Downloads](https://img.shields.io/npm/dm/loglayer)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

This is the monorepo for the LogLayer project, a flexible and extensible logging library for JavaScript and TypeScript.

- For full documentation, read the [docs](https://loglayer.dev).
- [Older 4.x documentation](https://github.com/loglayer/loglayer/tree/4.x)

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
