import type {
  CloudWatchLogsClient,
  CreateLogGroupCommand,
  CreateLogStreamCommand,
  DescribeLogGroupsCommand,
  DescribeLogStreamsCommand,
  PutLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import { LogLayer } from "loglayer";
import { describe, expect, it, vi } from "vitest";
import type { CloudWatchLogsTransportConfig } from "../CloudWatchLogsTransport.js";
import type { ICloudWatchLogsHandler } from "../handlers/common.js";

const mockSend = vi.fn((..._: Parameters<CloudWatchLogsClient["send"]>) => {
  return Promise.resolve({});
});

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
  async function getLoggerInstance(options?: CloudWatchLogsTransportConfig) {
    const { CloudWatchLogsTransport, createDefaultHandler } = await import("../index.js");
    let realHandler: ICloudWatchLogsHandler;
    const handler = vi.mockObject<ICloudWatchLogsHandler>({
      handleEvent: vi.fn((event, groupName, streamName) => realHandler.handleEvent(event, groupName, streamName)),
    });
    const log = new LogLayer({
      transport: new CloudWatchLogsTransport({
        ...options,
        handler: (options) => {
          realHandler = createDefaultHandler(options);
          return handler;
        },
      }),
    });

    return { log, handler };
  }

  it("should log a message", async () => {
    const { log } = await getLoggerInstance();
    const message = "test message";
    log.info(message);
    expect(mockSend).toHaveBeenCalledOnce();
    const [command] = mockSend.mock.calls.at(0);
    expect(command).toSatisfy((command: PutLogEventsCommand) => command.input.logEvents[0]?.message === message);
    mockSend.mockReset();
  });

  it("should log and format a message", async () => {
    const { log } = await getLoggerInstance({
      messageFn: (params) => `[${params.logLevel}] ${params.messages.map((msg) => String(msg)).join(" ")}`,
    });
    log.info("test message");
    expect(mockSend).toHaveBeenCalledOnce();
    const [command] = mockSend.mock.calls.at(0);
    expect(command).toSatisfy(
      (command: PutLogEventsCommand) => command.input.logEvents[0]?.message === "[info] test message",
    );
    mockSend.mockReset();
  });

  it("should log a message with context", async () => {
    const { log, handler } = await getLoggerInstance({
      messageFn: (params) => `[${params.context.tag}] ${params.messages.map((msg) => String(msg)).join(" ")}`,
    });

    log.withContext({ tag: "context" }).info("test message");

    expect(handler.handleEvent).toHaveBeenCalledOnce();
    await handler.handleEvent.mock.results[0].value;

    expect(mockSend).toHaveBeenCalledOnce();
    const [command] = mockSend.mock.calls.at(0);
    expect(command).toSatisfy(
      (command: PutLogEventsCommand) => command.input.logEvents[0]?.message === "[context] test message",
    );
    mockSend.mockReset();
  });

  it("should log a message with metadata", async () => {
    const { log, handler } = await getLoggerInstance({
      messageFn: (params) => `[${params.metadata.tag}] ${params.messages.map((msg) => String(msg)).join(" ")}`,
    });
    log.withMetadata({ tag: "meta" }).info("test message");

    expect(handler.handleEvent).toHaveBeenCalledOnce();
    await handler.handleEvent.mock.results[0].value;

    expect(mockSend).toHaveBeenCalledOnce();
    const [command] = mockSend.mock.calls.at(0);
    expect(command).toSatisfy(
      (command: PutLogEventsCommand) => command.input.logEvents[0]?.message === "[meta] test message",
    );

    mockSend.mockReset();
  });

  it("should try to create log group and stream", async () => {
    const groupName = "/loglayer/test";
    const streamName = "loglayer-stream-test";
    const { log, handler } = await getLoggerInstance({
      groupName,
      streamName,
      createIfNotExists: true,
    });

    log.info("test message");

    expect(handler.handleEvent).toHaveBeenCalledOnce();
    await handler.handleEvent.mock.results[0].value;

    expect(mockSend).toHaveBeenCalledTimes(5);
    const [[checkGroupCommand], [createGroupCommand], [checkStreamCommand], [createStreamCommand]] =
      mockSend.mock.calls;
    expect(checkGroupCommand).toSatisfy((command: DescribeLogGroupsCommand) =>
      command.input.logGroupIdentifiers?.includes(groupName),
    );
    expect(createGroupCommand).toSatisfy((command: CreateLogGroupCommand) => command.input.logGroupName === groupName);
    expect(checkStreamCommand).toSatisfy(
      (command: DescribeLogStreamsCommand) =>
        command.input.logGroupName === groupName && command.input.logStreamNamePrefix === streamName,
    );
    expect(createStreamCommand).toSatisfy(
      (command: CreateLogStreamCommand) =>
        command.input.logGroupName === groupName && command.input.logStreamName === streamName,
    );

    mockSend.mockReset();
  });
});
