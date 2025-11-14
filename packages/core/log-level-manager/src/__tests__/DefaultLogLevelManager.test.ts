import { LogLevel } from "@loglayer/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DefaultLogLevelManager } from "../DefaultLogLevelManager.js";

const parentLogger = vi.fn() as any;
const childLogger = vi.fn() as any;

describe("DefaultLogLevelManager", () => {
  let logLevelManager: DefaultLogLevelManager;

  beforeEach(() => {
    logLevelManager = new DefaultLogLevelManager();
  });

  describe("setLevel", () => {
    it("should set log level correctly", () => {
      logLevelManager.setLevel(LogLevel.warn);

      expect(logLevelManager.isLevelEnabled(LogLevel.info)).toBe(false);
      expect(logLevelManager.isLevelEnabled(LogLevel.warn)).toBe(true);
      expect(logLevelManager.isLevelEnabled(LogLevel.error)).toBe(true);
      expect(logLevelManager.isLevelEnabled(LogLevel.fatal)).toBe(true);
    });
  });

  describe("enableIndividualLevel", () => {
    it("should enable a specific log level", () => {
      logLevelManager.setLevel(LogLevel.warn);
      logLevelManager.enableIndividualLevel(LogLevel.debug);

      expect(logLevelManager.isLevelEnabled(LogLevel.debug)).toBe(true);
      expect(logLevelManager.isLevelEnabled(LogLevel.info)).toBe(false);
    });
  });

  describe("disableIndividualLevel", () => {
    it("should disable a specific log level", () => {
      logLevelManager.disableIndividualLevel(LogLevel.info);

      expect(logLevelManager.isLevelEnabled(LogLevel.info)).toBe(false);
      expect(logLevelManager.isLevelEnabled(LogLevel.warn)).toBe(true);
    });
  });

  describe("isLevelEnabled", () => {
    it("should return true for enabled levels", () => {
      expect(logLevelManager.isLevelEnabled(LogLevel.info)).toBe(true);
    });

    it("should return false for disabled levels", () => {
      logLevelManager.setLevel(LogLevel.warn);
      expect(logLevelManager.isLevelEnabled(LogLevel.info)).toBe(false);
    });
  });

  describe("enableLogging", () => {
    it("should enable all log levels", () => {
      logLevelManager.disableLogging();
      logLevelManager.enableLogging();

      expect(logLevelManager.isLevelEnabled(LogLevel.info)).toBe(true);
      expect(logLevelManager.isLevelEnabled(LogLevel.debug)).toBe(true);
      expect(logLevelManager.isLevelEnabled(LogLevel.trace)).toBe(true);
    });
  });

  describe("disableLogging", () => {
    it("should disable all log levels", () => {
      logLevelManager.disableLogging();

      expect(logLevelManager.isLevelEnabled(LogLevel.fatal)).toBe(false);
      expect(logLevelManager.isLevelEnabled(LogLevel.error)).toBe(false);
    });
  });

  describe("onChildLoggerCreated", () => {
    it("should copy parent log level status to child", () => {
      const childLogLevelManager = new DefaultLogLevelManager();

      logLevelManager.setLevel(LogLevel.warn);
      logLevelManager.onChildLoggerCreated({
        parentLogger,
        childLogger,
        parentLogLevelManager: logLevelManager,
        childLogLevelManager,
      });

      expect(childLogLevelManager.isLevelEnabled(LogLevel.info)).toBe(false);
      expect(childLogLevelManager.isLevelEnabled(LogLevel.warn)).toBe(true);
    });

    it("should not link parent and child - changes are independent", () => {
      const childLogLevelManager = new DefaultLogLevelManager();

      logLevelManager.setLevel(LogLevel.warn);
      logLevelManager.onChildLoggerCreated({
        parentLogger,
        childLogger,
        parentLogLevelManager: logLevelManager,
        childLogLevelManager,
      });

      // Change parent after child is created
      logLevelManager.setLevel(LogLevel.debug);

      // Child should not be affected
      expect(childLogLevelManager.isLevelEnabled(LogLevel.warn)).toBe(true);
      expect(childLogLevelManager.isLevelEnabled(LogLevel.debug)).toBe(false);
      expect(logLevelManager.isLevelEnabled(LogLevel.debug)).toBe(true);
    });
  });

  describe("clone", () => {
    it("should create a new instance with the same log level settings", () => {
      logLevelManager.setLevel(LogLevel.error);

      const clonedManager = logLevelManager.clone();
      expect(clonedManager.isLevelEnabled(LogLevel.error)).toBe(true);
      expect(clonedManager.isLevelEnabled(LogLevel.warn)).toBe(false);
    });

    it("should create independent instances", () => {
      logLevelManager.setLevel(LogLevel.warn);
      const clonedManager = logLevelManager.clone();

      clonedManager.setLevel(LogLevel.debug);

      expect(logLevelManager.isLevelEnabled(LogLevel.warn)).toBe(true);
      expect(logLevelManager.isLevelEnabled(LogLevel.debug)).toBe(false);
      expect(clonedManager.isLevelEnabled(LogLevel.debug)).toBe(true);
    });
  });
});
