import { LogLevel } from "@loglayer/shared";
import { describe, expect, it, vi } from "vitest";
import { LogLayer } from "../LogLayer.js";
import { TestLoggingLibrary } from "../TestLoggingLibrary.js";
import { ConsoleTransport } from "../transports/ConsoleTransport.js";
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

describe("LogLayer basic functionality", () => {
  it("should assign a prefix to messages", () => {
    const log = getLogger().withPrefix("[testing]");
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const levels = ["info", "warn", "error", "debug", "trace"];

    levels.forEach((level, idx) => {
      log[level](`${level} message`, idx);

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level,
          data: [`[testing] ${level} message`, idx],
        }),
      );
    });
  });

  it("should create a child transport with only the original configuration and context", () => {
    const origLog = getLogger().withContext({
      test: "context",
    });

    const parentGenericLogger = origLog.getLoggerInstance("console") as TestLoggingLibrary;

    // Add additional context to the child transport
    const childLog = origLog.child().withContext({
      child: "childData",
    });

    childLog.info("test");

    const childGenericLogger = childLog.getLoggerInstance("console") as TestLoggingLibrary;

    expect(childGenericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [
          {
            test: "context",
            child: "childData",
          },
          "test",
        ],
      }),
    );

    // make sure the parent transport doesn't have the additional context of the child
    origLog
      .withContext({
        parentContext: "test-2",
      })
      .info("parent-test");

    expect(parentGenericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [
          {
            test: "context",
            parentContext: "test-2",
          },
          "parent-test",
        ],
      }),
    );
  });

  it("should write messages", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const levels = ["info", "warn", "error", "debug", "trace"];

    levels.forEach((level, idx) => {
      log[level](`${level} message`, idx);

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level,
          data: [`${level} message`, idx],
        }),
      );
    });
  });

  it("should toggle log output", () => {
    const log = getLogger({ enabled: false });
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    log.info("test");
    expect(genericLogger.popLine()).not.toBeDefined();

    log.enableLogging();
    log.info("test");
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: "info",
        data: ["test"],
      }),
    );

    log.disableLogging();
    log.info("test");
    expect(genericLogger.popLine()).not.toBeDefined();

    // Test LogBuilder
    log.enableLogging();
    log.withMetadata({}).disableLogging().info("test");
    expect(genericLogger.popLine()).not.toBeDefined();

    // This doesn't immediately enable log output
    log.withMetadata({}).enableLogging().info("test");

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: "info",
        data: [{}, "test"],
      }),
    );
  });

  it("should include context", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const levels = ["info", "warn", "error", "debug", "trace"];

    log.withContext({
      sample: "data",
    });

    levels.forEach((level, idx) => {
      log[level](`${level} message`, idx);

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level,
          data: [{ sample: "data" }, `${level} message`, idx],
        }),
      );
    });
  });

  it("should clear context", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const levels = ["info", "warn", "error", "debug", "trace"];

    log.withContext({
      sample: "data",
    });

    log.clearContext();

    levels.forEach((level, idx) => {
      log[level](`${level} message`, idx);

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level,
          data: [`${level} message`, idx],
        }),
      );
    });
  });

  it("should clear specific context keys with a single string", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    log.withContext({
      sample: "data",
      other: "value",
      keep: "this",
    });

    log.clearContext("sample");

    log.info("test message");
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: "info",
        data: [{ other: "value", keep: "this" }, "test message"],
      }),
    );
  });

  it("should clear specific context keys with an array", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    log.withContext({
      sample: "data",
      other: "value",
      keep: "this",
    });

    log.clearContext(["sample", "other"]);

    log.info("test message");
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: "info",
        data: [{ keep: "this" }, "test message"],
      }),
    );
  });

  it("should return this for method chaining when clearing context", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    log
      .withContext({
        sample: "data",
        other: "value",
      })
      .clearContext("sample")
      .info("test message");

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: "info",
        data: [{ other: "value" }, "test message"],
      }),
    );
  });

  it("should ignore empty context", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    log.withContext().info("test");
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: "info",
        data: ["test"],
      }),
    );
  });

  it("should include metadata with a message", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const levels = ["info", "warn", "error", "debug", "trace"];

    levels.forEach((level, idx) => {
      log
        .withMetadata({
          index: idx,
        })
        [level](`${level} message`, idx);

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level,
          data: [{ index: idx }, `${level} message`, idx],
        }),
      );
    });
  });

  it("should ignore empty metadata", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    log.withMetadata().info("test");
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: "info",
        data: ["test"],
      }),
    );

    log.metadataOnly();
    expect(genericLogger.popLine()).not.toBeDefined();
  });

  it("should include an error with a message", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const levels = ["info", "warn", "error", "debug", "trace"];

    levels.forEach((level, idx) => {
      const e = new Error("test");

      log.withError(e)[level](`${level} message`, idx);

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level,
          data: [{ err: e }, `${level} message`, idx],
        }),
      );
    });
  });

  describe("errorOnly", () => {
    it("should log only an error", () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
      const e = new Error("err");
      log.errorOnly(e);

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.error,
          data: [
            {
              err: e,
            },
          ],
        }),
      );
    });

    it("should copy the error message as the log message", () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
      const e = new Error("error message");

      log.errorOnly(e, {
        logLevel: LogLevel.info,
        copyMsg: true,
      });

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [
            {
              err: e,
            },
            "error message",
          ],
        }),
      );
    });
  });

  it("should log only metadata", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    log.metadataOnly({
      only: "metadata",
    });

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [
          {
            only: "metadata",
          },
        ],
      }),
    );

    log.metadataOnly(
      {
        only: "trace metadata",
      },
      LogLevel.trace,
    );

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.trace,
        data: [
          {
            only: "trace metadata",
          },
        ],
      }),
    );
  });

  it("should combine an error, metadata, and context", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const e = new Error("err");

    log.withContext({
      contextual: "data",
    });

    log
      .withError(e)
      .withMetadata({
        situational: 1234,
      })
      .info("combined data");

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [
          {
            err: e,
            contextual: "data",
            situational: 1234,
          },
          "combined data",
        ],
      }),
    );
  });

  it("should pass metadata, error, and context to transport with proper structure", () => {
    // Create a mock transport that captures the parameters passed to _sendToLogger
    const mockTransport = {
      id: "test-transport",
      enabled: true,
      _sendToLogger: vi.fn(),
      getLoggerInstance: () => new TestLoggingLibrary(),
    };

    const log = new LogLayer({
      transport: mockTransport as any,
    });

    const testError = new Error("test error");
    const testMetadata = { metaKey: "metaValue", nested: { data: "value" } };
    const testContext = { contextKey: "contextValue", user: { id: 123 } };

    // Set up context and log with error and metadata
    log.withContext(testContext);
    log.withError(testError).withMetadata(testMetadata).info("test message");

    // Verify that _sendToLogger was called with the correct parameters
    expect(mockTransport._sendToLogger).toHaveBeenCalledWith({
      logLevel: LogLevel.info,
      messages: ["test message"],
      data: {
        err: testError,
        contextKey: "contextValue",
        user: { id: 123 },
        metaKey: "metaValue",
        nested: { data: "value" },
      },
      hasData: true,
      error: testError,
      metadata: testMetadata,
      context: testContext,
    });
  });

  it("should pass metadata, error, and context to multiple transports", () => {
    // Create mock transports that capture the parameters
    const mockTransport1 = {
      id: "transport1",
      enabled: true,
      _sendToLogger: vi.fn(),
      getLoggerInstance: () => new TestLoggingLibrary(),
    };

    const mockTransport2 = {
      id: "transport2",
      enabled: true,
      _sendToLogger: vi.fn(),
      getLoggerInstance: () => new TestLoggingLibrary(),
    };

    const log = new LogLayer({
      transport: [mockTransport1, mockTransport2] as any,
    });

    const testError = new Error("multi transport error");
    const testMetadata = { transportMeta: "data" };
    const testContext = { transportContext: "info" };

    // Set up context and log with error and metadata
    log.withContext(testContext);
    log.withError(testError).withMetadata(testMetadata).warn("multi transport message");

    // Verify both transports received the correct parameters
    const expectedParams = {
      logLevel: LogLevel.warn,
      messages: ["multi transport message"],
      data: {
        err: testError,
        transportContext: "info",
        transportMeta: "data",
      },
      hasData: true,
      error: testError,
      metadata: testMetadata,
      context: testContext,
    };

    expect(mockTransport1._sendToLogger).toHaveBeenCalledWith(expectedParams);
    expect(mockTransport2._sendToLogger).toHaveBeenCalledWith(expectedParams);
  });

  describe("integration tests for metadata, error, and context flow", () => {
    it("should pass metadata, error, and context through plugins to transports", () => {
      // Create a plugin that modifies data and captures parameters
      const dataModificationPlugin = {
        id: "data-modifier",
        onBeforeDataOut: vi.fn((params) => {
          // Verify the plugin receives the correct parameters
          expect(params.metadata).toEqual({ originalMeta: "value" });
          expect(params.error).toBeInstanceOf(Error);
          expect(params.error.message).toBe("integration test error");
          expect(params.context).toEqual({ originalContext: "data" });

          // Modify the data
          return { pluginAdded: "data" };
        }),
        shouldSendToLogger: vi.fn((params) => {
          // Verify the plugin receives the correct parameters in shouldSendToLogger
          expect(params.metadata).toEqual({ originalMeta: "value" });
          expect(params.error).toBeInstanceOf(Error);
          expect(params.error.message).toBe("integration test error");
          expect(params.context).toEqual({ originalContext: "data" });
          expect(params.transportId).toBe("integration-transport");

          return true;
        }),
      };

      // Create a mock transport that captures the final parameters
      const mockTransport = {
        id: "integration-transport",
        enabled: true,
        _sendToLogger: vi.fn(),
        getLoggerInstance: () => new TestLoggingLibrary(),
      };

      const log = new LogLayer({
        transport: mockTransport as any,
        plugins: [dataModificationPlugin],
      });

      const testError = new Error("integration test error");
      const testMetadata = { originalMeta: "value" };
      const testContext = { originalContext: "data" };

      // Set up context and log with error and metadata
      log.withContext(testContext);
      log.withError(testError).withMetadata(testMetadata).info("integration test message");

      // Verify the plugin was called with correct parameters
      expect(dataModificationPlugin.onBeforeDataOut).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: testMetadata,
          error: testError,
          context: testContext,
        }),
        expect.any(Object), // LogLayer instance
      );

      expect(dataModificationPlugin.shouldSendToLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: testMetadata,
          error: testError,
          context: testContext,
          transportId: "integration-transport",
        }),
        expect.any(Object), // LogLayer instance
      );

      // Verify the transport received the modified data plus original parameters
      expect(mockTransport._sendToLogger).toHaveBeenCalledWith({
        logLevel: LogLevel.info,
        messages: ["integration test message"],
        data: {
          err: testError,
          originalContext: "data",
          originalMeta: "value",
          pluginAdded: "data", // Added by plugin
        },
        hasData: true,
        error: testError,
        metadata: testMetadata,
        context: testContext,
      });
    });

    it("should handle metadata, error, and context with multiple plugins", () => {
      // Create multiple plugins that each modify data
      const plugin1 = {
        id: "plugin1",
        onBeforeDataOut: vi.fn((params) => {
          expect(params.metadata).toEqual({ meta: "test" });
          expect(params.error).toBeInstanceOf(Error);
          expect(params.context).toEqual({ ctx: "test" });
          return { plugin1Data: "added" };
        }),
      };

      const plugin2 = {
        id: "plugin2",
        onBeforeDataOut: vi.fn((params) => {
          expect(params.metadata).toEqual({ meta: "test" });
          expect(params.error).toBeInstanceOf(Error);
          expect(params.context).toEqual({ ctx: "test" });
          return { plugin2Data: "added" };
        }),
        shouldSendToLogger: vi.fn((params) => {
          expect(params.metadata).toEqual({ meta: "test" });
          expect(params.error).toBeInstanceOf(Error);
          expect(params.context).toEqual({ ctx: "test" });
          return true;
        }),
      };

      const mockTransport = {
        id: "multi-plugin-transport",
        enabled: true,
        _sendToLogger: vi.fn(),
        getLoggerInstance: () => new TestLoggingLibrary(),
      };

      const log = new LogLayer({
        transport: mockTransport as any,
        plugins: [plugin1, plugin2],
      });

      const testError = new Error("multi plugin error");
      const testMetadata = { meta: "test" };
      const testContext = { ctx: "test" };

      log.withContext(testContext);
      log.withError(testError).withMetadata(testMetadata).debug("multi plugin message");

      // Verify both plugins were called
      expect(plugin1.onBeforeDataOut).toHaveBeenCalled();
      expect(plugin2.onBeforeDataOut).toHaveBeenCalled();
      expect(plugin2.shouldSendToLogger).toHaveBeenCalled();

      // Verify the transport received data from both plugins
      expect(mockTransport._sendToLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            err: testError,
            ctx: "test",
            meta: "test",
            plugin1Data: "added",
            plugin2Data: "added",
          }),
          error: testError,
          metadata: testMetadata,
          context: testContext,
        }),
      );
    });

    it("should preserve metadata, error, and context when plugins return null", () => {
      const nullReturningPlugin = {
        id: "null-plugin",
        onBeforeDataOut: vi.fn((params) => {
          expect(params.metadata).toEqual({ meta: "preserved" });
          expect(params.error).toBeInstanceOf(Error);
          expect(params.context).toEqual({ ctx: "preserved" });
          return null; // Plugin returns null
        }),
      };

      const mockTransport = {
        id: "null-test-transport",
        enabled: true,
        _sendToLogger: vi.fn(),
        getLoggerInstance: () => new TestLoggingLibrary(),
      };

      const log = new LogLayer({
        transport: mockTransport as any,
        plugins: [nullReturningPlugin],
      });

      const testError = new Error("null test error");
      const testMetadata = { meta: "preserved" };
      const testContext = { ctx: "preserved" };

      log.withContext(testContext);
      log.withError(testError).withMetadata(testMetadata).error("null test message");

      // Verify plugin was called
      expect(nullReturningPlugin.onBeforeDataOut).toHaveBeenCalled();

      // Verify transport still received the original metadata, error, and context
      expect(mockTransport._sendToLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            err: testError,
            ctx: "preserved",
            meta: "preserved",
          }),
          error: testError,
          metadata: testMetadata,
          context: testContext,
        }),
      );
    });
  });

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
  });

  describe("log level management", () => {
    it("should enable individual log levels", () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      // Disable all log levels first
      log.disableLogging();

      // Verify logging is disabled
      log.info("test info");
      expect(genericLogger.popLine()).not.toBeDefined();

      // Enable just the info level
      log.enableIndividualLevel(LogLevel.info);

      // Info should now work
      log.info("test info");
      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: ["test info"],
        }),
      );

      // But other levels should still be disabled
      log.warn("test warn");
      expect(genericLogger.popLine()).not.toBeDefined();

      log.error("test error");
      expect(genericLogger.popLine()).not.toBeDefined();
    });

    it("should disable individual log levels", () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      // Start with all levels enabled
      log.enableLogging();

      // Disable just the warn level
      log.disableIndividualLevel(LogLevel.warn);

      // Warn should be disabled
      log.warn("test warn");
      expect(genericLogger.popLine()).not.toBeDefined();

      // Other levels should still work
      log.info("test info");
      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: ["test info"],
        }),
      );

      log.error("test error");
      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.error,
          data: ["test error"],
        }),
      );
    });

    it("should set minimum log level", () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      // Set minimum level to warn
      log.setLevel(LogLevel.warn);

      // Info and debug should be disabled
      log.info("test info");
      expect(genericLogger.popLine()).not.toBeDefined();

      log.debug("test debug");
      expect(genericLogger.popLine()).not.toBeDefined();

      // Warn, error and fatal should be enabled
      log.warn("test warn");
      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.warn,
          data: ["test warn"],
        }),
      );

      log.error("test error");
      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.error,
          data: ["test error"],
        }),
      );

      log.fatal("test fatal");
      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          // console logger does not have a fatal level
          level: LogLevel.error,
          data: ["test fatal"],
        }),
      );
    });

    it("should correctly report if a level is enabled", () => {
      const log = getLogger();

      // Start with all levels enabled
      log.enableLogging();

      expect(log.isLevelEnabled(LogLevel.info)).toBe(true);
      expect(log.isLevelEnabled(LogLevel.warn)).toBe(true);
      expect(log.isLevelEnabled(LogLevel.error)).toBe(true);
      expect(log.isLevelEnabled(LogLevel.debug)).toBe(true);
      expect(log.isLevelEnabled(LogLevel.trace)).toBe(true);
      expect(log.isLevelEnabled(LogLevel.fatal)).toBe(true);

      // Disable specific levels
      log.disableIndividualLevel(LogLevel.debug);
      log.disableIndividualLevel(LogLevel.info);

      expect(log.isLevelEnabled(LogLevel.info)).toBe(false);
      expect(log.isLevelEnabled(LogLevel.warn)).toBe(true);
      expect(log.isLevelEnabled(LogLevel.error)).toBe(true);
      expect(log.isLevelEnabled(LogLevel.debug)).toBe(false);
      expect(log.isLevelEnabled(LogLevel.trace)).toBe(true);
      expect(log.isLevelEnabled(LogLevel.fatal)).toBe(true);

      // Set minimum level to error
      log.setLevel(LogLevel.error);

      expect(log.isLevelEnabled(LogLevel.info)).toBe(false);
      expect(log.isLevelEnabled(LogLevel.warn)).toBe(false);
      expect(log.isLevelEnabled(LogLevel.error)).toBe(true);
      expect(log.isLevelEnabled(LogLevel.debug)).toBe(false);
      expect(log.isLevelEnabled(LogLevel.trace)).toBe(false);
      expect(log.isLevelEnabled(LogLevel.fatal)).toBe(true);
    });

    it("should chain log level methods", () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      // Chain multiple operations
      log.disableLogging().enableIndividualLevel(LogLevel.error).enableIndividualLevel(LogLevel.fatal);

      // Debug should be disabled
      log.debug("test debug");
      expect(genericLogger.popLine()).not.toBeDefined();

      // Error should be enabled
      log.error("test error");
      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.error,
          data: ["test error"],
        }),
      );

      // Chain with other methods
      log.setLevel(LogLevel.warn).withMetadata({ test: "data" }).warn("test with chain");

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.warn,
          data: [{ test: "data" }, "test with chain"],
        }),
      );
    });
  });
});
