# Datadog APM Trace Injector Plugin <Badge type="tip" text="Server" />

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Fplugin-datadog-apm-trace-injector)](https://www.npmjs.com/package/@loglayer/plugin-datadog-apm-trace-injector)

[![Source](https://img.shields.io/badge/source-GitHub-blue)](https://github.com/loglayer/loglayer/tree/master/packages/plugins/datadog-apm-trace-injector)

The Datadog APM Trace Injector Plugin automatically injects Datadog APM trace context into your LogLayer logs, enabling correlation between your application logs and distributed traces in Datadog.

## Installation

This plugin requires the [`dd-trace`](https://github.com/DataDog/dd-trace-js) library to be installed in your project.

::: code-group

```bash [npm]
npm install @loglayer/plugin-datadog-apm-trace-injector dd-trace
```

```bash [yarn]
yarn add @loglayer/plugin-datadog-apm-trace-injector dd-trace
```

```bash [pnpm]
pnpm add @loglayer/plugin-datadog-apm-trace-injector dd-trace
```

:::

## Configuration

### Required Parameters

| Name | Type | Description |
|------|------|-------------|
| `tracerInstance` | `Tracer` | The `dd-trace` tracer instance |

### Optional Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | - | Unique identifier for the plugin |
| `disabled` | `boolean` | `false` | Disable the plugin |
| `onError` | `(error: Error, data?: Record<string, any>) => void` | - | Error handler for tracer operation failures |

## Usage

```typescript
// dd-trace generally needs to be the first import of any project
// as it needs to patch node_module packages before they are imported
import tracer from 'dd-trace';
import { LogLayer } from 'loglayer';
import { datadogTraceInjectorPlugin } from '@loglayer/plugin-datadog-apm-trace-injector';

tracer.init();

// Create the plugin
const traceInjector = datadogTraceInjectorPlugin({
  tracerInstance: tracer,
  // Enable the plugin only if the Datadog API key is set
  disabled: !process.env.DD_API_KEY
});

// Add to your LogLayer instance
const log = new LogLayer({
  plugins: [traceInjector],
});

// Your logs will now automatically include trace context
log.info('User action completed');
```

### With Error Handling

```typescript
const traceInjectorWithErrorHandling = datadogTraceInjectorPlugin({
  tracerInstance: tracer,
  onError: (error, data) => {
    console.error('Datadog trace injection failed:', error.message, data);
  },
});

const log = new LogLayer({
  plugins: [traceInjectorWithErrorHandling],
});
```

## Express example

```typescript
import tracer from 'dd-trace';
import express from 'express';
import { LogLayer, ConsoleTransport } from 'loglayer';
import { datadogTraceInjectorPlugin } from '@loglayer/plugin-datadog-apm-trace-injector';

// Initialize dd-trace
tracer.init();

const app = express();

const log = new LogLayer({
  transport: new ConsoleTransport({
    messageField: 'msg',
    logger: console,
  }),
  plugins: [
    datadogTraceInjectorPlugin({
      tracerInstance: tracer,
    }),
  ],
});

app.get('/', (req, res) => {
  // This log will automatically include trace context
  log.info('Fetching users from database');

  // Your API logic here
  res.json({ users: [] });
});

app.listen(3004, function(err){
    if (err) console.log("Error in server setup")
    console.log("Server listening on Port 3004");
});
```

Visiting `/` outputs the following:

```json
{
  dd: {
    trace_id: '689cd152000000002bf3186dadf7c91a',
    span_id: '6991062753777198294',
    service: 'test-service',
    version: '0.0.1'
  },
  msg: 'Fetching users from database'
}
```

## How It Works

The plugin hooks into LogLayer's `onBeforeDataOut` lifecycle and:

1. **Retrieves Active Span**: Gets the currently active span from the dd-trace tracer
2. **Injects Trace Context**: Uses `tracer.inject()` to add trace and span IDs to the log data
3. **Preserves Existing Data**: Maintains all existing log data while adding trace context

The injected trace context follows Datadog's [log correlation format](https://docs.datadoghq.com/tracing/other_telemetry/connect_logs_and_traces/nodejs/), allowing you to:

- Correlate logs with traces in the Datadog UI
- Filter logs by trace ID or span ID
- View logs alongside trace spans in distributed tracing views

## Trace Context Fields

When a trace is active, the following fields are automatically added to your logs:

- `dd.trace_id`: The current trace ID
- `dd.span_id`: The current span ID
- `dd.service`: The service name (if configured in dd-trace)
- `dd.version`: The service version (if configured in dd-trace)

## Changelog

View the changelog [here](./changelogs/datadog-apm-trace-injector-changelog.md).
