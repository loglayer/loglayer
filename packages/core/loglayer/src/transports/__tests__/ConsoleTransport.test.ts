import { LogLevel } from "@loglayer/transport";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConsoleTransport } from "../ConsoleTransport.js";

describe("ConsoleTransport", () => {
  let mockConsole: Console;

  beforeEach(() => {
    mockConsole = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      trace: vi.fn(),
    } as unknown as Console;
  });

  describe("log level filtering", () => {
    it("should process all levels when level is trace", () => {
      const transport = new ConsoleTransport({ logger: mockConsole, level: "trace" });

      transport.shipToLogger({ logLevel: LogLevel.trace, messages: ["test"] });
      transport.shipToLogger({ logLevel: LogLevel.debug, messages: ["test"] });
      transport.shipToLogger({ logLevel: LogLevel.info, messages: ["test"] });
      transport.shipToLogger({ logLevel: LogLevel.warn, messages: ["test"] });
      transport.shipToLogger({ logLevel: LogLevel.error, messages: ["test"] });
      transport.shipToLogger({ logLevel: LogLevel.fatal, messages: ["test"] });

      expect(mockConsole.trace).toHaveBeenCalledWith("test");
      expect(mockConsole.debug).toHaveBeenCalledWith("test");
      expect(mockConsole.info).toHaveBeenCalledWith("test");
      expect(mockConsole.warn).toHaveBeenCalledWith("test");
      expect(mockConsole.error).toHaveBeenCalledTimes(2); // error and fatal
    });

    it("should only process info and above when level is info", () => {
      const transport = new ConsoleTransport({ logger: mockConsole, level: "info" });

      transport.shipToLogger({ logLevel: LogLevel.trace, messages: ["test"] });
      transport.shipToLogger({ logLevel: LogLevel.debug, messages: ["test"] });
      transport.shipToLogger({ logLevel: LogLevel.info, messages: ["test"] });
      transport.shipToLogger({ logLevel: LogLevel.warn, messages: ["test"] });
      transport.shipToLogger({ logLevel: LogLevel.error, messages: ["test"] });
      transport.shipToLogger({ logLevel: LogLevel.fatal, messages: ["test"] });

      expect(mockConsole.trace).not.toHaveBeenCalled();
      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).toHaveBeenCalledWith("test");
      expect(mockConsole.warn).toHaveBeenCalledWith("test");
      expect(mockConsole.error).toHaveBeenCalledTimes(2); // error and fatal
    });
  });

  describe("appendObjectData", () => {
    it("should prepend data by default", () => {
      const transport = new ConsoleTransport({ logger: mockConsole });
      const data = { user: "john" };

      transport.shipToLogger({
        logLevel: LogLevel.info,
        messages: ["test message"],
        data,
        hasData: true,
      });

      expect(mockConsole.info).toHaveBeenCalledWith(data, "test message");
    });

    it("should append data when appendObjectData is true", () => {
      const transport = new ConsoleTransport({ logger: mockConsole, appendObjectData: true });
      const data = { user: "john" };

      transport.shipToLogger({
        logLevel: LogLevel.info,
        messages: ["test message"],
        data,
        hasData: true,
      });

      expect(mockConsole.info).toHaveBeenCalledWith("test message", data);
    });

    it("should ignore appendObjectData when messageField is set", () => {
      const transport = new ConsoleTransport({
        logger: mockConsole,
        appendObjectData: true,
        messageField: "msg",
      });
      const data = { user: "john" };

      transport.shipToLogger({
        logLevel: LogLevel.info,
        messages: ["test message"],
        data,
        hasData: true,
      });

      expect(mockConsole.info).toHaveBeenCalledWith({
        user: "john",
        msg: "test message",
      });
    });
  });

  describe("messageField", () => {
    it("should place message in specified field", () => {
      const transport = new ConsoleTransport({
        logger: mockConsole,
        messageField: "msg",
      });

      transport.shipToLogger({
        logLevel: LogLevel.info,
        messages: ["test message"],
      });

      expect(mockConsole.info).toHaveBeenCalledWith({
        msg: "test message",
      });
    });

    it("should join multiple messages with space", () => {
      const transport = new ConsoleTransport({
        logger: mockConsole,
        messageField: "msg",
      });

      transport.shipToLogger({
        logLevel: LogLevel.info,
        messages: ["hello", "world"],
      });

      expect(mockConsole.info).toHaveBeenCalledWith({
        msg: "hello world",
      });
    });

    it("should merge message with existing data", () => {
      const transport = new ConsoleTransport({
        logger: mockConsole,
        messageField: "msg",
      });
      const data = { user: "john" };

      transport.shipToLogger({
        logLevel: LogLevel.info,
        messages: ["test message"],
        data,
        hasData: true,
      });

      expect(mockConsole.info).toHaveBeenCalledWith({
        user: "john",
        msg: "test message",
      });
    });
  });

  describe("dateField", () => {
    it("should add ISO date when dateField is specified", () => {
      const transport = new ConsoleTransport({
        logger: mockConsole,
        dateField: "timestamp",
      });

      const beforeDate = new Date().toISOString();
      transport.shipToLogger({
        logLevel: LogLevel.info,
        messages: ["test message"],
      });
      const afterDate = new Date().toISOString();

      expect(mockConsole.info).toHaveBeenCalledWith(
        "test message",
        expect.objectContaining({
          timestamp: expect.any(String),
        }),
      );

      const call = (mockConsole.info as any).mock.calls[0][1];
      expect(call.timestamp >= beforeDate).toBe(true);
      expect(call.timestamp <= afterDate).toBe(true);
    });

    it("should use dateFn when provided", () => {
      const customDate = "2023-01-01T00:00:00.000Z";
      const dateFn = vi.fn(() => customDate);
      const transport = new ConsoleTransport({
        logger: mockConsole,
        dateField: "timestamp",
        dateFn,
      });

      transport.shipToLogger({
        logLevel: LogLevel.info,
        messages: ["test message"],
      });

      expect(dateFn).toHaveBeenCalledOnce();
      expect(mockConsole.info).toHaveBeenCalledWith("test message", {
        timestamp: customDate,
      });
    });

    it("should use dateFn that returns a number", () => {
      const customTimestamp = 1672531200000;
      const dateFn = vi.fn(() => customTimestamp);
      const transport = new ConsoleTransport({
        logger: mockConsole,
        dateField: "timestamp",
        dateFn,
      });

      transport.shipToLogger({
        logLevel: LogLevel.info,
        messages: ["test message"],
      });

      expect(dateFn).toHaveBeenCalledOnce();
      expect(mockConsole.info).toHaveBeenCalledWith("test message", {
        timestamp: customTimestamp,
      });
    });

    it("should merge dateField with existing data", () => {
      const transport = new ConsoleTransport({
        logger: mockConsole,
        dateField: "timestamp",
      });
      const data = { user: "john" };

      transport.shipToLogger({
        logLevel: LogLevel.info,
        messages: ["test message"],
        data,
        hasData: true,
      });

      expect(mockConsole.info).toHaveBeenCalledWith(
        "test message",
        expect.objectContaining({
          user: "john",
          timestamp: expect.any(String),
        }),
      );
    });
  });

  describe("levelField", () => {
    it("should add log level when levelField is specified", () => {
      const transport = new ConsoleTransport({
        logger: mockConsole,
        levelField: "level",
      });

      transport.shipToLogger({
        logLevel: LogLevel.info,
        messages: ["test message"],
      });

      expect(mockConsole.info).toHaveBeenCalledWith("test message", {
        level: "info",
      });
    });

    it("should use levelFn when provided", () => {
      const levelFn = vi.fn((level) => `LEVEL_${level.toUpperCase()}`);
      const transport = new ConsoleTransport({
        logger: mockConsole,
        levelField: "level",
        levelFn,
      });

      transport.shipToLogger({
        logLevel: LogLevel.warn,
        messages: ["test message"],
      });

      expect(levelFn).toHaveBeenCalledWith("warn");
      expect(mockConsole.warn).toHaveBeenCalledWith("test message", {
        level: "LEVEL_WARN",
      });
    });

    it("should use levelFn that returns a number", () => {
      const levelFn = vi.fn((level) => {
        const levels = { trace: 10, debug: 20, info: 30, warn: 40, error: 50, fatal: 60 };
        return levels[level as keyof typeof levels] || 0;
      });
      const transport = new ConsoleTransport({
        logger: mockConsole,
        levelField: "level",
        levelFn,
      });

      transport.shipToLogger({
        logLevel: LogLevel.error,
        messages: ["test message"],
      });

      expect(levelFn).toHaveBeenCalledWith("error");
      expect(mockConsole.error).toHaveBeenCalledWith("test message", {
        level: 50,
      });
    });

    it("should merge levelField with existing data", () => {
      const transport = new ConsoleTransport({
        logger: mockConsole,
        levelField: "level",
      });
      const data = { user: "john" };

      transport.shipToLogger({
        logLevel: LogLevel.warn,
        messages: ["test message"],
        data,
        hasData: true,
      });

      expect(mockConsole.warn).toHaveBeenCalledWith("test message", {
        user: "john",
        level: "warn",
      });
    });
  });

  describe("combined fields", () => {
    it("should combine messageField, dateField, and levelField", () => {
      const transport = new ConsoleTransport({
        logger: mockConsole,
        messageField: "msg",
        dateField: "timestamp",
        levelField: "level",
      });

      transport.shipToLogger({
        logLevel: LogLevel.info,
        messages: ["hello", "world"],
      });

      const call = (mockConsole.info as any).mock.calls[0][0];
      expect(call).toHaveProperty("msg", "hello world");
      expect(call).toHaveProperty("timestamp");
      expect(call).toHaveProperty("level", "info");
      expect(typeof call.timestamp).toBe("string");
    });

    it("should combine all fields with custom functions", () => {
      const customDate = "2023-01-01T00:00:00.000Z";
      const dateFn = vi.fn(() => customDate);
      const levelFn = vi.fn((level) => level.toUpperCase());

      const transport = new ConsoleTransport({
        logger: mockConsole,
        messageField: "msg",
        dateField: "timestamp",
        levelField: "level",
        dateFn,
        levelFn,
      });

      transport.shipToLogger({
        logLevel: LogLevel.debug,
        messages: ["test message"],
      });

      expect(dateFn).toHaveBeenCalledOnce();
      expect(levelFn).toHaveBeenCalledWith("debug");
      expect(mockConsole.debug).toHaveBeenCalledWith({
        msg: "test message",
        timestamp: customDate,
        level: "DEBUG",
      });
    });

    it("should work with existing data when all fields are specified", () => {
      const transport = new ConsoleTransport({
        logger: mockConsole,
        messageField: "msg",
        dateField: "timestamp",
        levelField: "level",
      });
      const data = { user: "john", session: "abc123" };

      transport.shipToLogger({
        logLevel: LogLevel.error,
        messages: ["error occurred"],
        data,
        hasData: true,
      });

      const call = (mockConsole.error as any).mock.calls[0][0];
      expect(call).toHaveProperty("user", "john");
      expect(call).toHaveProperty("session", "abc123");
      expect(call).toHaveProperty("msg", "error occurred");
      expect(call).toHaveProperty("timestamp");
      expect(call).toHaveProperty("level", "error");
    });
  });

  describe("stringify", () => {
    it("should default to false", () => {
      const transport = new ConsoleTransport({
        logger: mockConsole,
        messageField: "msg",
      });

      transport.shipToLogger({
        logLevel: LogLevel.info,
        messages: ["test message"],
      });

      expect(mockConsole.info).toHaveBeenCalledWith({
        msg: "test message",
      });
    });

    it("should stringify output when stringify is true with messageField", () => {
      const transport = new ConsoleTransport({
        logger: mockConsole,
        messageField: "msg",
        stringify: true,
      });

      transport.shipToLogger({
        logLevel: LogLevel.info,
        messages: ["test message"],
      });

      expect(mockConsole.info).toHaveBeenCalledWith('{"msg":"test message"}');
    });

    it("should stringify output when stringify is true with dateField", () => {
      const transport = new ConsoleTransport({
        logger: mockConsole,
        dateField: "timestamp",
        stringify: true,
      });

      transport.shipToLogger({
        logLevel: LogLevel.info,
        messages: ["test message"],
      });

      expect(mockConsole.info).toHaveBeenCalledWith("test message", expect.any(String));

      const call = (mockConsole.info as any).mock.calls[0][1];
      expect(typeof call).toBe("string");
      const parsed = JSON.parse(call);
      expect(parsed).toHaveProperty("timestamp");
      expect(typeof parsed.timestamp).toBe("string");
    });

    it("should stringify output when stringify is true with levelField", () => {
      const transport = new ConsoleTransport({
        logger: mockConsole,
        levelField: "level",
        stringify: true,
      });

      transport.shipToLogger({
        logLevel: LogLevel.warn,
        messages: ["test message"],
      });

      expect(mockConsole.warn).toHaveBeenCalledWith("test message", '{"level":"warn"}');
    });

    it("should stringify output when stringify is true with combined fields", () => {
      const transport = new ConsoleTransport({
        logger: mockConsole,
        messageField: "msg",
        dateField: "timestamp",
        levelField: "level",
        stringify: true,
      });

      transport.shipToLogger({
        logLevel: LogLevel.error,
        messages: ["error occurred"],
      });

      const call = (mockConsole.error as any).mock.calls[0][0];
      expect(typeof call).toBe("string");
      const parsed = JSON.parse(call);
      expect(parsed).toHaveProperty("msg", "error occurred");
      expect(parsed).toHaveProperty("timestamp");
      expect(parsed).toHaveProperty("level", "error");
    });

    it("should stringify output with existing data when stringify is true", () => {
      const transport = new ConsoleTransport({
        logger: mockConsole,
        messageField: "msg",
        stringify: true,
      });
      const data = { user: "john", session: "abc123" };

      transport.shipToLogger({
        logLevel: LogLevel.info,
        messages: ["user action"],
        data,
        hasData: true,
      });

      const call = (mockConsole.info as any).mock.calls[0][0];
      expect(typeof call).toBe("string");
      const parsed = JSON.parse(call);
      expect(parsed).toHaveProperty("user", "john");
      expect(parsed).toHaveProperty("session", "abc123");
      expect(parsed).toHaveProperty("msg", "user action");
    });

    it("should not stringify when stringify is false", () => {
      const transport = new ConsoleTransport({
        logger: mockConsole,
        messageField: "msg",
        stringify: false,
      });

      transport.shipToLogger({
        logLevel: LogLevel.info,
        messages: ["test message"],
      });

      expect(mockConsole.info).toHaveBeenCalledWith({
        msg: "test message",
      });
    });

    it("should not stringify when no fields are defined", () => {
      const transport = new ConsoleTransport({
        logger: mockConsole,
        stringify: true,
      });
      const data = { user: "john" };

      transport.shipToLogger({
        logLevel: LogLevel.info,
        messages: ["test message"],
        data,
        hasData: true,
      });

      expect(mockConsole.info).toHaveBeenCalledWith(data, "test message");
    });

    it("should stringify with custom dateFn and levelFn", () => {
      const customDate = "2023-01-01T00:00:00.000Z";
      const dateFn = vi.fn(() => customDate);
      const levelFn = vi.fn((level) => level.toUpperCase());

      const transport = new ConsoleTransport({
        logger: mockConsole,
        messageField: "msg",
        dateField: "timestamp",
        levelField: "level",
        dateFn,
        levelFn,
        stringify: true,
      });

      transport.shipToLogger({
        logLevel: LogLevel.debug,
        messages: ["test message"],
      });

      expect(dateFn).toHaveBeenCalledOnce();
      expect(levelFn).toHaveBeenCalledWith("debug");
      expect(mockConsole.debug).toHaveBeenCalledWith(
        '{"msg":"test message","timestamp":"2023-01-01T00:00:00.000Z","level":"DEBUG"}',
      );
    });
  });
});
