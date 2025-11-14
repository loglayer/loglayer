import { LogLevel } from "@loglayer/log-level-manager";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OneWayLogLevelManager } from "../OneWayLogLevelManager.js";

const parentLogger = vi.fn() as any;
const childLogger = vi.fn() as any;

describe("OneWayLogLevelManager", () => {
  let parentManager: OneWayLogLevelManager;
  let childManager: OneWayLogLevelManager;

  beforeEach(() => {
    parentManager = new OneWayLogLevelManager();
    childManager = new OneWayLogLevelManager();
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

    it("should not propagate child changes to parent", () => {
      parentManager.onChildLoggerCreated({
        parentLogger,
        childLogger,
        parentLogLevelManager: parentManager,
        childLogLevelManager: childManager,
      });

      parentManager.setLevel(LogLevel.warn);
      childManager.setLevel(LogLevel.debug);

      expect(parentManager.isLevelEnabled(LogLevel.debug)).toBe(false);
      expect(parentManager.isLevelEnabled(LogLevel.warn)).toBe(true);
      expect(childManager.isLevelEnabled(LogLevel.debug)).toBe(true);
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
  });

  describe("onChildLoggerCreated", () => {
    it("should initialize child with parent's log level status", () => {
      parentManager.setLevel(LogLevel.error);

      parentManager.onChildLoggerCreated({
        parentLogger,
        childLogger,
        parentLogLevelManager: parentManager,
        childLogLevelManager: childManager,
      });

      expect(childManager.isLevelEnabled(LogLevel.error)).toBe(true);
      expect(childManager.isLevelEnabled(LogLevel.warn)).toBe(false);
    });

    it("should set up parent-child relationship", () => {
      parentManager.onChildLoggerCreated({
        parentLogger,
        childLogger,
        parentLogLevelManager: parentManager,
        childLogLevelManager: childManager,
      });

      parentManager.setLevel(LogLevel.debug);
      expect(childManager.isLevelEnabled(LogLevel.debug)).toBe(true);
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
});
