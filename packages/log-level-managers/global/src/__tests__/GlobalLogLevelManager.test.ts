import { LogLevel } from "@loglayer/log-level-manager";
import { beforeEach, describe, expect, it } from "vitest";
import { GlobalLogLevelManager } from "../GlobalLogLevelManager.js";

describe("GlobalLogLevelManager", () => {
  let manager1: GlobalLogLevelManager;
  let manager2: GlobalLogLevelManager;

  beforeEach(() => {
    manager1 = new GlobalLogLevelManager();
    manager2 = new GlobalLogLevelManager();
  });

  describe("setLevel", () => {
    it("should apply changes globally to all instances", () => {
      manager1.setLevel(LogLevel.warn);

      expect(manager1.isLevelEnabled(LogLevel.info)).toBe(false);
      expect(manager1.isLevelEnabled(LogLevel.warn)).toBe(true);
      expect(manager2.isLevelEnabled(LogLevel.info)).toBe(false);
      expect(manager2.isLevelEnabled(LogLevel.warn)).toBe(true);
    });

    it("should allow changes from any instance to affect all", () => {
      manager2.setLevel(LogLevel.debug);

      expect(manager1.isLevelEnabled(LogLevel.debug)).toBe(true);
      expect(manager1.isLevelEnabled(LogLevel.trace)).toBe(false);
      expect(manager2.isLevelEnabled(LogLevel.debug)).toBe(true);
      expect(manager2.isLevelEnabled(LogLevel.trace)).toBe(false);
    });
  });

  describe("enableIndividualLevel", () => {
    it("should apply changes globally", () => {
      manager1.setLevel(LogLevel.warn);
      manager2.enableIndividualLevel(LogLevel.debug);

      expect(manager1.isLevelEnabled(LogLevel.debug)).toBe(true);
      expect(manager2.isLevelEnabled(LogLevel.debug)).toBe(true);
    });
  });

  describe("disableIndividualLevel", () => {
    it("should apply changes globally", () => {
      manager1.disableIndividualLevel(LogLevel.info);

      expect(manager1.isLevelEnabled(LogLevel.info)).toBe(false);
      expect(manager2.isLevelEnabled(LogLevel.info)).toBe(false);
    });
  });

  describe("enableLogging", () => {
    it("should apply changes globally", () => {
      manager1.disableLogging();
      manager2.enableLogging();

      expect(manager1.isLevelEnabled(LogLevel.info)).toBe(true);
      expect(manager2.isLevelEnabled(LogLevel.info)).toBe(true);
    });
  });

  describe("disableLogging", () => {
    it("should apply changes globally", () => {
      manager1.disableLogging();

      expect(manager1.isLevelEnabled(LogLevel.fatal)).toBe(false);
      expect(manager2.isLevelEnabled(LogLevel.fatal)).toBe(false);
    });
  });

  describe("clone", () => {
    it("should create a new instance that shares global state", () => {
      const clone = manager1.clone();

      manager1.setLevel(LogLevel.error);

      expect(clone.isLevelEnabled(LogLevel.error)).toBe(true);
      expect(clone.isLevelEnabled(LogLevel.warn)).toBe(false);
    });
  });
});
