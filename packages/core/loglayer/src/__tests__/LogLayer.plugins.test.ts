import { LogLevel } from "@loglayer/shared";
import { describe, expect, it } from "vitest";
import { LogLayer } from "../LogLayer.js";
import { TestLoggingLibrary } from "../TestLoggingLibrary.js";
import { ConsoleTransport } from "../transports/ConsoleTransport.js";
import type { LogLayerConfig } from "../types/index.js";

function getLogger(config?: Partial<LogLayerConfig>) {
  const genericLogger = new TestLoggingLibrary();

  return new LogLayer({
    transport: new ConsoleTransport({
      id: "console",
      // @ts-ignore
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

    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

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
          onBeforeMessageOut: ({ messages }) => {
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
});
