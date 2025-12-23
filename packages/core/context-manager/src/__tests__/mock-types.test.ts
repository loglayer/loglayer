/**
 * Type tests to ensure MockContextManager has method signatures
 * that exactly match the IContextManager interface.
 *
 * These tests check parameter types to ensure the mock implementation
 * accepts the same arguments as the interface.
 */

import type { IContextManager } from "@loglayer/shared";
import { describe, expectTypeOf, it } from "vitest";
import type { MockContextManager } from "../MockContextManager.js";

describe("MockContextManager type compatibility", () => {
  it("should have setContext with the same parameters as IContextManager", () => {
    expectTypeOf<Parameters<MockContextManager["setContext"]>>().toEqualTypeOf<
      Parameters<IContextManager["setContext"]>
    >();
  });

  it("should have appendContext with the same parameters as IContextManager", () => {
    expectTypeOf<Parameters<MockContextManager["appendContext"]>>().toEqualTypeOf<
      Parameters<IContextManager["appendContext"]>
    >();
  });

  it("should have getContext with the same parameters as IContextManager", () => {
    expectTypeOf<Parameters<MockContextManager["getContext"]>>().toEqualTypeOf<
      Parameters<IContextManager["getContext"]>
    >();
  });

  it("should have hasContextData with the same parameters as IContextManager", () => {
    expectTypeOf<Parameters<MockContextManager["hasContextData"]>>().toEqualTypeOf<
      Parameters<IContextManager["hasContextData"]>
    >();
  });

  it("should have clearContext with the same parameters as IContextManager", () => {
    expectTypeOf<Parameters<MockContextManager["clearContext"]>>().toEqualTypeOf<
      Parameters<IContextManager["clearContext"]>
    >();
  });

  it("should have onChildLoggerCreated with the same parameters as IContextManager", () => {
    expectTypeOf<Parameters<MockContextManager["onChildLoggerCreated"]>>().toEqualTypeOf<
      Parameters<IContextManager["onChildLoggerCreated"]>
    >();
  });

  it("should have clone with the same parameters as IContextManager", () => {
    expectTypeOf<Parameters<MockContextManager["clone"]>>().toEqualTypeOf<Parameters<IContextManager["clone"]>>();
  });
});
