# tslog Transport for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-tslog)](https://www.npmjs.com/package/@loglayer/transport-tslog)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Ftransport-tslog)](https://www.npmjs.com/package/@loglayer/transport-tslog)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

[tslog](https://tslog.js.org/) provides powerful, fast and expressive logging for TypeScript and JavaScript.

## Installation

```bash
npm install loglayer @loglayer/transport-tslog tslog
```

## Usage

```typescript
import { LogLayer } from 'loglayer'
import { TracerTransport } from '@loglayer/transport-tslog'
import { Logger, ILogObj } from "tslog";

const tslog: Logger<ILogObj> = new Logger();

const log = new LogLayer({
  transport: new TsLogTransport({
    logger: tslog,
  })
})
```

## Documentation

For more details, visit [https://loglayer.dev/transports/tslog](https://loglayer.dev/transports/tslog)
