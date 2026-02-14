/**
 * Tests that group-related methods return void (or the correct type)
 * and do not trigger no-floating-promises.
 */
import { ConsoleTransport, lazy, LogLayer, MockLogLayer } from "loglayer";
import { allLoggers } from "./setup.js";

function testWithGroupPerLog() {
  for (const log of allLoggers) {
    log.withGroup("database").info("grouped info");
    log.withGroup("database").warn("grouped warn");
    log.withGroup("database").error("grouped error");
    log.withGroup("database").debug("grouped debug");
    log.withGroup("database").trace("grouped trace");
    log.withGroup("database").fatal("grouped fatal");

    // Multiple groups
    log.withGroup(["database", "auth"]).error("multi-group error");
  }
}

testWithGroupPerLog();

function testWithGroupChaining() {
  for (const log of allLoggers) {
    log.withMetadata({ query: "SELECT *" }).withGroup("database").error("metadata + group");
    log.withError(new Error("timeout")).withGroup("database").error("error + group");
    log.withMetadata({ key: "value" }).withError(new Error("test")).withGroup("auth").warn("all chained");
    log.withGroup("database").withMetadata({ key: "value" }).info("group then metadata");
    log.withGroup("database").withError(new Error("test")).error("group then error");

    // Sync lazy with groups
    log.withMetadata({ val: lazy(() => 42) }).withGroup("database").info("lazy + group");
  }
}

testWithGroupChaining();

function testWithGroupChildLogger() {
  for (const log of allLoggers) {
    const dbLogger = log.withGroup("database");
    dbLogger.info("child group info");
    dbLogger.error("child group error");
    dbLogger.withMetadata({ key: "value" }).info("child group metadata");
    dbLogger.withError(new Error("test")).error("child group error");

    // Additive groups
    const authDbLogger = log.withGroup("auth").withGroup("database");
    authDbLogger.error("multi-group child");

    // Child of grouped logger
    const child = dbLogger.child();
    child.info("grandchild of grouped");
  }
}

testWithGroupChildLogger();

function testGroupRuntimeManagement() {
  const log = new LogLayer({
    transport: [
      new ConsoleTransport({ id: "console", logger: console }),
      new ConsoleTransport({ id: "other", logger: console }),
    ],
    groups: {
      database: { transports: ["console"], level: "error" },
      auth: { transports: ["other"], level: "warn" },
    },
    activeGroups: ["database"],
    ungroupedBehavior: "all",
  });

  log.info("ungrouped");
  log.withGroup("database").error("grouped");

  // Runtime management
  log.addGroup("payments", { transports: ["console"], level: "info" });
  log.removeGroup("payments");
  log.enableGroup("database");
  log.disableGroup("database");
  log.setGroupLevel("database", "debug");
  log.setActiveGroups(["database", "auth"]);
  log.setActiveGroups(null);
  log.getGroups();

  // ungrouped variations
  const noneLog = new LogLayer({
    transport: new ConsoleTransport({ id: "c", logger: console }),
    groups: { db: { transports: ["c"] } },
    ungroupedBehavior: "none",
  });
  noneLog.info("dropped");

  const arrayLog = new LogLayer({
    transport: new ConsoleTransport({ id: "c", logger: console }),
    groups: { db: { transports: ["c"] } },
    ungroupedBehavior: ["c"],
  });
  arrayLog.info("to specific transports");
}

testGroupRuntimeManagement();

function testMockGroups() {
  const mock = new MockLogLayer();

  mock.withGroup("database").info("mock grouped");
  mock.withGroup(["database", "auth"]).error("mock multi-group");

  const dbMock = mock.withGroup("database");
  dbMock.info("mock child group");

  mock.addGroup("test", { transports: ["t"] });
  mock.removeGroup("test");
  mock.enableGroup("test");
  mock.disableGroup("test");
  mock.setGroupLevel("test", "debug");
  mock.setActiveGroups(["test"]);
  mock.setActiveGroups(null);
  mock.getGroups();
}

testMockGroups();
