import "global-jsdom/register";

import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the posthog-js module
const mockLogger = {
  trace: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  fatal: vi.fn(),
};

vi.mock("posthog-js", () => ({
  posthog: {
    logger: mockLogger,
  },
}));

import { LogLayer } from "loglayer";
import type { PostHog } from "posthog-js";
import { serializeError } from "serialize-error";
import { PosthogTransport } from "../PosthogTransport.js";

const mockPosthog = {
  logger: mockLogger,
} as unknown as PostHog;

describe("PosthogTransport", () => {
  let log: LogLayer;

  beforeEach(() => {
    vi.clearAllMocks();
    log = new LogLayer({
      transport: new PosthogTransport({
        id: "posthog",
        logger: mockPosthog,
      }),
    });
  });

  it("should send info logs", () => {
    log.info("hello world");
    expect(mockLogger.info).toHaveBeenCalledWith("hello world");
  });

  it("should send warn logs", () => {
    log.warn("something went wrong");
    expect(mockLogger.warn).toHaveBeenCalledWith("something went wrong");
  });

  it("should send error logs", () => {
    log.error("fatal error");
    expect(mockLogger.error).toHaveBeenCalledWith("fatal error");
  });

  it("should send debug logs", () => {
    log.debug("debug info");
    expect(mockLogger.debug).toHaveBeenCalledWith("debug info");
  });

  it("should send trace logs", () => {
    log.trace("trace info");
    expect(mockLogger.trace).toHaveBeenCalledWith("trace info");
  });

  it("should send fatal logs", () => {
    log.fatal("fatal");
    expect(mockLogger.fatal).toHaveBeenCalledWith("fatal");
  });

  it("should include metadata as attributes", () => {
    log.withMetadata({ order_id: "ord_123", total: 42 }).info("checkout completed");
    expect(mockLogger.info).toHaveBeenCalledWith("checkout completed", {
      order_id: "ord_123",
      total: 42,
    });
  });

  it("should include context data", () => {
    log.withContext({ userId: "user_1" });
    log.info("action");
    expect(mockLogger.info).toHaveBeenCalledWith("action", { userId: "user_1" });
  });

  it("should merge context and metadata", () => {
    log.withContext({ userId: "user_1" });
    log.withMetadata({ action: "login" }).info("event");
    expect(mockLogger.info).toHaveBeenCalledWith("event", {
      userId: "user_1",
      action: "login",
    });
  });

  it("should join multiple messages", () => {
    log.info("part1", "part2", "part3");
    expect(mockLogger.info).toHaveBeenCalledWith("part1 part2 part3");
  });

  it("should include error objects", () => {
    const logWithSerializer = new LogLayer({
      transport: new PosthogTransport({
        id: "posthog",
        logger: mockPosthog,
      }),
      errorSerializer: (err) => serializeError(err),
    });
    logWithSerializer.withError(new Error("boom")).error("failed");
    expect(mockLogger.error).toHaveBeenCalledWith(
      "failed",
      expect.objectContaining({ err: expect.objectContaining({ message: "boom" }) }),
    );
  });

  it("should respect prefix", () => {
    log.withPrefix("[app]").info("prefixed");
    expect(mockLogger.info).toHaveBeenCalledWith("[app] prefixed");
  });

  it("should not send when disabled", () => {
    const disabledLog = new LogLayer({
      transport: new PosthogTransport({
        id: "posthog-disabled",
        logger: mockPosthog,
        enabled: false,
      }),
    });
    disabledLog.info("should not appear");
    expect(mockLogger.info).not.toHaveBeenCalled();
  });

  it("should filter by transport level", () => {
    const levelLog = new LogLayer({
      transport: new PosthogTransport({
        id: "posthog-level",
        logger: mockPosthog,
        level: "warn",
      }),
    });
    levelLog.debug("debug");
    levelLog.info("info");
    expect(mockLogger.debug).not.toHaveBeenCalled();
    expect(mockLogger.info).not.toHaveBeenCalled();
    levelLog.warn("warn");
    expect(mockLogger.warn).toHaveBeenCalledWith("warn");
  });
});
