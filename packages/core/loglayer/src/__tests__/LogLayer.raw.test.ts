import { LogLevel } from "@loglayer/shared";
import { describe, expect, it, vi } from "vitest";
import { LogLayer } from "../LogLayer.js";
import { TestLoggingLibrary } from "../TestLoggingLibrary.js";
import { BlankTransport } from "../transports/BlankTransport.js";
import { ConsoleTransport } from "../transports/ConsoleTransport.js";
import { StructuredTransport } from "../transports/StructuredTransport.js";
import type { LogLayerConfig } from "../types/index.js";

function getLogger(config?: Partial<LogLayerConfig>) {
  const genericLogger = new TestLoggingLibrary();

  return new LogLayer({
    transport: new ConsoleTransport({
      id: "console",
      // @ts-expect-error
      logger: genericLogger,
    }),
    ...(config || {}),
  });
}

describe("raw method", () => {
  it("should log raw entry with all fields", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const testError = new Error("raw test error");
    const testMetadata = { rawMeta: "value" };
    const testContext = { rawContext: "data" };

    log.withContext(testContext);

    const rawEntry = {
      logLevel: LogLevel.info,
      messages: ["raw message", "additional param"],
      metadata: testMetadata,
      error: testError,
    };

    log.raw(rawEntry);

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [
          {
            err: testError,
            rawContext: "data",
            rawMeta: "value",
          },
          "raw message",
          "additional param",
        ],
      }),
    );
  });

  it("should log raw entry with only required fields", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    const rawEntry = {
      logLevel: LogLevel.warn,
      messages: ["minimal raw message"],
    };

    log.raw(rawEntry);

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.warn,
        data: ["minimal raw message"],
      }),
    );
  });

  it("should log raw entry with different log levels", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const levels = [LogLevel.info, LogLevel.warn, LogLevel.error, LogLevel.debug, LogLevel.trace];

    levels.forEach((level, idx) => {
      const rawEntry = {
        logLevel: level,
        messages: [`${level} raw message`, idx],
      };

      log.raw(rawEntry);

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level,
          data: [`${level} raw message`, idx],
        }),
      );
    });
  });

  it("should respect log level filtering for raw entries", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    // Set minimum level to warn
    log.setLevel(LogLevel.warn);

    // Info should be filtered out
    log.raw({
      logLevel: LogLevel.info,
      messages: ["info raw message"],
    });
    expect(genericLogger.popLine()).not.toBeDefined();

    // Warn should pass through
    log.raw({
      logLevel: LogLevel.warn,
      messages: ["warn raw message"],
    });
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.warn,
        data: ["warn raw message"],
      }),
    );

    // Error should pass through
    log.raw({
      logLevel: LogLevel.error,
      messages: ["error raw message"],
    });
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.error,
        data: ["error raw message"],
      }),
    );
  });

  it("should handle raw entry with empty messages array", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    const rawEntry = {
      logLevel: LogLevel.info,
      messages: [],
      metadata: { empty: "messages" },
    };

    log.raw(rawEntry);

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [{ empty: "messages" }],
      }),
    );
  });

  it("should handle raw entry with undefined messages", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    const rawEntry = {
      logLevel: LogLevel.info,
      metadata: { noMessages: "test" },
    };

    log.raw(rawEntry);

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [{ noMessages: "test" }],
      }),
    );
  });

  it("should apply prefix to raw entry messages", () => {
    const log = getLogger().withPrefix("[RAW]");
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    const rawEntry = {
      logLevel: LogLevel.info,
      messages: ["raw message"],
    };

    log.raw(rawEntry);

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["[RAW] raw message"],
      }),
    );
  });

  it("should pass raw entry data through plugins", () => {
    // Create a plugin that captures raw entry data
    const rawDataPlugin = {
      id: "raw-data-plugin",
      onBeforeDataOut: vi.fn((params) => {
        expect(params.metadata).toEqual({ rawMeta: "plugin test" });
        expect(params.error).toBeInstanceOf(Error);
        expect(params.error.message).toBe("raw plugin error");
        return { pluginProcessed: "raw data" };
      }),
      shouldSendToLogger: vi.fn((params) => {
        expect(params.metadata).toEqual({ rawMeta: "plugin test" });
        expect(params.error).toBeInstanceOf(Error);
        expect(params.error.message).toBe("raw plugin error");
        return true;
      }),
    };

    const mockTransport = {
      id: "raw-test-transport",
      enabled: true,
      _sendToLogger: vi.fn(),
      getLoggerInstance: () => new TestLoggingLibrary(),
    };

    const log = new LogLayer({
      transport: mockTransport as any,
      plugins: [rawDataPlugin],
    });

    const testError = new Error("raw plugin error");
    const testMetadata = { rawMeta: "plugin test" };

    const rawEntry = {
      logLevel: LogLevel.debug,
      messages: ["raw plugin message"],
      metadata: testMetadata,
      error: testError,
    };

    log.raw(rawEntry);

    // Verify plugin was called with correct parameters
    expect(rawDataPlugin.onBeforeDataOut).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: testMetadata,
        error: testError,
      }),
      expect.any(Object), // LogLayer instance
    );

    expect(rawDataPlugin.shouldSendToLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: testMetadata,
        error: testError,
      }),
      expect.any(Object), // LogLayer instance
    );

    // Verify transport received the processed data
    expect(mockTransport._sendToLogger).toHaveBeenCalledWith({
      logLevel: LogLevel.debug,
      messages: ["raw plugin message"],
      data: {
        err: testError,
        rawMeta: "plugin test",
        pluginProcessed: "raw data",
      },
      hasData: true,
      error: testError,
      metadata: testMetadata,
      context: {},
      groups: undefined,
      schema: {
        contextFieldName: undefined,
        metadataFieldName: undefined,
        errorFieldName: "err",
      },
      prefix: undefined,
    });
  });

  it("should work with multiple transports for raw entries", () => {
    const mockTransport1 = {
      id: "raw-transport1",
      enabled: true,
      _sendToLogger: vi.fn(),
      getLoggerInstance: () => new TestLoggingLibrary(),
    };

    const mockTransport2 = {
      id: "raw-transport2",
      enabled: true,
      _sendToLogger: vi.fn(),
      getLoggerInstance: () => new TestLoggingLibrary(),
    };

    const log = new LogLayer({
      transport: [mockTransport1, mockTransport2] as any,
    });

    const rawEntry = {
      logLevel: LogLevel.error,
      messages: ["multi transport raw message"],
      metadata: { multiTransport: "test" },
    };

    log.raw(rawEntry);

    const expectedParams = {
      logLevel: LogLevel.error,
      messages: ["multi transport raw message"],
      data: { multiTransport: "test" },
      hasData: true,
      error: undefined,
      metadata: { multiTransport: "test" },
      context: {},
      groups: undefined,
      schema: {
        contextFieldName: undefined,
        metadataFieldName: undefined,
        errorFieldName: "err",
      },
      prefix: undefined,
    };

    expect(mockTransport1._sendToLogger).toHaveBeenCalledWith(expectedParams);
    expect(mockTransport2._sendToLogger).toHaveBeenCalledWith(expectedParams);
  });

  it("should not log when disabled for raw entries", () => {
    const log = getLogger({ enabled: false });
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    const rawEntry = {
      logLevel: LogLevel.info,
      messages: ["disabled raw message"],
    };

    log.raw(rawEntry);
    expect(genericLogger.popLine()).not.toBeDefined();
  });

  it("should respect custom field names for error, context, and metadata", () => {
    const log = getLogger({
      errorFieldName: "customError",
      contextFieldName: "customContext",
      metadataFieldName: "customMetadata",
    });
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const testError = new Error("custom field test error");
    const testMetadata = { customMeta: "value" };
    const testContext = { customCtx: "data" };

    log.withContext(testContext);

    const rawEntry = {
      logLevel: LogLevel.warn,
      messages: ["custom field test message"],
      metadata: testMetadata,
      error: testError,
    };

    log.raw(rawEntry);

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.warn,
        data: [
          {
            customError: testError,
            customContext: testContext,
            customMetadata: testMetadata,
          },
          "custom field test message",
        ],
      }),
    );
  });

  it("should handle custom field names with same context and metadata field names", () => {
    const log = getLogger({
      errorFieldName: "customError",
      contextFieldName: "sharedField",
      metadataFieldName: "sharedField", // Same as context field name
    });
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const testError = new Error("shared field test error");
    const testMetadata = { metaKey: "metaValue" };
    const testContext = { ctxKey: "ctxValue" };

    log.withContext(testContext);

    const rawEntry = {
      logLevel: LogLevel.error,
      messages: ["shared field test message"],
      metadata: testMetadata,
      error: testError,
    };

    log.raw(rawEntry);

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.error,
        data: [
          {
            customError: testError,
            sharedField: {
              ctxKey: "ctxValue",
              metaKey: "metaValue",
            },
          },
          "shared field test message",
        ],
      }),
    );
  });

  it("should handle custom error field in metadata when errorFieldInMetadata is true", () => {
    const log = getLogger({
      errorFieldName: "customError",
      errorFieldInMetadata: true,
      metadataFieldName: "customMetadata",
    });
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const testError = new Error("error in metadata test");
    const testMetadata = { metaKey: "metaValue" };

    const rawEntry = {
      logLevel: LogLevel.info,
      messages: ["error in metadata test message"],
      metadata: testMetadata,
      error: testError,
    };

    log.raw(rawEntry);

    // When errorFieldInMetadata is true and metadata exists, the error should be placed
    // in the metadata field as specified
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [
          {
            customMetadata: {
              metaKey: "metaValue",
              customError: testError,
            },
          },
          "error in metadata test message",
        ],
      }),
    );
  });

  it("should handle custom error field in metadata when errorFieldInMetadata is true and no existing metadata", () => {
    const log = getLogger({
      errorFieldName: "customError",
      errorFieldInMetadata: true,
      metadataFieldName: "customMetadata",
    });
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const testError = new Error("error in metadata test");

    const rawEntry = {
      logLevel: LogLevel.info,
      messages: ["error in metadata test message"],
      error: testError,
    };

    log.raw(rawEntry);

    // When errorFieldInMetadata is true and no existing metadata, the error should be
    // placed in a new metadata field
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [
          {
            customMetadata: {
              customError: testError,
            },
          },
          "error in metadata test message",
        ],
      }),
    );
  });

  it("should override stored context with context from raw entry", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    // Set some stored context
    log.withContext({ storedContext: "storedValue", sharedKey: "storedValue" });

    const rawEntry = {
      logLevel: LogLevel.info,
      messages: ["context override test"],
      context: { rawContext: "rawValue", sharedKey: "rawValue" },
    };

    log.raw(rawEntry);

    // The raw entry context should override the stored context
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [
          {
            rawContext: "rawValue",
            sharedKey: "rawValue", // Should be from raw entry, not stored
          },
          "context override test",
        ],
      }),
    );

    // Verify that the stored context is restored after the raw call
    log.info("verify stored context restored");
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [
          {
            storedContext: "storedValue",
            sharedKey: "storedValue", // Should be from stored context again
          },
          "verify stored context restored",
        ],
      }),
    );
  });

  it("should not affect stored context when no context is provided in raw entry", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    // Set some stored context
    log.withContext({ storedContext: "storedValue" });

    const rawEntry = {
      logLevel: LogLevel.info,
      messages: ["no context override test"],
    };

    log.raw(rawEntry);

    // The stored context should be used since no context was provided in raw entry
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [
          {
            storedContext: "storedValue",
          },
          "no context override test",
        ],
      }),
    );
  });

  it("should override stored context with empty context object", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    // Set some stored context
    log.withContext({ storedContext: "storedValue" });

    const rawEntry = {
      logLevel: LogLevel.info,
      messages: ["empty context override test"],
      context: {}, // Empty context object
    };

    log.raw(rawEntry);

    // The empty context should override the stored context, resulting in no context data
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["empty context override test"], // No context data should be present
      }),
    );
  });

  it("should spread rootData flat at root level, bypassing metadataFieldName", () => {
    const genericLogger = new TestLoggingLibrary();
    const log = new LogLayer({
      transport: new StructuredTransport({
        // @ts-expect-error
        logger: genericLogger,
      }),
    });

    log.raw({
      logLevel: LogLevel.info,
      messages: ["rootData test"],
      metadata: { fromMeta: "yes" },
      rootData: { fromRoot: "yes" },
    });

    const line = genericLogger.popLine();
    const obj = line!.data[0];
    expect(obj.level).toBe("info");
    expect(obj.msg).toBe("rootData test");
    expect(obj.fromMeta).toBe("yes");
    expect(obj.fromRoot).toBe("yes");
  });

  it("should spread rootData flat even when metadataFieldName is set", () => {
    const genericLogger = new TestLoggingLibrary();
    const log = new LogLayer({
      transport: new StructuredTransport({
        id: "structured",
        // @ts-expect-error
        logger: genericLogger,
      }),
      metadataFieldName: "meta",
    });

    log.raw({
      logLevel: LogLevel.info,
      messages: ["rootData with metadataFieldName"],
      metadata: { fromMeta: "yes" },
      rootData: { fromRoot: "yes" },
    });

    const line = genericLogger.popLine();
    const obj = line!.data[0];
    expect(obj.meta).toEqual({ fromMeta: "yes" });
    expect(obj.fromRoot).toBe("yes");
    expect(obj.fromMeta).toBeUndefined();
  });

  it("should let rootData override same-named fields from metadata", () => {
    const genericLogger = new TestLoggingLibrary();
    const log = new LogLayer({
      transport: new StructuredTransport({
        id: "structured",
        // @ts-expect-error
        logger: genericLogger,
      }),
    });

    log.raw({
      logLevel: LogLevel.info,
      messages: ["rootData override test"],
      metadata: { sharedKey: "from-metadata" },
      rootData: { sharedKey: "from-rootdata" },
    });

    const line = genericLogger.popLine();
    const obj = line!.data[0];
    expect(obj.sharedKey).toBe("from-rootdata");
  });

  it("should spread rootData flat even when contextFieldName is set", () => {
    const genericLogger = new TestLoggingLibrary();
    const log = new LogLayer({
      transport: new StructuredTransport({
        id: "structured",
        // @ts-expect-error
        logger: genericLogger,
      }),
      contextFieldName: "ctx",
    });

    log.raw({
      logLevel: LogLevel.info,
      messages: ["rootData with contextFieldName"],
      metadata: { fromMeta: "yes" },
      rootData: { fromRoot: "yes" },
    });

    const line = genericLogger.popLine();
    const obj = line!.data[0];
    expect(obj.fromRoot).toBe("yes");
  });

  it("should let plugins redact/modify rootData fields", () => {
    const genericLogger = new TestLoggingLibrary();
    const log = new LogLayer({
      transport: new StructuredTransport({
        id: "structured",
        // @ts-expect-error
        logger: genericLogger,
      }),
      plugins: [
        {
          id: "redaction-plugin",
          onBeforeDataOut: (params) => {
            if (params.data) {
              params.data.ssn = "[REDACTED]";
              params.data.traceId = "abc-123";
            }
            return params.data;
          },
        },
      ],
    });

    log.raw({
      logLevel: LogLevel.info,
      messages: ["redaction test"],
      rootData: { userId: "user-1", ssn: "123-45-6789" },
    });

    const line = genericLogger.popLine();
    const obj = line!.data[0];
    expect(obj.ssn).toBe("[REDACTED]");
    expect(obj.traceId).toBe("abc-123");
    expect(obj.userId).toBe("user-1");
  });

  it("should preserve rootData fields when plugin doesn't touch them", () => {
    const genericLogger = new TestLoggingLibrary();
    const log = new LogLayer({
      transport: new StructuredTransport({
        id: "structured",
        // @ts-expect-error
        logger: genericLogger,
      }),
      plugins: [
        {
          id: "trace-plugin",
          onBeforeDataOut: (params) => {
            if (params.data) {
              params.data.traceId = "abc-123";
            }
            return params.data;
          },
        },
      ],
    });

    log.raw({
      logLevel: LogLevel.info,
      messages: ["preserve test"],
      rootData: { userId: "user-1", orderId: "order-42" },
    });

    const line = genericLogger.popLine();
    const obj = line!.data[0];
    expect(obj.userId).toBe("user-1");
    expect(obj.orderId).toBe("order-42");
    expect(obj.traceId).toBe("abc-123");
  });

  it("should let rootData override error field", () => {
    const genericLogger = new TestLoggingLibrary();
    const log = new LogLayer({
      transport: new StructuredTransport({
        id: "structured",
        // @ts-expect-error
        logger: genericLogger,
      }),
    });

    log.raw({
      logLevel: LogLevel.error,
      messages: ["error override test"],
      error: new Error("original error"),
      rootData: { err: "from-rootdata" },
    });

    const line = genericLogger.popLine();
    const obj = line!.data[0];
    expect(obj.err).toBe("from-rootdata");
  });

  it("should not set hasData when rootData is empty and no other data exists", () => {
    let capturedHasData: boolean | undefined;
    const log = new LogLayer({
      transport: new BlankTransport({
        shipToLogger: (params) => {
          capturedHasData = params.hasData;
          return params.messages;
        },
      }),
    });

    log.raw({
      logLevel: LogLevel.info,
      messages: ["empty rootData test"],
      rootData: {},
    });

    expect(capturedHasData).toBeFalsy();
  });

  it("should spread rootData flat when metadataFieldName equals contextFieldName", () => {
    const genericLogger = new TestLoggingLibrary();
    const log = new LogLayer({
      transport: new StructuredTransport({
        id: "structured",
        // @ts-expect-error
        logger: genericLogger,
      }),
      metadataFieldName: "meta",
      contextFieldName: "meta",
    });

    log.raw({
      logLevel: LogLevel.info,
      messages: ["same field name test"],
      metadata: { fromMeta: "yes" },
      rootData: { fromRoot: "yes" },
    });

    const line = genericLogger.popLine();
    const obj = line!.data[0];
    expect(obj.meta).toMatchObject({ fromMeta: "yes" });
    expect(obj.fromRoot).toBe("yes");
  });

  it("should let rootData override level and msg fields in StructuredTransport", () => {
    const genericLogger = new TestLoggingLibrary();
    const log = new LogLayer({
      transport: new StructuredTransport({
        id: "structured",
        // @ts-expect-error
        logger: genericLogger,
      }),
    });

    log.raw({
      logLevel: LogLevel.info,
      messages: ["actual message"],
      rootData: { level: "error", msg: "fake message" },
    });

    const line = genericLogger.popLine();
    const obj = line!.data[0];
    expect(obj.level).toBe("error");
    expect(obj.msg).toBe("fake message");
  });

  it("should not lazily evaluate rootData values", () => {
    const genericLogger = new TestLoggingLibrary();
    const log = new LogLayer({
      transport: new StructuredTransport({
        id: "structured",
        // @ts-expect-error
        logger: genericLogger,
      }),
    });

    const fn = () => "evaluated";
    log.raw({
      logLevel: LogLevel.info,
      messages: ["test"],
      rootData: { fn },
    });

    const line = genericLogger.popLine();
    const obj = line!.data[0];
    expect(obj.fn).toBe(fn);
  });

  it("should spread rootData after context and metadata in same raw() call", () => {
    const genericLogger = new TestLoggingLibrary();
    const log = new LogLayer({
      transport: new StructuredTransport({
        id: "structured",
        // @ts-expect-error
        logger: genericLogger,
      }),
      metadataFieldName: "meta",
      contextFieldName: "ctx",
    });

    log.raw({
      logLevel: LogLevel.info,
      messages: ["combo test"],
      metadata: { fromMeta: "yes", sharedKey: "from-metadata" },
      context: { fromCtx: "yes" },
      rootData: { fromRoot: "yes", sharedKey: "from-rootdata" },
    });

    const line = genericLogger.popLine();
    const obj = line!.data[0];
    expect(obj.meta).toMatchObject({ fromMeta: "yes" });
    expect(obj.ctx).toEqual({ fromCtx: "yes" });
    expect(obj.fromRoot).toBe("yes");
    // rootData sharedKey is at root level, metadata sharedKey stays inside meta
    expect(obj.sharedKey).toBe("from-rootdata");
  });

  it("should pass rootData through async resolution path", async () => {
    const genericLogger = new TestLoggingLibrary();
    const log = new LogLayer({
      transport: new StructuredTransport({
        id: "structured",
        // @ts-expect-error
        logger: genericLogger,
      }),
    });

    await log.raw({
      logLevel: LogLevel.info,
      messages: ["async rootData test"],
      metadata: { asyncMeta: Promise.resolve("resolved") },
      rootData: { fromRoot: "yes" },
    });

    const line = genericLogger.popLine();
    const obj = line!.data[0];
    expect(obj.asyncMeta).toBe("resolved");
    expect(obj.fromRoot).toBe("yes");
  });
});
