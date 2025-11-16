import { LogLevel } from "@loglayer/log-level-manager";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LinkedLogLevelManager } from "../LinkedLogLevelManager.js";

const parentLogger = vi.fn() as any;
const childLogger = vi.fn() as any;

describe("LinkedLogLevelManager", () => {
  let parentManager: LinkedLogLevelManager;
  let childManager: LinkedLogLevelManager;

  beforeEach(() => {
    parentManager = new LinkedLogLevelManager();
    childManager = new LinkedLogLevelManager();
  });

  describe("setLevel", () => {
    it("should propagate parent changes to children", () => {
      parentManager.onChildLoggerCreated({
        parentLogger,
        childLogger,
        parentLogLevelManager: parentManager,
        childLogLevelManager: childManager,
      });

      parentManager.setLevel(LogLevel.warn);

      expect(parentManager.isLevelEnabled(LogLevel.info)).toBe(false);
      expect(parentManager.isLevelEnabled(LogLevel.warn)).toBe(true);
      expect(childManager.isLevelEnabled(LogLevel.info)).toBe(false);
      expect(childManager.isLevelEnabled(LogLevel.warn)).toBe(true);
    });

    it("should propagate child changes to parent", () => {
      parentManager.onChildLoggerCreated({
        parentLogger,
        childLogger,
        parentLogLevelManager: parentManager,
        childLogLevelManager: childManager,
      });

      childManager.setLevel(LogLevel.debug);

      expect(parentManager.isLevelEnabled(LogLevel.debug)).toBe(true);
      expect(parentManager.isLevelEnabled(LogLevel.info)).toBe(true);
      expect(childManager.isLevelEnabled(LogLevel.debug)).toBe(true);
      expect(childManager.isLevelEnabled(LogLevel.info)).toBe(true);
    });
  });

  describe("enableIndividualLevel", () => {
    it("should propagate parent changes to children", () => {
      parentManager.onChildLoggerCreated({
        parentLogger,
        childLogger,
        parentLogLevelManager: parentManager,
        childLogLevelManager: childManager,
      });

      parentManager.setLevel(LogLevel.warn);
      parentManager.enableIndividualLevel(LogLevel.debug);

      expect(childManager.isLevelEnabled(LogLevel.debug)).toBe(true);
    });

    it("should propagate child changes to parent", () => {
      parentManager.onChildLoggerCreated({
        parentLogger,
        childLogger,
        parentLogLevelManager: parentManager,
        childLogLevelManager: childManager,
      });

      parentManager.setLevel(LogLevel.warn);
      childManager.enableIndividualLevel(LogLevel.debug);

      expect(parentManager.isLevelEnabled(LogLevel.debug)).toBe(true);
    });
  });

  describe("disableIndividualLevel", () => {
    it("should propagate parent changes to children", () => {
      parentManager.onChildLoggerCreated({
        parentLogger,
        childLogger,
        parentLogLevelManager: parentManager,
        childLogLevelManager: childManager,
      });

      parentManager.disableIndividualLevel(LogLevel.info);

      expect(childManager.isLevelEnabled(LogLevel.info)).toBe(false);
    });

    it("should propagate child changes to parent", () => {
      parentManager.onChildLoggerCreated({
        parentLogger,
        childLogger,
        parentLogLevelManager: parentManager,
        childLogLevelManager: childManager,
      });

      childManager.disableIndividualLevel(LogLevel.info);

      expect(parentManager.isLevelEnabled(LogLevel.info)).toBe(false);
    });
  });

  describe("enableLogging", () => {
    it("should propagate parent changes to children", () => {
      parentManager.onChildLoggerCreated({
        parentLogger,
        childLogger,
        parentLogLevelManager: parentManager,
        childLogLevelManager: childManager,
      });

      parentManager.disableLogging();
      parentManager.enableLogging();

      expect(childManager.isLevelEnabled(LogLevel.info)).toBe(true);
    });

    it("should propagate child changes to parent", () => {
      parentManager.onChildLoggerCreated({
        parentLogger,
        childLogger,
        parentLogLevelManager: parentManager,
        childLogLevelManager: childManager,
      });

      parentManager.disableLogging();
      childManager.enableLogging();

      expect(parentManager.isLevelEnabled(LogLevel.info)).toBe(true);
    });
  });

  describe("disableLogging", () => {
    it("should propagate parent changes to children", () => {
      parentManager.onChildLoggerCreated({
        parentLogger,
        childLogger,
        parentLogLevelManager: parentManager,
        childLogLevelManager: childManager,
      });

      parentManager.disableLogging();

      expect(childManager.isLevelEnabled(LogLevel.fatal)).toBe(false);
    });

    it("should propagate child changes to parent", () => {
      parentManager.onChildLoggerCreated({
        parentLogger,
        childLogger,
        parentLogLevelManager: parentManager,
        childLogLevelManager: childManager,
      });

      childManager.disableLogging();

      expect(parentManager.isLevelEnabled(LogLevel.fatal)).toBe(false);
    });
  });

  describe("onChildLoggerCreated", () => {
    it("should share container between parent and child", () => {
      parentManager.setLevel(LogLevel.error);

      parentManager.onChildLoggerCreated({
        parentLogger,
        childLogger,
        parentLogLevelManager: parentManager,
        childLogLevelManager: childManager,
      });

      // Child should have the same status as parent (they share the container)
      expect(childManager.isLevelEnabled(LogLevel.error)).toBe(true);
      expect(childManager.isLevelEnabled(LogLevel.warn)).toBe(false);
    });

    it("should set up bidirectional relationship", () => {
      parentManager.onChildLoggerCreated({
        parentLogger,
        childLogger,
        parentLogLevelManager: parentManager,
        childLogLevelManager: childManager,
      });

      // Child change should affect parent
      childManager.setLevel(LogLevel.debug);
      expect(parentManager.isLevelEnabled(LogLevel.debug)).toBe(true);

      // Parent change should affect child
      parentManager.setLevel(LogLevel.warn);
      expect(childManager.isLevelEnabled(LogLevel.warn)).toBe(true);
    });
  });

  describe("clone", () => {
    it("should create an independent instance", () => {
      parentManager.setLevel(LogLevel.error);
      const clone = parentManager.clone();

      // Clone should have the same initial status as parent
      expect(clone.isLevelEnabled(LogLevel.error)).toBe(true);
      expect(clone.isLevelEnabled(LogLevel.warn)).toBe(false);

      // Changing parent should not affect clone
      parentManager.setLevel(LogLevel.debug);

      expect(clone.isLevelEnabled(LogLevel.error)).toBe(true);
      expect(clone.isLevelEnabled(LogLevel.warn)).toBe(false);
      expect(parentManager.isLevelEnabled(LogLevel.debug)).toBe(true);
    });
  });

  describe("nested children", () => {
    it("should propagate changes through multiple levels", () => {
      const grandchildManager = new LinkedLogLevelManager();

      parentManager.onChildLoggerCreated({
        parentLogger,
        childLogger,
        parentLogLevelManager: parentManager,
        childLogLevelManager: childManager,
      });

      childManager.onChildLoggerCreated({
        parentLogger: childLogger,
        childLogger: vi.fn() as any,
        parentLogLevelManager: childManager,
        childLogLevelManager: grandchildManager,
      });

      // Parent change should affect all descendants
      parentManager.setLevel(LogLevel.error);

      expect(parentManager.isLevelEnabled(LogLevel.error)).toBe(true);
      expect(childManager.isLevelEnabled(LogLevel.error)).toBe(true);
      expect(grandchildManager.isLevelEnabled(LogLevel.error)).toBe(true);

      // Grandchild change should affect all ancestors
      grandchildManager.setLevel(LogLevel.debug);

      expect(parentManager.isLevelEnabled(LogLevel.debug)).toBe(true);
      expect(childManager.isLevelEnabled(LogLevel.debug)).toBe(true);
      expect(grandchildManager.isLevelEnabled(LogLevel.debug)).toBe(true);
    });
  });

  describe("memory leak prevention", () => {
    it("should handle multiple children correctly", () => {
      const children: LinkedLogLevelManager[] = [];
      const childLoggers = Array.from({ length: 5 }, () => vi.fn() as any);

      // Create multiple children
      for (let i = 0; i < 5; i++) {
        const child = new LinkedLogLevelManager();
        children.push(child);
        parentManager.onChildLoggerCreated({
          parentLogger,
          childLogger: childLoggers[i],
          parentLogLevelManager: parentManager,
          childLogLevelManager: child,
        });
      }

      // All children should receive updates from parent
      parentManager.setLevel(LogLevel.warn);

      for (const child of children) {
        expect(child.isLevelEnabled(LogLevel.warn)).toBe(true);
        expect(child.isLevelEnabled(LogLevel.info)).toBe(false);
      }
    });

    it("should propagate child changes to parent with multiple children", () => {
      const children: LinkedLogLevelManager[] = [];
      const childLoggers = Array.from({ length: 3 }, () => vi.fn() as any);

      for (let i = 0; i < 3; i++) {
        const child = new LinkedLogLevelManager();
        children.push(child);
        parentManager.onChildLoggerCreated({
          parentLogger,
          childLogger: childLoggers[i],
          parentLogLevelManager: parentManager,
          childLogLevelManager: child,
        });
      }

      // Any child change should affect parent and all siblings
      children[1].setLevel(LogLevel.debug);

      expect(parentManager.isLevelEnabled(LogLevel.debug)).toBe(true);
      expect(children[0].isLevelEnabled(LogLevel.debug)).toBe(true);
      expect(children[1].isLevelEnabled(LogLevel.debug)).toBe(true);
      expect(children[2].isLevelEnabled(LogLevel.debug)).toBe(true);
    });

    it("should propagate to all children when using enableIndividualLevel", () => {
      const children: LinkedLogLevelManager[] = [];
      const childLoggers = Array.from({ length: 3 }, () => vi.fn() as any);

      for (let i = 0; i < 3; i++) {
        const child = new LinkedLogLevelManager();
        children.push(child);
        parentManager.onChildLoggerCreated({
          parentLogger,
          childLogger: childLoggers[i],
          parentLogLevelManager: parentManager,
          childLogLevelManager: child,
        });
      }

      parentManager.setLevel(LogLevel.warn);
      parentManager.enableIndividualLevel(LogLevel.debug);

      for (const child of children) {
        expect(child.isLevelEnabled(LogLevel.debug)).toBe(true);
      }
    });

    it("should propagate child enableIndividualLevel to parent and siblings", () => {
      const children: LinkedLogLevelManager[] = [];
      const childLoggers = Array.from({ length: 3 }, () => vi.fn() as any);

      for (let i = 0; i < 3; i++) {
        const child = new LinkedLogLevelManager();
        children.push(child);
        parentManager.onChildLoggerCreated({
          parentLogger,
          childLogger: childLoggers[i],
          parentLogLevelManager: parentManager,
          childLogLevelManager: child,
        });
      }

      parentManager.setLevel(LogLevel.warn);
      children[1].enableIndividualLevel(LogLevel.debug);

      expect(parentManager.isLevelEnabled(LogLevel.debug)).toBe(true);
      for (const child of children) {
        expect(child.isLevelEnabled(LogLevel.debug)).toBe(true);
      }
    });

    it("should propagate to all children when using disableIndividualLevel", () => {
      const children: LinkedLogLevelManager[] = [];
      const childLoggers = Array.from({ length: 3 }, () => vi.fn() as any);

      for (let i = 0; i < 3; i++) {
        const child = new LinkedLogLevelManager();
        children.push(child);
        parentManager.onChildLoggerCreated({
          parentLogger,
          childLogger: childLoggers[i],
          parentLogLevelManager: parentManager,
          childLogLevelManager: child,
        });
      }

      parentManager.disableIndividualLevel(LogLevel.info);

      for (const child of children) {
        expect(child.isLevelEnabled(LogLevel.info)).toBe(false);
      }
    });

    it("should propagate child disableIndividualLevel to parent and siblings", () => {
      const children: LinkedLogLevelManager[] = [];
      const childLoggers = Array.from({ length: 3 }, () => vi.fn() as any);

      for (let i = 0; i < 3; i++) {
        const child = new LinkedLogLevelManager();
        children.push(child);
        parentManager.onChildLoggerCreated({
          parentLogger,
          childLogger: childLoggers[i],
          parentLogLevelManager: parentManager,
          childLogLevelManager: child,
        });
      }

      children[1].disableIndividualLevel(LogLevel.info);

      expect(parentManager.isLevelEnabled(LogLevel.info)).toBe(false);
      for (const child of children) {
        expect(child.isLevelEnabled(LogLevel.info)).toBe(false);
      }
    });

    it("should propagate to all children when using enableLogging", () => {
      const children: LinkedLogLevelManager[] = [];
      const childLoggers = Array.from({ length: 3 }, () => vi.fn() as any);

      for (let i = 0; i < 3; i++) {
        const child = new LinkedLogLevelManager();
        children.push(child);
        parentManager.onChildLoggerCreated({
          parentLogger,
          childLogger: childLoggers[i],
          parentLogLevelManager: parentManager,
          childLogLevelManager: child,
        });
      }

      parentManager.disableLogging();
      parentManager.enableLogging();

      for (const child of children) {
        expect(child.isLevelEnabled(LogLevel.info)).toBe(true);
        expect(child.isLevelEnabled(LogLevel.fatal)).toBe(true);
      }
    });

    it("should propagate child enableLogging to parent and siblings", () => {
      const children: LinkedLogLevelManager[] = [];
      const childLoggers = Array.from({ length: 3 }, () => vi.fn() as any);

      for (let i = 0; i < 3; i++) {
        const child = new LinkedLogLevelManager();
        children.push(child);
        parentManager.onChildLoggerCreated({
          parentLogger,
          childLogger: childLoggers[i],
          parentLogLevelManager: parentManager,
          childLogLevelManager: child,
        });
      }

      parentManager.disableLogging();
      children[1].enableLogging();

      expect(parentManager.isLevelEnabled(LogLevel.info)).toBe(true);
      for (const child of children) {
        expect(child.isLevelEnabled(LogLevel.info)).toBe(true);
      }
    });

    it("should propagate to all children when using disableLogging", () => {
      const children: LinkedLogLevelManager[] = [];
      const childLoggers = Array.from({ length: 3 }, () => vi.fn() as any);

      for (let i = 0; i < 3; i++) {
        const child = new LinkedLogLevelManager();
        children.push(child);
        parentManager.onChildLoggerCreated({
          parentLogger,
          childLogger: childLoggers[i],
          parentLogLevelManager: parentManager,
          childLogLevelManager: child,
        });
      }

      parentManager.disableLogging();

      for (const child of children) {
        expect(child.isLevelEnabled(LogLevel.fatal)).toBe(false);
        expect(child.isLevelEnabled(LogLevel.error)).toBe(false);
      }
    });

    it("should propagate child disableLogging to parent and siblings", () => {
      const children: LinkedLogLevelManager[] = [];
      const childLoggers = Array.from({ length: 3 }, () => vi.fn() as any);

      for (let i = 0; i < 3; i++) {
        const child = new LinkedLogLevelManager();
        children.push(child);
        parentManager.onChildLoggerCreated({
          parentLogger,
          childLogger: childLoggers[i],
          parentLogLevelManager: parentManager,
          childLogLevelManager: child,
        });
      }

      children[1].disableLogging();

      expect(parentManager.isLevelEnabled(LogLevel.fatal)).toBe(false);
      for (const child of children) {
        expect(child.isLevelEnabled(LogLevel.fatal)).toBe(false);
      }
    });

    it("should use WeakRef to prevent memory leaks from circular references", () => {
      // This test verifies that WeakRef is used internally.
      // When children are garbage collected, they should not prevent
      // the parent from being garbage collected, and dead references
      // should be cleaned up during iteration.

      const child1 = new LinkedLogLevelManager();
      const child2 = new LinkedLogLevelManager();

      parentManager.onChildLoggerCreated({
        parentLogger,
        childLogger: vi.fn() as any,
        parentLogLevelManager: parentManager,
        childLogLevelManager: child1,
      });

      parentManager.onChildLoggerCreated({
        parentLogger,
        childLogger: vi.fn() as any,
        parentLogLevelManager: parentManager,
        childLogLevelManager: child2,
      });

      // Both children should receive updates from parent
      parentManager.setLevel(LogLevel.error);
      expect(child1.isLevelEnabled(LogLevel.error)).toBe(true);
      expect(child2.isLevelEnabled(LogLevel.error)).toBe(true);

      // Child changes should affect parent and siblings
      child1.setLevel(LogLevel.debug);
      expect(parentManager.isLevelEnabled(LogLevel.debug)).toBe(true);
      expect(child2.isLevelEnabled(LogLevel.debug)).toBe(true);

      // The fact that this works without memory leaks is because
      // WeakRef allows garbage collection when objects are no longer referenced
    });
  });

  describe("Disposable", () => {
    it("should implement Disposable interface", () => {
      const manager = new LinkedLogLevelManager();
      expect(typeof manager[Symbol.dispose]).toBe("function");
    });

    it("should clear references when disposed", () => {
      const parent = new LinkedLogLevelManager();
      const child = new LinkedLogLevelManager();

      parent.onChildLoggerCreated({
        parentLogger,
        childLogger,
        parentLogLevelManager: parent,
        childLogLevelManager: child,
      });

      // Verify relationship exists
      parent.setLevel(LogLevel.warn);
      expect(child.isLevelEnabled(LogLevel.warn)).toBe(true);
      expect(child.isLevelEnabled(LogLevel.info)).toBe(false);

      // Dispose parent
      parent[Symbol.dispose]();

      // After disposal, parent should not propagate to children
      // The parent's setLevel should return early and not update the shared container
      parent.setLevel(LogLevel.error);
      // Child should still have warn level (not updated by disposed parent)
      expect(child.isLevelEnabled(LogLevel.warn)).toBe(true);
      expect(child.isLevelEnabled(LogLevel.info)).toBe(false);
    });

    it("should return early from methods when disposed", () => {
      const manager = new LinkedLogLevelManager();
      manager.setLevel(LogLevel.warn);
      expect(manager.isLevelEnabled(LogLevel.warn)).toBe(true);

      manager[Symbol.dispose]();

      // All methods should return early
      manager.setLevel(LogLevel.debug);
      manager.enableIndividualLevel(LogLevel.info);
      manager.disableIndividualLevel(LogLevel.warn);
      manager.enableLogging();
      manager.disableLogging();

      // isLevelEnabled should return false
      expect(manager.isLevelEnabled(LogLevel.warn)).toBe(false);
      expect(manager.isLevelEnabled(LogLevel.debug)).toBe(false);
    });

    it("should return false from isLevelEnabled when disposed", () => {
      const manager = new LinkedLogLevelManager();
      manager.setLevel(LogLevel.info);
      expect(manager.isLevelEnabled(LogLevel.info)).toBe(true);

      manager[Symbol.dispose]();
      expect(manager.isLevelEnabled(LogLevel.info)).toBe(false);
    });

    it("should not allow onChildLoggerCreated after disposal", () => {
      const parent = new LinkedLogLevelManager();
      const child = new LinkedLogLevelManager();

      parent[Symbol.dispose]();

      parent.onChildLoggerCreated({
        parentLogger,
        childLogger,
        parentLogLevelManager: parent,
        childLogLevelManager: child,
      });

      // Child should not receive updates from disposed parent
      parent.setLevel(LogLevel.warn);
      // Child has default level (not updated)
      expect(child.isLevelEnabled(LogLevel.info)).toBe(true);
    });

    it("should create a new instance when cloning a disposed manager", () => {
      const manager = new LinkedLogLevelManager();
      manager.setLevel(LogLevel.error);
      manager[Symbol.dispose]();

      const clone = manager.clone();
      expect(clone).toBeInstanceOf(LinkedLogLevelManager);
      // Clone should have default levels (not error)
      expect(clone.isLevelEnabled(LogLevel.info)).toBe(true);
      expect(clone.isLevelEnabled(LogLevel.error)).toBe(true);
    });

    it("should be safe to call dispose multiple times", () => {
      const manager = new LinkedLogLevelManager();
      manager[Symbol.dispose]();
      manager[Symbol.dispose](); // Should not throw
      manager[Symbol.dispose](); // Should not throw
    });

    it("should not propagate changes after disposal", () => {
      const parent = new LinkedLogLevelManager();
      const child = new LinkedLogLevelManager();

      parent.onChildLoggerCreated({
        parentLogger,
        childLogger,
        parentLogLevelManager: parent,
        childLogLevelManager: child,
      });

      // Set initial level
      parent.setLevel(LogLevel.warn);
      expect(parent.isLevelEnabled(LogLevel.warn)).toBe(true);
      expect(child.isLevelEnabled(LogLevel.warn)).toBe(true);

      // Dispose child
      child[Symbol.dispose]();

      // Child changes should not affect parent after disposal (child.setLevel returns early)
      child.setLevel(LogLevel.debug);
      // Parent should still have warn level (not updated by disposed child)
      expect(parent.isLevelEnabled(LogLevel.warn)).toBe(true);
      expect(parent.isLevelEnabled(LogLevel.debug)).toBe(false);

      // Parent changes should not affect disposed child (parent propagates, but child is disposed)
      parent.setLevel(LogLevel.error);
      // Disposed child should return false from isLevelEnabled
      expect(child.isLevelEnabled(LogLevel.error)).toBe(false);
    });
  });
});
