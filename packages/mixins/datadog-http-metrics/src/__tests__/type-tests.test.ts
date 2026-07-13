/**
 * Type tests for @loglayer/mixin-datadog-http-metrics
 *
 * Verifies that the module augmentation reaches both the concrete `LogLayer`
 * class and the bare `ILogLayer` interface, that the metrics builder chain keeps
 * its concrete types, and — most importantly — that the mixin API survives a
 * core method chain (`logger.child()...`) that previously collapsed to `any`.
 * See https://github.com/loglayer/loglayer/issues/417.
 *
 * These assertions are enforced at compile time by the `verify-types` task
 * (`tsc --noEmit`). `expectTypeOf(...).not.toBeAny()` fails to compile when the
 * type has collapsed, so they are real regression guards, not no-ops.
 */

import type { BufferedMetricsLogger } from "datadog-metrics";
import type { ILogLayer } from "loglayer";
import { LogLayer, MockLogLayer, useLogLayerMixin } from "loglayer";
import { beforeAll, describe, expectTypeOf, it, vi } from "vitest";
import { datadogMetricsMixin } from "../index.js";
import type { IIncrementBuilder, IMetricsAPI, IMetricsBuilder } from "../types.js";

vi.mock("datadog-metrics", () => ({
  default: {
    BufferedMetricsLogger: function MockBufferedMetricsLogger(this: any) {
      Object.assign(this, {
        gauge: vi.fn(),
        increment: vi.fn(),
        histogram: vi.fn(),
        distribution: vi.fn(),
        flush: vi.fn().mockResolvedValue(undefined),
        start: vi.fn(),
        stop: vi.fn().mockResolvedValue(undefined),
      });
    },
    reporters: { NullReporter: class {}, DatadogReporter: class {} },
  },
}));

describe("datadog-http-metrics mixin type tests", () => {
  beforeAll(() => {
    useLogLayerMixin(datadogMetricsMixin({ apiKey: "test-key", prefix: "test." } as any));
  });

  it("should expose the mixin API on the concrete LogLayer type", () => {
    const log = new LogLayer({ transport: {} as any });

    expectTypeOf(log.ddStats).toEqualTypeOf<IMetricsAPI>();
    expectTypeOf(log.ddStats.getClient()).toEqualTypeOf<BufferedMetricsLogger>();
  });

  it("should expose the mixin API on the bare ILogLayer interface", () => {
    const log: ILogLayer = new LogLayer({ transport: {} as any });

    // Augmentation must reach the interface, not just the class.
    expectTypeOf(log.ddStats).not.toBeAny();
    expectTypeOf(log.ddStats).toEqualTypeOf<IMetricsAPI>();
  });

  it("should expose the mixin API on MockLogLayer", () => {
    const log = new MockLogLayer();

    expectTypeOf(log.ddStats).toEqualTypeOf<IMetricsAPI>();
  });

  it("should preserve builder chain types", () => {
    const log: ILogLayer = new LogLayer({ transport: {} as any });

    const inc = log.ddStats.increment("requests").withValue(2).withTags(["env:prod"]).withTimestamp(0);
    expectTypeOf(inc).toEqualTypeOf<IIncrementBuilder>();
    expectTypeOf(inc.send()).toBeVoid();

    const gauge = log.ddStats.gauge("mem", 100).withTags(["host:a"]);
    expectTypeOf(gauge).toEqualTypeOf<IMetricsBuilder>();

    expectTypeOf(log.ddStats.flush()).toEqualTypeOf<Promise<void>>();
  });

  it("should keep the mixin API accessible after a core method chain (issue #417)", () => {
    // Note: this guards the #417 `any` collapse. The separate augmentation-target
    // regression (mixin methods vanishing on chained types when `ILogLayer` is
    // augmented under both `loglayer` and `@loglayer/shared` by coexisting mixins)
    // only manifests with multiple real packages installed; it is validated by an
    // external-consumer type test, not reproducible in this single-package suite.
    const log: ILogLayer = new LogLayer({ transport: {} as any });

    // `.child().withPrefix(...)` used to collapse to `any`, which would have
    // silently made `.ddStats` `any` too. It must stay a real `IMetricsAPI`.
    const chained = log.child().withPrefix("svc").child();
    expectTypeOf(chained.ddStats).not.toBeAny();
    expectTypeOf(chained.ddStats).toEqualTypeOf<IMetricsAPI>();
    expectTypeOf(chained.ddStats.increment("x")).toEqualTypeOf<IIncrementBuilder>();
  });
});
