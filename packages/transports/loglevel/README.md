# loglevel Transport for LogLayer

A transport for using [loglevel](https://github.com/pimterry/loglevel) with [LogLayer](https://loglayer.dev).

## Installation

```bash
npm install @loglayer/transport-loglevel loglevel
```

## Usage

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

loglayer.info('Hello world');
```

## Configuration Options

### `appendObjectData`

Controls where object data (metadata, context, errors) appears in the log messages:
- `false` (default): Object data appears as the first parameter
- `true`: Object data appears as the last parameter

Example with `appendObjectData: false` (default):
```typescript
loglayer.withMetadata({ user: 'john' }).info('User logged in');
// logger.info({ user: 'john' }, 'User logged in')
```

Example with `appendObjectData: true`:
```typescript
loglayer.withMetadata({ user: 'john' }).info('User logged in');
// logger.info('User logged in', { user: 'john' })
```

## Log Level Mapping

| LogLayer | LogLevel |
|----------|----------|
| trace    | trace    |
| debug    | debug    |
| info     | info     |
| warn     | warn     |
| error    | error    |
| fatal    | error    |
