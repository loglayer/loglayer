/**
 * Type tests for @loglayer/mixin-wide-events
 *
 * These tests verify that TypeScript correctly infers types when using
 * ILogLayer<LogLayer> interface with the wide-events mixin.
 */

import { AsyncLocalStorage } from "node:async_hooks";
import type { ILogLayer } from "loglayer";
import { LogLayer, useLogLayerMixin } from "loglayer";
import { describe, expectTypeOf, it } from "vitest";
import { createWideEventMixin } from "../index.js";

describe("Type Tests", () => {
  // Setup mixin once for all tests
  const asyncContext = new AsyncLocalStorage<Record<string, any>>();
  const wideEventsMixin = createWideEventMixin({ asyncContext });
  useLogLayerMixin(wideEventsMixin);

  it("should preserve type when using ILogLayer interface", () => {
    const logger: ILogLayer = new LogLayer({ transport: {} as any });

    // withWideEvents should return the logger type
    const result1 = logger.withWideEvents({ userId: "123" });
    expectTypeOf(result1).toMatchTypeOf<ILogLayer>();

    // getWideEvents should return data
    const result2 = logger.getWideEvents();
    expectTypeOf(result2).toMatchTypeOf<Record<string, any> | any>();

    // clearWideEvents should return the logger type
    const result3 = logger.clearWideEvents();
    expectTypeOf(result3).toMatchTypeOf<ILogLayer>();

    // emitWideEvent should return the logger type
    const result4 = logger.emitWideEvent({ message: "test" });
    expectTypeOf(result4).toMatchTypeOf<ILogLayer>();
  });

  it("should allow method chaining", () => {
    const logger: ILogLayer = new LogLayer({ transport: {} as any });

    // All methods should return the same type for chaining
    const result = logger
      .withWideEvents({ userId: "123" })
      .withWideEvents({ orderId: "456" })
      .withContext({ requestStart: Date.now() })
      .clearWideEvents()
      .withWideEvents({ newRequest: "req-789" })
      .emitWideEvent({ message: "New request completed" });

    expectTypeOf(result).toMatchTypeOf<ILogLayer>();
  });

  it("should preserve LogLayer type", () => {
    const logger = new LogLayer({ transport: {} as any });

    // All methods should work on concrete LogLayer
    logger.withWideEvents({ userId: "123" });
    logger.getWideEvents();
    logger.clearWideEvents();
    logger.emitWideEvent({ message: "test" });
  });

  it("should allow type narrowing in functions", () => {
    function processWithContext(logger: ILogLayer) {
      logger.withWideEvents({ processing: true });
      logger.getWideEvents();
      logger.clearWideEvents();
      logger.emitWideEvent({ message: "processed" });
      logger.info("standard log call");
      logger.withContext({ context: "data" });
      return logger;
    }

    const logger = new LogLayer({ transport: {} as any });
    const result = processWithContext(logger);
    expectTypeOf(result).toMatchTypeOf<ILogLayer>();
  });

  it("should accept correct emitWideEvent config", () => {
    const logger: ILogLayer = new LogLayer({ transport: {} as any });

    // All config options should be valid
    logger.emitWideEvent({ message: "msg" });
    logger.emitWideEvent({ message: "msg", level: "error" });
    logger.emitWideEvent({ message: "msg", metadata: { extra: "data" } });
    logger.emitWideEvent({
      message: "msg",
      level: "warn",
      metadata: { code: 123 },
    });
  });
});
