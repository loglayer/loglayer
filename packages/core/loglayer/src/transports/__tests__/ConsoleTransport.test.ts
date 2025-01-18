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
});
