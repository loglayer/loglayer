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

describe("LogLayer transport management", () => {
  it("should replace single transport with another single transport", () => {
    const transport1 = createTestTransport("transport1");
    const transport2 = createTestTransport("transport2");

    const log = new LogLayer({
      transport: transport1,
    });

    // Verify initial state
    expect(log.getLoggerInstance("transport1")).toBeDefined();
    expect(log.getLoggerInstance("transport2")).toBeUndefined();

    // Replace transport
    log.withFreshTransports(transport2);

    // Verify updated state
    expect(log.getLoggerInstance("transport1")).toBeUndefined();
    expect(log.getLoggerInstance("transport2")).toBeDefined();

    // Verify logging works with new transport
    const logger2 = log.getLoggerInstance("transport2") as TestLoggingLibrary;
    log.info("test message");

    expect(logger2.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["test message"],
      }),
    );
  });

  it("should replace single transport with multiple transports", () => {
    const transport1 = createTestTransport("transport1");
    const transport2 = createTestTransport("transport2");
    const transport3 = createTestTransport("transport3");

    const log = new LogLayer({
      transport: transport1,
    });

    // Replace with multiple transports
    log.withFreshTransports([transport2, transport3]);

    // Verify updated state
    expect(log.getLoggerInstance("transport1")).toBeUndefined();
    expect(log.getLoggerInstance("transport2")).toBeDefined();
    expect(log.getLoggerInstance("transport3")).toBeDefined();

    // Verify logging works with all new transports
    const logger2 = log.getLoggerInstance("transport2") as TestLoggingLibrary;
    const logger3 = log.getLoggerInstance("transport3") as TestLoggingLibrary;

    log.info("test message");

    expect(logger2.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["test message"],
      }),
    );
    expect(logger3.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["test message"],
      }),
    );
  });

  it("should replace multiple transports with single transport", () => {
    const transport1 = createTestTransport("transport1");
    const transport2 = createTestTransport("transport2");
    const transport3 = createTestTransport("transport3");

    const log = new LogLayer({
      transport: [transport1, transport2],
    });

    // Replace with single transport
    log.withFreshTransports(transport3);

    // Verify updated state
    expect(log.getLoggerInstance("transport1")).toBeUndefined();
    expect(log.getLoggerInstance("transport2")).toBeUndefined();
    expect(log.getLoggerInstance("transport3")).toBeDefined();

    // Verify logging works with new transport
    const logger3 = log.getLoggerInstance("transport3") as TestLoggingLibrary;
    log.info("test message");

    expect(logger3.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["test message"],
      }),
    );
  });

  it("should preserve context when replacing transports", () => {
    const transport1 = createTestTransport("transport1");
    const transport2 = createTestTransport("transport2");

    const log = new LogLayer({
      transport: transport1,
    }).withContext({ contextKey: "value" });

    // Replace transport
    log.withFreshTransports(transport2);

    // Verify context is preserved
    const logger2 = log.getLoggerInstance("transport2") as TestLoggingLibrary;
    log.info("test message");

    expect(logger2.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [{ contextKey: "value" }, "test message"],
      }),
    );
  });

  it("should preserve plugins when replacing transports", () => {
    const transport1 = createTestTransport("transport1");
    const transport2 = createTestTransport("transport2");

    const log = new LogLayer({
      transport: transport1,
    });

    // Add a test plugin
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

    // Replace transport
    log.withFreshTransports(transport2);

    // Verify plugin still works
    const logger2 = log.getLoggerInstance("transport2") as TestLoggingLibrary;
    log.withMetadata({ original: true }).info("test message");

    expect(logger2.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [
          {
            original: true,
            modified: true,
          },
          "test message",
        ],
      }),
    );
  });

  it("should allow child loggers to have independent transports from parent", () => {
    const transport1 = createTestTransport("transport1");
    const transport2 = createTestTransport("transport2");
    const transport3 = createTestTransport("transport3");

    const parentLog = new LogLayer({
      transport: [transport1, transport2],
    });

    const childLog = parentLog.child();
    childLog.withFreshTransports(transport3);

    // Verify child logger state
    expect(childLog.getLoggerInstance("transport1")).toBeUndefined();
    expect(childLog.getLoggerInstance("transport2")).toBeUndefined();
    expect(childLog.getLoggerInstance("transport3")).toBeDefined();

    // Verify parent logger state is unchanged
    expect(parentLog.getLoggerInstance("transport1")).toBeDefined();
    expect(parentLog.getLoggerInstance("transport2")).toBeDefined();
    expect(parentLog.getLoggerInstance("transport3")).toBeUndefined();

    // Verify logging works independently
    const parentLogger1 = parentLog.getLoggerInstance("transport1") as TestLoggingLibrary;
    const parentLogger2 = parentLog.getLoggerInstance("transport2") as TestLoggingLibrary;
    const childLogger3 = childLog.getLoggerInstance("transport3") as TestLoggingLibrary;

    parentLog.info("parent message");
    childLog.info("child message");

    // Check parent loggers
    expect(parentLogger1.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["parent message"],
      }),
    );
    expect(parentLogger2.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["parent message"],
      }),
    );

    // Check child logger
    expect(childLogger3.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["child message"],
      }),
    );

    // Verify parent loggers didn't receive child message
    expect(parentLogger1.popLine()).toBeUndefined();
    expect(parentLogger2.popLine()).toBeUndefined();
    // Verify child logger didn't receive parent message
    expect(childLogger3.popLine()).toBeUndefined();
  });
});
