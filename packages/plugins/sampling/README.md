# @loglayer/plugin-sampling

[![npm version](https://img.shields.io/npm/v/@loglayer/plugin-sampling.svg)](https://www.npmjs.com/package/@loglayer/plugin-sampling)
[![Downloads](https://img.shields.io/npm/dm/@loglayer/plugin-sampling.svg)](https://www.npmjs.com/package/@loglayer/plugin-sampling)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)

A sampling plugin for [LogLayer](https://loglayer.dev) that randomly drops log entries to control log volume and cost.

## Features

- **Rate-based sampling**: Keep a configurable percentage of log entries
- **Per-level sampling**: Different rates per log level
- **Custom sampling**: Use a callback for content-aware filtering
- **Fail-safe**: `error` and `fatal` default to a 100% keep rate (can be overridden via `perLevel` or callback)
- **Fail-open**: Callback exceptions keep the event (never crash)

## Installation

```bash
npm install @loglayer/plugin-sampling
```

## Quick Start

```typescript
import { samplingPlugin } from "@loglayer/plugin-sampling";
import { LogLayer, ConsoleTransport } from "loglayer";

const log = new LogLayer({
  transport: new ConsoleTransport({ logger: console }),
  plugins: [
    // Keep only 10% of logs (errors/fatals default to 100%)
    samplingPlugin({ rate: 0.1 }),
  ],
});
```

## Configuration

- `strategy`: `"default"` or `"per_level"` (default: `"default"`)
- `rate`: 0-1 fraction to keep (default: 1 = keep all)
- `perLevel`: per-level rates like `{ trace: 0.1, debug: 0.3 }`
- `shouldSample`: custom callback `(params: SamplingParams) => boolean`

`error` and `fatal` default to 100% but can be overridden.

## See Also

- [LogLayer](https://loglayer.dev)
- [Wide Events Mixin](https://loglayer.dev/mixins/wide-events) (for wide-event-specific sampling)
