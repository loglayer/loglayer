import { LogLevel } from "@loglayer/shared";
import { describe, expect, it } from "vitest";
import { LogLayer } from "../LogLayer.js";
import { TestLoggingLibrary } from "../TestLoggingLibrary.js";
import { ConsoleTransport } from "../transports/ConsoleTransport.js";

function createTestTransport(id: string) {
  return new ConsoleTransport({
    id,
    // @ts-expect-error
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

  it("should allow child loggers to have independent transports from parent (child modifies)", () => {
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

  it("should not affect child loggers when parent replaces transports", () => {
    const transport1 = createTestTransport("transport1");
    const transport2 = createTestTransport("transport2");
    const transport3 = createTestTransport("transport3");

    const parentLog = new LogLayer({
      transport: [transport1, transport2],
    });

    // Create child before modifying parent
    const childLog = parentLog.child();

    // Parent replaces its transports
    parentLog.withFreshTransports(transport3);

    // Verify parent has new transport
    expect(parentLog.getLoggerInstance("transport1")).toBeUndefined();
    expect(parentLog.getLoggerInstance("transport2")).toBeUndefined();
    expect(parentLog.getLoggerInstance("transport3")).toBeDefined();

    // Verify child still has original transports
    expect(childLog.getLoggerInstance("transport1")).toBeDefined();
    expect(childLog.getLoggerInstance("transport2")).toBeDefined();
    expect(childLog.getLoggerInstance("transport3")).toBeUndefined();

    // Verify child logging still works
    const childLogger1 = childLog.getLoggerInstance("transport1") as TestLoggingLibrary;
    const childLogger2 = childLog.getLoggerInstance("transport2") as TestLoggingLibrary;
    childLog.info("child message");

    expect(childLogger1.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["child message"],
      }),
    );
    expect(childLogger2.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["child message"],
      }),
    );
  });

  it("should not affect child loggers when parent adds transports", () => {
    const transport1 = createTestTransport("transport1");
    const transport2 = createTestTransport("transport2");

    const parentLog = new LogLayer({
      transport: transport1,
    });

    // Create child before modifying parent
    const childLog = parentLog.child();

    // Parent adds a transport
    parentLog.addTransport(transport2);

    // Verify parent has both transports
    expect(parentLog.getLoggerInstance("transport1")).toBeDefined();
    expect(parentLog.getLoggerInstance("transport2")).toBeDefined();

    // Verify child still has only the original transport
    expect(childLog.getLoggerInstance("transport1")).toBeDefined();
    expect(childLog.getLoggerInstance("transport2")).toBeUndefined();
  });

  it("should not affect child loggers when parent removes transports", () => {
    const transport1 = createTestTransport("transport1");
    const transport2 = createTestTransport("transport2");

    const parentLog = new LogLayer({
      transport: [transport1, transport2],
    });

    // Create child before modifying parent
    const childLog = parentLog.child();

    // Parent removes a transport
    parentLog.removeTransport("transport1");

    // Verify parent only has transport2
    expect(parentLog.getLoggerInstance("transport1")).toBeUndefined();
    expect(parentLog.getLoggerInstance("transport2")).toBeDefined();

    // Verify child still has both transports
    expect(childLog.getLoggerInstance("transport1")).toBeDefined();
    expect(childLog.getLoggerInstance("transport2")).toBeDefined();

    // Verify child logging still works on both transports
    const childLogger1 = childLog.getLoggerInstance("transport1") as TestLoggingLibrary;
    const childLogger2 = childLog.getLoggerInstance("transport2") as TestLoggingLibrary;
    childLog.info("child message");

    expect(childLogger1.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["child message"],
      }),
    );
    expect(childLogger2.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["child message"],
      }),
    );
  });

  describe("addTransport", () => {
    it("should add a single transport to a single existing transport", () => {
      const transport1 = createTestTransport("transport1");
      const transport2 = createTestTransport("transport2");

      const log = new LogLayer({
        transport: transport1,
      });

      // Verify initial state
      expect(log.getLoggerInstance("transport1")).toBeDefined();
      expect(log.getLoggerInstance("transport2")).toBeUndefined();

      // Add transport
      log.addTransport(transport2);

      // Verify updated state
      expect(log.getLoggerInstance("transport1")).toBeDefined();
      expect(log.getLoggerInstance("transport2")).toBeDefined();

      // Verify logging works with both transports
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

    it("should add multiple transports at once", () => {
      const transport1 = createTestTransport("transport1");
      const transport2 = createTestTransport("transport2");
      const transport3 = createTestTransport("transport3");

      const log = new LogLayer({
        transport: transport1,
      });

      // Add multiple transports
      log.addTransport([transport2, transport3]);

      // Verify all transports are present
      expect(log.getLoggerInstance("transport1")).toBeDefined();
      expect(log.getLoggerInstance("transport2")).toBeDefined();
      expect(log.getLoggerInstance("transport3")).toBeDefined();

      // Verify logging works with all transports
      const logger1 = log.getLoggerInstance("transport1") as TestLoggingLibrary;
      const logger2 = log.getLoggerInstance("transport2") as TestLoggingLibrary;
      const logger3 = log.getLoggerInstance("transport3") as TestLoggingLibrary;
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
      expect(logger3.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: ["test message"],
        }),
      );
    });

    it("should preserve context when adding transports", () => {
      const transport1 = createTestTransport("transport1");
      const transport2 = createTestTransport("transport2");

      const log = new LogLayer({
        transport: transport1,
      }).withContext({ contextKey: "value" });

      // Add transport
      log.addTransport(transport2);

      // Verify context is preserved on new transport
      const logger2 = log.getLoggerInstance("transport2") as TestLoggingLibrary;
      log.info("test message");

      expect(logger2.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [{ contextKey: "value" }, "test message"],
        }),
      );
    });

    it("should not affect parent when adding transport to child logger", () => {
      const transport1 = createTestTransport("transport1");
      const transport2 = createTestTransport("transport2");

      const parentLog = new LogLayer({
        transport: transport1,
      });

      const childLog = parentLog.child();
      childLog.addTransport(transport2);

      // Verify child has both transports
      expect(childLog.getLoggerInstance("transport1")).toBeDefined();
      expect(childLog.getLoggerInstance("transport2")).toBeDefined();

      // Verify parent only has original transport
      expect(parentLog.getLoggerInstance("transport1")).toBeDefined();
      expect(parentLog.getLoggerInstance("transport2")).toBeUndefined();
    });

    it("should return the logger instance for method chaining", () => {
      const transport1 = createTestTransport("transport1");
      const transport2 = createTestTransport("transport2");

      const log = new LogLayer({
        transport: transport1,
      });

      const result = log.addTransport(transport2);

      expect(result).toBe(log);
    });

    it("should replace existing transport with the same ID", () => {
      const transport1 = createTestTransport("transport1");
      const transport2 = createTestTransport("transport2");
      const transport1Replacement = createTestTransport("transport1");

      const log = new LogLayer({
        transport: [transport1, transport2],
      });

      // Verify initial state
      const originalLogger1 = log.getLoggerInstance("transport1") as TestLoggingLibrary;
      expect(originalLogger1).toBeDefined();

      // Add transport with same ID
      log.addTransport(transport1Replacement);

      // Verify the transport was replaced
      const newLogger1 = log.getLoggerInstance("transport1") as TestLoggingLibrary;
      expect(newLogger1).toBeDefined();
      expect(newLogger1).not.toBe(originalLogger1);

      // Verify transport2 is still there
      expect(log.getLoggerInstance("transport2")).toBeDefined();

      // Verify logging works with the new transport
      log.info("test message");

      expect(newLogger1.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: ["test message"],
        }),
      );
    });

    it("should dispose existing transport when replacing with same ID", () => {
      const transport1 = createTestTransport("transport1");
      let disposed = false;
      (transport1 as any)[Symbol.dispose] = () => {
        disposed = true;
      };

      const transport1Replacement = createTestTransport("transport1");

      const log = new LogLayer({
        transport: transport1,
      });

      log.addTransport(transport1Replacement);

      expect(disposed).toBe(true);
    });

    it("should handle mixed replacement and addition", () => {
      const transport1 = createTestTransport("transport1");
      const transport2 = createTestTransport("transport2");
      const transport1Replacement = createTestTransport("transport1");
      const transport3 = createTestTransport("transport3");

      const log = new LogLayer({
        transport: [transport1, transport2],
      });

      // Add transport1 replacement and transport3
      log.addTransport([transport1Replacement, transport3]);

      // Verify all expected transports are present
      expect(log.getLoggerInstance("transport1")).toBeDefined();
      expect(log.getLoggerInstance("transport2")).toBeDefined();
      expect(log.getLoggerInstance("transport3")).toBeDefined();

      // Verify transport1 was replaced (not duplicated)
      const config = log.getConfig();
      const transports = config.transport as Array<any>;
      const transport1Count = transports.filter((t) => t.id === "transport1").length;
      expect(transport1Count).toBe(1);
    });
  });

  describe("removeTransport", () => {
    it("should remove a transport by ID from multiple transports", () => {
      const transport1 = createTestTransport("transport1");
      const transport2 = createTestTransport("transport2");
      const transport3 = createTestTransport("transport3");

      const log = new LogLayer({
        transport: [transport1, transport2, transport3],
      });

      // Verify initial state
      expect(log.getLoggerInstance("transport1")).toBeDefined();
      expect(log.getLoggerInstance("transport2")).toBeDefined();
      expect(log.getLoggerInstance("transport3")).toBeDefined();

      // Remove transport
      const result = log.removeTransport("transport2");

      // Verify result
      expect(result).toBe(true);

      // Verify updated state
      expect(log.getLoggerInstance("transport1")).toBeDefined();
      expect(log.getLoggerInstance("transport2")).toBeUndefined();
      expect(log.getLoggerInstance("transport3")).toBeDefined();

      // Verify logging works with remaining transports
      const logger1 = log.getLoggerInstance("transport1") as TestLoggingLibrary;
      const logger3 = log.getLoggerInstance("transport3") as TestLoggingLibrary;
      log.info("test message");

      expect(logger1.popLine()).toStrictEqual(
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

    it("should return false when transport ID does not exist", () => {
      const transport1 = createTestTransport("transport1");

      const log = new LogLayer({
        transport: transport1,
      });

      const result = log.removeTransport("nonexistent");

      expect(result).toBe(false);
      expect(log.getLoggerInstance("transport1")).toBeDefined();
    });

    it("should handle removing transport when only one transport exists", () => {
      const transport1 = createTestTransport("transport1");
      const transport2 = createTestTransport("transport2");

      const log = new LogLayer({
        transport: [transport1, transport2],
      });

      // Remove one transport
      log.removeTransport("transport1");

      // Verify state
      expect(log.getLoggerInstance("transport1")).toBeUndefined();
      expect(log.getLoggerInstance("transport2")).toBeDefined();

      // Verify logging still works
      const logger2 = log.getLoggerInstance("transport2") as TestLoggingLibrary;
      log.info("test message");

      expect(logger2.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: ["test message"],
        }),
      );
    });

    it("should preserve context when removing transports", () => {
      const transport1 = createTestTransport("transport1");
      const transport2 = createTestTransport("transport2");

      const log = new LogLayer({
        transport: [transport1, transport2],
      }).withContext({ contextKey: "value" });

      // Remove transport
      log.removeTransport("transport1");

      // Verify context is preserved on remaining transport
      const logger2 = log.getLoggerInstance("transport2") as TestLoggingLibrary;
      log.info("test message");

      expect(logger2.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [{ contextKey: "value" }, "test message"],
        }),
      );
    });

    it("should not affect parent when removing transport from child logger", () => {
      const transport1 = createTestTransport("transport1");
      const transport2 = createTestTransport("transport2");

      const parentLog = new LogLayer({
        transport: [transport1, transport2],
      });

      const childLog = parentLog.child();
      childLog.removeTransport("transport1");

      // Verify child only has transport2
      expect(childLog.getLoggerInstance("transport1")).toBeUndefined();
      expect(childLog.getLoggerInstance("transport2")).toBeDefined();

      // Verify parent still has both transports
      expect(parentLog.getLoggerInstance("transport1")).toBeDefined();
      expect(parentLog.getLoggerInstance("transport2")).toBeDefined();
    });

    it("should call dispose on removed transport if it implements Disposable", () => {
      const transport1 = createTestTransport("transport1");
      let disposed = false;
      (transport1 as any)[Symbol.dispose] = () => {
        disposed = true;
      };

      const transport2 = createTestTransport("transport2");

      const log = new LogLayer({
        transport: [transport1, transport2],
      });

      log.removeTransport("transport1");

      expect(disposed).toBe(true);
    });
  });
});
