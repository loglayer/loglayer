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
import { createWideEventMixin, type WideEventSamplingConfig, type WideEventSamplingStrategy } from "../index.js";

describe("Type Tests", () => {
  // Setup mixin once for all tests (matching docs pattern)
  const asyncLocalStorage = new AsyncLocalStorage<{ logger: ILogLayer }>();
  const wideEventsMixin = createWideEventMixin({ asyncContext: asyncLocalStorage });
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

    // emitWideEvent returns void
    logger.emitWideEvent({ message: "test" });
  });

  it("should allow method chaining", () => {
    const logger: ILogLayer = new LogLayer({ transport: {} as any });

    // Most methods return the logger for chaining
    const result = logger
      .withWideEvents({ userId: "123" })
      .withWideEvents({ orderId: "456" })
      .withContext({ requestStart: Date.now() })
      .clearWideEvents()
      .withWideEvents({ newRequest: "req-789" });

    expectTypeOf(result).toMatchTypeOf<ILogLayer>();

    // emitWideEvent returns void, call separately
    logger.emitWideEvent({ message: "New request completed" });
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
  });

  it("should accept sampling config in mixin options", () => {
    // default strategy
    const config1: WideEventSamplingConfig = {
      strategy: "default",
      rate: 0.5,
    };

    const asyncContext = new AsyncLocalStorage<Record<string, any>>();
    createWideEventMixin({ asyncContext: asyncContext, sampling: config1 });

    // per_level strategy
    const config2: WideEventSamplingConfig = {
      strategy: "per_level",
      perLevel: {
        trace: 0,
        debug: 0.1,
        info: 0.5,
        error: 1, // ignored — but type-accepted
      },
    };

    createWideEventMixin({ asyncContext: new AsyncLocalStorage(), sampling: config2 });

    // boolean rate
    const config3: WideEventSamplingConfig = {
      rate: true,
    };
    createWideEventMixin({ asyncContext: new AsyncLocalStorage(), sampling: config3 });

    // emitLevel
    const config4: WideEventSamplingConfig = {
      strategy: "default",
      rate: 1,
      emitLevel: "debug",
    };
    createWideEventMixin({ asyncContext: new AsyncLocalStorage(), sampling: config4 });

    // forceKeep callback
    const config5: WideEventSamplingConfig = {
      strategy: "per_level",
      perLevel: { info: 0.01 },
      forceKeep: ({ wideData, level }) => wideData.debug === true && level === "info",
    };
    createWideEventMixin({ asyncContext: new AsyncLocalStorage(), sampling: config5 });

    // Type check: strategy is literal
    expectTypeOf<WideEventSamplingStrategy>().toEqualTypeOf<"default" | "per_level">();
  });
});
