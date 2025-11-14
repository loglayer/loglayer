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
});
