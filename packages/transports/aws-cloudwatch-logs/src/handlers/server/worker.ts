import { parentPort, workerData } from "node:worker_threads";
import type { CloudWatchLogsHandlerOptions, ICloudWatchLogsHandler } from "../common.js";
import { createDefaultHandler } from "../handler.js";
import type { WorkerEventMessage } from "./common.js";

let senderInstance: ICloudWatchLogsHandler | undefined;
function getSender() {
  senderInstance ??= createDefaultHandler(workerData as CloudWatchLogsHandlerOptions);
  return senderInstance;
}

parentPort?.on("message", async (msg: WorkerEventMessage) => {
  const sender = getSender();
  sender.handleEvent(msg.event, msg.logGroupName, msg.logStreamName);
});
