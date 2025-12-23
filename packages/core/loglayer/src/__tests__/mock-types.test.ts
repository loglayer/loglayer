/**
 * Type tests to ensure MockLogLayer and MockLogBuilder have method signatures
 * that exactly match ILogLayer and ILogBuilder interfaces.
 *
 * These tests check both the parameter types AND return types to ensure
 * the mock implementations accept the same arguments as the interfaces.
 */

import type { ILogBuilder, ILogLayer } from "@loglayer/shared";
import { describe, expectTypeOf, it } from "vitest";
import type { MockLogBuilder } from "../MockLogBuilder.js";
import type { MockLogLayer } from "../MockLogLayer.js";

describe("MockLogLayer type compatibility", () => {
  it("should have clearContext with the same parameters as ILogLayer", () => {
    // Check that Parameters match exactly - this catches missing optional params
    expectTypeOf<Parameters<MockLogLayer["clearContext"]>>().toEqualTypeOf<
      Parameters<ILogLayer<MockLogLayer>["clearContext"]>
    >();
  });

  it("should have withContext with the same parameters as ILogLayer", () => {
    expectTypeOf<Parameters<MockLogLayer["withContext"]>>().toEqualTypeOf<
      Parameters<ILogLayer<MockLogLayer>["withContext"]>
    >();
  });

  it("should have withPrefix with the same parameters as ILogLayer", () => {
    expectTypeOf<Parameters<MockLogLayer["withPrefix"]>>().toEqualTypeOf<
      Parameters<ILogLayer<MockLogLayer>["withPrefix"]>
    >();
  });

  it("should have child with the same parameters as ILogLayer", () => {
    expectTypeOf<Parameters<MockLogLayer["child"]>>().toEqualTypeOf<Parameters<ILogLayer<MockLogLayer>["child"]>>();
  });

  it("should have enableLogging with the same parameters as ILogLayer", () => {
    expectTypeOf<Parameters<MockLogLayer["enableLogging"]>>().toEqualTypeOf<
      Parameters<ILogLayer<MockLogLayer>["enableLogging"]>
    >();
  });

  it("should have disableLogging with the same parameters as ILogLayer", () => {
    expectTypeOf<Parameters<MockLogLayer["disableLogging"]>>().toEqualTypeOf<
      Parameters<ILogLayer<MockLogLayer>["disableLogging"]>
    >();
  });

  it("should have getContext with the same parameters as ILogLayer", () => {
    expectTypeOf<Parameters<MockLogLayer["getContext"]>>().toEqualTypeOf<
      Parameters<ILogLayer<MockLogLayer>["getContext"]>
    >();
  });

  it("should have setLevel with the same parameters as ILogLayer", () => {
    expectTypeOf<Parameters<MockLogLayer["setLevel"]>>().toEqualTypeOf<
      Parameters<ILogLayer<MockLogLayer>["setLevel"]>
    >();
  });

  it("should have isLevelEnabled with the same parameters as ILogLayer", () => {
    expectTypeOf<Parameters<MockLogLayer["isLevelEnabled"]>>().toEqualTypeOf<
      Parameters<ILogLayer<MockLogLayer>["isLevelEnabled"]>
    >();
  });
});

describe("MockLogBuilder type compatibility", () => {
  it("should have withMetadata with the same parameters as ILogBuilder", () => {
    expectTypeOf<Parameters<MockLogBuilder["withMetadata"]>>().toEqualTypeOf<
      Parameters<ILogBuilder<MockLogBuilder>["withMetadata"]>
    >();
  });

  it("should have withError with the same parameters as ILogBuilder", () => {
    expectTypeOf<Parameters<MockLogBuilder["withError"]>>().toEqualTypeOf<
      Parameters<ILogBuilder<MockLogBuilder>["withError"]>
    >();
  });

  it("should have enableLogging with the same parameters as ILogBuilder", () => {
    expectTypeOf<Parameters<MockLogBuilder["enableLogging"]>>().toEqualTypeOf<
      Parameters<ILogBuilder<MockLogBuilder>["enableLogging"]>
    >();
  });

  it("should have disableLogging with the same parameters as ILogBuilder", () => {
    expectTypeOf<Parameters<MockLogBuilder["disableLogging"]>>().toEqualTypeOf<
      Parameters<ILogBuilder<MockLogBuilder>["disableLogging"]>
    >();
  });
});
