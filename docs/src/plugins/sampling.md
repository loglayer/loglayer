# Sampling Plugin <Badge type="tip" text="Server" /> <Badge type="info" text="Deno" /> <Badge type="info" text="Bun" />

[![npm version](https://img.shields.io/npm/v/@loglayer/plugin-sampling.svg)](https://www.npmjs.com/package/@loglayer/plugin-sampling)
[![Source](https://img.shields.io/badge/source-GitHub-blue)](https://github.com/loglayer/loglayer/tree/master/packages/plugins/sampling)

The Sampling Plugin lets you randomly drop log entries to control log volume and cost. It works with all log levels and supports rate-based, per-level, or custom callback strategies.

## Installation

```bash
npm install @loglayer/plugin-sampling
```

## Usage

### Rate-Based Sampling

Keep a percentage of all log entries:

```typescript
import { LogLayer, ConsoleTransport } from "loglayer";
import { samplingPlugin } from "@loglayer/plugin-sampling";

const log = new LogLayer({
  transport: new ConsoleTransport({ logger: console }),
  plugins: [samplingPlugin({ rate: 0.1 })],  // keep ~10%
});
```

### Per-Level Sampling

Apply different rates per level:

```typescript
const log = new LogLayer({
  transport: new ConsoleTransport({ logger: console }),
  plugins: [
    samplingPlugin({
      strategy: "per_level",
      perLevel: {
        trace: 0.1,  // keep 10% of trace
        debug: 0.3,  // keep 30% of debug
        info: 0.5,   // keep 50% of info
      },
    }),
  ],
});
```

### Custom Callback

Use a callback for content-aware filtering:

```typescript
const log = new LogLayer({
  transport: new ConsoleTransport({ logger: console }),
  plugins: [
    samplingPlugin({
      shouldSample: ({ level, metadata }) => {
        // keep everything at error level or above, or logs with a userId
        return level === "error" || metadata?.userId;
      },
    }),
  ],
});
```

## Behavior

- **error/fatal default to 100%**: Levels `error` and `fatal` are kept by default. Use `perLevel: { error: 0 }` or a `shouldSample` callback to override.
- **fail-open**: If the shouldSample callback throws, the event is kept
- **snapshot**: perLevel map is snapshotted at construction; mutating it afterward has no effect
- **rate clamping**: Rates are clamped to [0, 1]. NaN/Infinity are treated as 0

## Configuration Options

### Required Parameters

None.

### Optional Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `strategy` | `"default"` \| `"per_level"` | `"default"` | Sampling strategy. |
| `rate` | `boolean` \| `number` | `1` | Fraction of events to keep (0-1). With `"per_level"` this acts as a fallback for unmapped levels. |
| `perLevel` | `Partial<Record<LogLevelType, boolean \| number>>` | `undefined` | Per-level rates. Levels not listed fall back to `rate` (or 1 if `rate` is not set). |
| `shouldSample` | `(params) => boolean` | `undefined` | Callback to make a keep/drop decision. Receives the log level, messages, metadata, context, and error. |

<!--@include: ../changelogs/plugins/sampling-changelog.md-->
