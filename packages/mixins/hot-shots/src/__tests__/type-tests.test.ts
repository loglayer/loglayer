/**
 * Type tests for @loglayer/mixin-hot-shots
 *
 * Verifies that the module augmentation reaches both the concrete `LogLayer`
 * class and the bare `ILogLayer` interface, that the stats builder chain keeps
 * its concrete types, and — most importantly — that the mixin API survives a
 * core method chain (`logger.child()...`) that previously collapsed to `any`.
 * See https://github.com/loglayer/loglayer/issues/417.
 *
 * These assertions are enforced at compile time by the `verify-types` task
 * (`tsc --noEmit`). `expectTypeOf(...).not.toBeAny()` fails to compile when the
 * type has collapsed, so they are real regression guards, not no-ops.
 */

import { StatsD } from "hot-shots";
import type { ILogLayer } from "loglayer";
import { LogLayer, MockLogLayer, useLogLayerMixin } from "loglayer";
import { beforeAll, describe, expectTypeOf, it } from "vitest";
import { hotshotsMixin } from "../index.js";
import type { IIncrementDecrementBuilder, IStatsAPI, IStatsBuilder } from "../types.js";

describe("hot-shots mixin type tests", () => {
  beforeAll(() => {
    useLogLayerMixin(hotshotsMixin(new StatsD({ mock: true })));
  });

  it("should expose the mixin API on the concrete LogLayer type", () => {
    const log = new LogLayer({ transport: {} as any });

    expectTypeOf(log.stats).toEqualTypeOf<IStatsAPI>();
    expectTypeOf(log.getClient()).toEqualTypeOf<StatsD>();
  });

  it("should expose the mixin API on the bare ILogLayer interface", () => {
    const log: ILogLayer = new LogLayer({ transport: {} as any });

    // Augmentation must reach the interface, not just the class.
    expectTypeOf(log.stats).not.toBeAny();
    expectTypeOf(log.stats).toEqualTypeOf<IStatsAPI>();
    expectTypeOf(log.getClient()).toEqualTypeOf<StatsD>();
  });

  it("should expose the mixin API on MockLogLayer", () => {
    const log = new MockLogLayer();

    expectTypeOf(log.stats).toEqualTypeOf<IStatsAPI>();
    expectTypeOf(log.getClient()).toEqualTypeOf<StatsD>();
  });

  it("should preserve builder chain types", () => {
    const log: ILogLayer = new LogLayer({ transport: {} as any });

    // increment() returns the specialized builder; withValue() preserves it.
    const inc = log.stats.increment("requests");
    expectTypeOf(inc).toEqualTypeOf<IIncrementDecrementBuilder>();
    expectTypeOf(inc.withValue(2)).toEqualTypeOf<IIncrementDecrementBuilder>();

    // withTags()/withSampleRate() come from the base builder and return it.
    const configured = inc.withValue(2).withTags({ env: "prod" }).withSampleRate(0.5);
    expectTypeOf(configured).toEqualTypeOf<IStatsBuilder>();
    expectTypeOf(configured.send()).toBeVoid();

    const gauge = log.stats.gauge("mem", 100).withTags({ host: "a" });
    expectTypeOf(gauge).toEqualTypeOf<IStatsBuilder>();
  });

  it("should keep the mixin API accessible after a core method chain (issue #417)", () => {
    // Note: this guards the #417 `any` collapse. The separate augmentation-target
    // regression (mixin methods vanishing on chained types when `ILogLayer` is
    // augmented under both `loglayer` and `@loglayer/shared` by coexisting mixins)
    // only manifests with multiple real packages installed; it is validated by an
    // external-consumer type test, not reproducible in this single-package suite.
    const log: ILogLayer = new LogLayer({ transport: {} as any });

    // `.child().withPrefix(...)` used to collapse to `any`, which would have
    // silently made `.stats` `any` too. It must stay a real `IStatsAPI`.
    const chained = log.child().withPrefix("svc").child();
    expectTypeOf(chained.stats).not.toBeAny();
    expectTypeOf(chained.stats).toEqualTypeOf<IStatsAPI>();
    expectTypeOf(chained.stats.increment("x")).toEqualTypeOf<IIncrementDecrementBuilder>();
  });
});
