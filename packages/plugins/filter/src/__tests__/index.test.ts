import type { PluginShouldSendToLoggerParams } from "@loglayer/plugin";
import { LogLevel } from "@loglayer/shared";
import { MockLogLayer } from "loglayer";
import { describe, expect, it, vi } from "vitest";
import { filterPlugin } from "../index.js";

const loglayer = new MockLogLayer();

describe("filter plugin", () => {
  it("should allow all messages when no queries are provided", () => {
    const plugin = filterPlugin({ id: "test", queries: [] });
    const params: PluginShouldSendToLoggerParams = {
      messages: ["test message"],
      logLevel: "info" as LogLevel,
      data: { foo: "bar" },
    };

    expect(plugin.shouldSendToLogger(params, loglayer)).toBe(true);
  });

  it("should filter messages based on a single query", () => {
    const plugin = filterPlugin({
      id: "test",
      queries: [".level == 'error'"],
    });

    // Should allow error messages
    expect(
      plugin.shouldSendToLogger(
        {
          messages: ["error message"],
          logLevel: "error" as LogLevel,
          data: {},
        },
        loglayer,
      ),
    ).toBe(true);

    // Should filter out info messages
    expect(
      plugin.shouldSendToLogger(
        {
          messages: ["info message"],
          logLevel: "info" as LogLevel,
          data: {},
        },
        loglayer,
      ),
    ).toBe(false);
  });

  it("should handle multiple queries as OR conditions", () => {
    const plugin = filterPlugin({
      id: "test",
      queries: [".level == 'error'", ".data.important == true"],
    });

    // Should allow error messages
    expect(
      plugin.shouldSendToLogger(
        {
          messages: ["error message"],
          logLevel: "error" as LogLevel,
          data: { important: false },
        },
        loglayer,
      ),
    ).toBe(true);

    // Should allow important messages
    expect(
      plugin.shouldSendToLogger(
        {
          messages: ["important info"],
          logLevel: "info" as LogLevel,
          data: { important: true },
        },
        loglayer,
      ),
    ).toBe(true);

    // Should filter out non-error, non-important messages
    expect(
      plugin.shouldSendToLogger(
        {
          messages: ["regular info"],
          logLevel: "info" as LogLevel,
          data: { important: false },
        },
        loglayer,
      ),
    ).toBe(false);
  });

  it("should handle undefined data", () => {
    const plugin = filterPlugin({
      id: "test",
      queries: ["this.data.foo == 'bar'"],
    });

    expect(
      plugin.shouldSendToLogger(
        {
          messages: ["test"],
          logLevel: "info" as LogLevel,
          data: undefined,
        },
        loglayer,
      ),
    ).toBe(false);
  });

  it("should handle undefined messages", () => {
    const plugin = filterPlugin({
      id: "test",
      queries: ["this.message.indexOf('test') >= 0"],
    });

    expect(
      plugin.shouldSendToLogger(
        {
          messages: undefined,
          logLevel: "info" as LogLevel,
          data: {},
        },
        loglayer,
      ),
    ).toBe(false);
  });

  it("should handle complex data queries", () => {
    const plugin = filterPlugin({
      id: "test",
      queries: [".data.user.age > 18"],
    });

    expect(
      plugin.shouldSendToLogger(
        {
          messages: ["test"],
          logLevel: "info" as LogLevel,
          data: { user: { age: 25 } },
        },
        loglayer,
      ),
    ).toBe(true);

    expect(
      plugin.shouldSendToLogger(
        {
          messages: ["test"],
          logLevel: "info" as LogLevel,
          data: { user: { age: 15 } },
        },
        loglayer,
      ),
    ).toBe(false);
  });

  it("should handle invalid queries gracefully", () => {
    const plugin = filterPlugin({
      id: "test",
      queries: ["invalid query syntax"],
    });

    // Should default to false when query is invalid
    expect(
      plugin.shouldSendToLogger(
        {
          messages: ["test"],
          logLevel: "info" as LogLevel,
          data: {},
        },
        loglayer,
      ),
    ).toBe(false);
  });

  it("should respect disabled flag", () => {
    const plugin = filterPlugin({
      id: "test",
      queries: ["this.level == 'error'"],
      disabled: true,
    });

    expect(plugin.disabled).toBe(true);
  });

  it("should handle debug mode", () => {
    const consoleSpy = vi.spyOn(console, "log");
    const plugin = filterPlugin({
      id: "test",
      queries: ["this.level == 'error'"],
      debug: true,
    });

    plugin.shouldSendToLogger(
      {
        messages: ["test"],
        logLevel: "info" as LogLevel,
        data: {},
      },
      loglayer,
    );

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("[filter-plugin] query:"));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("[filter-plugin] input:"));

    consoleSpy.mockRestore();
  });

  describe("message pattern filtering", () => {
    it("should match string patterns", () => {
      const plugin = filterPlugin({
        id: "test",
        messages: ["error", "warning"],
      });

      // Should match when message contains the pattern
      expect(
        plugin.shouldSendToLogger(
          {
            messages: ["this is an error message"],
            logLevel: "info" as LogLevel,
            data: {},
          },
          loglayer,
        ),
      ).toBe(true);

      // Should match when message contains any pattern
      expect(
        plugin.shouldSendToLogger(
          {
            messages: ["this is a warning message"],
            logLevel: "info" as LogLevel,
            data: {},
          },
          loglayer,
        ),
      ).toBe(true);

      // Should not match when message doesn't contain any pattern
      expect(
        plugin.shouldSendToLogger(
          {
            messages: ["this is a regular message"],
            logLevel: "info" as LogLevel,
            data: {},
          },
          loglayer,
        ),
      ).toBe(false);
    });

    it("should match RegExp patterns", () => {
      const plugin = filterPlugin({
        id: "test",
        messages: [/error/i, /warning\d+/],
      });

      // Should match case-insensitive RegExp
      expect(
        plugin.shouldSendToLogger(
          {
            messages: ["this is an ERROR message"],
            logLevel: "info" as LogLevel,
            data: {},
          },
          loglayer,
        ),
      ).toBe(true);

      // Should match RegExp with special pattern
      expect(
        plugin.shouldSendToLogger(
          {
            messages: ["this is warning123"],
            logLevel: "info" as LogLevel,
            data: {},
          },
          loglayer,
        ),
      ).toBe(true);

      // Should not match when RegExp doesn't match
      expect(
        plugin.shouldSendToLogger(
          {
            messages: ["this is just a warning"],
            logLevel: "info" as LogLevel,
            data: {},
          },
          loglayer,
        ),
      ).toBe(false);
    });

    it("should handle mixed string and RegExp patterns", () => {
      const plugin = filterPlugin({
        id: "test",
        messages: ["error", /warning\d+/],
      });

      // Should match string pattern
      expect(
        plugin.shouldSendToLogger(
          {
            messages: ["this is an error"],
            logLevel: "info" as LogLevel,
            data: {},
          },
          loglayer,
        ),
      ).toBe(true);

      // Should match RegExp pattern
      expect(
        plugin.shouldSendToLogger(
          {
            messages: ["this is warning123"],
            logLevel: "info" as LogLevel,
            data: {},
          },
          loglayer,
        ),
      ).toBe(true);

      // Should not match when neither pattern matches
      expect(
        plugin.shouldSendToLogger(
          {
            messages: ["this is a regular message"],
            logLevel: "info" as LogLevel,
            data: {},
          },
          loglayer,
        ),
      ).toBe(false);
    });

    it("should fall back to query filtering when no message patterns match", () => {
      const plugin = filterPlugin({
        id: "test",
        messages: ["error"],
        queries: [".level == 'warn'"],
      });

      // Should match message pattern regardless of query
      expect(
        plugin.shouldSendToLogger(
          {
            messages: ["this is an error"],
            logLevel: "info" as LogLevel,
            data: {},
          },
          loglayer,
        ),
      ).toBe(true);

      // Should use query when message pattern doesn't match
      expect(
        plugin.shouldSendToLogger(
          {
            messages: ["regular message"],
            logLevel: "warn" as LogLevel,
            data: {},
          },
          loglayer,
        ),
      ).toBe(true);

      // Should not match when neither pattern nor query matches
      expect(
        plugin.shouldSendToLogger(
          {
            messages: ["regular message"],
            logLevel: "info" as LogLevel,
            data: {},
          },
          loglayer,
        ),
      ).toBe(false);
    });
  });

  it("should handle multiple log levels with OR conditions", () => {
    const plugin = filterPlugin({
      id: "test",
      queries: ['.level == "fatal" or .level == "error" or .level == "warn" or .level == "info" or .level == "debug"'],
    });

    // Should allow all standard log levels
    const logLevels = [LogLevel.fatal, LogLevel.error, LogLevel.warn, LogLevel.info, LogLevel.debug];

    for (const level of logLevels) {
      expect(
        plugin.shouldSendToLogger(
          {
            messages: ["test message"],
            logLevel: level,
            data: {},
          },
          loglayer,
        ),
      ).toBe(true);
    }

    // Should filter out trace level
    expect(
      plugin.shouldSendToLogger(
        {
          messages: ["test message"],
          logLevel: LogLevel.trace,
          data: {},
        },
        loglayer,
      ),
    ).toBe(false);
  });
});
