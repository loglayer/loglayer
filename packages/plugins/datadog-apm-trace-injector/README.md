# Datadog APM Trace Injector Plugin for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Fplugin-datadog-apm-trace-injector)](https://www.npmjs.com/package/@loglayer/plugin-datadog-apm-trace-injector)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Fplugin-datadog-apm-trace-injector)](https://www.npmjs.com/package/@loglayer/plugin-datadog-apm-trace-injector)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

A plugin for [LogLayer](https://loglayer.dev) that automatically injects Datadog APM trace context into your logs. This enables correlation between your application logs and distributed traces in Datadog.

## Installation

This plugin requires the [`dd-trace`](https://github.com/DataDog/dd-trace-js) library to be installed in your project:

```bash
npm install @loglayer/plugin-datadog-apm-trace-injector dd-trace
```

## Usage

```typescript
// dd-trace generally needs to be the first import of any project
// as it needs to patch node_module packages before they are imported
import tracer from 'dd-trace';
import { LogLayer } from 'loglayer';
import { datadogTraceInjectorPlugin } from '@loglayer/plugin-datadog-apm-trace-injector';

// Initialize dd-trace (must be done before any other imports)
tracer.init();

// Create the plugin
const traceInjector = datadogTraceInjectorPlugin({
  tracerInstance: tracer,
  // Enable the plugin only if the Datadog API key is set
  enabled: !!process.env.DD_API_KEY
});

// Add to your LogLayer instance
const log = new LogLayer({
  plugins: [traceInjector],
});

// Your logs will now automatically include trace context
log.info('User action completed');
```

### Configuration

The plugin accepts the following configuration options:

| Option | Type | Description |
|--------|------|-------------|
| `id` | `string` | Optional. Unique identifier for the plugin |
| `tracerInstance` | `Tracer` | Required. The dd-trace tracer instance |
| `disabled` | `boolean` | Optional. Disable the plugin |
| `onError` | `(error: Error, data?: Record<string, any>) => void` | Optional. Error handler for tracer operation failures |

## Documentation

For more details, visit [https://loglayer.dev/plugins/datadog-apm-trace-injector](https://loglayer.dev/plugins/datadog-apm-trace-injector) 
