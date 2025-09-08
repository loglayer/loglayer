---
title: loglevel Transport for LogLayer
description: Send logs to loglevel with the LogLayer logging library
---

# loglevel Transport

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-loglevel)](https://www.npmjs.com/package/@loglayer/transport-loglevel)

[loglevel](https://github.com/pimterry/loglevel) is a minimal lightweight logging library for JavaScript. It provides a simple logging API that works in both Node.js and browser environments.

[Transport Source](https://github.com/loglayer/loglayer/blob/master/packages/transports/loglevel)

## Installation

::: code-group

```sh [npm]
npm i @loglayer/transport-loglevel loglevel
```

```sh [pnpm]
pnpm add @loglayer/transport-loglevel loglevel
```

```sh [yarn]
yarn add @loglayer/transport-loglevel loglevel
```

:::

## Setup

```typescript
import { LogLayer } from 'loglayer';
import { LogLevelTransport } from '@loglayer/transport-loglevel';
import log from 'loglevel';

const logger = log.getLogger('myapp');
logger.setLevel('trace'); // Enable all log levels

const loglayer = new LogLayer({
  transport: new LogLevelTransport({
    logger,
    // Optional: control where object data appears in log messages
    appendObjectData: false // default: false - object data appears first
  })
});
```

## Configuration Options

### Required Parameters

None - all parameters are optional.

### Optional Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `appendObjectData` | `boolean` | `false` | Controls where object data (metadata, context, errors) appears in the log messages. `false`: Object data appears as the first parameter. `true`: Object data appears as the last parameter |

### Examples

#### appendObjectData: false (default)
```typescript
loglayer.withMetadata({ user: 'john' }).info('User logged in');
// logger.info({ user: 'john' }, 'User logged in')
```

#### appendObjectData: true
```typescript
loglayer.withMetadata({ user: 'john' }).info('User logged in');
// logger.info('User logged in', { user: 'john' })
```

## Log Level Mapping

| LogLayer | loglevel |
|----------|----------|
| trace    | trace    |
| debug    | debug    |
| info     | info     |
| warn     | warn     |
| error    | error    |
| fatal    | error    |

## Changelog

View the changelog [here](./changelogs/loglevel-changelog.md).

