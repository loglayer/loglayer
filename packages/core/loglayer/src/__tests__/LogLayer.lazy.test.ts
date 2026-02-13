import { LogLevel, lazy } from "@loglayer/shared";
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

describe("lazy evaluation", () => {
  describe("lazy context", () => {
    it("should resolve lazy values in context at log time", () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      let counter = 0;
      log.withContext({
        count: lazy(() => ++counter),
        static: "value",
      });

      log.info("first");
      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [{ count: 1, static: "value" }, "first"],
        }),
      );

      log.info("second");
      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [{ count: 2, static: "value" }, "second"],
        }),
      );
    });

    it("should not evaluate lazy context values when log level is disabled", () => {
      const log = getLogger();
      const fn = vi.fn(() => "expensive");

      log.withContext({
        value: lazy(fn),
      });

      log.disableLogging();
      log.info("should not evaluate");
      expect(fn).not.toHaveBeenCalled();

      log.enableLogging();
      log.info("should evaluate");
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should not evaluate lazy context values for disabled individual levels", () => {
      const log = getLogger();
      const fn = vi.fn(() => "expensive");

      log.withContext({
        value: lazy(fn),
      });

      log.disableIndividualLevel(LogLevel.debug);
      log.debug("should not evaluate");
      expect(fn).not.toHaveBeenCalled();

      log.info("should evaluate");
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should inherit lazy context values in child loggers", () => {
      const log = getLogger();

      let requestId = "req-1";
      log.withContext({
        requestId: lazy(() => requestId),
      });

      const child = log.child().withContext({ child: "data" });
      const childLogger = child.getLoggerInstance("console") as TestLoggingLibrary;

      child.info("from child");
      expect(childLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [{ requestId: "req-1", child: "data" }, "from child"],
        }),
      );

      // Change the variable - child should pick up the new value
      requestId = "req-2";
      child.info("updated");
      expect(childLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [{ requestId: "req-2", child: "data" }, "updated"],
        }),
      );
    });

    it("should work with context field name configuration", () => {
      const log = getLogger({ contextFieldName: "ctx" });
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.withContext({
        env: lazy(() => "production"),
      });

      log.info("test");
      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [{ ctx: { env: "production" } }, "test"],
        }),
      );
    });
  });

  describe("lazy metadata", () => {
    it("should resolve lazy values in metadata at log time", () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log
        .withMetadata({
          timestamp: lazy(() => "2024-01-01"),
          static: "value",
        })
        .info("test");

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [{ timestamp: "2024-01-01", static: "value" }, "test"],
        }),
      );
    });

    it("should not evaluate lazy metadata values when log level is disabled", () => {
      const log = getLogger();
      const fn = vi.fn(() => "expensive");

      log.disableLogging();
      log
        .withMetadata({
          value: lazy(fn),
        })
        .info("should not evaluate");

      expect(fn).not.toHaveBeenCalled();
    });

    it("should not evaluate lazy metadata values for disabled individual levels", () => {
      const log = getLogger();
      const fn = vi.fn(() => "expensive");

      log.setLevel(LogLevel.warn);
      log
        .withMetadata({
          value: lazy(fn),
        })
        .debug("should not evaluate");

      expect(fn).not.toHaveBeenCalled();
    });

    it("should resolve lazy metadata in metadataOnly", () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.metadataOnly({
        computed: lazy(() => 42),
        static: "value",
      });

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [{ computed: 42, static: "value" }],
        }),
      );
    });

    it("should not evaluate lazy metadata in metadataOnly when level is disabled", () => {
      const log = getLogger();
      const fn = vi.fn(() => "expensive");

      log.setLevel(LogLevel.warn);
      log.metadataOnly({ value: lazy(fn) }, LogLevel.info);
      expect(fn).not.toHaveBeenCalled();
    });

    it("should work with metadata field name configuration", () => {
      const log = getLogger({ metadataFieldName: "meta" });
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log
        .withMetadata({
          env: lazy(() => "production"),
        })
        .info("test");

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [{ meta: { env: "production" } }, "test"],
        }),
      );
    });
  });

  describe("lazy context and metadata combined", () => {
    it("should resolve both lazy context and lazy metadata", () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.withContext({
        reqId: lazy(() => "abc-123"),
      });

      log
        .withMetadata({
          duration: lazy(() => 150),
        })
        .info("request complete");

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [{ reqId: "abc-123", duration: 150 }, "request complete"],
        }),
      );
    });

    it("should not evaluate either lazy values when logging is disabled", () => {
      const log = getLogger();
      const contextFn = vi.fn(() => "context");
      const metadataFn = vi.fn(() => "metadata");

      log.withContext({ ctx: lazy(contextFn) });
      log.disableLogging();

      log.withMetadata({ meta: lazy(metadataFn) }).info("disabled");

      expect(contextFn).not.toHaveBeenCalled();
      expect(metadataFn).not.toHaveBeenCalled();
    });
  });

  describe("lazy with raw logging", () => {
    it("should resolve lazy values in raw entry context", () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.raw({
        logLevel: LogLevel.info,
        messages: ["raw test"],
        context: {
          dynamic: lazy(() => "resolved"),
        },
      });

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [{ dynamic: "resolved" }, "raw test"],
        }),
      );
    });

    it("should resolve lazy values in raw entry metadata", () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.raw({
        logLevel: LogLevel.info,
        messages: ["raw test"],
        metadata: {
          computed: lazy(() => 99),
        },
      });

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [{ computed: 99 }, "raw test"],
        }),
      );
    });
  });

  describe("lazy with plugins", () => {
    it("should pass resolved values to plugins", () => {
      const mockTransport = {
        id: "test-transport",
        enabled: true,
        _sendToLogger: vi.fn(),
        getLoggerInstance: () => new TestLoggingLibrary(),
      };

      const plugin = {
        id: "test-plugin",
        onBeforeDataOut: vi.fn((params) => {
          // Plugin should see resolved values, not lazy wrappers
          expect(params.context.dynamic).toBe("resolved-value");
          expect(params.metadata.computed).toBe(42);
          return params.data;
        }),
      };

      const log = new LogLayer({
        transport: mockTransport as any,
        plugins: [plugin],
      });

      log.withContext({
        dynamic: lazy(() => "resolved-value"),
      });

      log
        .withMetadata({
          computed: lazy(() => 42),
        })
        .info("plugin test");

      expect(plugin.onBeforeDataOut).toHaveBeenCalled();
    });

    it("should pass resolved context to transport", () => {
      const mockTransport = {
        id: "test-transport",
        enabled: true,
        _sendToLogger: vi.fn(),
        getLoggerInstance: () => new TestLoggingLibrary(),
      };

      const log = new LogLayer({
        transport: mockTransport as any,
      });

      log.withContext({
        dynamic: lazy(() => "resolved"),
        static: "value",
      });

      log.info("test");

      expect(mockTransport._sendToLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          context: { dynamic: "resolved", static: "value" },
        }),
      );
    });
  });

  describe("lazy edge cases", () => {
    it("should handle lazy values returning null", () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.withContext({
        nullable: lazy(() => null),
      });

      log.info("test");
      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [{ nullable: null }, "test"],
        }),
      );
    });

    it("should handle lazy values returning undefined", () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.withContext({
        undef: lazy(() => undefined),
      });

      log.info("test");
      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [{ undef: undefined }, "test"],
        }),
      );
    });

    it("should handle lazy values returning objects", () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.withContext({
        user: lazy(() => ({ id: 1, name: "test" })),
      });

      log.info("test");
      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [{ user: { id: 1, name: "test" } }, "test"],
        }),
      );
    });

    it("should resolve lazy values in getContext with evalLazy option", () => {
      const log = getLogger();

      log.withContext({
        dynamic: lazy(() => "resolved"),
        static: "value",
      });

      // Without evalLazy, returns raw lazy wrappers
      const rawContext = log.getContext();
      expect(rawContext.static).toBe("value");
      expect(typeof rawContext.dynamic).toBe("object");

      // With evalLazy, returns resolved values
      const resolvedContext = log.getContext({ evalLazy: true });
      expect(resolvedContext).toStrictEqual({
        dynamic: "resolved",
        static: "value",
      });
    });

    it("should handle context with no lazy values efficiently (no copy)", () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.withContext({
        static1: "a",
        static2: "b",
      });

      log.info("test");
      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [{ static1: "a", static2: "b" }, "test"],
        }),
      );
    });
  });
});

