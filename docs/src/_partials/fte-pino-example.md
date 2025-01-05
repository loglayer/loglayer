```javascript
// Example using the Pino logging library with LogLayer
// You can also start out with a console logger and swap to another later!
import { LogLayer } from 'loglayer';
import { pino } from 'pino';
import { PinoTransport } from '@loglayer/transport-pino';
import { redactionPlugin } from '@loglayer/plugin-redaction';

const log = new LogLayer({
  // Multiple loggers can also be used at the same time. 
  transport: new PinoTransport({
    logger: pino()
  }),
  // Plugins modify log data before it's shipped to your logging library.
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
  "level": 30,
  "time": 1735857465669,
  "msg": "[my-app] my message",
  // The placement of these fields are also configurable!
  "password": "[REDACTED]",
  "some": "data",
  "err":{
    "type": "Error",
    "message": "test",
    "stack": "Error: test\n ..."
  }
}
```
