import { DefaultLogLevelManager } from "@loglayer/log-level-manager";
import { LogLevel } from "@loglayer/shared";
import { describe, expect, it, vi } from "vitest";
import { LogLayer } from "../LogLayer.js";
import { TestLoggingLibrary } from "../TestLoggingLibrary.js";
import { TestTransport } from "../transports/TestTransport.js";

function getLogger() {
  const genericLogger = new TestLoggingLibrary();

  return new LogLayer({
    transport: new TestTransport({
      id: "test",
      logger: genericLogger,
    }),
  });
}

describe("LogLayer log level manager integration", () => {
  describe("withLogLevelManager", () => {
    it("should set a custom log level manager", () => {
      const log = getLogger();
      const customManager = new DefaultLogLevelManager();

      log.withLogLevelManager(customManager);

      const manager = log.getLogLevelManager<DefaultLogLevelManager>();
      expect(manager).toBe(customManager);
    });

    it("should return the same instance for chaining", () => {
      const log = getLogger();
      const manager = new DefaultLogLevelManager();

      const result = log.withLogLevelManager(manager);
      expect(result).toBe(log);
    });
  });

  describe("getLogLevelManager", () => {
    it("should return the default log level manager by default", () => {
      const log = getLogger();
      const manager = log.getLogLevelManager();

      expect(manager).toBeInstanceOf(DefaultLogLevelManager);
    });

    it("should return the custom log level manager when set", () => {
      const log = getLogger();
      const customManager = new DefaultLogLevelManager();

      log.withLogLevelManager(customManager);
      const manager = log.getLogLevelManager<DefaultLogLevelManager>();

      expect(manager).toBe(customManager);
      expect(manager).toBeInstanceOf(DefaultLogLevelManager);
    });

    it("should support type casting for specific manager types", () => {
      const log = getLogger();
      const customManager = new DefaultLogLevelManager();

      log.withLogLevelManager(customManager);
      const manager = log.getLogLevelManager<DefaultLogLevelManager>();

      expect(manager).toBe(customManager);
      expect(manager).toBeInstanceOf(DefaultLogLevelManager);
    });
  });

  describe("child logger with DefaultLogLevelManager", () => {
    it("should clone log level manager for child logger", () => {
      const parentLog = getLogger();
      const _parentGenericLogger = parentLog.getLoggerInstance("test") as TestLoggingLibrary;

      // Set log level on parent
      parentLog.setLevel(LogLevel.warn);

      const childLog = parentLog.child();
      const _childGenericLogger = childLog.getLoggerInstance("test") as TestLoggingLibrary;

      // Child should inherit parent's log level at creation
      expect(childLog.isLevelEnabled(LogLevel.warn)).toBe(true);
      expect(childLog.isLevelEnabled(LogLevel.info)).toBe(false);

      // Parent change should not affect child (DefaultLogLevelManager behavior)
      parentLog.setLevel(LogLevel.debug);

      expect(parentLog.isLevelEnabled(LogLevel.debug)).toBe(true);
      expect(childLog.isLevelEnabled(LogLevel.debug)).toBe(false); // Child not affected
      expect(childLog.isLevelEnabled(LogLevel.warn)).toBe(true); // Child still at warn
    });

    it("should have independent log level managers for parent and child", () => {
      const parentLog = getLogger();
      const childLog = parentLog.child();

      const parentManager = parentLog.getLogLevelManager();
      const childManager = childLog.getLogLevelManager();

      // They should be different instances
      expect(parentManager).not.toBe(childManager);
      expect(parentManager).toBeInstanceOf(DefaultLogLevelManager);
      expect(childManager).toBeInstanceOf(DefaultLogLevelManager);
    });
  });

  describe("log level manager methods delegation", () => {
    it("should delegate setLevel to log level manager", () => {
      const log = getLogger();
      const manager = log.getLogLevelManager();
      const setLevelSpy = vi.spyOn(manager, "setLevel");

      log.setLevel(LogLevel.warn);

      expect(setLevelSpy).toHaveBeenCalledWith(LogLevel.warn);
    });

    it("should delegate enableIndividualLevel to log level manager", () => {
      const log = getLogger();
      const manager = log.getLogLevelManager();
      const enableSpy = vi.spyOn(manager, "enableIndividualLevel");

      log.enableIndividualLevel(LogLevel.debug);

      expect(enableSpy).toHaveBeenCalledWith(LogLevel.debug);
    });

    it("should delegate disableIndividualLevel to log level manager", () => {
      const log = getLogger();
      const manager = log.getLogLevelManager();
      const disableSpy = vi.spyOn(manager, "disableIndividualLevel");

      log.disableIndividualLevel(LogLevel.info);

      expect(disableSpy).toHaveBeenCalledWith(LogLevel.info);
    });

    it("should delegate isLevelEnabled to log level manager", () => {
      const log = getLogger();
      const manager = log.getLogLevelManager();
      const isEnabledSpy = vi.spyOn(manager, "isLevelEnabled");

      log.isLevelEnabled(LogLevel.warn);

      expect(isEnabledSpy).toHaveBeenCalledWith(LogLevel.warn);
    });

    it("should delegate enableLogging to log level manager", () => {
      const log = getLogger();
      const manager = log.getLogLevelManager();
      const enableSpy = vi.spyOn(manager, "enableLogging");

      log.enableLogging();

      expect(enableSpy).toHaveBeenCalled();
    });

    it("should delegate disableLogging to log level manager", () => {
      const log = getLogger();
      const manager = log.getLogLevelManager();
      const disableSpy = vi.spyOn(manager, "disableLogging");

      log.disableLogging();

      expect(disableSpy).toHaveBeenCalled();
    });
  });
});
