import { MockLogLayer } from "loglayer";
import { beforeEach, describe, expect, it } from "vitest";
import { LinkedContextManager } from "../LinkedContextManager.js";

describe("LinkedContextManager", () => {
  let contextManager: LinkedContextManager;

  beforeEach(() => {
    contextManager = new LinkedContextManager();
  });

  describe("setContext", () => {
    it("should set context data", () => {
      const context = { foo: "bar" };
      contextManager.setContext(context);
      expect(contextManager.getContext()).toEqual(context);
      expect(contextManager.hasContextData()).toBe(true);
    });

    it("should clear context when undefined is provided", () => {
      contextManager.setContext({ foo: "bar" });
      contextManager.setContext(undefined);
      expect(contextManager.getContext()).toEqual({});
      expect(contextManager.hasContextData()).toBe(false);
    });

    it("should maintain the same object reference when setting context", () => {
      const initialContext = contextManager.getContext();
      contextManager.setContext({ foo: "bar" });
      expect(contextManager.getContext()).toBe(initialContext);
    });
  });

  describe("appendContext", () => {
    it("should append context data to existing context", () => {
      contextManager.setContext({ foo: "bar" });
      contextManager.appendContext({ baz: "qux" });
      expect(contextManager.getContext()).toEqual({
        foo: "bar",
        baz: "qux",
      });
      expect(contextManager.hasContextData()).toBe(true);
    });

    it("should override existing keys when appending", () => {
      contextManager.setContext({ foo: "bar" });
      contextManager.appendContext({ foo: "baz" });
      expect(contextManager.getContext()).toEqual({ foo: "baz" });
    });
  });

  describe("getContext", () => {
    it("should return empty object when no context is set", () => {
      expect(contextManager.getContext()).toEqual({});
    });

    it("should return set context", () => {
      const context = { foo: "bar" };
      contextManager.setContext(context);
      expect(contextManager.getContext()).toEqual(context);
    });
  });

  describe("hasContextData", () => {
    it("should return false when no context is set", () => {
      expect(contextManager.hasContextData()).toBe(false);
    });

    it("should return true when context is set", () => {
      contextManager.setContext({ foo: "bar" });
      expect(contextManager.hasContextData()).toBe(true);
    });
  });

  describe("clearContext", () => {
    it("should clear all context data when no keys are provided", () => {
      contextManager.setContext({ foo: "bar", baz: "qux" });
      contextManager.clearContext();
      expect(contextManager.getContext()).toEqual({});
      expect(contextManager.hasContextData()).toBe(false);
    });

    it("should remove a single key when a string is provided", () => {
      contextManager.setContext({ foo: "bar", baz: "qux", test: "value" });
      contextManager.clearContext("foo");
      expect(contextManager.getContext()).toEqual({ baz: "qux", test: "value" });
      expect(contextManager.hasContextData()).toBe(true);
    });

    it("should remove multiple keys when an array is provided", () => {
      contextManager.setContext({ foo: "bar", baz: "qux", test: "value" });
      contextManager.clearContext(["foo", "baz"]);
      expect(contextManager.getContext()).toEqual({ test: "value" });
      expect(contextManager.hasContextData()).toBe(true);
    });

    it("should set hasContext to false when all keys are removed", () => {
      contextManager.setContext({ foo: "bar", baz: "qux" });
      contextManager.clearContext(["foo", "baz"]);
      expect(contextManager.getContext()).toEqual({});
      expect(contextManager.hasContextData()).toBe(false);
    });

    it("should maintain the same object reference when clearing specific keys", () => {
      contextManager.setContext({ foo: "bar", baz: "qux" });
      const initialContext = contextManager.getContext();
      contextManager.clearContext("foo");
      expect(contextManager.getContext()).toBe(initialContext);
    });

    it("should propagate cleared keys to linked context managers", () => {
      const childContextManager = new LinkedContextManager();

      contextManager.setContext({ foo: "bar", baz: "qux" });
      contextManager.onChildLoggerCreated({
        parentLogger: new MockLogLayer(),
        childLogger: new MockLogLayer(),
        parentContextManager: contextManager,
        childContextManager,
      });

      contextManager.clearContext("foo");
      expect(childContextManager.getContext()).toEqual({ baz: "qux" });
    });
  });

  describe("onChildLoggerCreated", () => {
    it("should link parent and child context", () => {
      const parentContext = { foo: "bar" };
      const childContextManager = new LinkedContextManager();

      contextManager.setContext(parentContext);
      contextManager.onChildLoggerCreated({
        parentLogger: new MockLogLayer(),
        childLogger: new MockLogLayer(),
        parentContextManager: contextManager,
        childContextManager,
      });

      expect(childContextManager.getContext()).toEqual(parentContext);

      // Test bi-directional linking
      childContextManager.appendContext({ baz: "qux" });
      expect(contextManager.getContext()).toEqual({ foo: "bar", baz: "qux" });

      contextManager.appendContext({ test: "value" });
      expect(childContextManager.getContext()).toEqual({ foo: "bar", baz: "qux", test: "value" });
    });

    it("should maintain link when parent context is cleared", () => {
      const childContextManager = new LinkedContextManager();

      contextManager.setContext({ foo: "bar" });
      contextManager.onChildLoggerCreated({
        parentLogger: new MockLogLayer(),
        childLogger: new MockLogLayer(),
        parentContextManager: contextManager,
        childContextManager,
      });

      contextManager.setContext(undefined);
      expect(childContextManager.getContext()).toEqual({});
      expect(childContextManager.hasContextData()).toBe(false);
    });
  });

  describe("clone", () => {
    it("should create a new instance with the same context data", () => {
      const context = { foo: "bar" };
      contextManager.setContext(context);

      const clonedManager = contextManager.clone();
      expect(clonedManager.getContext()).toEqual(context);
      expect(clonedManager.hasContextData()).toBe(true);
    });

    it("should maintain bi-directional link between original and clone", () => {
      contextManager.setContext({ foo: "bar" });
      const clonedManager = contextManager.clone();

      // Changes in clone should affect original
      clonedManager.appendContext({ baz: "qux" });
      expect(contextManager.getContext()).toEqual({ foo: "bar", baz: "qux" });

      // Changes in original should affect clone
      contextManager.appendContext({ test: "value" });
      expect(clonedManager.getContext()).toEqual({ foo: "bar", baz: "qux", test: "value" });

      // Clearing original should affect clone
      contextManager.setContext(undefined);
      expect(clonedManager.getContext()).toEqual({});
      expect(clonedManager.hasContextData()).toBe(false);
    });
  });
});
