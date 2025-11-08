import { LogLevel } from "@loglayer/shared";
import { describe, expect, it, vi } from "vitest";
import { LogLayer } from "../LogLayer.js";
import { TestLoggingLibrary } from "../TestLoggingLibrary.js";
import { ConsoleTransport } from "../transports/ConsoleTransport.js";
import { TestTransport } from "../transports/TestTransport.js";
import type { LogLayerConfig } from "../types/index.js";

function getLogger(config?: Partial<LogLayerConfig>) {
  const genericLogger = new TestLoggingLibrary();

  return new LogLayer({
    transport: new ConsoleTransport({
      id: "console",
      // @ts-expect-error
      logger: genericLogger,
    }),
    ...(config || {}),
  });
}

function getLoggerWithTestTransport(config?: Partial<LogLayerConfig>) {
  const genericLogger = new TestLoggingLibrary();

  return new LogLayer({
    transport: new TestTransport({
      id: "test",
      logger: genericLogger,
    }),
    ...(config || {}),
  });
}

describe("LogLayer plugin system", () => {
  it("should copy the plugin manager to a child transport", () => {
    const log = getLogger();
    log.addPlugins([
      {
        shouldSendToLogger: () => false,
      },
    ]);

    const _genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    const child = log.child();

    expect(child["pluginManager"].countPlugins()).toBe(1);
  });

  describe("shouldSendToLogger", () => {
    it("should disallow sending to the transport", () => {
      const log = getLogger();
      log.addPlugins([
        {
          shouldSendToLogger: () => false,
        },
      ]);

      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.info("Test message");

      expect(genericLogger.lines.length).toBe(0);
    });

    it("should allow sending to the transport", () => {
      const log = getLogger();
      log.addPlugins([
        {
          shouldSendToLogger: () => true,
        },
      ]);

      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.info("Test message");

      expect(genericLogger.lines.length).toBe(1);
    });
  });

  describe("onBeforeDataOut", () => {
    it("should modify the data", () => {
      const log = getLogger();
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

      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log
        .withMetadata({
          modified: false,
        })
        .info("Test message");

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [
            {
              modified: true,
            },
            "Test message",
          ],
        }),
      );
    });
  });

  describe("onBeforeMessageOut", () => {
    it("should modify the message", () => {
      const log = getLogger();
      log.addPlugins([
        {
          onBeforeMessageOut: () => {
            return ["Modified message"];
          },
        },
      ]);

      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.info("Test message");

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: ["Modified message"],
        }),
      );
    });
  });

  describe("transformLogLevel", () => {
    it("should transform log level from info to error", () => {
      const log = getLogger();
      log.addPlugins([
        {
          transformLogLevel: () => LogLevel.error,
        },
      ]);

      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.info("Test message");

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.error,
          data: ["Test message"],
        }),
      );
    });

    it("should use original log level when plugin returns null", () => {
      const log = getLogger();
      log.addPlugins([
        {
          transformLogLevel: () => null,
        },
      ]);

      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.warn("Test message");

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.warn,
          data: ["Test message"],
        }),
      );
    });

    it("should use original log level when plugin returns undefined", () => {
      const log = getLogger();
      log.addPlugins([
        {
          transformLogLevel: () => undefined,
        },
      ]);

      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.debug("Test message");

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.debug,
          data: ["Test message"],
        }),
      );
    });

    it("should use original log level when plugin returns false", () => {
      const log = getLogger();
      log.addPlugins([
        {
          transformLogLevel: () => false,
        },
      ]);

      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.trace("Test message");

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.trace,
          data: ["Test message"],
        }),
      );
    });

    it("should transform log level based on metadata", () => {
      const log = getLoggerWithTestTransport();
      const transformSpy = vi.fn(({ logLevel, metadata, data }) => {
        // Check both metadata parameter and data object (metadata is in both)
        if (metadata?.critical || data?.critical) {
          return LogLevel.fatal;
        }
        return null;
      });

      log.addPlugins([
        {
          transformLogLevel: transformSpy,
        },
      ]);

      const genericLogger = log.getLoggerInstance("test") as TestLoggingLibrary;

      log.withMetadata({ critical: true }).error("Critical error");

      // Verify what was passed to transformLogLevel
      expect(transformSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          logLevel: LogLevel.error,
          metadata: { critical: true },
        }),
        expect.any(Object),
      );

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.fatal,
          data: expect.arrayContaining(["Critical error"]),
        }),
      );
    });

    it("should transform log level based on error", () => {
      const log = getLoggerWithTestTransport();
      const transformSpy = vi.fn(({ logLevel, error }) => {
        // Check error parameter
        if (error?.stack) {
          return LogLevel.fatal;
        }
        return null;
      });

      log.addPlugins([
        {
          transformLogLevel: transformSpy,
        },
      ]);

      const genericLogger = log.getLoggerInstance("test") as TestLoggingLibrary;

      const testError = new Error("Test error");
      log.withError(testError).error("Error message");

      // Verify what was passed to transformLogLevel
      expect(transformSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          logLevel: LogLevel.error,
          error: testError,
        }),
        expect.any(Object),
      );

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.fatal,
          data: expect.arrayContaining(["Error message"]),
        }),
      );
    });

    it("should use last plugin that returns a valid log level", () => {
      const log = getLogger();
      log.addPlugins([
        {
          transformLogLevel: () => null, // Skip
        },
        {
          transformLogLevel: () => LogLevel.warn, // This will be overridden
        },
        {
          transformLogLevel: () => LogLevel.error, // Last one wins
        },
      ]);

      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.info("Test message");

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.error,
          data: ["Test message"],
        }),
      );
    });

    it("should transform log level after onBeforeDataOut processes data", () => {
      const log = getLogger();
      const onBeforeDataOutSpy = vi.fn(({ logLevel, data }) => {
        // onBeforeDataOut receives original log level
        expect(logLevel).toBe(LogLevel.info);
        return { ...data, processed: true };
      });

      log.addPlugins([
        {
          onBeforeDataOut: onBeforeDataOutSpy,
        },
        {
          transformLogLevel: ({ data }) => {
            // transformLogLevel receives processed data from onBeforeDataOut
            if (data?.processed) {
              return LogLevel.error;
            }
            return null;
          },
        },
      ]);

      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.info("Test message");

      expect(onBeforeDataOutSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          logLevel: LogLevel.info,
        }),
        expect.any(Object),
      );

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.error,
        }),
      );
    });

    it("should transform log level after onBeforeMessageOut processes messages", () => {
      const log = getLogger();
      const onBeforeMessageOutSpy = vi.fn(({ logLevel }) => {
        // onBeforeMessageOut receives original log level
        expect(logLevel).toBe(LogLevel.info);
        return ["Modified message"];
      });

      log.addPlugins([
        {
          onBeforeMessageOut: onBeforeMessageOutSpy,
        },
        {
          transformLogLevel: () => LogLevel.warn,
        },
      ]);

      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.info("Test message");

      expect(onBeforeMessageOutSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          logLevel: LogLevel.info,
        }),
        expect.any(Object),
      );

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.warn,
          data: ["Modified message"],
        }),
      );
    });

    it("should transform log level before shouldSendToLogger receives it", () => {
      const log = getLoggerWithTestTransport();
      const shouldSendToLoggerSpy = vi.fn(({ logLevel }) => {
        expect(logLevel).toBe(LogLevel.fatal);
        return true;
      });

      log.addPlugins([
        {
          transformLogLevel: () => LogLevel.fatal,
        },
        {
          shouldSendToLogger: shouldSendToLoggerSpy,
        },
      ]);

      const genericLogger = log.getLoggerInstance("test") as TestLoggingLibrary;

      log.info("Test message");

      expect(shouldSendToLoggerSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          logLevel: LogLevel.fatal,
        }),
        expect.any(Object),
      );

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.fatal,
        }),
      );
    });
  });

  describe("onMetadataCalled", () => {
    describe("withMetadata", () => {
      it("should modify the metadata", () => {
        const log = getLogger();
        log.addPlugins([
          {
            onMetadataCalled: (metadata) => {
              return {
                ...metadata,
                modified: true,
              };
            },
          },
        ]);

        const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

        log
          .withMetadata({
            someData: false,
          })
          .info("Test message");

        expect(genericLogger.popLine()).toStrictEqual(
          expect.objectContaining({
            level: LogLevel.info,
            data: [
              {
                someData: false,
                modified: true,
              },
              "Test message",
            ],
          }),
        );
      });

      it("should drop the metadata", () => {
        const log = getLogger();
        log.addPlugins([
          {
            onMetadataCalled: () => null,
          },
        ]);

        const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

        log
          .withMetadata({
            someData: false,
          })
          .info("Test message");

        expect(genericLogger.popLine()).toStrictEqual(
          expect.objectContaining({
            level: LogLevel.info,
            data: ["Test message"],
          }),
        );
      });
    });

    describe("metadataOnly", () => {
      it("should modify the metadata", () => {
        const log = getLogger();
        log.addPlugins([
          {
            onMetadataCalled: (metadata) => {
              return {
                ...metadata,
                modified: true,
              };
            },
          },
        ]);

        const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

        log.metadataOnly({
          someData: false,
        });

        expect(genericLogger.popLine()).toStrictEqual(
          expect.objectContaining({
            level: LogLevel.info,
            data: [
              {
                someData: false,
                modified: true,
              },
            ],
          }),
        );
      });

      it("should drop the metadata", () => {
        const log = getLogger();
        log.addPlugins([
          {
            onMetadataCalled: () => null,
          },
        ]);

        const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

        log.metadataOnly({
          someData: false,
        });

        expect(genericLogger.popLine()).toBe(undefined);
      });
    });
  });

  describe("onContextCalled", () => {
    it("should modify the context", () => {
      const log = getLogger();
      log.addPlugins([
        {
          onContextCalled: (context) => {
            return {
              ...context,
              modified: true,
            };
          },
        },
      ]);

      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log
        .withContext({
          someData: false,
        })
        .info("Test message");

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [
            {
              someData: false,
              modified: true,
            },
            "Test message",
          ],
        }),
      );
    });

    it("should drop the context", () => {
      const log = getLogger();
      log.addPlugins([
        {
          onContextCalled: () => null,
        },
      ]);

      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log
        .withContext({
          someData: false,
        })
        .info("Test message");

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: ["Test message"],
        }),
      );
    });

    it("should chain multiple context plugins", () => {
      const log = getLogger();
      log.addPlugins([
        {
          onContextCalled: (context) => {
            return {
              ...context,
              first: true,
            };
          },
        },
        {
          onContextCalled: (context) => {
            return {
              ...context,
              second: true,
            };
          },
        },
      ]);

      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log
        .withContext({
          original: true,
        })
        .info("Test message");

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [
            {
              original: true,
              first: true,
              second: true,
            },
            "Test message",
          ],
        }),
      );
    });
  });

  describe("withFreshPlugins", () => {
    it("should replace all existing plugins", () => {
      const log = getLogger();

      // Add initial plugins
      log.addPlugins([
        {
          id: "plugin1",
          onBeforeDataOut: ({ data }) => {
            if (data) {
              data.first = true;
            }
            return data;
          },
        },
      ]);

      // Replace with new plugins
      log.withFreshPlugins([
        {
          id: "plugin2",
          onBeforeDataOut: ({ data }) => {
            if (data) {
              data.second = true;
            }
            return data;
          },
        },
      ]);

      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.withMetadata({ original: true }).info("test message");

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [
            {
              original: true,
              second: true,
            },
            "test message",
          ],
        }),
      );
    });

    it("should not affect parent logger plugins", () => {
      const parentLog = getLogger();

      // Add plugin to parent
      parentLog.addPlugins([
        {
          id: "parent-plugin",
          onBeforeDataOut: ({ data }) => {
            if (data) {
              data.parent = true;
            }
            return data;
          },
        },
      ]);

      const childLog = parentLog.child();

      // Replace plugins in child
      childLog.withFreshPlugins([
        {
          id: "child-plugin",
          onBeforeDataOut: ({ data }) => {
            if (data) {
              data.child = true;
            }
            return data;
          },
        },
      ]);

      const parentLogger = parentLog.getLoggerInstance("console") as TestLoggingLibrary;
      const childLogger = childLog.getLoggerInstance("console") as TestLoggingLibrary;

      // Test parent logger still has original plugin
      parentLog.withMetadata({ test: true }).info("parent message");
      expect(parentLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [
            {
              test: true,
              parent: true,
            },
            "parent message",
          ],
        }),
      );

      // Test child logger has new plugin
      childLog.withMetadata({ test: true }).info("child message");
      expect(childLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [
            {
              test: true,
              child: true,
            },
            "child message",
          ],
        }),
      );
    });
  });
});
