# Sumo Logic Transport for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-sumo-logic)](https://www.npmjs.com/package/@loglayer/transport-sumo-logic)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Ftransport-sumo-logic)](https://www.npmjs.com/package/@loglayer/transport-sumo-logic)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

A transport to send logs to Sumo Logic via [HTTP Source](https://help.sumologic.com/docs/send-data/hosted-collectors/http-source/logs-metrics/upload-logs/) for the [LogLayer](https://loglayer.dev) logging library.

## Installation

```bash
npm install @loglayer/transport-sumo-logic serialize-error
# or
yarn add @loglayer/transport-sumo-logic serialize-error
# or
pnpm add @loglayer/transport-sumo-logic serialize-error
```

## Usage

```typescript
import { LogLayer } from "loglayer";
import { SumoLogicTransport } from "@loglayer/transport-sumo-logic";
import { serializeError } from "serialize-error";

const transport = new SumoLogicTransport({
  url: "YOUR_SUMO_LOGIC_HTTP_SOURCE_URL",
});

const logger = new LogLayer({
  errorSerializer: serializeError,
  transport
});

// Basic logging
logger.info("Hello from LogLayer!");
```

## Documentation

For more details, visit [https://loglayer.dev/transports/sumo-logic](https://loglayer.dev/transports/sumo-logic)
