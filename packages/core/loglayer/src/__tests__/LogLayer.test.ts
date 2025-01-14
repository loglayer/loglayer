import type { PluginBeforeDataOutFn, PluginShouldSendToLoggerFn } from "@loglayer/plugin";
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

describe("loglayer general tests", () => {
  it("should assign a prefix to messages", () => {
    const log = getLogger().withPrefix("[testing]");
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const levels = ["info", "warn", "error", "debug", "trace"];

    levels.forEach((level, idx) => {
      log[level](`${level} message`, idx);

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level,
          data: [`[testing] ${level} message`, idx],
        }),
      );
    });
  });

  it("should create a child transport with only the original configuration and context", () => {
    const origLog = getLogger().withContext({
      test: "context",
    });

    const parentGenericLogger = origLog.getLoggerInstance("console") as TestLoggingLibrary;

    // Add additional context to the child transport
    const childLog = origLog.child().withContext({
      child: "childData",
    });

    childLog.info("test");

    const childGenericLogger = childLog.getLoggerInstance("console") as TestLoggingLibrary;

    expect(childGenericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [
          {
            test: "context",
            child: "childData",
          },
          "test",
        ],
      }),
    );

    // make sure the parent transport doesn't have the additional context of the child
    origLog
      .withContext({
        parentContext: "test-2",
      })
      .info("parent-test");

    expect(parentGenericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [
          {
            test: "context",
            parentContext: "test-2",
          },
          "parent-test",
        ],
      }),
    );
  });

  it("should write messages", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const levels = ["info", "warn", "error", "debug", "trace"];

    levels.forEach((level, idx) => {
      log[level](`${level} message`, idx);

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level,
          data: [`${level} message`, idx],
        }),
      );
    });
  });

  it("should toggle log output", () => {
    const log = getLogger({ enabled: false });
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    log.info("test");
    expect(genericLogger.popLine()).not.toBeDefined();

    log.enableLogging();
    log.info("test");
    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: "info",
        data: ["test"],
      }),
    );

    log.disableLogging();
    log.info("test");
    expect(genericLogger.popLine()).not.toBeDefined();

    // Test LogBuilder
    log.enableLogging();
    log.withMetadata({}).disableLogging().info("test");
    expect(genericLogger.popLine()).not.toBeDefined();

    // This doesn't immediately enable log output
    log.withMetadata({}).enableLogging().info("test");

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: "info",
        data: [{}, "test"],
      }),
    );
  });

  it("should include context", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const levels = ["info", "warn", "error", "debug", "trace"];

    log.withContext({
      sample: "data",
    });

    levels.forEach((level, idx) => {
      log[level](`${level} message`, idx);

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level,
          data: [{ sample: "data" }, `${level} message`, idx],
        }),
      );
    });
  });

  it("should include metadata with a message", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const levels = ["info", "warn", "error", "debug", "trace"];

    levels.forEach((level, idx) => {
      log
        .withMetadata({
          index: idx,
        })
        [level](`${level} message`, idx);

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level,
          data: [{ index: idx }, `${level} message`, idx],
        }),
      );
    });
  });

  it("should include an error with a message", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const levels = ["info", "warn", "error", "debug", "trace"];

    levels.forEach((level, idx) => {
      const e = new Error("test");

      log.withError(e)[level](`${level} message`, idx);

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level,
          data: [{ err: e }, `${level} message`, idx],
        }),
      );
    });
  });

  describe("errorOnly", () => {
    it("should log only an error", () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
      const e = new Error("err");
      log.errorOnly(e);

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

    it("should copy the error message as the log message", () => {
      const log = getLogger();
      const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
      const e = new Error("error message");

      log.errorOnly(e, {
        logLevel: LogLevel.info,
        copyMsg: true,
      });

      expect(genericLogger.popLine()).toStrictEqual(
        expect.objectContaining({
          level: LogLevel.info,
          data: [
            {
              err: e,
            },
            "error message",
          ],
        }),
      );
    });
  });

  it("should log only metadata", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    log.metadataOnly({
      only: "metadata",
    });

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [
          {
            only: "metadata",
          },
        ],
      }),
    );

    log.metadataOnly(
      {
        only: "trace metadata",
      },
      LogLevel.trace,
    );

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.trace,
        data: [
          {
            only: "trace metadata",
          },
        ],
      }),
    );
  });

  it("should combine an error, metadata, and context", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const e = new Error("err");

    log.withContext({
      contextual: "data",
    });

    log
      .withError(e)
      .withMetadata({
        situational: 1234,
      })
      .info("combined data");

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [
          {
            err: e,
            contextual: "data",
            situational: 1234,
          },
          "combined data",
        ],
      }),
    );
  });

  describe("config options", () => {
    describe("plugins config", () => {
      describe("onBeforeDataOut", () => {
        it("should call onBeforeDataOut with context", () => {
          const onBeforeDataOut: PluginBeforeDataOutFn = ({ data }) => {
            if (data) {
              data.modified = true;
            }

            return data;
          };

          const log = getLogger({
            plugins: [
              {
                onBeforeDataOut,
              },
            ],
          });
          const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
          const e = new Error("err");

          log.withContext({
            contextual: "data",
          });

          log
            .withError(e)
            .withMetadata({
              situational: 1234,
            })
            .info("combined data");

          expect(genericLogger.popLine()).toStrictEqual(
            expect.objectContaining({
              level: LogLevel.info,
              data: [
                {
                  err: e,
                  contextual: "data",
                  situational: 1234,
                  modified: true,
                },
                "combined data",
              ],
            }),
          );
        });

        it("should call onBeforeDataOut with without data", () => {
          const onBeforeDataOut: PluginBeforeDataOutFn = ({ data }) => {
            if (data) {
              data.modified = true;
            }

            return data;
          };

          const log = getLogger({
            plugins: [
              {
                onBeforeDataOut,
              },
            ],
          });

          const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

          log.info("no data");

          expect(genericLogger.popLine()).toStrictEqual(
            expect.objectContaining({
              level: LogLevel.info,
              data: ["no data"],
            }),
          );
        });
      });

      describe("shouldSendToLogger", () => {
        it("should not send to the transport", () => {
          const shouldSendToLogger: PluginShouldSendToLoggerFn = ({ messages }) => {
            return messages[0] !== 0;
          };

          const log = getLogger({
            plugins: [
              {
                shouldSendToLogger,
              },
            ],
          });
          const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

          log.info(0);
          expect(genericLogger.popLine()).toBeUndefined();
          log.info(1);
          expect(genericLogger.popLine()).toStrictEqual(
            expect.objectContaining({
              level: LogLevel.info,
              data: [1],
            }),
          );
        });
      });

      it("should add plugins", () => {
        const log = getLogger();

        log.addPlugins([
          {
            onBeforeDataOut: ({ data }) => {
              if (data) {
                data.newField = true;
              }

              return data;
            },
          },
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
        const e = new Error("err");

        log.withContext({
          contextual: "data",
        });

        log
          .withError(e)
          .withMetadata({
            situational: 1234,
          })
          .info("combined data");

        expect(genericLogger.popLine()).toStrictEqual(
          expect.objectContaining({
            level: LogLevel.info,
            data: [
              {
                err: e,
                contextual: "data",
                situational: 1234,
                modified: true,
                newField: true,
              },
              "combined data",
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
  });
});

describe("mute / unmute", () => {
  it("should mute and unmute context", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const context = { ctx: "data" };

    log.muteContext();
    log.withContext(context).info("test");

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["test"],
      }),
    );

    log.unMuteContext().info("test");

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [context, "test"],
      }),
    );
  });

  it("should mute context but still add metadata", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const metadata = { test: "abcd" };

    log.muteContext();
    log.withContext({ ctx: "data" }).withMetadata(metadata).info("test");

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [metadata, "test"],
      }),
    );
  });

  it("should mute and unmute metadata", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;

    const metadata = { test: "abcd" };
    log.muteMetadata();
    log.withMetadata(metadata).info("test");

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["test"],
      }),
    );

    log.unMuteMetadata();
    log.withMetadata(metadata).info("test");

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: [metadata, "test"],
      }),
    );
  });

  it("should mute both context and metadata", () => {
    const log = getLogger();
    const genericLogger = log.getLoggerInstance("console") as TestLoggingLibrary;
    const metadata = { test: "abcd" };
    const context = { ctx: "data" };

    log.muteMetadata();
    log.muteContext();

    log.withContext(context).withMetadata(metadata).info("test");

    expect(genericLogger.popLine()).toStrictEqual(
      expect.objectContaining({
        level: LogLevel.info,
        data: ["test"],
      }),
    );
  });

  describe("plugins", () => {
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
});
