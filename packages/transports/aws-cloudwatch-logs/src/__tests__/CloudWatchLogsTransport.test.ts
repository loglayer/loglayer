import type { CloudWatchLogsClient, PutLogEventsCommand } from "@aws-sdk/client-cloudwatch-logs";
import { LogLayer } from "loglayer";
import { describe, expect, it, vi } from "vitest";
import type { CloudWatchLogsTransportConfig } from "../CloudWatchLogsTransport.js";
import type { ICloudWatchLogsStrategy } from "../common.types.js";
import { BaseStrategy } from "../strategies/base.strategy.js";
import { DefaultCloudWatchStrategy } from "../strategies/default.strategy.js";

const mockSend = vi.fn((..._: Parameters<CloudWatchLogsClient["send"]>) => {
  return Promise.resolve({});
});
const onError = vi.fn();

vi.mock(import("@aws-sdk/client-cloudwatch-logs"), async (importOriginal) => {
  const original = await importOriginal();
  const mockedClient: typeof original.CloudWatchLogsClient = class extends original.CloudWatchLogsClient {
    constructor() {
      super({
        region: "us-east-1",
      });
    }
    send = mockSend as any;
  };
  return {
    ...original,
    CloudWatchLogsClient: mockedClient,
  };
});

describe("CloudWatchLogsTransport with LogLayer", () => {
  async function getLoggerInstance(options?: Partial<CloudWatchLogsTransportConfig>) {
    const { CloudWatchLogsTransport } = await import("../index.js");
    let realStrategy: ICloudWatchLogsStrategy;

    // Create a real strategy instance for the mock to delegate to
    realStrategy = new DefaultCloudWatchStrategy({
      createIfNotExists: options?.createIfNotExists ?? false,
    });

    class MockStrategy extends BaseStrategy {
      sendEvent = vi.fn(({ event, logGroupName, logStreamName }) =>
        realStrategy.sendEvent({ event, logGroupName, logStreamName }),
      );
      _configure = vi.fn();
      cleanup = vi.fn();
    }

    const strategy = new MockStrategy();

    const groupName = "/loglayer/test";
    const streamName = "loglayer-stream-test";

    const log = new LogLayer({
      transport: new CloudWatchLogsTransport({
        groupName,
        streamName,
        onError,
        strategy,
        ...options,
      }),
    });

    return { log, strategy, groupName, streamName };
  }

  async function getLoggerInstanceWithoutStrategy(options?: Partial<CloudWatchLogsTransportConfig>) {
    const { CloudWatchLogsTransport } = await import("../index.js");
    const groupName = "/loglayer/test";
    const streamName = "loglayer-stream-test";

    const log = new LogLayer({
      transport: new CloudWatchLogsTransport({
        groupName,
        streamName,
        onError,
        ...options,
      }),
    });

    return { log, groupName, streamName };
  }

  it("should log a message", async () => {
    const { log } = await getLoggerInstance();
    log.info("test message");
    expect(mockSend).toHaveBeenCalledOnce();
    const [command] = mockSend.mock.calls.at(0);
    expect(command).toSatisfy(
      (command: PutLogEventsCommand) => command.input.logEvents[0]?.message === "[info] test message",
    );
    mockSend.mockReset();
  });

  it("should log and format a message", async () => {
    const { log } = await getLoggerInstance({
      payloadTemplate: (params) => params.messages.map((msg) => String(msg)).join(" "),
    });
    log.info("test message");
    expect(mockSend).toHaveBeenCalledOnce();
    const [command] = mockSend.mock.calls.at(0);
    expect(command).toSatisfy((command: PutLogEventsCommand) => command.input.logEvents[0]?.message === "test message");
    mockSend.mockReset();
  });

  it("should log a message with context", async () => {
    const { log, strategy } = await getLoggerInstance({
      payloadTemplate: (params) => `[${params.context.tag}] ${params.messages.map((msg) => String(msg)).join(" ")}`,
    });

    log.withContext({ tag: "context" }).info("test message");

    expect(strategy.sendEvent).toHaveBeenCalledOnce();
    await strategy.sendEvent.mock.results[0].value;

    expect(mockSend).toHaveBeenCalledOnce();
    const [command] = mockSend.mock.calls.at(0);
    expect(command).toSatisfy(
      (command: PutLogEventsCommand) => command.input.logEvents[0]?.message === "[context] test message",
    );
    mockSend.mockReset();
  });

  it("should log a message with metadata", async () => {
    const { log, strategy } = await getLoggerInstance({
      payloadTemplate: (params) => `[${params.metadata.tag}] ${params.messages.map((msg) => String(msg)).join(" ")}`,
    });
    log.withMetadata({ tag: "meta" }).info("test message");

    expect(strategy.sendEvent).toHaveBeenCalledOnce();
    await strategy.sendEvent.mock.results[0].value;

    expect(mockSend).toHaveBeenCalledOnce();
    const [command] = mockSend.mock.calls.at(0);
    expect(command).toSatisfy(
      (command: PutLogEventsCommand) => command.input.logEvents[0]?.message === "[meta] test message",
    );

    mockSend.mockReset();
  });

  it("should call error callback", async () => {
    const { log, strategy } = await getLoggerInstance();

    // Make the strategy return a rejected promise
    strategy.sendEvent.mockReturnValue(Promise.reject(new Error("Test error")));

    log.info("test message");
    expect(strategy.sendEvent).toHaveBeenCalledOnce();

    // Wait for the promise to be handled by the transport
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(onError).toHaveBeenCalledOnce();

    mockSend.mockReset();
    onError.mockReset();
  });

  it("should try to create log group and stream", async () => {
    const { log, strategy, groupName, streamName } = await getLoggerInstance({
      createIfNotExists: true,
    });

    log.info("test message");

    expect(strategy.sendEvent).toHaveBeenCalledOnce();
    await strategy.sendEvent.mock.results[0].value;

    // The real strategy will make multiple calls for createIfNotExists
    // but our mock strategy just delegates to the real one
    expect(mockSend).toHaveBeenCalled();

    // Verify the strategy was configured with onError
    expect(strategy._configure).toHaveBeenCalledWith({
      onError: expect.any(Function),
    });

    mockSend.mockReset();
  });

  it("should use DefaultCloudWatchStrategy when no strategy is provided", async () => {
    const { log } = await getLoggerInstanceWithoutStrategy();
    log.info("test message");
    expect(mockSend).toHaveBeenCalledOnce();
    const [command] = mockSend.mock.calls.at(0);
    expect(command).toSatisfy(
      (command: PutLogEventsCommand) => command.input.logEvents[0]?.message === "[info] test message",
    );
    mockSend.mockReset();
  });
});
