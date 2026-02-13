import { LogLevel } from "@loglayer/shared";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LogLayer } from "../LogLayer.js";
import { MockLogBuilder } from "../MockLogBuilder.js";
import { MockLogLayer } from "../MockLogLayer.js";
import { TestLoggingLibrary } from "../TestLoggingLibrary.js";
import { ConsoleTransport } from "../transports/ConsoleTransport.js";

function createTestTransport(id: string) {
  return new ConsoleTransport({
    id,
    // @ts-expect-error
    logger: new TestLoggingLibrary(),
  });
}

function getLogger(log: LogLayer, id: string) {
  return log.getLoggerInstance(id) as TestLoggingLibrary;
}

describe("LogLayer groups functionality", () => {
  describe("backward compatibility", () => {
    it("should send logs to all transports when no groups are configured", () => {
      const transport1 = createTestTransport("t1");
      const transport2 = createTestTransport("t2");

      const log = new LogLayer({
        transport: [transport1, transport2],
      });

      log.info("test message");

      expect(getLogger(log, "t1").popLine()).toStrictEqual(
        expect.objectContaining({ level: LogLevel.info, data: ["test message"] }),
      );
      expect(getLogger(log, "t2").popLine()).toStrictEqual(
        expect.objectContaining({ level: LogLevel.info, data: ["test message"] }),
      );
    });

    it("should send ungrouped logs to all transports even when groups are configured", () => {
      const transport1 = createTestTransport("t1");
      const transport2 = createTestTransport("t2");

      const log = new LogLayer({
        transport: [transport1, transport2],
        groups: {
          database: { transports: ["t1"], level: "error" },
        },
      });

      // Ungrouped log should go to all transports
      log.info("ungrouped message");

      expect(getLogger(log, "t1").popLine()).toStrictEqual(
        expect.objectContaining({ level: LogLevel.info, data: ["ungrouped message"] }),
      );
      expect(getLogger(log, "t2").popLine()).toStrictEqual(
        expect.objectContaining({ level: LogLevel.info, data: ["ungrouped message"] }),
      );
    });
  });

  describe("basic group routing", () => {
    it("should route grouped logs only to the group's transports", () => {
      const transport1 = createTestTransport("t1");
      const transport2 = createTestTransport("t2");

      const log = new LogLayer({
        transport: [transport1, transport2],
        groups: {
          database: { transports: ["t1"] },
        },
      });

      log.withGroup("database").error("db error");

      expect(getLogger(log, "t1").popLine()).toStrictEqual(
        expect.objectContaining({ level: LogLevel.error, data: ["db error"] }),
      );
      expect(getLogger(log, "t2").popLine()).toBeUndefined();
    });

    it("should route multi-group logs to the union of transports", () => {
      const transport1 = createTestTransport("t1");
      const transport2 = createTestTransport("t2");
      const transport3 = createTestTransport("t3");

      const log = new LogLayer({
        transport: [transport1, transport2, transport3],
        groups: {
          database: { transports: ["t1"] },
          auth: { transports: ["t2"] },
        },
      });

      log.withGroup(["database", "auth"]).error("multi-group error");

      expect(getLogger(log, "t1").popLine()).toStrictEqual(
        expect.objectContaining({ level: LogLevel.error, data: ["multi-group error"] }),
      );
      expect(getLogger(log, "t2").popLine()).toStrictEqual(
        expect.objectContaining({ level: LogLevel.error, data: ["multi-group error"] }),
      );
      expect(getLogger(log, "t3").popLine()).toBeUndefined();
    });
  });

  describe("group log level filtering", () => {
    it("should drop logs below the group's level", () => {
      const transport1 = createTestTransport("t1");

      const log = new LogLayer({
        transport: [transport1],
        groups: {
          database: { transports: ["t1"], level: "error" },
        },
      });

      log.withGroup("database").info("should be dropped");
      expect(getLogger(log, "t1").popLine()).toBeUndefined();

      log.withGroup("database").warn("should also be dropped");
      expect(getLogger(log, "t1").popLine()).toBeUndefined();

      log.withGroup("database").error("should pass");
      expect(getLogger(log, "t1").popLine()).toStrictEqual(
        expect.objectContaining({ level: LogLevel.error, data: ["should pass"] }),
      );
    });

    it("should allow logs at or above the group's level", () => {
      const transport1 = createTestTransport("t1");

      const log = new LogLayer({
        transport: [transport1],
        groups: {
          database: { transports: ["t1"], level: "warn" },
        },
      });

      log.withGroup("database").warn("warn passes");
      expect(getLogger(log, "t1").popLine()).toBeDefined();

      log.withGroup("database").error("error passes");
      expect(getLogger(log, "t1").popLine()).toBeDefined();

      log.withGroup("database").fatal("fatal passes");
      expect(getLogger(log, "t1").popLine()).toBeDefined();
    });

    it("should allow all levels when group has no level set", () => {
      const transport1 = createTestTransport("t1");

      const log = new LogLayer({
        transport: [transport1],
        groups: {
          database: { transports: ["t1"] },
        },
      });

      log.withGroup("database").trace("trace passes");
      expect(getLogger(log, "t1").popLine()).toBeDefined();
    });
  });

  describe("group enabled/disabled", () => {
    it("should not route logs through a disabled group", () => {
      const transport1 = createTestTransport("t1");

      const log = new LogLayer({
        transport: [transport1],
        groups: {
          database: { transports: ["t1"], enabled: false },
        },
      });

      log.withGroup("database").error("should be dropped");
      expect(getLogger(log, "t1").popLine()).toBeUndefined();
    });

    it("should allow disableGroup at runtime", () => {
      const transport1 = createTestTransport("t1");

      const log = new LogLayer({
        transport: [transport1],
        groups: {
          database: { transports: ["t1"] },
        },
      });

      log.disableGroup("database");
      log.withGroup("database").error("should be dropped");
      expect(getLogger(log, "t1").popLine()).toBeUndefined();
    });

    it("should allow enableGroup at runtime", () => {
      const transport1 = createTestTransport("t1");

      const log = new LogLayer({
        transport: [transport1],
        groups: {
          database: { transports: ["t1"], enabled: false },
        },
      });

      log.enableGroup("database");
      log.withGroup("database").error("should pass");
      expect(getLogger(log, "t1").popLine()).toStrictEqual(
        expect.objectContaining({ level: LogLevel.error, data: ["should pass"] }),
      );
    });
  });

  describe("activeGroups filter", () => {
    it("should only route logs through active groups", () => {
      const transport1 = createTestTransport("t1");
      const transport2 = createTestTransport("t2");

      const log = new LogLayer({
        transport: [transport1, transport2],
        groups: {
          database: { transports: ["t1"] },
          auth: { transports: ["t2"] },
        },
        activeGroups: ["database"],
      });

      log.withGroup("database").error("db error");
      expect(getLogger(log, "t1").popLine()).toBeDefined();

      log.withGroup("auth").error("auth error");
      expect(getLogger(log, "t2").popLine()).toBeUndefined();
    });

    it("should allow setActiveGroups at runtime", () => {
      const transport1 = createTestTransport("t1");
      const transport2 = createTestTransport("t2");

      const log = new LogLayer({
        transport: [transport1, transport2],
        groups: {
          database: { transports: ["t1"] },
          auth: { transports: ["t2"] },
        },
      });

      log.setActiveGroups(["auth"]);

      log.withGroup("database").error("should be dropped");
      expect(getLogger(log, "t1").popLine()).toBeUndefined();

      log.withGroup("auth").error("should pass");
      expect(getLogger(log, "t2").popLine()).toBeDefined();
    });

    it("should clear the filter when setActiveGroups(null)", () => {
      const transport1 = createTestTransport("t1");

      const log = new LogLayer({
        transport: [transport1],
        groups: {
          database: { transports: ["t1"] },
        },
        activeGroups: ["nonexistent"],
      });

      log.withGroup("database").error("should be dropped");
      expect(getLogger(log, "t1").popLine()).toBeUndefined();

      log.setActiveGroups(null);

      log.withGroup("database").error("should pass");
      expect(getLogger(log, "t1").popLine()).toBeDefined();
    });
  });

  describe("ungrouped behavior", () => {
    it("should send ungrouped logs to all transports by default (ungrouped: 'all')", () => {
      const transport1 = createTestTransport("t1");
      const transport2 = createTestTransport("t2");

      const log = new LogLayer({
        transport: [transport1, transport2],
        groups: {
          database: { transports: ["t1"] },
        },
        ungrouped: "all",
      });

      log.info("ungrouped");
      expect(getLogger(log, "t1").popLine()).toBeDefined();
      expect(getLogger(log, "t2").popLine()).toBeDefined();
    });

    it("should drop ungrouped logs when ungrouped: 'none'", () => {
      const transport1 = createTestTransport("t1");
      const transport2 = createTestTransport("t2");

      const log = new LogLayer({
        transport: [transport1, transport2],
        groups: {
          database: { transports: ["t1"] },
        },
        ungrouped: "none",
      });

      log.info("ungrouped");
      expect(getLogger(log, "t1").popLine()).toBeUndefined();
      expect(getLogger(log, "t2").popLine()).toBeUndefined();
    });

    it("should send ungrouped logs only to specific transports when ungrouped is string[]", () => {
      const transport1 = createTestTransport("t1");
      const transport2 = createTestTransport("t2");

      const log = new LogLayer({
        transport: [transport1, transport2],
        groups: {
          database: { transports: ["t1"] },
        },
        ungrouped: ["t2"],
      });

      log.info("ungrouped");
      expect(getLogger(log, "t1").popLine()).toBeUndefined();
      expect(getLogger(log, "t2").popLine()).toBeDefined();
    });
  });

  describe("child logger with persistent groups", () => {
    it("should create a child logger with withGroup that persists groups", () => {
      const transport1 = createTestTransport("t1");
      const transport2 = createTestTransport("t2");

      const log = new LogLayer({
        transport: [transport1, transport2],
        groups: {
          database: { transports: ["t1"] },
        },
      });

      const dbLogger = log.withGroup("database");

      dbLogger.error("first");
      expect(getLogger(log, "t1").popLine()).toBeDefined();
      expect(getLogger(log, "t2").popLine()).toBeUndefined();

      dbLogger.error("second");
      expect(getLogger(log, "t1").popLine()).toBeDefined();
      expect(getLogger(log, "t2").popLine()).toBeUndefined();
    });

    it("should not affect the parent logger", () => {
      const transport1 = createTestTransport("t1");
      const transport2 = createTestTransport("t2");

      const log = new LogLayer({
        transport: [transport1, transport2],
        groups: {
          database: { transports: ["t1"] },
        },
      });

      const _dbLogger = log.withGroup("database");

      // Parent should still send to all transports (ungrouped)
      log.info("parent log");
      expect(getLogger(log, "t1").popLine()).toBeDefined();
      expect(getLogger(log, "t2").popLine()).toBeDefined();
    });

    it("should inherit parent groups in nested withGroup", () => {
      const transport1 = createTestTransport("t1");
      const transport2 = createTestTransport("t2");
      const transport3 = createTestTransport("t3");

      const log = new LogLayer({
        transport: [transport1, transport2, transport3],
        groups: {
          database: { transports: ["t1"] },
          auth: { transports: ["t2"] },
        },
      });

      const authDbLogger = log.withGroup("database").withGroup("auth");

      authDbLogger.error("nested groups");
      expect(getLogger(log, "t1").popLine()).toBeDefined();
      expect(getLogger(log, "t2").popLine()).toBeDefined();
      expect(getLogger(log, "t3").popLine()).toBeUndefined();
    });
  });

  describe("group merging (logger-level + per-log)", () => {
    it("should merge logger-level and per-log groups", () => {
      const transport1 = createTestTransport("t1");
      const transport2 = createTestTransport("t2");

      const log = new LogLayer({
        transport: [transport1, transport2],
        groups: {
          database: { transports: ["t1"] },
          auth: { transports: ["t2"] },
        },
      });

      const dbLogger = log.withGroup("database");

      // Add auth group via LogBuilder
      dbLogger.withMetadata({ test: true }).withGroup("auth").error("merged groups");
      expect(getLogger(log, "t1").popLine()).toBeDefined();
      expect(getLogger(log, "t2").popLine()).toBeDefined();
    });
  });

  describe("undefined groups", () => {
    it("should treat logs tagged with undefined groups as ungrouped", () => {
      const transport1 = createTestTransport("t1");
      const transport2 = createTestTransport("t2");

      const log = new LogLayer({
        transport: [transport1, transport2],
        groups: {
          database: { transports: ["t1"] },
        },
      });

      // 'nonexistent' is not defined in groups config
      log.withGroup("nonexistent").error("unknown group");
      // Should fall through to ungrouped rules (default: 'all')
      expect(getLogger(log, "t1").popLine()).toBeDefined();
      expect(getLogger(log, "t2").popLine()).toBeDefined();
    });

    it("should treat mix of defined and undefined groups correctly", () => {
      const transport1 = createTestTransport("t1");
      const transport2 = createTestTransport("t2");

      const log = new LogLayer({
        transport: [transport1, transport2],
        groups: {
          database: { transports: ["t1"], level: "error" },
        },
      });

      // 'database' is defined, 'nonexistent' is not
      log.withGroup(["database", "nonexistent"]).error("mixed groups");
      // 'database' group routes to t1 and passes level check
      expect(getLogger(log, "t1").popLine()).toBeDefined();
      // 'nonexistent' is not defined, but hasAnyDefinedGroup is true (database), so t2 is NOT ungrouped
      expect(getLogger(log, "t2").popLine()).toBeUndefined();
    });
  });

  describe("runtime management", () => {
    it("should add groups at runtime with addGroup", () => {
      const transport1 = createTestTransport("t1");

      const log = new LogLayer({
        transport: [transport1],
        groups: {},
      });

      log.addGroup("database", { transports: ["t1"], level: "error" });

      log.withGroup("database").error("should pass");
      expect(getLogger(log, "t1").popLine()).toBeDefined();

      log.withGroup("database").info("should be dropped");
      expect(getLogger(log, "t1").popLine()).toBeUndefined();
    });

    it("should remove groups at runtime with removeGroup", () => {
      const transport1 = createTestTransport("t1");
      const transport2 = createTestTransport("t2");

      const log = new LogLayer({
        transport: [transport1, transport2],
        groups: {
          database: { transports: ["t1"] },
        },
      });

      log.removeGroup("database");

      // After removing, 'database' group is unknown, treated as ungrouped
      log.withGroup("database").error("now ungrouped");
      expect(getLogger(log, "t1").popLine()).toBeDefined();
      expect(getLogger(log, "t2").popLine()).toBeDefined();
    });

    it("should update group level at runtime with setGroupLevel", () => {
      const transport1 = createTestTransport("t1");

      const log = new LogLayer({
        transport: [transport1],
        groups: {
          database: { transports: ["t1"], level: "error" },
        },
      });

      log.withGroup("database").info("should be dropped");
      expect(getLogger(log, "t1").popLine()).toBeUndefined();

      log.setGroupLevel("database", "info");

      log.withGroup("database").info("should pass now");
      expect(getLogger(log, "t1").popLine()).toBeDefined();
    });

    it("should return groups snapshot with getGroups", () => {
      const log = new LogLayer({
        transport: createTestTransport("t1"),
        groups: {
          database: { transports: ["t1"], level: "error" },
        },
      });

      const groups = log.getGroups();
      expect(groups).toStrictEqual({
        database: { transports: ["t1"], level: "error" },
      });

      // Snapshot should not be affected by later changes
      log.addGroup("auth", { transports: ["t1"] });
      expect(groups).not.toHaveProperty("auth");
    });
  });

  describe("groups passed to transports", () => {
    it("should include groups in LogLayerTransportParams", () => {
      const transport1 = createTestTransport("t1");
      const originalShipToLogger = transport1.shipToLogger.bind(transport1);
      const shipSpy = vi.fn(originalShipToLogger);
      transport1.shipToLogger = shipSpy;

      const log = new LogLayer({
        transport: [transport1],
        groups: {
          database: { transports: ["t1"] },
        },
      });

      log.withGroup("database").error("test");

      expect(shipSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          groups: ["database"],
        }),
      );
    });

    it("should not include groups when no groups are tagged", () => {
      const transport1 = createTestTransport("t1");
      const originalShipToLogger = transport1.shipToLogger.bind(transport1);
      const shipSpy = vi.fn(originalShipToLogger);
      transport1.shipToLogger = shipSpy;

      const log = new LogLayer({
        transport: [transport1],
      });

      log.info("no groups");

      expect(shipSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          groups: undefined,
        }),
      );
    });
  });

  describe("groups passed to shouldSendToLogger plugin", () => {
    it("should include groups in plugin params", () => {
      const transport1 = createTestTransport("t1");
      const shouldSendSpy = vi.fn(() => true);

      const log = new LogLayer({
        transport: [transport1],
        groups: {
          database: { transports: ["t1"] },
        },
        plugins: [
          {
            id: "test-plugin",
            shouldSendToLogger: shouldSendSpy,
          },
        ],
      });

      log.withGroup("database").error("test");

      expect(shouldSendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          groups: ["database"],
        }),
        expect.anything(),
      );
    });
  });

  describe("API chaining", () => {
    it("should work with withMetadata().withGroup()", () => {
      const transport1 = createTestTransport("t1");
      const transport2 = createTestTransport("t2");

      const log = new LogLayer({
        transport: [transport1, transport2],
        groups: {
          database: { transports: ["t1"] },
        },
      });

      log.withMetadata({ query: "SELECT *" }).withGroup("database").error("query failed");

      const line = getLogger(log, "t1").popLine();
      expect(line).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.error,
        }),
      );
      expect(getLogger(log, "t2").popLine()).toBeUndefined();
    });

    it("should work with withError().withGroup()", () => {
      const transport1 = createTestTransport("t1");
      const transport2 = createTestTransport("t2");

      const log = new LogLayer({
        transport: [transport1, transport2],
        groups: {
          database: { transports: ["t1"] },
        },
      });

      log.withError(new Error("test")).withGroup("database").error("error occurred");

      expect(getLogger(log, "t1").popLine()).toBeDefined();
      expect(getLogger(log, "t2").popLine()).toBeUndefined();
    });

    it("should work with withGroup().withMetadata()", () => {
      const transport1 = createTestTransport("t1");
      const transport2 = createTestTransport("t2");

      const log = new LogLayer({
        transport: [transport1, transport2],
        groups: {
          database: { transports: ["t1"] },
        },
      });

      // withGroup on LogLayer returns a child, then withMetadata on that child
      log.withGroup("database").withMetadata({ query: "SELECT *" }).error("query failed");

      expect(getLogger(log, "t1").popLine()).toBeDefined();
      expect(getLogger(log, "t2").popLine()).toBeUndefined();
    });
  });

  describe("single transport", () => {
    it("should apply group routing with a single transport", () => {
      const transport1 = createTestTransport("t1");

      const log = new LogLayer({
        transport: transport1,
        groups: {
          database: { transports: ["t1"], level: "error" },
        },
      });

      log.withGroup("database").info("should be dropped");
      expect(getLogger(log, "t1").popLine()).toBeUndefined();

      log.withGroup("database").error("should pass");
      expect(getLogger(log, "t1").popLine()).toBeDefined();
    });

    it("should drop grouped logs when transport is not in group", () => {
      const transport1 = createTestTransport("t1");

      const log = new LogLayer({
        transport: transport1,
        groups: {
          database: { transports: ["other-transport"] },
        },
      });

      log.withGroup("database").error("wrong transport");
      expect(getLogger(log, "t1").popLine()).toBeUndefined();
    });
  });

  describe("env variable parsing", () => {
    const originalEnv = process.env.LOGLAYER_GROUPS;

    afterEach(() => {
      if (originalEnv === undefined) {
        delete process.env.LOGLAYER_GROUPS;
      } else {
        process.env.LOGLAYER_GROUPS = originalEnv;
      }
    });

    it("should filter active groups from env variable", () => {
      process.env.LOGLAYER_GROUPS = "database";

      const transport1 = createTestTransport("t1");
      const transport2 = createTestTransport("t2");

      const log = new LogLayer({
        transport: [transport1, transport2],
        groups: {
          database: { transports: ["t1"] },
          auth: { transports: ["t2"] },
        },
      });

      log.withGroup("database").error("db error");
      expect(getLogger(log, "t1").popLine()).toBeDefined();

      log.withGroup("auth").error("auth error");
      expect(getLogger(log, "t2").popLine()).toBeUndefined();
    });

    it("should override group levels from env variable", () => {
      process.env.LOGLAYER_GROUPS = "database:debug";

      const transport1 = createTestTransport("t1");

      const log = new LogLayer({
        transport: [transport1],
        groups: {
          database: { transports: ["t1"], level: "error" },
        },
      });

      // Level was overridden from error to debug via env
      log.withGroup("database").debug("debug message");
      expect(getLogger(log, "t1").popLine()).toBeDefined();
    });
  });

  describe("mock classes", () => {
    it("MockLogLayer.withGroup should return this", () => {
      const mock = new MockLogLayer();
      expect(mock.withGroup("database")).toBe(mock);
    });

    it("MockLogLayer group management methods should return this", () => {
      const mock = new MockLogLayer();
      expect(mock.addGroup("db", { transports: ["t1"] })).toBe(mock);
      expect(mock.removeGroup("db")).toBe(mock);
      expect(mock.enableGroup("db")).toBe(mock);
      expect(mock.disableGroup("db")).toBe(mock);
      expect(mock.setGroupLevel("db", "error")).toBe(mock);
      expect(mock.setActiveGroups(["db"])).toBe(mock);
      expect(mock.getGroups()).toStrictEqual({});
    });

    it("MockLogBuilder.withGroup should return this", () => {
      const mock = new MockLogBuilder();
      expect(mock.withGroup("database")).toBe(mock);
    });
  });
});
