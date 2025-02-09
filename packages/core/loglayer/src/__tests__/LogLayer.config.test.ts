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

describe("LogLayer configuration", () => {
  describe("error config", () => {
    it("should use a custom serializer and field name", () => {
      const log = getLogger({
        errorSerializer: (err) => {
          return `[ERROR] ${err.message}`;
        },
        errorFieldName: "causedBy",
      });

      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.errorOnly(new Error("this is an error"));

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.error,
          data: [
            {
              causedBy: "[ERROR] this is an error",
            },
          ],
        }),
      );
    });

    it("should always copy error messages", () => {
      const log = getLogger({
        copyMsgOnOnlyError: true,
      });

      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      const e = new Error("this is an error");

      log.errorOnly(e);

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.error,
          data: [
            {
              err: e,
            },
            "this is an error",
          ],
        }),
      );
    });

    it("should override copy over messages", () => {
      const log = getLogger({
        copyMsgOnOnlyError: true,
      });

      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      const e = new Error("this is an error");

      log.errorOnly(e, { copyMsg: false });

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.error,
          data: [
            {
              err: e,
            },
          ],
        }),
      );
    });

    it("should add the error to the metadata field", () => {
      const log = getLogger({
        errorFieldName: "error",
        errorFieldInMetadata: true,
        metadataFieldName: "metadata",
      });

      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      const e = new Error("this is an error");

      log.errorOnly(e);

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.error,
          data: [
            {
              metadata: {
                error: e,
              },
            },
          ],
        }),
      );
    });
  });

  describe("metadata config", () => {
    it("should use a custom metadata field", () => {
      const log = getLogger({
        metadataFieldName: "myMetadata",
      });

      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.metadataOnly({
        my: "metadata",
      });

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [
            {
              myMetadata: {
                my: "metadata",
              },
            },
          ],
        }),
      );
    });

    it("should use a custom context and metadata field", () => {
      const log = getLogger({
        contextFieldName: "myContext",
        metadataFieldName: "myMetadata",
      });

      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.withContext({
        reqId: 1234,
      });

      log
        .withMetadata({
          my: "metadata",
        })
        .info("a request");

      expect(log.getContext()).toStrictEqual({
        reqId: 1234,
      });

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [
            {
              myContext: {
                reqId: 1234,
              },
              myMetadata: {
                my: "metadata",
              },
            },
            "a request",
          ],
        }),
      );
    });

    it("should merge metadata and context fields if they are the same field name", () => {
      const log = getLogger({
        metadataFieldName: "sharedData",
        contextFieldName: "sharedData",
      });

      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      log.withContext({ ctx: "data" }).metadataOnly({
        my: "metadata",
      });

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [
            {
              sharedData: {
                my: "metadata",
                ctx: "data",
              },
            },
          ],
        }),
      );
    });
  });

  it("should not send logs to disabled transports", () => {
    const transport = new ConsoleTransport({
      id: "console",
      // @ts-ignore
      logger: new TestLoggingLibrary(),
      enabled: false,
    });
    const log = new LogLayer({
      transport,
    });
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    log.info("test message");
    expect(genericLogger.popLine()).not.toBeDefined();

    // Create a new enabled transport
    const enabledTransport = new ConsoleTransport({
      id: "console",
      // @ts-ignore
      logger: new TestLoggingLibrary(),
      enabled: true,
    });

    // Create a new LogLayer instance with the enabled transport
    const enabledLog = new LogLayer({
      transport: enabledTransport,
    });
    const enabledGenericLogger = enabledLog.getLoggerInstance("console") as TestLoggingLibrary;

    enabledLog.info("test message");
    expect(enabledGenericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["test message"],
      }),
    );
  });

  describe("linkParentContext", () => {
    it("should share context between parent and child when enabled", () => {
      const log = getLogger({
        linkParentContext: true,
      });
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      // Set initial context on parent
      log.withContext({
        parent: "data",
      });

      // Create child and add context
      const childLog = log.child();
      childLog.withContext({
        child: "data",
      });

      // Verify child has both contexts
      childLog.info("child message");
      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [
            {
              parent: "data",
              child: "data",
            },
            "child message",
          ],
        }),
      );

      // Verify parent also has both contexts
      log.info("parent message");
      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [
            {
              parent: "data",
              child: "data",
            },
            "parent message",
          ],
        }),
      );

      // Verify changes in parent affect child
      log.withContext({
        newParent: "data",
      });
      childLog.info("child message 2");
      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [
            {
              parent: "data",
              child: "data",
              newParent: "data",
            },
            "child message 2",
          ],
        }),
      );
    });

    it("should maintain separate contexts when disabled", () => {
      const log = getLogger({
        linkParentContext: false,
      });
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

      // Set initial context on parent
      log.withContext({
        parent: "data",
      });

      // Create child and add context
      const childLog = log.child();
      childLog.withContext({
        child: "data",
      });

      // Verify child has both contexts initially
      childLog.info("child message");
      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [
            {
              parent: "data",
              child: "data",
            },
            "child message",
          ],
        }),
      );

      // Verify parent only has its own context
      log.info("parent message");
      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [
            {
              parent: "data",
            },
            "parent message",
          ],
        }),
      );

      // Verify changes in parent don't affect child
      log.withContext({
        newParent: "data",
      });
      childLog.info("child message 2");
      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [
            {
              parent: "data",
              child: "data",
            },
            "child message 2",
          ],
        }),
      );
    });
  });
}); 