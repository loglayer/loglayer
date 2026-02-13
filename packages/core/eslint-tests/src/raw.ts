/**
 * Tests that raw() returns void for non-lazy and sync lazy metadata.
 */
import { lazy, LogLevel } from "loglayer";
import { allLoggers } from "./setup.js";

function testRaw() {
  for (const log of allLoggers) {
    // All log levels
    log.raw({ logLevel: LogLevel.info, messages: ["raw message"] });
    log.raw({ logLevel: LogLevel.warn, messages: ["raw warn"] });
    log.raw({ logLevel: LogLevel.error, messages: ["raw error"] });
    log.raw({ logLevel: LogLevel.debug, messages: ["raw debug"] });
    log.raw({ logLevel: LogLevel.trace, messages: ["raw trace"] });
    log.raw({ logLevel: LogLevel.fatal, messages: ["raw fatal"] });

    // Raw with metadata
    log.raw({ logLevel: LogLevel.info, messages: ["msg"], metadata: { key: "value" } });

    // Raw with error
    log.raw({ logLevel: LogLevel.error, messages: ["msg"], error: new Error("raw error") });

    // Raw with context override
    log.raw({ logLevel: LogLevel.info, messages: ["msg"], context: { userId: "123" } });

    // Raw with everything
    log.raw({
      logLevel: LogLevel.info,
      messages: ["full raw"],
      metadata: { key: "value" },
      error: new Error("test"),
      context: { userId: "123" },
    });

    // Raw with sync lazy metadata
    log.raw({ logLevel: LogLevel.info, messages: ["msg"], metadata: { key: lazy(() => "sync") } });

    // Raw with no messages
    log.raw({ logLevel: LogLevel.info });

    // Raw with empty messages
    log.raw({ logLevel: LogLevel.info, messages: [] });
  }
}

testRaw();
