import { describe, expect, it } from "vitest";
import { IsolatedContextManager } from "../IsolatedContextManager.js";

describe("IsolatedContextManager", () => {
  it("should set and get context data", () => {
    const manager = new IsolatedContextManager();
    const context = { userId: "123", sessionId: "abc" };

    manager.setContext(context);

    expect(manager.getContext()).toEqual(context);
    expect(manager.hasContextData()).toBe(true);
  });

  it("should clear context when set to undefined", () => {
    const manager = new IsolatedContextManager();
    const context = { userId: "123" };

    manager.setContext(context);
    expect(manager.hasContextData()).toBe(true);

    manager.setContext(undefined);
    expect(manager.getContext()).toEqual({});
    expect(manager.hasContextData()).toBe(false);
  });

  it("should append context data", () => {
    const manager = new IsolatedContextManager();

    manager.setContext({ userId: "123" });
    manager.appendContext({ sessionId: "abc" });

    expect(manager.getContext()).toEqual({
      userId: "123",
      sessionId: "abc",
    });
    expect(manager.hasContextData()).toBe(true);
  });

  it("should overwrite existing keys when appending", () => {
    const manager = new IsolatedContextManager();

    manager.setContext({ userId: "123", role: "user" });
    manager.appendContext({ userId: "456", sessionId: "abc" });

    expect(manager.getContext()).toEqual({
      userId: "456",
      role: "user",
      sessionId: "abc",
    });
  });

  it("should not copy context to child logger", () => {
    const parentManager = new IsolatedContextManager();
    const childManager = new IsolatedContextManager();

    parentManager.setContext({ userId: "123", role: "admin" });

    // Simulate child logger creation
    parentManager.onChildLoggerCreated({
      parentLogger: {} as any,
      childLogger: {} as any,
      parentContextManager: parentManager,
      childContextManager: childManager,
    });

    // Child should have no context data
    expect(childManager.getContext()).toEqual({});
    expect(childManager.hasContextData()).toBe(false);

    // Parent should still have its context
    expect(parentManager.getContext()).toEqual({ userId: "123", role: "admin" });
    expect(parentManager.hasContextData()).toBe(true);
  });

  it("should maintain isolation between parent and child", () => {
    const parentManager = new IsolatedContextManager();
    const childManager = new IsolatedContextManager();

    parentManager.setContext({ userId: "123" });

    parentManager.onChildLoggerCreated({
      parentLogger: {} as any,
      childLogger: {} as any,
      parentContextManager: parentManager,
      childContextManager: childManager,
    });

    // Modify child context
    childManager.setContext({ sessionId: "abc" });

    // Parent should be unaffected
    expect(parentManager.getContext()).toEqual({ userId: "123" });
    expect(childManager.getContext()).toEqual({ sessionId: "abc" });
  });

  it("should create an isolated clone", () => {
    const manager = new IsolatedContextManager();
    manager.setContext({ userId: "123", role: "admin" });

    const clone = manager.clone();

    // Clone should have no context data (isolated)
    expect(clone.getContext()).toEqual({});
    expect(clone.hasContextData()).toBe(false);

    // Original should be unchanged
    expect(manager.getContext()).toEqual({ userId: "123", role: "admin" });
    expect(manager.hasContextData()).toBe(true);

    // Modifying clone should not affect original
    clone.setContext({ sessionId: "xyz" });
    expect(manager.getContext()).toEqual({ userId: "123", role: "admin" });
    expect(clone.getContext()).toEqual({ sessionId: "xyz" });
  });

  it("should handle empty context correctly", () => {
    const manager = new IsolatedContextManager();

    expect(manager.getContext()).toEqual({});
    expect(manager.hasContextData()).toBe(false);

    manager.setContext({});
    expect(manager.getContext()).toEqual({});
    expect(manager.hasContextData()).toBe(true);
  });

  describe("clearContext", () => {
    it("should clear all context data when no keys are provided", () => {
      const manager = new IsolatedContextManager();
      manager.setContext({ foo: "bar", baz: "qux" });
      manager.clearContext();
      expect(manager.getContext()).toEqual({});
      expect(manager.hasContextData()).toBe(false);
    });

    it("should remove a single key when a string is provided", () => {
      const manager = new IsolatedContextManager();
      manager.setContext({ foo: "bar", baz: "qux", test: "value" });
      manager.clearContext("foo");
      expect(manager.getContext()).toEqual({ baz: "qux", test: "value" });
      expect(manager.hasContextData()).toBe(true);
    });

    it("should remove multiple keys when an array is provided", () => {
      const manager = new IsolatedContextManager();
      manager.setContext({ foo: "bar", baz: "qux", test: "value" });
      manager.clearContext(["foo", "baz"]);
      expect(manager.getContext()).toEqual({ test: "value" });
      expect(manager.hasContextData()).toBe(true);
    });

    it("should set hasContext to false when all keys are removed", () => {
      const manager = new IsolatedContextManager();
      manager.setContext({ foo: "bar", baz: "qux" });
      manager.clearContext(["foo", "baz"]);
      expect(manager.getContext()).toEqual({});
      expect(manager.hasContextData()).toBe(false);
    });

    it("should handle removing non-existent keys gracefully", () => {
      const manager = new IsolatedContextManager();
      manager.setContext({ foo: "bar" });
      manager.clearContext("nonexistent");
      expect(manager.getContext()).toEqual({ foo: "bar" });
      expect(manager.hasContextData()).toBe(true);
    });
  });
});
