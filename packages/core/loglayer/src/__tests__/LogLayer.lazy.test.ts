import { LogLevel } from "@loglayer/shared";
import { describe, expect, it, vi } from "vitest";
import { LogLayer } from "../LogLayer.js";
import { LAZY_EVAL_ERROR, lazy } from "../lazy.js";
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

    it("should resolve lazy values in getContext by default", () => {
      const log = getLogger();

      log.withContext({
        dynamic: lazy(() => "resolved"),
        static: "value",
      });

      // By default, returns resolved values
      const resolvedContext = log.getContext();
      expect(resolvedContext).toStrictEqual({
        dynamic: "resolved",
        static: "value",
      });

      // With raw: true, returns raw lazy wrappers
      const rawContext = log.getContext({ raw: true });
      expect(rawContext.static).toBe("value");
      expect(typeof rawContext.dynamic).toBe("object");
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

  describe("async lazy error handling", () => {
    it("should replace failed async lazy metadata value with error indicator and still log", async () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      await log
        .withMetadata({
          failing: lazy(async () => {
            throw new Error("async failure");
          }),
          ok: lazy(async () => "fine"),
        })
        .info("test");

      // Error log should be emitted first
      const errorLine = genericLogger.lines[0];
      expect(errorLine.level).toBe(LogLevel.error);
      expect(errorLine.data).toEqual(
        expect.arrayContaining([expect.stringContaining('Lazy evaluation failed for metadata key "failing"')]),
      );

      // Original log should still be sent with error indicator
      const originalLine = genericLogger.lines[1];
      expect(originalLine.level).toBe(LogLevel.info);
      expect(originalLine.data[0]).toStrictEqual(
        expect.objectContaining({
          failing: LAZY_EVAL_ERROR,
          ok: "fine",
        }),
      );
    });
  });

  describe("async lazy with plugins", () => {
    it("should pass resolved async metadata values to plugins, not Promises", async () => {
      const onBeforeDataOutSpy = vi.fn((params) => params.data);

      const log = getLogger({
        plugins: [
          {
            onBeforeDataOut: onBeforeDataOutSpy,
          },
        ],
      });

      await log
        .withMetadata({
          asyncVal: lazy(async () => "resolved-for-plugin"),
        })
        .info("test");

      expect(onBeforeDataOutSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            asyncVal: "resolved-for-plugin",
          }),
        }),
        expect.anything(),
      );
    });
  });

  describe("async lazy with metadataOnly", () => {
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
    it("should resolve async lazy values in raw entry metadata", async () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      await log.raw({
        logLevel: LogLevel.info,
        messages: ["raw test"],
        metadata: {
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

    it("should return a Promise for async lazy metadata values", () => {
      const log = getLogger();

      const result = log
        .withMetadata({
          asyncVal: lazy(async () => "async"),
        })
        .info("test");
      expect(result).toBeInstanceOf(Promise);
    });
  });
});

describe("lazy evaluation error handling", () => {
  describe("sync lazy failures", () => {
    it("should replace failed sync lazy context value with error indicator and still log", () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.withContext({
        failing: lazy(() => {
          throw new Error("sync boom");
        }),
        working: lazy(() => "ok"),
        static: "value",
      });

      log.info("test message");

      // Error log should be emitted for the failing key
      const errorLine = genericLogger.lines[0];
      expect(errorLine.level).toBe(LogLevel.error);
      expect(errorLine.data).toEqual(
        expect.arrayContaining([expect.stringContaining('Lazy evaluation failed for context key "failing"')]),
      );
      expect(errorLine.data).toEqual(expect.arrayContaining([expect.stringContaining("sync boom")]));

      // Original log should contain error indicator for failing key, resolved value for working key
      const originalLine = genericLogger.lines[1];
      expect(originalLine.level).toBe(LogLevel.info);
      expect(originalLine.data[0]).toStrictEqual(
        expect.objectContaining({
          failing: LAZY_EVAL_ERROR,
          working: "ok",
          static: "value",
        }),
      );
    });

    it("should replace failed sync lazy metadata value with error indicator and still log", () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log
        .withMetadata({
          bad: lazy(() => {
            throw new Error("meta boom");
          }),
          good: lazy(() => 42),
        })
        .info("test");

      // Error log for the failing metadata key
      const errorLine = genericLogger.lines[0];
      expect(errorLine.level).toBe(LogLevel.error);
      expect(errorLine.data).toEqual(
        expect.arrayContaining([expect.stringContaining('Lazy evaluation failed for metadata key "bad"')]),
      );

      // Original log with error indicator
      const originalLine = genericLogger.lines[1];
      expect(originalLine.level).toBe(LogLevel.info);
      expect(originalLine.data[0]).toStrictEqual(
        expect.objectContaining({
          bad: LAZY_EVAL_ERROR,
          good: 42,
        }),
      );
    });

    it("should handle multiple failing lazy values in one log call", () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.withContext({
        fail1: lazy(() => {
          throw new Error("error1");
        }),
        fail2: lazy(() => {
          throw new Error("error2");
        }),
        ok: "static",
      });

      log.info("multi-fail");

      // Two error logs + one original log = 3 lines total
      expect(genericLogger.lines).toHaveLength(3);
      expect(genericLogger.lines[0].level).toBe(LogLevel.error);
      expect(genericLogger.lines[1].level).toBe(LogLevel.error);
      expect(genericLogger.lines[2].level).toBe(LogLevel.info);
      expect(genericLogger.lines[2].data[0]).toStrictEqual(
        expect.objectContaining({
          fail1: LAZY_EVAL_ERROR,
          fail2: LAZY_EVAL_ERROR,
          ok: "static",
        }),
      );
    });
  });

  describe("async lazy metadata failures", () => {
    it("should handle rejected promise in async lazy metadata", async () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      await log
        .withMetadata({
          asyncBad: lazy(async () => {
            throw new Error("rejected");
          }),
        })
        .info("test");

      expect(genericLogger.lines).toHaveLength(2);
      expect(genericLogger.lines[0].level).toBe(LogLevel.error);
      expect(genericLogger.lines[1].data[0]).toStrictEqual(
        expect.objectContaining({
          asyncBad: LAZY_EVAL_ERROR,
        }),
      );
    });
  });

  describe("getContext error handling", () => {
    it("should replace failed sync lazy value in getContext with error indicator", () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.withContext({
        failing: lazy(() => {
          throw new Error("getContext boom");
        }),
        ok: "static",
      });

      const ctx = log.getContext();
      expect(ctx).toStrictEqual({
        failing: LAZY_EVAL_ERROR,
        ok: "static",
      });

      // Error should have been logged
      expect(genericLogger.lines).toHaveLength(1);
      expect(genericLogger.lines[0].level).toBe(LogLevel.error);
    });
  });

  describe("async lazy in context not supported", () => {
    it("should replace async lazy context values with error indicator and log warning", () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.withContext({
        asyncVal: lazy(async () => "should-not-resolve"),
        syncVal: lazy(() => "ok"),
      });

      log.info("test");

      // Error log about unsupported async lazy in context
      const errorLine = genericLogger.lines[0];
      expect(errorLine.level).toBe(LogLevel.error);
      expect(errorLine.data).toEqual(
        expect.arrayContaining([expect.stringContaining("Async lazy values are not supported in context")]),
      );

      // Original log should contain error indicator for async key, resolved sync value
      const originalLine = genericLogger.lines[1];
      expect(originalLine.level).toBe(LogLevel.info);
      expect(originalLine.data[0]).toStrictEqual(
        expect.objectContaining({
          asyncVal: LAZY_EVAL_ERROR,
          syncVal: "ok",
        }),
      );
    });

    it("should replace async lazy context values in getContext", () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.withContext({
        asyncVal: lazy(async () => "nope"),
        ok: "static",
      });

      const ctx = log.getContext();
      expect(ctx).toStrictEqual({
        asyncVal: LAZY_EVAL_ERROR,
        ok: "static",
      });

      expect(genericLogger.lines).toHaveLength(1);
      expect(genericLogger.lines[0].level).toBe(LogLevel.error);
    });
  });

  describe("error log recursion prevention", () => {
    it("should not recurse when error logging itself would trigger lazy eval", () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.withContext({
        failing: lazy(() => {
          throw new Error("boom");
        }),
      });

      // Should not throw or hang
      log.info("test");

      expect(genericLogger.lines.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("LAZY_EVAL_ERROR constant", () => {
    it("should be importable and have the expected value", () => {
      expect(LAZY_EVAL_ERROR).toBe("[LazyEvalError]");
    });
  });
});
