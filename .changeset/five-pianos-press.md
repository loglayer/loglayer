---
"loglayer": minor
"@loglayer/shared": minor
---

- Added new `raw()` method for advanced logging scenarios
  - Allows bypassing the normal LogLayer API to directly specify all aspects of a log entry
  - Supports complete control over log level, messages, metadata, error, and context
  - Still processes through all LogLayer features including plugins, context merging, and transport routing
  - See [Basic Logging documentation](https://loglayer.dev/logging-api/basic-logging.html#raw-logging) for usage examples

- Fixed bug where `errorFieldInMetadata` option was not working correctly
  - Error objects were not being placed in metadata fields when `errorFieldInMetadata` was set to true
  - Now properly places errors in metadata fields as specified by the configuration