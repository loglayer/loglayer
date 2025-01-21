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
  // Put context data in a specific field (default is flattened)
  contextFieldName: 'context',
  // Put metadata in a specific field (default is flattened)
  metadataFieldName: 'metadata',
})

// persisted data that is always included in logs
log.withContext({
  path: "/",
  reqId: "1234"
})

log.withPrefix("[my-app]")
  .withError(new Error('test'))
  // data that is included for this log entry only
  .withMetadata({ some: 'data', password: 'my-pass' })
  // Non-object data only (numbers and strings only)
  // this can be omitted to just log an object / error
  // by using .errorOnly() / .metadataOnly() instead of withError() / withMetadata()
  .info('my message')
```

```json5
{
  "level": 30,
  "time": 1735857465669,
  "msg": "[my-app] my message",
  "context": {
    "path": "/",
    "reqId": "1234",
  },
  "metadata": {
    "password": "[REDACTED]",
    "some": "data",    
  },
  "err":{
    "type": "Error",
    "message": "test",
    "stack": "Error: test\n ..."
  }
}
```
