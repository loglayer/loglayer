---
"loglayer": minor
"@loglayer/docs": minor
---

Add new options to the `ConsoleTransport`:

- `messageField`: Allows you to specify the field in the log message object where the message should be stored. This is useful when you want to log structured data and need to specify the field name for the message.
- `level`: Sets the minimum log level to process. Messages with a lower priority level will be ignored.