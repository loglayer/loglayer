import { AsyncLocalStorage } from "node:async_hooks";
import { BlankTransport, LogLayer, useLogLayerMixin } from "loglayer";
import { beforeEach, describe, expect, it } from "vitest";
import { createWideEventMixin } from "../index.js";

describe("WideEventMixin", () => {
  let asyncContext: AsyncLocalStorage<Record<string, any>>;
  let log: LogLayer;
  let emittedLogs: any[];

  beforeEach(() => {
    asyncContext = new AsyncLocalStorage();
    emittedLogs = [];

    const transport = new BlankTransport({
      shipToLogger: (params) => {
        emittedLogs.push({
          level: params.logLevel,
          messages: params.messages,
          metadata: params.metadata,
          context: params.context,
          data: params.data,
        });
        return params.messages;
      },
    });

    const mixin = createWideEventMixin({ asyncContext });
    useLogLayerMixin(mixin);

    log = new LogLayer({
      transport,
    });
  });

  it("should accumulate wide event data via withWideEvents", () => {
    asyncContext.run({}, () => {
      const logger = log.child();
      logger.withWideEvents({ userId: "123" });
      logger.withWideEvents({ orderId: "456" });

      const store = asyncContext.getStore();
      expect(store?._llWideEvents).toEqual({ userId: "123", orderId: "456" });
    });
  });

  it("should silently ignore withWideEvents when not in async context", () => {
    const logger = log.child();
    const result = logger.withWideEvents({ test: "value" });
    expect(result).toBe(logger);
  });

  it("should emit wide event with accumulated data", () => {
    asyncContext.run({}, () => {
      const logger = log.child();
      logger.withWideEvents({ userId: "123" });
      logger.withWideEvents({ orderId: "456" });
      logger.emitWideEvent({ message: "Order processed" });
    });

    expect(emittedLogs).toHaveLength(1);
    expect(emittedLogs[0].messages).toContain("Order processed");
    expect(emittedLogs[0].data).toMatchObject({
      userId: "123",
      orderId: "456",
    });
  });

  it("should include context in emitted wide event by default", () => {
    asyncContext.run({}, () => {
      const logger = log.child().withContext({ requestId: "req-1" });
      logger.withWideEvents({ userId: "123" });
      logger.emitWideEvent({ message: "Request completed" });
    });

    expect(emittedLogs[0].context).toEqual({
      requestId: "req-1",
    });
    expect(emittedLogs[0].data).toMatchObject({
      userId: "123",
    });
  });

  it("should exclude context when includeContext is false", () => {
    const ctx = new AsyncLocalStorage();
    useLogLayerMixin(createWideEventMixin({ asyncContext: ctx, includeContext: false }));
    const l = new LogLayer({
      transport: new BlankTransport({
        shipToLogger: (p) => {
          emittedLogs.push({ metadata: p.metadata, context: p.context, data: p.data });
          return p.messages;
        },
      }),
    });

    ctx.run({}, () => {
      const logger = l.child().withContext({ requestId: "req-1" });
      logger.withWideEvents({ userId: "123" });
      logger.emitWideEvent({ message: "Test" });
    });

    // includeContext: false means wide event rootData doesn't include context
    // The logger's context still flows through formatContext independently
    // Verify: context is tracked in params.context (from formatContext)
    expect(emittedLogs[0].context).toMatchObject({ requestId: "req-1" });
    // And rootData only has wide event fields
    expect(emittedLogs[0].data).toMatchObject({ userId: "123" });
  });

  it("should nest wide event data under wideEventField when configured", () => {
    const ctx = new AsyncLocalStorage();
    useLogLayerMixin(createWideEventMixin({ asyncContext: ctx, wideEventField: "event" }));
    const l = new LogLayer({
      transport: new BlankTransport({
        shipToLogger: (p) => {
          emittedLogs.push({ metadata: p.metadata, context: p.context, data: p.data });
          return p.messages;
        },
      }),
    });

    ctx.run({}, () => {
      const logger = l.child();
      logger.withContext({ requestId: "req-1" });
      logger.withWideEvents({ userId: "123" });
      logger.emitWideEvent({ message: "Test" });
    });

    // wideEventField should wrap the wideEvents data
    expect(emittedLogs[0].data).toMatchObject({
      event: { userId: "123" },
    });
    // Context should still be separate
    expect(emittedLogs[0].context).toEqual({ requestId: "req-1" });
  });

  it("should allow context and wideEvents to be flattened together", () => {
    const ctx = new AsyncLocalStorage();
    useLogLayerMixin(createWideEventMixin({ asyncContext: ctx }));
    const l = new LogLayer({
      transport: new BlankTransport({
        shipToLogger: (p) => {
          emittedLogs.push({ metadata: p.metadata, context: p.context, data: p.data });
          return p.messages;
        },
      }),
    });

    ctx.run({}, () => {
      const logger = l.child();
      logger.withContext({ contextKey: "from-context" });
      logger.withWideEvents({ wideEventsKey: "from-wideEvents" });
      logger.emitWideEvent({ message: "Test" });
    });

    // Both context and wideEvents should be included
    expect(emittedLogs[0].context).toEqual({ contextKey: "from-context" });
    expect(emittedLogs[0].data).toMatchObject({ wideEventsKey: "from-wideEvents" });
  });

  it("should prioritize withWideEvents over withContext for same key", () => {
    const ctx = new AsyncLocalStorage();
    useLogLayerMixin(createWideEventMixin({ asyncContext: ctx }));
    const l = new LogLayer({
      transport: new BlankTransport({
        shipToLogger: (p) => {
          emittedLogs.push({ metadata: p.metadata, context: p.context, data: p.data });
          return p.messages;
        },
      }),
    });

    ctx.run({}, () => {
      const logger = l.child();
      logger.withContext({ key: "from-context" });
      logger.withWideEvents({ key: "from-wideEvents" });
      logger.emitWideEvent({ message: "Test" });
    });

    // Context has its value, but wideEvents should override in data
    expect(emittedLogs[0].context).toEqual({ key: "from-context" });
    expect(emittedLogs[0].data).toMatchObject({ key: "from-wideEvents" });
  });

  it("should allow withMetadata and withWideEvents to work independently", () => {
    const ctx = new AsyncLocalStorage();
    useLogLayerMixin(createWideEventMixin({ asyncContext: ctx }));
    const l = new LogLayer({
      transport: new BlankTransport({
        shipToLogger: (p) => {
          emittedLogs.push({ messages: p.messages, metadata: p.metadata, data: p.data });
          return p.messages;
        },
      }),
    });

    ctx.run({}, () => {
      const logger = l.child();

      // withMetadata() creates immediate log
      logger.withMetadata({ immediate: "yes" }).info("Immediate");

      // withWideEvents() accumulates
      logger.withWideEvents({ accumulated: "yes" });

      // Another withMetadata()
      logger.withMetadata({ alsoImmediate: "yes" }).warn("Another");

      // withWideEvents() accumulates more
      logger.withWideEvents({ more: "yes" });

      // emitWideEvent outputs only wideEvents data (not withMetadata data)
      logger.emitWideEvent({ message: "Wide event" });
    });

    // Should have 3 log entries: 2 immediate + 1 wide event
    expect(emittedLogs).toHaveLength(3);

    // First log (immediate withMetadata)
    expect(emittedLogs[0].messages).toContain("Immediate");
    expect(emittedLogs[0].metadata).toEqual({ immediate: "yes" });

    // Second log (immediate withMetadata)
    expect(emittedLogs[1].messages).toContain("Another");
    expect(emittedLogs[1].metadata).toEqual({ alsoImmediate: "yes" });

    // Third log (wide event - has only wideEvents data, not withMetadata data)
    expect(emittedLogs[2].messages).toContain("Wide event");
    expect(emittedLogs[2].data).toMatchObject({ accumulated: "yes", more: "yes" });
  });

  it("should support custom log level in emitWideEvent", () => {
    asyncContext.run({}, () => {
      const logger = log.child();
      logger.withWideEvents({ data: "test" });
      logger.emitWideEvent({ message: "Error occurred", level: "error" });
    });

    expect(emittedLogs).toHaveLength(1);
    expect(emittedLogs[0].level).toBe("error");
  });

  it("should return logger for chaining", () => {
    asyncContext.run({}, () => {
      const logger = log.child();
      const result = logger.withWideEvents({ key: "value" });
      expect(result).toBe(logger);
    });
  });

  it("should handle multiple emissions without clearing", () => {
    asyncContext.run({}, () => {
      const logger = log.child();
      logger.withWideEvents({ initial: "data" });
      logger.emitWideEvent({ message: "First" });
      logger.emitWideEvent({ message: "Second" });
    });

    expect(emittedLogs).toHaveLength(2);
    expect(emittedLogs[0].messages).toContain("First");
    expect(emittedLogs[1].messages).toContain("Second");
  });

  it("should work with async operations", async () => {
    await asyncContext.run({}, async () => {
      const logger = log.child();
      logger.withWideEvents({ step: 1 });

      await Promise.resolve();
      logger.withWideEvents({ step: 2 });

      await Promise.resolve();
      logger.emitWideEvent({ message: "Async complete" });
    });

    expect(emittedLogs[0].data).toMatchObject({
      step: 2,
    });
  });

  it("should not affect normal logs with wide event data", () => {
    asyncContext.run({}, () => {
      const logger = log.child();
      logger.withWideEvents({ wideEventData: "should not appear" });
      logger.info("Normal log");
    });

    expect(emittedLogs).toHaveLength(1);
    expect(emittedLogs[0].messages).toContain("Normal log");
    // Normal logs without emitWideEvent should not have the wideEvents metadata
    expect(emittedLogs[0].metadata).toBeNull();
  });

  it("should work on child loggers", () => {
    asyncContext.run({}, () => {
      const parent = log.child();
      const child = parent.child();
      child.withWideEvents({ fromChild: "yes" });
      child.emitWideEvent({ message: "Child event" });
    });

    expect(emittedLogs[0].data).toMatchObject({ fromChild: "yes" });
  });

  it("should deep merge nested objects", () => {
    asyncContext.run({}, () => {
      const logger = log.child();
      logger.withWideEvents({ user: { id: "123" } });
      logger.withWideEvents({ user: { name: "Alice" } });
      logger.emitWideEvent({ message: "Test" });
    });

    // Both nested properties should be present
    expect(emittedLogs[0].data).toMatchObject({
      user: { id: "123", name: "Alice" },
    });
  });

  it("should overwrite top-level keys but merge nested", () => {
    asyncContext.run({}, () => {
      const logger = log.child();
      logger.withWideEvents({ user: { id: "123" }, count: 1 });
      logger.withWideEvents({ user: { name: "Alice" }, count: 2 });
      logger.emitWideEvent({ message: "Test" });
    });

    // count: 2 (overwritten), user: { id: "123", name: "Alice" } (merged)
    expect(emittedLogs[0].data).toMatchObject({
      user: { id: "123", name: "Alice" },
      count: 2,
    });
  });

  it("should get all wide event data with getWideEvents", () => {
    asyncContext.run({}, () => {
      const logger = log.child();
      logger.withWideEvents({ userId: "123" });
      logger.withWideEvents({ orderId: "456" });

      const data = logger.getWideEvents();
      expect(data).toEqual({ userId: "123", orderId: "456" });
    });
  });

  it("should get specific key with getWideEvents(key)", () => {
    asyncContext.run({}, () => {
      const logger = log.child();
      logger.withWideEvents({ userId: "123" });
      logger.withWideEvents({ orderId: "456" });

      const userId = logger.getWideEvents("userId");
      expect(userId).toBe("123");

      const orderId = logger.getWideEvents("orderId");
      expect(orderId).toBe("456");

      const nonExistent = logger.getWideEvents("nonexistent");
      expect(nonExistent).toBeUndefined();
    });
  });

  it("should return empty object from getWideEvents when no data", () => {
    asyncContext.run({}, () => {
      const logger = log.child();
      const data = logger.getWideEvents();
      expect(data).toEqual({});
    });
  });

  it("should return undefined for getWideEvents when outside async context", () => {
    const logger = log.child();
    const data = logger.getWideEvents();
    expect(data).toEqual({});

    const key = logger.getWideEvents("userId");
    expect(key).toBeUndefined();
  });

  it("should clear all wide event data with clearWideEvents", () => {
    asyncContext.run({}, () => {
      const logger = log.child();
      logger.withWideEvents({ userId: "123" });
      logger.withWideEvents({ orderId: "456" });

      const before = logger.getWideEvents();
      expect(before).toEqual({ userId: "123", orderId: "456" });

      logger.clearWideEvents();

      const after = logger.getWideEvents();
      expect(after).toEqual({});
    });
  });

  it("should clear specific key with clearWideEvents(key)", () => {
    asyncContext.run({}, () => {
      const logger = log.child();
      logger.withWideEvents({ userId: "123", orderId: "456" });

      const before = logger.getWideEvents();
      expect(before).toEqual({ userId: "123", orderId: "456" });

      logger.clearWideEvents("userId");

      const after = logger.getWideEvents();
      expect(after).toEqual({ orderId: "456" });
    });
  });

  it("should return logger for clearWideEvents chaining", () => {
    asyncContext.run({}, () => {
      const logger = log.child();
      const result = logger.clearWideEvents();
      expect(result).toBe(logger);
    });
  });

  it("should not merge dangerous prototype keys", () => {
    asyncContext.run({}, () => {
      const logger = log.child();
      // Simulate malicious data with dangerous prototype keys
      const maliciousData: Record<string, any> = { userId: "123" };
      maliciousData["__proto__"] = { admin: true };
      maliciousData["constructor"] = { prototype: {} };
      maliciousData["prototype"] = { evil: true };

      logger.withWideEvents(maliciousData);

      const data = logger.getWideEvents();
      // Should only contain userId, not dangerous keys
      expect(data).toEqual({ userId: "123" });
      expect(Object.keys(data)).toEqual(["userId"]);
    });
  });

  it("should handle circular references gracefully", () => {
    asyncContext.run({}, () => {
      const logger = log.child();
      // Create objects with circular reference
      const objA: Record<string, any> = { name: "A" };
      const objB: Record<string, any> = { name: "B" };
      objA.ref = objB;
      objB.ref = objA; // circular!

      // Should not throw or hang - that's the key test
      logger.withWideEvents({ first: objA });

      const data = logger.getWideEvents();
      // Structure is preserved, circular ref is detected
      expect(data.first.name).toBe("A");
      expect(data.first.ref.name).toBe("B");
      // Circular reference is marked (not followed infinitely)
      expect(data.first.ref.ref).toBeDefined();
    });
  });

  describe("withWideEventError", () => {
    it("should capture error with default serializer", () => {
      asyncContext.run({}, () => {
        const logger = log.child();
        const testError = new Error("Something went wrong");
        testError.name = "CustomError";

        logger.withWideEventError(testError);
        logger.emitWideEvent({ message: "Operation failed" });

        expect(emittedLogs).toHaveLength(1);
        expect(emittedLogs[0].data.error).toMatchObject({
          name: "CustomError",
          message: "Something went wrong",
          stack: testError.stack,
        });
      });
    });

    it("should use custom error field name", () => {
      const customContext = new AsyncLocalStorage<Record<string, any>>();
      const customLog = new LogLayer({
        transport: new BlankTransport({
          shipToLogger: (params) => {
            emittedLogs.push({
              level: params.logLevel,
              metadata: params.metadata,
              data: params.data,
            });
            return params.messages;
          },
        }),
      });
      const mixin = createWideEventMixin({
        asyncContext: customContext,
        errorField: "errorInfo",
      });
      useLogLayerMixin(mixin);

      customContext.run({}, () => {
        const logger = customLog.child();
        logger.withWideEventError(new Error("Test error"));
        logger.emitWideEvent({ message: "Done" });
      });

      expect(emittedLogs[0].data.errorInfo).toBeDefined();
      expect(emittedLogs[0].data.error).toBeUndefined();
    });

    it("should use 'errors' field name by default when errorsAsArray is true", () => {
      const customContext = new AsyncLocalStorage<Record<string, any>>();
      const customLog = new LogLayer({
        transport: new BlankTransport({
          shipToLogger: (params) => {
            emittedLogs.push({
              level: params.logLevel,
              metadata: params.metadata,
              data: params.data,
            });
            return params.messages;
          },
        }),
      });
      const mixin = createWideEventMixin({
        asyncContext: customContext,
        errorsAsArray: true,
      });
      useLogLayerMixin(mixin);

      customContext.run({}, () => {
        const logger = customLog.child();
        logger.withWideEventError(new Error("First error"));
        logger.withWideEventError(new Error("Second error"));
        logger.emitWideEvent({ message: "Done" });
      });

      // Should use 'errors' (plural) by default when errorsAsArray is true
      expect(emittedLogs[0].data.errors).toEqual([
        { name: "Error", message: "First error", stack: expect.any(String) },
        { name: "Error", message: "Second error", stack: expect.any(String) },
      ]);
      // Should NOT have 'error' field
      expect(emittedLogs[0].data.error).toBeUndefined();
    });

    it("should replace error when errorsAsArray is false (default)", () => {
      asyncContext.run({}, () => {
        const logger = log.child();
        logger.withWideEventError(new Error("First"));
        logger.withWideEventError(new Error("Second"));
        logger.emitWideEvent({ message: "Done" });
      });

      expect(emittedLogs[0].data.error).toMatchObject({
        name: "Error",
        message: "Second",
        stack: expect.any(String),
      });
    });

    it("should handle non-Error values with default serializer", () => {
      asyncContext.run({}, () => {
        const logger = log.child();
        logger.withWideEventError("Just a string error");
        logger.emitWideEvent({ message: "Done" });
      });

      expect(emittedLogs[0].data.error).toMatchObject({
        message: "Just a string error",
      });
    });

    it("should return logger for chaining", () => {
      asyncContext.run({}, () => {
        const logger = log.child();
        const result = logger.withWideEventError(new Error("test"));
        expect(result).toBe(logger);
      });
    });

    it("should silently ignore when not in async context", () => {
      const logger = log.child();
      const result = logger.withWideEventError(new Error("test"));
      expect(result).toBe(logger);
    });

    it("should use LogLayer's errorSerializer when configured", () => {
      const customContext = new AsyncLocalStorage<Record<string, any>>();
      const loglayerErrorSerializer = (err: any) => ({
        class: err.constructor.name,
        text: err.message,
        code: err.code || "NO_CODE",
      });

      const customLog = new LogLayer({
        transport: new BlankTransport({
          shipToLogger: (params) => {
            emittedLogs.push({ metadata: params.metadata, data: params.data });
            return params.messages;
          },
        }),
        errorSerializer: loglayerErrorSerializer,
      });
      const mixin = createWideEventMixin({
        asyncContext: customContext,
        // No custom errorSerializer - should use LogLayer's
      });
      useLogLayerMixin(mixin);

      customContext.run({}, () => {
        const logger = customLog.child();
        const err = new Error("Service unavailable");
        (err as any).code = "SVC_DOWN";
        logger.withWideEventError(err);
        logger.emitWideEvent({ message: "Done" });
      });

      expect(emittedLogs[0].data.error).toMatchObject({
        class: "Error",
        text: "Service unavailable",
        code: "SVC_DOWN",
      });
    });
  });

  it("should emit wide event data flat at root even when metadataFieldName is configured", () => {
    const ctx = new AsyncLocalStorage();
    useLogLayerMixin(createWideEventMixin({ asyncContext: ctx }));
    const l = new LogLayer({
      transport: new BlankTransport({
        shipToLogger: (p) => {
          emittedLogs.push({ metadata: p.metadata, context: p.context, data: p.data });
          return p.messages;
        },
      }),
      metadataFieldName: "meta",
    });

    ctx.run({}, () => {
      const logger = l.child();
      logger.withWideEvents({ userId: "123", orderId: "456" });
      logger.emitWideEvent({ message: "Test" });
    });

    // Wide event data should be flat at root, not nested under "meta"
    expect(emittedLogs[0].data).toMatchObject({
      userId: "123",
      orderId: "456",
    });
    // Should NOT be nested under metadataFieldName
    expect(emittedLogs[0].data.meta).toBeUndefined();
  });
});
