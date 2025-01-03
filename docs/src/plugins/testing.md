---
title: Testing LogLayer Plugins
description: Learn how to write tests for your LogLayer plugins
---

# Testing Plugins

LogLayer provides a `TestTransport` and `TestLoggingLibrary` that make it easy to test your plugins. Here's an example of how to test a plugin that adds a timestamp to metadata:

```typescript
import { LogLayer, TestLoggingLibrary, TestTransport } from "loglayer";
import { describe, expect, it } from "vitest";

describe("timestamp plugin", () => {
  it("should add timestamp to metadata", () => {
    // Create a test logger to capture output
    const logger = new TestLoggingLibrary();
    
    // Create the timestamp plugin
    const timestampPlugin = {
      id: "timestamp",
      onMetadataCalled: (metadata) => ({
        ...metadata,
        timestamp: "2024-01-01T00:00:00.000Z"
      })
    };

    // Create LogLayer instance with the plugin
    const log = new LogLayer({
      transport: new TestTransport({
        logger,
      }),
      plugins: [timestampPlugin],
    });

    // Test the plugin by adding some metadata
    log.metadataOnly({
      message: "test message"
    });

    // Get the logged line and verify the timestamp was added
    const line = logger.popLine();
    expect(line.data[0].timestamp).toBe("2024-01-01T00:00:00.000Z");
    expect(line.data[0].message).toBe("test message");
  });

  it("should handle empty metadata", () => {
    const logger = new TestLoggingLibrary();
    
    const timestampPlugin = {
      id: "timestamp",
      onMetadataCalled: (metadata) => ({
        ...metadata,
        timestamp: "2024-01-01T00:00:00.000Z"
      })
    };

    const log = new LogLayer({
      transport: new TestTransport({
        logger,
      }),
      plugins: [timestampPlugin],
    });

    log.metadataOnly({});

    const line = logger.popLine();
    expect(line.data[0].timestamp).toBe("2024-01-01T00:00:00.000Z");
  });
});
```

## TestLoggingLibrary API

The `TestLoggingLibrary` provides several methods and properties to help you test your plugins:

### Properties

- `lines`: An array containing all logged lines. Each line has a `level` (`LogLevel`) and `data` (array of parameters passed to the log method).

### Methods

- `getLastLine()`: Returns the most recent log line without removing it. Returns null if no lines exist.
- `popLine()`: Returns and removes the most recent log line. Returns null if no lines exist.
- `clearLines()`: Removes all logged lines, resetting the library to its initial state.

Each logged line has the following structure:
```typescript
{
  level: LogLevel;  // The log level (info, warn, error, etc.)
  data: any[];      // Array of parameters passed to the log method
}
```