import type { CloudWatchLogsClient } from "@aws-sdk/client-cloudwatch-logs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DefaultCloudWatchStrategy } from "../strategies/default.strategy.js";

const mockSend = vi.fn();
const mockClient = {
  send: mockSend,
} as unknown as CloudWatchLogsClient;

vi.mock("@aws-sdk/client-cloudwatch-logs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@aws-sdk/client-cloudwatch-logs")>();
  return {
    ...actual,
    CloudWatchLogsClient: vi.fn(() => mockClient),
  };
});

describe("DefaultCloudWatchStrategy", () => {
  let strategy: DefaultCloudWatchStrategy;
  const onError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    strategy = new DefaultCloudWatchStrategy({ createIfNotExists: false });
    strategy._configure({ onError });
  });

  it("should send events without creating group/stream when createIfNotExists is false", async () => {
    mockSend.mockResolvedValue({});

    await strategy.sendEvent({
      event: { timestamp: Date.now(), message: "test message" },
      logGroupName: "/test/group",
      logStreamName: "test-stream",
    });

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          logEvents: [{ timestamp: expect.any(Number), message: "test message" }],
          logGroupName: "/test/group",
          logStreamName: "test-stream",
        }),
      }),
    );
  });

  it("should create group and stream when createIfNotExists is true", async () => {
    strategy = new DefaultCloudWatchStrategy({ createIfNotExists: true });
    strategy._configure({ onError });
    mockSend.mockResolvedValue({});

    await strategy.sendEvent({
      event: { timestamp: Date.now(), message: "test message" },
      logGroupName: "/test/group",
      logStreamName: "test-stream",
    });

    // Should call describe, create group, describe stream, create stream, then put events
    expect(mockSend).toHaveBeenCalledTimes(5);
  });

  it("should handle errors and call onError", async () => {
    const error = new Error("Test error");
    mockSend.mockRejectedValue(error);

    await strategy.sendEvent({
      event: { timestamp: Date.now(), message: "test message" },
      logGroupName: "/test/group",
      logStreamName: "test-stream",
    });

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("An error occurred while sending log events"),
        cause: error,
      }),
    );
  });

  it("should cleanup without errors", () => {
    expect(() => strategy.cleanup()).not.toThrow();
  });
});
