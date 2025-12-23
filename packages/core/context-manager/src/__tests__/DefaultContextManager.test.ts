import { beforeEach, describe, expect, it, vi } from "vitest";
import { DefaultContextManager } from "../DefaultContextManager.js";

const parentLogger = vi.fn() as any;
const childLogger = vi.fn() as any;

describe("DefaultContextManager", () => {
  let contextManager: DefaultContextManager;

  beforeEach(() => {
    contextManager = new DefaultContextManager();
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

    it("should handle removing non-existent keys gracefully", () => {
      contextManager.setContext({ foo: "bar" });
      contextManager.clearContext("nonexistent");
      expect(contextManager.getContext()).toEqual({ foo: "bar" });
      expect(contextManager.hasContextData()).toBe(true);
    });

    it("should handle empty array of keys", () => {
      contextManager.setContext({ foo: "bar" });
      contextManager.clearContext([]);
      expect(contextManager.getContext()).toEqual({ foo: "bar" });
      expect(contextManager.hasContextData()).toBe(true);
    });
  });

  describe("onChildLoggerCreated", () => {
    it("should copy parent context to child logger", () => {
      const parentContext = { foo: "bar" };
      const childContextManager = new DefaultContextManager();

      contextManager.setContext(parentContext);
      contextManager.onChildLoggerCreated({
        parentLogger,
        childLogger,
        parentContextManager: contextManager,
        childContextManager,
      });

      expect(childContextManager.getContext()).toEqual(parentContext);
    });

    it("should not copy context if parent has no context", () => {
      const childContextManager = new DefaultContextManager();

      contextManager.onChildLoggerCreated({
        parentLogger,
        childLogger,
        childContextManager: childContextManager,
        parentContextManager: contextManager,
      });

      expect(childContextManager.getContext()).toEqual({});
      expect(childContextManager.hasContextData()).toBe(false);
    });
  });

  describe("clone", () => {
    it("should create a new instance with the same context", () => {
      const context = { foo: "bar" };
      contextManager.setContext(context);

      const clonedManager = contextManager.clone();
      expect(clonedManager.getContext()).toEqual(context);
      expect(clonedManager.hasContextData()).toBe(true);
    });

    it("should create independent instances", () => {
      contextManager.setContext({ foo: "bar" });
      const clonedManager = contextManager.clone();

      clonedManager.appendContext({ baz: "qux" });

      expect(contextManager.getContext()).toEqual({ foo: "bar" });
      expect(clonedManager.getContext()).toEqual({ foo: "bar", baz: "qux" });
    });
  });
});
