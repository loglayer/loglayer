import { parentPort, workerData } from "node:worker_threads";
import { CloudWatchLogsClient, type InputLogEvent } from "@aws-sdk/client-cloudwatch-logs";
import type { CloudWatchLogsStrategyOptions } from "../common.js";
import { ensureGroupExists, ensureStreamExists, sendEvents } from "../shared.js";
import type { CloudWatchLogsWorkerQueueOptions, WorkerError, WorkerEventMessage } from "./common.js";

interface EventChannel {
  logGroupName: string;
  logStreamName: string;
  events: InputLogEvent[];
}

// TSX can't handle this worker without a default export
export default null;

const options: CloudWatchLogsStrategyOptions & CloudWatchLogsWorkerQueueOptions = workerData;
options.delay ??= 6000;
options.batchSize ??= 10000;
options.onError = (error) => {
  parentPort.postMessage({ error } as WorkerError);
};

const client = new CloudWatchLogsClient(options.clientConfig);
const channels: EventChannel[] = [];

parentPort.on("message", async ({ event, logGroupName, logStreamName }: WorkerEventMessage) => {
  if (options.createIfNotExists) {
    await ensureGroupExists(client, logGroupName, options.onError);
    await ensureStreamExists(client, logGroupName, logStreamName, options.onError);
  }

  let channel = channels.find((c) => c.logGroupName === logGroupName && c.logStreamName === logStreamName);
  if (!channel) {
    channel = { logGroupName, logStreamName, events: [] };
    channels.push(channel);
  }

  channel.events.push(event);
});

setInterval(async () => {
  for (const channel of channels) {
    if (channel.events.length > 0) {
      const events = channel.events.splice(0, Math.min(channel.events.length, options.batchSize));
      await sendEvents(client, events, channel.logGroupName, channel.logStreamName, options.onError);
    }
  }
}, options.delay);
