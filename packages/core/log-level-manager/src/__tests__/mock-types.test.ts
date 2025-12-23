/**
 * Type tests to ensure MockLogLevelManager has method signatures
 * that exactly match the ILogLevelManager interface.
 *
 * These tests check parameter types to ensure the mock implementation
 * accepts the same arguments as the interface.
 */

import type { ILogLevelManager } from "@loglayer/shared";
import { describe, expectTypeOf, it } from "vitest";
import type { MockLogLevelManager } from "../MockLogLevelManager.js";

describe("MockLogLevelManager type compatibility", () => {
  it("should have setLevel with the same parameters as ILogLevelManager", () => {
    expectTypeOf<Parameters<MockLogLevelManager["setLevel"]>>().toEqualTypeOf<
      Parameters<ILogLevelManager["setLevel"]>
    >();
  });

  it("should have enableIndividualLevel with the same parameters as ILogLevelManager", () => {
    expectTypeOf<Parameters<MockLogLevelManager["enableIndividualLevel"]>>().toEqualTypeOf<
      Parameters<ILogLevelManager["enableIndividualLevel"]>
    >();
  });

  it("should have disableIndividualLevel with the same parameters as ILogLevelManager", () => {
    expectTypeOf<Parameters<MockLogLevelManager["disableIndividualLevel"]>>().toEqualTypeOf<
      Parameters<ILogLevelManager["disableIndividualLevel"]>
    >();
  });

  it("should have isLevelEnabled with the same parameters as ILogLevelManager", () => {
    expectTypeOf<Parameters<MockLogLevelManager["isLevelEnabled"]>>().toEqualTypeOf<
      Parameters<ILogLevelManager["isLevelEnabled"]>
    >();
  });

  it("should have enableLogging with the same parameters as ILogLevelManager", () => {
    expectTypeOf<Parameters<MockLogLevelManager["enableLogging"]>>().toEqualTypeOf<
      Parameters<ILogLevelManager["enableLogging"]>
    >();
  });

  it("should have disableLogging with the same parameters as ILogLevelManager", () => {
    expectTypeOf<Parameters<MockLogLevelManager["disableLogging"]>>().toEqualTypeOf<
      Parameters<ILogLevelManager["disableLogging"]>
    >();
  });

  it("should have onChildLoggerCreated with the same parameters as ILogLevelManager", () => {
    expectTypeOf<Parameters<MockLogLevelManager["onChildLoggerCreated"]>>().toEqualTypeOf<
      Parameters<ILogLevelManager["onChildLoggerCreated"]>
    >();
  });

  it("should have clone with the same parameters as ILogLevelManager", () => {
    expectTypeOf<Parameters<MockLogLevelManager["clone"]>>().toEqualTypeOf<Parameters<ILogLevelManager["clone"]>>();
  });
});
