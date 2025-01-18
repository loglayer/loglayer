import { LogLevel } from "@loglayer/shared";
import { describe, expect, it } from "vitest";
import { LogLayer } from "../LogLayer.js";
import { TestLoggingLibrary } from "../TestLoggingLibrary.js";
import { ConsoleTransport } from "../transports/ConsoleTransport.js";

function createTestTransport(id: string) {
  return new ConsoleTransport({
    id,
    // @ts-ignore
    logger: new TestLoggingLibrary(),
  });
}

describe("LogLayer multi-transport functionality", () => {
  it("should send logs to all transports", () => {
    const transport1 = createTestTransport("transport1");
    const transport2 = createTestTransport("transport2");

    const log = new LogLayer({
      transport: [transport1, transport2],
    });

    const logger1 = log.getLoggerInstance("transport1") as TestLoggingLibrary;
    const logger2 = log.getLoggerInstance("transport2") as TestLoggingLibrary;

    log.info("test message");

    expect(logger1.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["test message"],
      }),
    );

    expect(logger2.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["test message"],
      }),
    );
  });

  it("should send logs to all transports with context and metadata", () => {
    const transport1 = createTestTransport("transport1");
    const transport2 = createTestTransport("transport2");

    const log = new LogLayer({
      transport: [transport1, transport2],
    });

    const logger1 = log.getLoggerInstance("transport1") as TestLoggingLibrary;
    const logger2 = log.getLoggerInstance("transport2") as TestLoggingLibrary;

    log.withContext({ ctx: "data" }).withMetadata({ meta: "info" }).info("test message");

    const expectedData = {
      level: LogLevel.info,
      data: [
        {
          ctx: "data",
          meta: "info",
        },
        "test message",
      ],
    };

    expect(logger1.popLine()).toStrictEqual(expect.objectContaining(expectedData));
    expect(logger2.popLine()).toStrictEqual(expect.objectContaining(expectedData));
  });

  it("should respect individual transport enabled states", () => {
    const transport1 = createTestTransport("transport1");
    const transport2 = new ConsoleTransport({
      id: "transport2",
      // @ts-ignore
      logger: new TestLoggingLibrary(),
      enabled: false,
    });

    const log = new LogLayer({
      transport: [transport1, transport2],
    });

    const logger1 = log.getLoggerInstance("transport1") as TestLoggingLibrary;
    const logger2 = log.getLoggerInstance("transport2") as TestLoggingLibrary;

    log.info("test message");

    expect(logger1.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["test message"],
      }),
    );

    expect(logger2.popLine()).not.toBeDefined();
  });

  it("should handle errors independently for each transport", () => {
    const transport1 = createTestTransport("transport1");
    const transport2 = createTestTransport("transport2");

    const log = new LogLayer({
      transport: [transport1, transport2],
      errorFieldName: "error",
    });

    const logger1 = log.getLoggerInstance("transport1") as TestLoggingLibrary;
    const logger2 = log.getLoggerInstance("transport2") as TestLoggingLibrary;

    const error = new Error("test error");
    log.errorOnly(error);

    const expectedData = {
      level: LogLevel.error,
      data: [
        {
          error: error,
        },
      ],
    };

    expect(logger1.popLine()).toStrictEqual(expect.objectContaining(expectedData));
    expect(logger2.popLine()).toStrictEqual(expect.objectContaining(expectedData));
  });

  it("should maintain separate contexts for child loggers across transports", () => {
    const transport1 = createTestTransport("transport1");
    const transport2 = createTestTransport("transport2");

    const parentLog = new LogLayer({
      transport: [transport1, transport2],
    }).withContext({ parent: true });

    const childLog = parentLog.child().withContext({ child: true });

    const parent1 = parentLog.getLoggerInstance("transport1") as TestLoggingLibrary;
    const parent2 = parentLog.getLoggerInstance("transport2") as TestLoggingLibrary;
    const child1 = childLog.getLoggerInstance("transport1") as TestLoggingLibrary;
    const child2 = childLog.getLoggerInstance("transport2") as TestLoggingLibrary;

    // Test parent logger
    parentLog.info("parent message");
    expect(parent1.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [{ parent: true }, "parent message"],
      }),
    );
    expect(parent2.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [{ parent: true }, "parent message"],
      }),
    );

    // Test child logger
    childLog.info("child message");
    expect(child1.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [{ parent: true, child: true }, "child message"],
      }),
    );
    expect(child2.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [{ parent: true, child: true }, "child message"],
      }),
    );
  });

  it("should apply plugins across all transports", () => {
    const transport1 = createTestTransport("transport1");
    const transport2 = createTestTransport("transport2");

    const log = new LogLayer({
      transport: [transport1, transport2],
    });

    log.addPlugins([
      {
        onBeforeDataOut: ({ data }) => {
          if (data) {
            data.modified = true;
          }
          return data;
        },
      },
    ]);

    const logger1 = log.getLoggerInstance("transport1") as TestLoggingLibrary;
    const logger2 = log.getLoggerInstance("transport2") as TestLoggingLibrary;

    log.withMetadata({ original: true }).info("test message");

    const expectedData = {
      level: LogLevel.info,
      data: [
        {
          original: true,
          modified: true,
        },
        "test message",
      ],
    };

    expect(logger1.popLine()).toStrictEqual(expect.objectContaining(expectedData));
    expect(logger2.popLine()).toStrictEqual(expect.objectContaining(expectedData));
  });

  it("should handle muting independently across transports", () => {
    const transport1 = createTestTransport("transport1");
    const transport2 = createTestTransport("transport2");

    const log = new LogLayer({
      transport: [transport1, transport2],
    });

    const logger1 = log.getLoggerInstance("transport1") as TestLoggingLibrary;
    const logger2 = log.getLoggerInstance("transport2") as TestLoggingLibrary;

    // Mute metadata for all transports
    log.muteMetadata();

    log.withMetadata({ meta: "data" }).info("test message");

    expect(logger1.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["test message"],
      }),
    );
    expect(logger2.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["test message"],
      }),
    );

    // Unmute metadata and verify it's unmuted for all transports
    log.unMuteMetadata();
    log.withMetadata({ meta: "data" }).info("test message");

    const expectedData = {
      level: LogLevel.info,
      data: [{ meta: "data" }, "test message"],
    };

    expect(logger1.popLine()).toStrictEqual(expect.objectContaining(expectedData));
    expect(logger2.popLine()).toStrictEqual(expect.objectContaining(expectedData));
  });
});
