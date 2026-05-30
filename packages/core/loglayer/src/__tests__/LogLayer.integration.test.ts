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
      schema: {
        contextFieldName: undefined,
        metadataFieldName: undefined,
        errorFieldName: "err",
      },
      prefix: undefined,
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

describe("metadata, error, and context", () => {
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

    log.withContext(testContext);
    log.withError(testError).withMetadata(testMetadata).info("test message");

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
      schema: {
        contextFieldName: undefined,
        metadataFieldName: undefined,
        errorFieldName: "err",
      },
      prefix: undefined,
    });
  });

  it("should pass metadata, error, and context to multiple transports", () => {
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

    log.withContext(testContext);
    log.withError(testError).withMetadata(testMetadata).warn("multi transport message");

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
});
