/**
 * Type tests to ensure chained calls on an `ILogLayer`- / `ILogBuilder`-typed
 * logger do not collapse to `any`.
 *
 * See https://github.com/loglayer/loglayer/issues/417
 *
 * Previously, methods on `ILogLayer<This>` returned `This`. Because the default
 * type argument is `ILogLayer<any>`, chaining two or more `This`-returning
 * methods would resolve to `ILogLayer<ILogLayer<any>>` -> `ILogLayer<any>` ->
 * `any`. Returning `ILogLayer<This>` (matching how `ILogBuilder` is typed) keeps
 * the type stable across arbitrarily deep chains.
 *
 * Types are imported from the package entry (`../index.js`, i.e. the public
 * `loglayer` module) rather than `@loglayer/shared`, matching the import path in
 * the issue report and guarding the re-export at the same time.
 *
 * Note: `toMatchTypeOf<...>()` alone would pass even when the type is `any`
 * (everything matches `any`), so each case asserts `.not.toBeAny()` explicitly.
 * These assertions are enforced by `tsc` via the `verify-types` task and fail to
 * compile when the type collapses.
 */

import { describe, expectTypeOf, it } from "vitest";
import type { ILogBuilder, ILogLayer } from "../index.js";
import { LogLayer } from "../LogLayer.js";
import { ConsoleTransport } from "../transports/ConsoleTransport.js";

function getLogger(): ILogLayer {
  return new LogLayer({
    transport: new ConsoleTransport({ logger: console }),
  });
}

describe("ILogLayer chained call type preservation", () => {
  it("should not collapse to any when chaining child()", () => {
    const logger = getLogger();
    const child1 = logger.child();
    const child2 = child1.child();

    expectTypeOf(child1).not.toBeAny();
    expectTypeOf(child2).not.toBeAny();
    expectTypeOf(child2).toMatchTypeOf<ILogLayer>();
  });

  it("should not collapse to any when chaining withPrefix()", () => {
    const logger = getLogger();
    const prefixed = logger.withPrefix("1").withPrefix("2");

    expectTypeOf(prefixed).not.toBeAny();
    expectTypeOf(prefixed).toMatchTypeOf<ILogLayer>();
  });

  it("should not collapse to any when chaining withContext()", () => {
    const logger = getLogger();
    const chained = logger.withContext({ a: 1 }).withContext({ b: 2 }).child();

    expectTypeOf(chained).not.toBeAny();
    expectTypeOf(chained).toMatchTypeOf<ILogLayer>();
  });

  it("should stay stable across a deep chain of mixed methods", () => {
    const logger = getLogger();
    const deep = logger.child().withPrefix("a").withContext({ b: 1 }).muteContext().child().withGroup("g");

    expectTypeOf(deep).not.toBeAny();
    expectTypeOf(deep).toMatchTypeOf<ILogLayer>();
  });
});

describe("ILogBuilder chained call type preservation", () => {
  // ILogBuilder methods already return `ILogBuilder<This, IsAsync>` (never bare
  // `This`), which is the scheme ILogLayer was aligned to. These guard against a
  // future regression that "simplifies" the builder back to returning `This`.
  it("should not collapse to any when chaining builder methods", () => {
    const logger = getLogger();
    const chained = logger.withMetadata({ a: 1 }).withError(new Error("x")).withGroup("g");

    expectTypeOf(chained).not.toBeAny();
    expectTypeOf(chained).toMatchTypeOf<ILogBuilder>();
  });

  it("should keep a bare ILogBuilder stable across a chain", () => {
    const builder = getLogger().withMetadata({ a: 1 }) as ILogBuilder;
    const chained = builder.withGroup("g").withError(new Error("x")).withGroup("h");

    expectTypeOf(chained).not.toBeAny();
    expectTypeOf(chained).toMatchTypeOf<ILogBuilder>();
  });
});