describe("async lazy evaluation", () => {
  describe("async lazy context", () => {
    it("should resolve async lazy values in context when awaited", async () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.withContext({
        userId: lazy(async () => "user-123"),
        static: "value",
      });

      await log.info("test");
      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [{ userId: "user-123", static: "value" }, "test"],
        }),
      );
    });

    it("should resolve async lazy values that perform actual async work", async () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.withContext({
        data: lazy(async () => {
          return new Promise((resolve) => setTimeout(() => resolve("delayed-value"), 10));
        }),
      });

      await log.info("test");
      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [{ data: "delayed-value" }, "test"],
        }),
      );
    });

    it("should not evaluate async lazy context values when log level is disabled", async () => {
      const log = getLogger({ enabled: false });
      const fn = vi.fn(async () => "should-not-run");

      log.withContext({
        value: lazy(fn),
      });

      await log.info("test");
      expect(fn).not.toHaveBeenCalled();
    });

    it("should not evaluate async lazy context when individual level is disabled", async () => {
      const log = getLogger();
      log.disableIndividualLevel(LogLevel.debug);
      const fn = vi.fn(async () => "should-not-run");

      log.withContext({
        value: lazy(fn),
      });

      await log.debug("test");
      expect(fn).not.toHaveBeenCalled();
    });

    it("should inherit async lazy context in child loggers", async () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      let counter = 0;
      log.withContext({
        count: lazy(async () => ++counter),
      });

      const child = log.child();

      await child.info("from child");
      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [{ count: 1 }, "from child"],
        }),
      );
    });
  });

  describe("async lazy metadata", () => {
    it("should resolve async lazy metadata when awaited", async () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      await log
        .withMetadata({
          result: lazy(async () => "async-result"),
        })
        .info("test");

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [{ result: "async-result" }, "test"],
        }),
      );
    });

    it("should not evaluate async lazy metadata when log level is disabled", async () => {
      const log = getLogger({ enabled: false });
      const fn = vi.fn(async () => "should-not-run");

      await log
        .withMetadata({
          value: lazy(fn),
        })
        .info("test");

      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe("mixed sync and async lazy", () => {
    it("should resolve both sync and async lazy values together", async () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.withContext({
        syncValue: lazy(() => "sync"),
        asyncValue: lazy(async () => "async"),
        static: "plain",
      });

      await log.info("test");
      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [{ syncValue: "sync", asyncValue: "async", static: "plain" }, "test"],
        }),
      );
    });

    it("should handle async context with sync metadata", async () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.withContext({
        ctxValue: lazy(async () => "async-ctx"),
      });

      await log
        .withMetadata({
          metaValue: lazy(() => "sync-meta"),
        })
        .info("test");

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [{ ctxValue: "async-ctx", metaValue: "sync-meta" }, "test"],
        }),
      );
    });
  });

  describe("async lazy error handling", () => {
    it("should handle async lazy callback that rejects", async () => {
      const log = getLogger({ consoleDebug: true });
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      log.withContext({
        failing: lazy(async () => {
          throw new Error("async failure");
        }),
      });

      await log.info("test");

      // The log should not have been sent due to the error
      expect(genericLogger.popLine()).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith("[LogLayer] Error resolving async lazy values:", expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe("async lazy with getContextAsync", () => {
    it("should resolve async lazy values via getContextAsync", async () => {
      const log = getLogger();

      log.withContext({
        asyncVal: lazy(async () => "resolved"),
        syncVal: lazy(() => "also-resolved"),
        plain: "static",
      });

      const ctx = await log.getContextAsync({ evalLazy: true });
      expect(ctx).toStrictEqual({
        asyncVal: "resolved",
        syncVal: "also-resolved",
        plain: "static",
      });
    });

    it("should return raw context when evalLazy is false", async () => {
      const log = getLogger();

      log.withContext({
        plain: "static",
      });

      const ctx = await log.getContextAsync();
      expect(ctx).toStrictEqual({
        plain: "static",
      });
    });
  });

  describe("async lazy with plugins", () => {
    it("should pass resolved values to plugins, not Promises", async () => {
      const onBeforeDataOutSpy = vi.fn((params) => params.data);

      const log = getLogger({
        plugins: [
          {
            onBeforeDataOut: onBeforeDataOutSpy,
          },
        ],
      });
      const _genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.withContext({
        asyncVal: lazy(async () => "resolved-for-plugin"),
      });

      await log.info("test");

      expect(onBeforeDataOutSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            asyncVal: "resolved-for-plugin",
          }),
        }),
        expect.anything(),
      );
    });
  });

  describe("async lazy with errorOnly and metadataOnly", () => {
    it("should resolve async lazy context in errorOnly", async () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.withContext({
        reqId: lazy(async () => "req-456"),
      });

      await log.errorOnly(new Error("test error"));
      const line = genericLogger.popLine();
      expect(line).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.error,
        }),
      );
      // Context should contain the resolved async value
      expect(line?.data?.[0]).toStrictEqual(
        expect.objectContaining({
          reqId: "req-456",
        }),
      );
    });

    it("should resolve async lazy metadata in metadataOnly", async () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      await log.metadataOnly({
        asyncMeta: lazy(async () => "meta-value"),
      });

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [{ asyncMeta: "meta-value" }],
        }),
      );
    });
  });

  describe("async lazy with raw", () => {
    it("should resolve async lazy values in raw entries", async () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      await log.raw({
        logLevel: LogLevel.info,
        messages: ["raw test"],
        context: {
          rawAsync: lazy(async () => "raw-resolved"),
        },
      });

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [{ rawAsync: "raw-resolved" }, "raw test"],
        }),
      );
    });
  });

  describe("backward compatibility", () => {
    it("should work without await for sync lazy values (unchanged behavior)", () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.withContext({
        syncVal: lazy(() => "sync"),
      });

      // No await - should work synchronously as before
      log.info("test");
      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [{ syncVal: "sync" }, "test"],
        }),
      );
    });

    it("should return void for sync lazy values (no Promise)", () => {
      const log = getLogger();

      log.withContext({
        syncVal: lazy(() => "sync"),
      });

      const result = log.info("test");
      expect(result).toBeUndefined();
    });

    it("should return a Promise for async lazy values", () => {
      const log = getLogger();

      log.withContext({
        asyncVal: lazy(async () => "async"),
      });

      const result = log.info("test");
      expect(result).toBeInstanceOf(Promise);
    });
  });
});
