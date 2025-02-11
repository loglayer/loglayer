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
