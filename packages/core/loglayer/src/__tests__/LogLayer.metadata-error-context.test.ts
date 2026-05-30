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
      schema: {
        contextFieldName: undefined,
        metadataFieldName: undefined,
        errorFieldName: "err",
      },
      prefix: undefined,
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
